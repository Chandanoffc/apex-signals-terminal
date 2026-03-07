import { Router } from 'express';
import { getKlines, getOrderBookDepth } from '../services/binanceService.js';
import { getLiquidationOrders } from '../services/binanceService.js';
import { detectLiquidityZones, scoreStopHuntProbability } from '../analytics/liquidityMapService.js';
import { clusterLiquidations } from '../analytics/liquidationClusterService.js';

const router = Router();

const MAJOR_SYMBOLS = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT'];

router.get('/', async (req, res) => {
  try {
    const zones = await Promise.all(
      MAJOR_SYMBOLS.map(async (pair) => {
        const [klines, depth, liqOrders] = await Promise.all([
          getKlines(pair, '1h', 100),
          getOrderBookDepth(pair, 25),
          getLiquidationOrders(pair, 50),
        ]);
        const liquidityZones = detectLiquidityZones(klines, depth);
        const clusters = clusterLiquidations(liqOrders, parseFloat(klines[klines.length - 1]?.[4]));
        const support = liquidityZones.support.map((z) => ({
          ...z,
          stopHuntProbability: scoreStopHuntProbability(z, clusters),
        }));
        const resistance = liquidityZones.resistance.map((z) => ({
          ...z,
          stopHuntProbability: scoreStopHuntProbability(z, clusters),
        }));
        return {
          symbol: pair.replace('USDT', ''),
          currentPrice: liquidityZones.currentPrice,
          support,
          resistance,
        };
      })
    );

    res.json({ zones });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

export default router;
