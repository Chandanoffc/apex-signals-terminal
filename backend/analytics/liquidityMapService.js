export function detectLiquidityZones(klines, orderBook) {
  if (!klines?.length) return { support: [], resistance: [] };
  const highs = klines.map((k) => parseFloat(k[2]));
  const lows = klines.map((k) => parseFloat(k[3]));
  const currentPrice = parseFloat(klines[klines.length - 1][4]);

  const lookback = Math.min(50, Math.floor(klines.length / 2));
  const recentHighs = highs.slice(-lookback);
  const recentLows = lows.slice(-lookback);

  const resistance = [...new Set(recentHighs)]
    .filter((h) => h > currentPrice * 1.001)
    .sort((a, b) => a - b)
    .slice(0, 5)
    .map((price) => ({
      price,
      distancePct: ((price - currentPrice) / currentPrice) * 100,
      type: 'resistance',
    }));

  const support = [...new Set(recentLows)]
    .filter((l) => l < currentPrice * 0.999)
    .sort((a, b) => b - a)
    .slice(0, 5)
    .map((price) => ({
      price,
      distancePct: ((price - currentPrice) / currentPrice) * 100,
      type: 'support',
    }));

  return { support, resistance, currentPrice };
}

export function scoreStopHuntProbability(zone, liquidationClusters) {
  let score = 0.5;
  const nearLiq = liquidationClusters?.some(
    (c) => Math.abs(c.price - zone.price) / zone.price < 0.005
  );
  if (nearLiq) score += 0.3;
  return Math.min(1, score);
}
