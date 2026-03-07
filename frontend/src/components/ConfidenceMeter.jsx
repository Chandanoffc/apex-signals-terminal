export default function ConfidenceMeter({ value, max = 11 }) {
  const pct = Math.min(100, (value / max) * 100);
  const color = pct >= 70 ? 'bg-apex-long' : pct >= 50 ? 'bg-apex-accent' : 'bg-apex-short';

  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-2 bg-apex-panel rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs font-mono tabular-nums">{value}/{max}</span>
    </div>
  );
}
