import { useState, useEffect } from 'react';
import { api } from '../api/client';
import SignalTable from '../components/SignalTable';
import ConfidenceMeter from '../components/ConfidenceMeter';

export default function SignalScanner() {
  const [signals, setSignals] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSignals = () => {
    setLoading(true);
    api
      .getSignals()
      .then((data) => setSignals(data.signals || []))
      .catch(() => setSignals([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => fetchSignals(), []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Signal Scanner</h1>
          <p className="text-apex-muted mt-1">Ranked perpetual futures signals (score ≥ 6)</p>
        </div>
        <button
          onClick={fetchSignals}
          disabled={loading}
          className="px-4 py-2 rounded-lg bg-apex-accent text-white font-medium hover:opacity-90 disabled:opacity-50"
        >
          {loading ? 'Scanning…' : 'Refresh'}
        </button>
      </div>

      <SignalTable signals={signals} loading={loading} />

      {!loading && signals?.length > 0 && (
        <div className="rounded-lg border border-apex-border bg-apex-panel p-4">
          <h3 className="font-semibold mb-2">Signal details</h3>
          <div className="space-y-3">
            {signals.slice(0, 3).map((s) => (
              <div key={s.symbol} className="border-b border-apex-border/50 pb-3 last:border-0 last:pb-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono font-medium">{s.symbol}</span>
                  <span className={`text-sm font-semibold ${s.bias === 'LONG' ? 'text-apex-long' : 'text-apex-short'}`}>
                    {s.bias}
                  </span>
                  <ConfidenceMeter value={s.confidence} />
                </div>
                <p className="text-apex-muted text-sm">{s.explanation}</p>
                {s.risk && (
                  <div className="mt-2 text-xs font-mono text-apex-muted">
                    Entry {s.risk.entryPrice?.toFixed(2)} · SL {s.risk.stopLoss?.toFixed(2)} · TP {s.risk.takeProfit?.toFixed(2)} · R:R {s.risk.riskRewardRatio}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
