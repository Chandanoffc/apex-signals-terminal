import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import signalsRouter from './routes/signals.js';
import analysisRouter from './routes/analysis.js';
import marketRouter from './routes/market.js';
import whalesRouter from './routes/whales.js';
import liquidationsRouter from './routes/liquidations.js';
import liquidityRouter from './routes/liquidity.js';
import backtestRouter from './routes/backtest.js';
import healthRouter from './routes/health.js';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.use('/signals', signalsRouter);
app.use('/analysis', analysisRouter);
app.use('/market', marketRouter);
app.use('/whales', whalesRouter);
app.use('/liquidations', liquidationsRouter);
app.use('/liquidity', liquidityRouter);
app.use('/backtest', backtestRouter);
app.use('/health', healthRouter);

function startServer(port) {
  const server = app.listen(port, () => {
    console.log(`Apex Signals API running on http://localhost:${port}`);
  });
  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`Port ${port} is in use. Try: kill $(lsof -t -i:${port})`);
      process.exit(1);
    }
    throw err;
  });
}

startServer(PORT);
