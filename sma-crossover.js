/**
 * Simple Moving Average Crossover Strategy
 * 
 * Buy when short SMA crosses above long SMA
 * Sell when short SMA crosses below long SMA
 * 
 * Usage: node sma-crossover.js --symbol BTCUSDT --short 7 --long 25 --interval 1h
 */

const axios = require('axios');
const { SMA } = require('technicalindicators');

async function fetchCandles(symbol, interval, limit = 100) {
    const response = await axios.get(`https://api.binance.com/api/v3/klines`, {
        params: {
            symbol: symbol.toUpperCase(),
            interval: interval,
            limit: limit
        }
    });
    
    return response.data.map(candle => ({
        time: candle[0],
        open: parseFloat(candle[1]),
        high: parseFloat(candle[2]),
        low: parseFloat(candle[3]),
        close: parseFloat(candle[4]),
        volume: parseFloat(candle[5])
    }));
}

function calculateSMA(prices, period) {
    return SMA.calculate({ period, values: prices });
}

async function runStrategy(symbol, shortPeriod, longPeriod, interval) {
    console.log(`\n📈 SMA Crossover Strategy`);
    console.log(`Symbol: ${symbol}`);
    console.log(`Short Period: ${shortPeriod} | Long Period: ${longPeriod}`);
    console.log(`Interval: ${interval}`);
    console.log('Loading data...\n');
    
    const candles = await fetchCandles(symbol, interval, 200);
    const closes = candles.map(c => c.close);
    
    const shortSMA = calculateSMA(closes, shortPeriod);
    const longSMA = calculateSMA(closes, longPeriod);
    
    let position = null;
    const trades = [];
    
    for (let i = longPeriod; i < closes.length; i++) {
        const price = closes[i];
        const short = shortSMA[i];
        const long = longSMA[i];
        
        if (short > long && position !== 'long') {
            position = 'long';
            trades.push({ type: 'BUY', price, time: candles[i].time });
        } else if (short < long && position === 'long') {
            position = null;
            trades.push({ type: 'SELL', price, time: candles[i].time });
        }
    }
    
    console.log('📊 Recent Signals:\n');
    trades.slice(-5).forEach(trade => {
        const date = new Date(trade.time).toLocaleString();
        console.log(`${trade.type} @ $${trade.price.toFixed(2)} on ${date}`);
    });
    
    console.log(`\n✅ Total trades: ${trades.length}`);
    
    if (trades.length > 1) {
        const firstBuy = trades[0].price;
        const lastSell = trades[trades.length - 1].price;
        if (lastSell && firstBuy) {
            const profit = ((lastSell - firstBuy) / firstBuy * 100).toFixed(2);
            console.log(`📈 Total Return: ${profit}%`);
        }
    }
}

// CLI
const args = process.argv.slice(2);
const symbolArg = args.find(a => a.startsWith('--symbol='));
const shortArg = args.find(a => a.startsWith('--short='));
const longArg = args.find(a => a.startsWith('--long='));
const intervalArg = args.find(a => a.startsWith('--interval='));

if (symbolArg) {
    const symbol = symbolArg.split('=')[1];
    const short = shortArg ? parseInt(shortArg.split('=')[1]) : 7;
    const long = longArg ? parseInt(longArg.split('=')[1]) : 25;
    const interval = intervalArg ? intervalArg.split('=')[1] : '1h';
    
    runStrategy(symbol, short, long, interval).catch(console.error);
} else {
    console.log('Usage: node sma-crossover.js --symbol=BTCUSDT --short=7 --long=25 --interval=1h');
}

module.exports = { runStrategy, fetchCandles };
