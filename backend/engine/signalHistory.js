const history = [];
const MAX_HISTORY = 500;

export function recordSignal(signal) {
  const entry = {
    timestamp: new Date().toISOString(),
    symbol: signal.symbol,
    bias: signal.bias,
    confidence: signal.confidence,
    entryPrice: signal.price,
    risk: signal.risk,
    result: null,
  };
  history.unshift(entry);
  if (history.length > MAX_HISTORY) history.pop();
  return entry;
}

export function getHistory(limit = 100) {
  return history.slice(0, limit);
}

export function updateResult(index, result) {
  if (index >= 0 && index < history.length) {
    history[index].result = result;
  }
}

export function getStats() {
  const withResult = history.filter((h) => h.result != null);
  const wins = withResult.filter((h) => h.result === 'win').length;
  const total = withResult.length;
  const winRate = total > 0 ? (wins / total) * 100 : 0;
  return { total: history.length, withResult: total, wins, winRate };
}
