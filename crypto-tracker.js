/**
 * Crypto Price Tracker
 * 
 * Track cryptocurrency prices and send alerts
 * 
 * Usage: node crypto-tracker.js --symbol BTC ETH --threshold 50000 3000
 */

const axios = require('axios');
const fs = require('fs');

// Default config
const CONFIG = {
    symbols: ['BTC', 'ETH', 'SOL', 'BNB'],
    currencies: ['usd'],
    alerts: {},  // Will be loaded from file
    interval: 60000,  // 1 minute
    apiUrl: 'https://api.coingecko.com/api/v3/simple/price'
};

class CryptoTracker {
    constructor() {
        this.prices = {};
        this.alerts = this.loadAlerts();
    }
    
    loadAlerts() {
        try {
            const data = fs.readFileSync('crypto-alerts.json', 'utf8');
            return JSON.parse(data);
        } catch (e) {
            return {};
        }
    }
    
    saveAlerts() {
        fs.writeFileSync('crypto-alerts.json', JSON.stringify(this.alerts, null, 2));
    }
    
    async getPrices(symbols, currencies = ['usd']) {
        try {
            const ids = symbols.map(s => s.toLowerCase()).join(',');
            const vs_currencies = currencies.join(',');
            
            const response = await axios.get(
                `${CONFIG.apiUrl}?ids=${ids}&vs_currencies=${vs_currencies}`
            );
            
            return response.data;
        } catch (error) {
            console.error(`❌ Error fetching prices: ${error.message}`);
            return null;
        }
    }
    
    async trackPrices(symbols = CONFIG.symbols, currencies = CONFIG.currencies) {
        console.log(`\n📊 Tracking prices for: ${symbols.join(', ')}`);
        
        const prices = await this.getPrices(symbols, currencies);
        if (!prices) return;
        
        console.log('\n┌──────────┬─────────────┬─────────────┬────────────────┐');
        console.log('│ Symbol   │ Price (USD) │ 24h Change  │ Status         │');
        console.log('├──────────┼─────────────┼─────────────┼────────────────┤');
        
        for (const symbol of symbols) {
            const symbolLower = symbol.toLowerCase();
            const price = prices[symbolLower]?.usd;
            
            if (price) {
                this.prices[symbol] = price;
                
                // Check alerts
                let status = '🟢';
                if (this.alerts[symbol]) {
                    if (price >= this.alerts[symbol].upper) {
                        status = '🔴 HIGH';
                    } else if (price <= this.alerts[symbol].lower) {
                        status = '🟡 LOW';
                    }
                }
                
                console.log(`│ ${symbol.padEnd(8)} │ $${price.toLocaleString().padEnd(10)} │             │ ${status}          │`);
            } else {
                console.log(`│ ${symbol.padEnd(8)} │ N/A         │             │ ❌ Not found  │`);
            }
        }
        
        console.log('└──────────┴─────────────┴─────────────┴────────────────┘');
        
        return this.prices;
    }
    
    setAlert(symbol, upper, lower) {
        this.alerts[symbol] = { upper, lower };
        this.saveAlerts();
        console.log(`✅ Alert set for ${symbol}: Upper $${upper}, Lower $${lower}`);
    }
    
    async continuousTrack(symbols, currencies, intervalMs = CONFIG.interval) {
        console.log(`\n🚀 Starting continuous tracking (every ${intervalMs/1000}s)...`);
        console.log('Press Ctrl+C to stop\n');
        
        // Initial fetch
        await this.trackPrices(symbols, currencies);
        
        // Continuous tracking
        const interval = setInterval(async () => {
            await this.trackPrices(symbols, currencies);
        }, intervalMs);
        
        // Handle exit
        process.on('SIGINT', () => {
            clearInterval(interval);
            console.log('\n👋 Tracking stopped');
            process.exit(0);
        });
    }
}

// CLI interface
const args = process.argv.slice(2);
const symbolsArg = args.find(a => a.startsWith('--symbol='));
const thresholdArg = args.find(a => a.startsWith('--threshold='));
const intervalArg = args.find(a => a.startsWith('--interval='));
const setAlertArg = args.find(a => a.startsWith('--alert='));

const tracker = new CryptoTracker();

// Handle alert setting
if (setAlertArg) {
    const parts = setAlertArg.split('=')[1].split(':');
    const symbol = parts[0].toUpperCase();
    const upper = parseFloat(parts[1]);
    const lower = parseFloat(parts[2]);
    tracker.setAlert(symbol, upper, lower);
    process.exit(0);
}

// Parse symbols
let symbols = CONFIG.symbols;
if (symbolsArg) {
    symbols = symbolsArg.split('=')[1].split(',').map(s => s.toUpperCase());
}

// Parse interval
let interval = CONFIG.interval;
if (intervalArg) {
    interval = parseInt(intervalArg.split('=')[1]) * 1000;
}

// Start tracking
tracker.continuousTrack(symbols, ['usd'], interval).catch(console.error);
