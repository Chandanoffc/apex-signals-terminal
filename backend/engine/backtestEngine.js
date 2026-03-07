import { getHistory } from './signalHistory.js';

export function getBacktestMetrics() {
  const history = getHistory(200);
  const withResult = history.filter((h) => h.result != null && h.entryPrice);

  if (withResult.length === 0) {
    return {
      winRate: 0,
      averageReturn: 0,
      maxDrawdown: 0,
      expectancy: 0,
      profitFactor: 0,
      totalSignals: history.length,
      evaluatedSignals: 0,
    };
  }

  const returns = withResult.map((h) => (h.result === 'win' ? 1 : -1));
  const wins = returns.filter((r) => r > 0).length;
  const losses = returns.filter((r) => r < 0).length;
  const winRate = (wins / withResult.length) * 100;

  let cumulative = 0;
  let peak = 0;
  let maxDrawdown = 0;
  for (const r of returns) {
    cumulative += r;
    peak = Math.max(peak, cumulative);
    maxDrawdown = Math.max(maxDrawdown, peak - cumulative);
  }

  const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
  const grossProfit = returns.filter((r) => r > 0).reduce((a, b) => a + b, 0);
  const grossLoss = Math.abs(returns.filter((r) => r < 0).reduce((a, b) => a + b, 0));
  const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit;
  const expectancy = avgReturn;

  return {
    winRate: Math.round(winRate * 10) / 10,
    averageReturn: Math.round(avgReturn * 100) / 100,
    maxDrawdown,
    expectancy: Math.round(expectancy * 100) / 100,
    profitFactor: Math.round(profitFactor * 100) / 100,
    totalSignals: history.length,
    evaluatedSignals: withResult.length,
  };
}
