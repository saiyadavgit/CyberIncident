import React from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ChartTooltip } from './ChartTooltip';
import { SEVERITY_META } from '../../utils/incidentMeta';
import type { DailySeverityPoint } from '../../utils/incidentStats';
import type { Severity } from '../../types/incident';

const STACK: Severity[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

export function SeverityTrendChart({ data, height = 240 }: {data: DailySeverityPoint[];height?: number;}) {
  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 4, bottom: 0, left: -12 }}>
          <CartesianGrid vertical={false} stroke="rgb(28 34 44)" />
          <XAxis dataKey="label" tickLine={false} axisLine={false} minTickGap={24} dy={6} />
          <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={36} />
          <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgb(17 21 28)' }} />
          {STACK.map((s, i) =>
          <Bar
            key={s}
            dataKey={s}
            name={SEVERITY_META[s].label}
            stackId="sev"
            fill={SEVERITY_META[s].hex}
            maxBarSize={18}
            radius={i === STACK.length - 1 ? [2, 2, 0, 0] : 0}
            animationDuration={700} />

          )}
        </BarChart>
      </ResponsiveContainer>
    </div>);

}