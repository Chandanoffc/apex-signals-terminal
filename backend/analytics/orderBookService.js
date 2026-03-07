export function analyzeOrderBook(bids, asks) {
  const parse = (arr) => (Array.isArray(arr) ? arr : []).map(([p, q]) => ({
    price: parseFloat(p),
    qty: parseFloat(q),
  }));

  const b = parse(bids || []);
  const a = parse(asks || []);

  const buyVolume = b.reduce((s, x) => s + x.qty, 0);
  const sellVolume = a.reduce((s, x) => s + x.qty, 0);
  const total = buyVolume + sellVolume;
  const imbalance = total > 0 ? (buyVolume - sellVolume) / total : 0;

  const buyWalls = b.filter((x) => x.qty > b.reduce((m, y) => Math.max(m, y.qty), 0) * 0.5);
  const sellWalls = a.filter((x) => x.qty > a.reduce((m, y) => Math.max(m, y.qty), 0) * 0.5);

  return {
    buyVolume,
    sellVolume,
    imbalance,
    pressure: imbalance > 0.1 ? 'BUY' : imbalance < -0.1 ? 'SELL' : 'NEUTRAL',
    buyWalls: buyWalls.slice(0, 5),
    sellWalls: sellWalls.slice(0, 5),
  };
}
