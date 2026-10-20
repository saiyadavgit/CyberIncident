import React from 'react';
import type { TooltipProps } from 'recharts';

export function ChartTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null;
  const rows = payload.filter((p) => Number(p.value) > 0);
  return (
    <div className="min-w-[150px] rounded-md border border-line-strong bg-surface px-3 py-2 shadow-xl shadow-black/40">
      <p className="mb-1.5 font-mono text-2xs text-faint">{label}</p>
      {(rows.length ? rows : payload).map((p) =>
      <div key={String(p.dataKey)} className="flex items-center justify-between gap-6 py-0.5 text-xs">
          <span className="flex items-center gap-2 text-muted">
            <span className="h-2 w-2 rounded-sm" style={{ background: p.color }} />
            {p.name}
          </span>
          <span className="font-mono text-ink tabular">{p.value}</span>
        </div>
      )}
    </div>);

}