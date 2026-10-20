import React from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';
import { SEVERITIES, SEVERITY_META } from '../../utils/incidentMeta';
import { AnimatedNumber } from '../ui/AnimatedNumber';
import type { Severity } from '../../types/incident';

interface SeverityDonutProps {
  counts: Record<Severity, number>;
  caption: string;
  size?: number;
}

export function SeverityDonut({ counts, caption, size = 168 }: SeverityDonutProps) {
  const total = SEVERITIES.reduce((a, s) => a + counts[s], 0);
  const data = SEVERITIES.map((s) => ({ name: SEVERITY_META[s].label, value: counts[s], color: SEVERITY_META[s].hex }));
  const slices = total ? data : [{ name: 'none', value: 1, color: 'rgb(44 52 65)' }];
  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={slices}
              dataKey="value"
              innerRadius={size * 0.38}
              outerRadius={size * 0.48}
              paddingAngle={total ? 2 : 0}
              stroke="none"
              startAngle={90}
              endAngle={-270}
              animationDuration={800}>
              
              {slices.map((d, i) =>
              <Cell key={i} fill={d.color} />
              )}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <AnimatedNumber value={total} className="font-mono text-3xl font-medium text-ink tabular" />
          <span className="text-2xs text-faint">{caption}</span>
        </div>
      </div>
      <ul className="w-full space-y-2.5">
        {SEVERITIES.map((s) => {
          const pct = total ? Math.round(counts[s] / total * 100) : 0;
          return (
            <li key={s} className="flex items-center gap-3 text-sm">
              <span className="h-2 w-2 shrink-0 rounded-sm" style={{ background: SEVERITY_META[s].hex }} aria-hidden />
              <span className="flex-1 text-muted">{SEVERITY_META[s].label}</span>
              <span className="font-mono text-ink tabular">{counts[s]}</span>
              <span className="w-10 text-right font-mono text-2xs text-faint tabular">{pct}%</span>
            </li>);

        })}
      </ul>
    </div>);

}