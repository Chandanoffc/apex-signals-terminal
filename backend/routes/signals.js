import { Router } from 'express';
import { getRankedSignals } from '../engine/signalEngine.js';
import { getHistory } from '../engine/signalHistory.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const signals = await getRankedSignals();
    res.json({ signals });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

router.get('/history', (req, res) => {
  const limit = Math.min(parseInt(req.query.limit, 10) || 100, 200);
  res.json({ history: getHistory(limit) });
});

export default router;
