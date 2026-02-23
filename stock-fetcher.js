/**
 * Stock Data Fetcher
 * 
 * Fetch stock prices and financial data
 * 
 * Usage: node stock-fetcher.js --symbol AAPL MSFT GOOGL
 */

const axios = require('axios');
const fs = require('fs');

// Default config
const CONFIG = {
    symbols: ['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA'],
    apiKey: process.env.ALPHA_VANTAGE_API_KEY || '',
    apiUrl: 'https://www.alphavantage.co/query'
};

class StockFetcher {
    constructor() {
        this.watchlist = this.loadWatchlist();
    }
    
    loadWatchlist() {
        try {
            const data = fs.readFileSync('stock-watchlist.json', 'utf8');
            return JSON.parse(data);
        } catch (e) {
            return {};
        }
    }
    
    saveWatchlist() {
        fs.writeFileSync('stock-watchlist.json', JSON.stringify(this.watchlist, null, 2));
    }
    
    async getQuote(symbol) {
        try {
            const response = await axios.get(CONFIG.apiUrl, {
                params: {
                    function: 'GLOBAL_QUOTE',
                    symbol: symbol,
                    apikey: CONFIG.apiKey || 'demo'
                }
            });
            
            const data = response.data['Global Quote'];
            if (!data) return null;
            
            return {
                symbol: data['01. symbol'],
                price: parseFloat(data['05. price']),
                volume: data['06. volume'],
                latestTradingDay: data['07. latest trading day'],
                previousClose: parseFloat(data['08. previous close']),
                change: parseFloat(data['09. change']),
                changePercent: data['10. change percent']
            };
        } catch (error) {
            console.error(`❌ Error fetching ${symbol}: ${error.message}`);
            return null;
        }
    }
    
    async getOverview(symbol) {
        try {
            const response = await axios.get(CONFIG.apiUrl, {
                params: {
                    function: 'OVERVIEW',
                    symbol: symbol,
                    apikey: CONFIG.apiKey || 'demo'
                }
            });
            
            return response.data;
        } catch (error) {
            console.error(`❌ Error fetching overview for ${symbol}: ${error.message}`);
            return null;
        }
    }
    
    async getIntraday(symbol, interval = '15min') {
        try {
            const response = await axios.get(CONFIG.apiUrl, {
                params: {
                    function: 'TIME_SERIES_INTRADAY',
                    symbol: symbol,
                    interval: interval,
                    apikey: CONFIG.apiKey || 'demo'
                }
            });
            
            return response.data[`Time Series (${interval})`];
        } catch (error) {
            console.error(`❌ Error fetching intraday for ${symbol}: ${error.message}`);
            return null;
        }
    }
    
    async displayQuotes(symbols) {
        console.log('\n📈 Stock Quotes');
        console.log('═══════════════════════════════════════════════════════════════');
        console.log('┌──────────┬─────────────┬────────────┬───────────┬───────────┐');
        console.log('│ Symbol   │ Price       │ Change     │ % Change  │ Volume    │');
        console.log('├──────────┼─────────────┼────────────┼───────────┼───────────┤');
        
        for (const symbol of symbols) {
            const quote = await this.getQuote(symbol);
            
            if (quote) {
                const changeSymbol = quote.change >= 0 ? '▲' : '▼';
                const changeColor = quote.change >= 0 ? '🟢' : '🔴';
                
                console.log(
                    `│ ${symbol.padEnd(8)} │ $${quote.price.toFixed(2).padEnd(10)} │ ${changeSymbol} $${Math.abs(quote.change).toFixed(2).padEnd(9)} │ ${changeColor} ${quote.changePercent.padEnd(8)} │ ${parseInt(quote.volume).toLocaleString().padEnd(10)} │`
                );
            } else {
                console.log(`│ ${symbol.padEnd(8)} │ N/A         │            │           │           │`);
            }
        }
        
        console.log('└──────────┴─────────────┴────────────┴───────────┴───────────┘');
    }
    
    addToWatchlist(symbol, targetPrice, note = '') {
        this.watchlist[symbol] = {
            targetPrice,
            note,
            addedAt: new Date().toISOString()
        };
        this.saveWatchlist();
        console.log(`✅ Added ${symbol} to watchlist (Target: $${targetPrice})`);
    }
    
    checkWatchlist() {
        console.log('\n👀 Watchlist');
        console.log('═══════════════════════════════════════════════════════════════');
        
        const entries = Object.entries(this.watchlist);
        if (entries.length === 0) {
            console.log('No stocks in watchlist. Add with: node stock-fetcher.js --add AAPL:150:Apple competitor');
            return;
        }
        
        console.log('┌──────────┬─────────────┬────────────┬───────────┐');
        console.log('│ Symbol   │ Target      │ Status     │ Note      │');
        console.log('├──────────┼─────────────┼────────────┼───────────┤');
        
        for (const [symbol, data] of entries) {
            console.log(`│ ${symbol.padEnd(8)} │ $${data.targetPrice.toString().padEnd(10)} │            │ ${(data.note || '-').substring(0, 8).padEnd(8)} │`);
        }
        
        console.log('└──────────┴─────────────┴────────────┴───────────┘');
    }
}

// CLI interface
const args = process.argv.slice(2);
const symbolsArg = args.find(a => a.startsWith('--symbol='));
const addArg = args.find(a => a.startsWith('--add='));
const watchlistArg = args.find(a => a.startsWith('--watchlist'));

const fetcher = new StockFetcher();

// Handle add to watchlist
if (addArg) {
    const parts = addArg.split('=')[1].split(':');
    const symbol = parts[0].toUpperCase();
    const targetPrice = parseFloat(parts[1]);
    const note = parts[2] || '';
    fetcher.addToWatchlist(symbol, targetPrice, note);
    process.exit(0);
}

// Show watchlist
if (watchlistArg) {
    fetcher.checkWatchlist();
    process.exit(0);
}

// Parse symbols
let symbols = CONFIG.symbols;
if (symbolsArg) {
    symbols = symbolsArg.split('=')[1].split(',').map(s => s.toUpperCase());
}

// Display quotes
fetcher.displayQuotes(symbols).catch(console.error);
