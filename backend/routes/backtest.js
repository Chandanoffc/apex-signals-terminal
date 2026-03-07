import { Router } from 'express';
import { getBacktestMetrics } from '../engine/backtestEngine.js';
import { getHistory } from '../engine/signalHistory.js';

const router = Router();

router.get('/', (req, res) => {
  try {
    const metrics = getBacktestMetrics();
    const history = getHistory(50);
    res.json({ metrics, recentSignals: history });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

export default router;
