import { Router } from 'express';
import { getTop100Listings } from '../services/cmcService.js';
import { getTicker24h, getOpenInterest, getOrderBookDepth, getKlines } from '../services/binanceService.js';
import { getIndicatorSummary } from '../analytics/indicatorsService.js';
import { getOIPercentChange } from '../analytics/openInterestService.js';
import { recordOpenInterest } from '../analytics/openInterestService.js';
import { detectWhaleActivity } from '../analytics/whaleService.js';
import { analyzeOrderBook } from '../analytics/orderBookService.js';

const router = Router();

function binanceSymbol(symbol) {
  return symbol === 'BTC' ? 'BTCUSDT' : `${symbol}USDT`;
}

router.get('/', async (req, res) => {
  try {
    const listings = await getTop100Listings();
    const symbols = listings.slice(0, 20).map((c) => c.symbol);

    const results = await Promise.allSettled(
      symbols.map(async (symbol) => {
        const pair = binanceSymbol(symbol);
        const [ticker, oi, depth, klines] = await Promise.all([
          getTicker24h(pair),
          getOpenInterest(pair),
          getOrderBookDepth(pair, 20),
          getKlines(pair, '1h', 50),
        ]);
        if (!ticker) return null;
        recordOpenInterest(pair, oi?.openInterest);
        const indicators = getIndicatorSummary(klines);
        const oiChangePct = getOIPercentChange(pair, oi?.openInterest);
        const ob = analyzeOrderBook(depth.bids, depth.asks);
        const alerts = detectWhaleActivity({
          currentVolume: indicators?.volume,
          avgVolume: indicators?.volumeSma,
          oiChangePct,
          orderBookImbalance: ob.imbalance,
        });
        if (alerts.length === 0) return null;
        return {
          symbol,
          price: ticker.lastPrice,
          volume: ticker.quoteVolume,
          oiChangePct,
          alerts,
        };
      })
    );

    const feed = results
      .filter((r) => r.status === 'fulfilled' && r.value != null)
      .map((r) => r.value)
      .sort((a, b) => b.alerts.length - a.alerts.length);

    res.json({ feed });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

export default router;
