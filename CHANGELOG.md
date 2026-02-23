# 📈 Auto-Trader v1.1 - 量化交易工具箱更新

## 新增工具

### 🪙 Crypto Price Tracker
加密货币价格追踪器
```bash
node crypto-tracker.js --symbol BTC ETH SOL --threshold 50000 3000 200
```

功能：
- 实时追踪 BTC、ETH、SOL 等价格
- 设置价格警报（高于/低于阈值）
- 持续监控模式

### 📊 Stock Fetcher
股票数据获取器
```bash
node stock-fetcher.js --symbol AAPL MSFT GOOGL
```

功能：
- 获取实时报价
- 查看涨跌幅
- 自选股监控列表
- 支持 Alpha Vantage API

---

## 工具清单

| 工具 | 功能 | 使用场景 |
|------|------|----------|
| `sma-crossover.js` | SMA 交叉策略 | 加密货币自动交易 |
| `rsi-strategy.js` | RSI 策略 | 技术分析交易 |
| `crypto-tracker.js` | 价格追踪 | 加密货币监控 |
| `stock-fetcher.js` | 股票数据 | 股票监控 |

---

## 安装依赖

```bash
npm install axios
```

---

## 使用示例

### 加密货币追踪
```bash
# 追踪 BTC 和 ETH
node crypto-tracker.js --symbol BTC,ETH

# 设置警报 (BTC > 50000, ETH > 3000)
node crypto-tracker.js --symbol BTC --threshold 50000:45000

# 持续追踪 (每30秒)
node crypto-tracker.js --symbol BTC,ETH,SOL --interval 30
```

### 股票监控
```bash
# 查看报价
node stock-fetcher.js --symbol AAPL,MSFT,GOOGL

# 添加到自选
node stock-fetcher.js --add AAPL:200:Apple target

# 查看自选列表
node stock-fetcher.js --watchlist
```

---

## API 密钥 (可选)

获取 Alpha Vantage API Key:
1. 访问 https://www.alphavantage.co/support/#api-key
2. 免费申请 API Key
3. 设置环境变量: `set ALPHA_VANTAGE_API_KEY=your_key`

---

## 即将推出

- [ ] Backtesting Framework
- [ ] Portfolio Tracker
- [ ] Trading Bot Templates

---

**GitHub:** github.com/kwl314/auto-trader
**ETH:** 0xE6a27735DEbb8322617c9E9E4c1D504c412b6eae
