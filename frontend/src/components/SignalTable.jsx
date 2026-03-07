import { Link } from 'react-router-dom';
import ConfidenceMeter from './ConfidenceMeter';

function formatVol(v) {
  if (v == null) return '—';
  if (v >= 1e9) return `${(v / 1e9).toFixed(1)}B`;
  if (v >= 1e6) return `${(v / 1e6).toFixed(1)}M`;
  if (v >= 1e3) return `${(v / 1e3).toFixed(1)}K`;
  return String(v);
}

function formatPrice(p) {
  if (p == null) return '—';
  if (p >= 1000) return p.toLocaleString(undefined, { maximumFractionDigits: 0 });
  if (p >= 1) return p.toFixed(2);
  return p.toFixed(4);
}

export default function SignalTable({ signals, loading }) {
  if (loading) {
    return (
      <div className="rounded-lg border border-apex-border bg-apex-panel p-8 text-center text-apex-muted">
        Loading signals…
      </div>
    );
  }
  if (!signals?.length) {
    return (
      <div className="rounded-lg border border-apex-border bg-apex-panel p-8 text-center text-apex-muted">
        No signals meeting threshold (score ≥ 6). Try again later.
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-apex-border bg-apex-panel overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-apex-border text-left text-apex-muted">
              <th className="px-4 py-3 font-medium">Symbol</th>
              <th className="px-4 py-3 font-medium">Bias</th>
              <th className="px-4 py-3 font-medium">Confidence</th>
              <th className="px-4 py-3 font-medium">Price</th>
              <th className="px-4 py-3 font-medium">24h %</th>
              <th className="px-4 py-3 font-medium">Volume</th>
              <th className="px-4 py-3 font-medium">Funding</th>
              <th className="px-4 py-3 font-medium">OI Δ</th>
              <th className="px-4 py-3 font-medium">Regime</th>
              <th className="px-4 py-3 font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {signals.map((s) => (
              <tr key={`${s.symbol}-${s.confidence}`} className="border-b border-apex-border/50 hover:bg-apex-border/20">
                <td className="px-4 py-3 font-mono font-medium">{s.symbol}</td>
                <td className="px-4 py-3">
                  <span className={`font-semibold ${s.bias === 'LONG' ? 'text-apex-long' : 'text-apex-short'}`}>
                    {s.bias}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <ConfidenceMeter value={s.confidence} />
                </td>
                <td className="px-4 py-3 font-mono">{formatPrice(s.price)}</td>
                <td className="px-4 py-3 font-mono">
                  <span className={(s.change24h ?? 0) >= 0 ? 'text-apex-long' : 'text-apex-short'}>
                    {s.change24h != null ? `${s.change24h >= 0 ? '+' : ''}${s.change24h.toFixed(2)}%` : '—'}
                  </span>
                </td>
                <td className="px-4 py-3 font-mono text-apex-muted">{formatVol(s.volume)}</td>
                <td className="px-4 py-3 font-mono">
                  {s.fundingRate != null ? (s.fundingRate * 100).toFixed(3) + '%' : '—'}
                </td>
                <td className="px-4 py-3 font-mono">{s.openInterestChange ?? '—'}</td>
                <td className="px-4 py-3 text-apex-muted">{s.marketRegime ?? '—'}</td>
                <td className="px-4 py-3">
                  <Link
                    to={`/analysis/${s.symbol}`}
                    className="text-apex-accent hover:underline"
                  >
                    Analyze
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
