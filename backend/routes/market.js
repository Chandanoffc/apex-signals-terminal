import { Router } from 'express';
import { getTop100Listings } from '../services/cmcService.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const listings = await getTop100Listings();
    res.json({ assets: listings });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

export default router;
