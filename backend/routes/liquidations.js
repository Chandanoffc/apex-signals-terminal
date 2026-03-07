import { Router } from 'express';
import { getLiquidationOrders } from '../services/binanceService.js';
import { getTicker24h } from '../services/binanceService.js';
import { clusterLiquidations } from '../analytics/liquidationClusterService.js';

const router = Router();

const MAJOR_SYMBOLS = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'XRPUSDT'];

router.get('/', async (req, res) => {
  try {
    const heatmap = await Promise.all(
      MAJOR_SYMBOLS.map(async (pair) => {
        const [orders, ticker] = await Promise.all([
          getLiquidationOrders(pair, 100),
          getTicker24h(pair),
        ]);
        const price = ticker?.lastPrice;
        const clusters = clusterLiquidations(orders, price);
        return {
          symbol: pair.replace('USDT', ''),
          price,
          clusters,
        };
      })
    );

    res.json({ heatmap });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

export default router;
