/**
 * RSI Strategy
 * 
 * Buy when RSI < oversold, Sell when RSI > overbought
 * 
 * Usage: node rsi-strategy.js --symbol ETHUSDT --period 14 --overbought 70 --oversold 30
 */

const axios = require('axios');
const { RSI } = require('technicalindicators');

async function fetchCandles(symbol, interval, limit = 100) {
    const response = await axios.get(`https://api.binance.com/api/v3/klines`, {
        params: {
            symbol: symbol.toUpperCase(),
            interval: interval,
            limit: limit
        }
    });
    
    return response.data.map(candle => ({
        close: parseFloat(candle[4]),
        time: candle[0]
    }));
}

async function runStrategy(symbol, period, overbought, oversold, interval) {
    console.log(`\n📊 RSI Strategy`);
    console.log(`Symbol: ${symbol} | Period: ${period}`);
    console.log(`Overbought: ${overbought} | Oversold: ${oversold}`);
    console.log('Loading data...\n');
    
    const candles = await fetchCandles(symbol, interval, 200);
    const closes = candles.map(c => c.close);
    const rsiValues = RSI.calculate({ period, values: closes });
    
    let position = null;
    const signals = [];
    
    for (let i = period; i < rsiValues.length; i++) {
        const rsi = rsiValues[i];
        const price = closes[i + period];
        
        if (rsi < oversold && position !== 'long') {
            position = 'long';
            signals.push({ type: 'BUY', price, rsi, time: candles[i + period].time });
        } else if (rsi > overbought && position === 'long') {
            position = null;
            signals.push({ type: 'SELL', price, rsi, time: candles[i + period].time });
        }
    }
    
    console.log('📈 Recent Signals:');
    signals.slice(-5).forEach(sig => {
        const date = new Date(sig.time).toLocaleString();
        console.log(`${sig.type} @ $${sig.price.toFixed(2)} (RSI: ${sig.rsi.toFixed(2)}) - ${date}`);
    });
    
    console.log(`\n✅ Total signals: ${signals.length}`);
}

// CLI
const args = process.argv.slice(2);
const symbolArg = args.find(a => a.startsWith('--symbol='));
const periodArg = args.find(a => a.startsWith('--period='));
const overArg = args.find(a => a.startsWith('--overbought='));
const underArg = args.find(a => a.startsWith('--oversold='));
const intervalArg = args.find(a => a.startsWith('--interval='));

if (symbolArg) {
    const symbol = symbolArg.split('=')[1];
    const period = periodArg ? parseInt(periodArg.split('=')[1]) : 14;
    const overbought = overArg ? parseFloat(overArg.split('=')[1]) : 70;
    const oversold = underArg ? parseFloat(underArg.split('=')[1]) : 30;
    const interval = intervalArg ? intervalArg.split('=')[1] : '1h';
    
    runStrategy(symbol, period, overbought, oversold, interval).catch(console.error);
} else {
    console.log('Usage: node rsi-strategy.js --symbol=ETHUSDT --period=14 --overbought=70 --oversold=30 --interval=1h');
}

module.exports = { runStrategy };
