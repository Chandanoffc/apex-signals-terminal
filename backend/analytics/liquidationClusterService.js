const ZONE_PCT = 0.002;

export function clusterLiquidations(orders, currentPrice) {
  if (!orders?.length || currentPrice == null) return [];
  const zones = new Map();

  for (const o of orders) {
    const price = parseFloat(o.price || o.avgPrice || 0);
    const qty = parseFloat(o.origQty || o.qty || 0);
    const side = (o.side || '').toUpperCase();
    if (!price || !qty) continue;
    const bucket = Math.round(price / (currentPrice * ZONE_PCT)) * (currentPrice * ZONE_PCT);
    const key = bucket.toFixed(2);
    if (!zones.has(key)) zones.set(key, { price: bucket, totalQty: 0, buys: 0, sells: 0 });
    const z = zones.get(key);
    z.totalQty += qty;
    if (side === 'BUY' || side === 'SELL') z[side === 'BUY' ? 'buys' : 'sells'] += qty;
  }

  return Array.from(zones.values())
    .sort((a, b) => a.price - b.price)
    .map((z) => ({
      ...z,
      distancePct: currentPrice ? ((z.price - currentPrice) / currentPrice) * 100 : 0,
    }));
}

export function getNearestCluster(clusters, currentPrice, side) {
  if (!clusters?.length || currentPrice == null) return null;
  const relevant = clusters.filter((c) =>
    side === 'LONG' ? c.price > currentPrice : c.price < currentPrice
  );
  if (!relevant.length) return null;
  const nearest = relevant.reduce((a, b) =>
    Math.abs(a.price - currentPrice) < Math.abs(b.price - currentPrice) ? a : b
  );
  return {
    ...nearest,
    distancePct: ((nearest.price - currentPrice) / currentPrice) * 100,
  };
}
