# Apex Signals Intelligence Terminal

A full-stack crypto derivatives intelligence platform that analyzes cryptocurrency markets and produces high-probability perpetual futures trading insights. **The system does not execute trades** — it only provides analysis and signals.

## Features

- **Ranked signals** (score ≥ 6) from momentum, volume, funding, open interest, RSI, EMA, order book, liquidation clusters, whale activity, liquidity zones, and market regime
- **Market regime detection**: TRENDING, RANGING, HIGH_VOLATILITY, LOW_VOLATILITY with strategy adaptation
- **Open interest & funding** analysis (squeeze detection)
- **Liquidation cluster** and **liquidity map** (stop-hunt) visualization
- **Whale activity** feed (volume spike, OI jump, order book imbalance)
- **Risk levels** per signal (entry, stop loss, take profit, R:R)
- **Backtesting** metrics (win rate, expectancy, profit factor)
- **Alerts** when confidence ≥ 8 (Telegram, Discord webhook; optional)

## Tech Stack

- **Frontend**: React, Vite, TailwindCSS, Recharts
- **Backend**: Node.js, Express
- **Indicators**: `technicalindicators` (RSI, EMA, MACD, ATR, Bollinger, ADX, VWAP)
- **Data**: CoinMarketCap API (top 100), Binance Futures/Spot APIs
- **Caching**: In-memory (60s TTL)

## Project Structure

```
apex-signals-terminal/
├── backend/
│   ├── routes/       # API routes
│   ├── services/     # CMC, Binance, alerts, cache
│   ├── engine/       # signal, risk, backtest, signalHistory
│   ├── analytics/    # indicators, regime, OI, funding, volume, orderBook, liquidation, liquidity, whale
│   └── utils/        # cache
├── frontend/
│   └── src/
│       ├── components/
│       ├── pages/    # Dashboard, SignalScanner, Market, AssetAnalysis, Whales, Liquidations, Liquidity, Backtest
│       ├── api/      # client
│       └── charts/
└── README.md
```

## Environment Variables

### Backend (`.env`)

| Variable | Description |
|----------|-------------|
| `PORT` | Server port (default 4000) |
| `CMC_KEY` | CoinMarketCap API key (required for live top 100) |
| `TELEGRAM_BOT_TOKEN` | Optional: Telegram bot token for alerts |
| `TELEGRAM_CHAT_ID` | Optional: Telegram chat ID |
| `DISCORD_WEBHOOK_URL` | Optional: Discord webhook for alerts |

### Frontend

Set `VITE_API_URL` to your backend URL when deploying (e.g. `https://your-app.onrender.com`). For local dev, the Vite proxy forwards `/api` to `http://localhost:4000`.

## Run Locally

### Backend

```bash
cd backend
npm install
npm run dev
```

API runs at `http://localhost:4000`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

App runs at `http://localhost:3000`. API calls go through the proxy to the backend.

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/signals` | Ranked signals |
| GET | `/signals/history` | Signal history |
| GET | `/analysis/:symbol` | Detailed asset analysis |
| GET | `/market` | Top 100 market overview |
| GET | `/whales` | Whale activity feed |
| GET | `/liquidations` | Liquidation heatmap |
| GET | `/liquidity` | Liquidity pool zones |
| GET | `/backtest` | Backtest metrics + recent signals |
| GET | `/health` | Server status |

## Deploy

### Backend → Render

1. Create a new **Web Service**.
2. Connect your repo; root: `apex-signals-terminal`.
3. Build: `cd backend && npm install`
4. Start: `cd backend && npm start`
5. Add env vars: `CMC_KEY`, optionally `TELEGRAM_*`, `DISCORD_WEBHOOK_URL`.
6. Deploy. Note the URL (e.g. `https://apex-signals-api.onrender.com`).

### Frontend → Vercel

1. Import project; root: `apex-signals-terminal/frontend`.
2. Build command: `npm run build`
3. Environment: `VITE_API_URL=https://your-backend.onrender.com`
4. Deploy.

After deployment, the system will scan markets (when endpoints are hit) and display ranked signals. No automatic trade execution — analysis and signals only.

## License

MIT
