export function FeatureBars({ rows, valueKey }: { rows: Array<Record<string, string | number>>; valueKey: string }) {
  const max = Math.max(...rows.map((row) => Math.abs(Number(row[valueKey]))), 1);

  return (
    <div className="space-y-3">
      {rows.map((row) => {
        const raw = Number(row[valueKey]);
        const width = `${Math.max((Math.abs(raw) / max) * 100, 2)}%`;
        return (
          <div key={String(row.feature)} className="space-y-1">
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="truncate text-zinc-200">{row.feature}</span>
              <span className={raw >= 0 ? "text-mint" : "text-ember"}>{raw.toFixed(4)}</span>
            </div>
            <div className="h-2 rounded-full bg-white/10">
              <div className={`h-2 rounded-full ${raw >= 0 ? "bg-mint" : "bg-ember"}`} style={{ width }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
