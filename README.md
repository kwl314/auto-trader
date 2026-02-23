# 🤖 Auto-Trader

**Algorithmic trading strategies and automation tools**

An open-source collection of trading bots, backtesting frameworks, and market analysis tools.

## Features

### 1. Simple Moving Average Crossover Strategy
```bash
node sma-crossover.js --symbol BTCUSDT --short 7 --long 25 --interval 1h
```

### 2. RSI Strategy
```bash
node rsi-strategy.js --symbol ETHUSDT --period 14 --overbought 70 --oversold 30
```

### 3. Backtesting Framework
```bash
node backtest.js --strategy sma-crossover --data btc-1y.csv --initial-capital 10000
```

### 4. Market Data Fetcher
```bash
node market-data.js --symbol AAPL --output data.json --interval 1d --period 1y
```

### 5. Portfolio Tracker
```bash
node portfolio-tracker.js --holdings holdings.json --output portfolio-report.xlsx
```

## Installation

```bash
git clone https://github.com/kwl314/auto-trader.git
cd auto-trader
npm install
```

## Dependencies

- `axios` - HTTP requests for market data
- `ccxt` - Cryptocurrency exchange library
- `technicalindicators` - Technical analysis
- `exceljs` - Excel reports

```bash
npm install axios ccxt technicalindicators exceljs
```

## Usage

See individual scripts for detailed documentation.

## Disclaimers

⚠️ **Trading involves risk. Use at your own risk.**
⚠️ **Backtesting results don't guarantee future performance.**
⚠️ **Never invest more than you can afford to lose.**

## License

MIT

## Contact

- **GitHub:** github.com/kwl314
- **ETH:** 0xE6a27735DEbb8322617c9E9E4c1D504c412b6eae
