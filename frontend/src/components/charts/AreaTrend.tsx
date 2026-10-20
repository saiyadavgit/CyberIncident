import React from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { format } from 'date-fns';
import { ChartTooltip } from './ChartTooltip';
import type { TrendPoint } from '../../types/admin';

interface AreaTrendProps {
  data: TrendPoint[];
  name: string;
  color?: string;
  height?: number;
}

function label(d: string): string {
  const date = new Date(d);
  return Number.isNaN(date.getTime()) ? d : format(date, 'dd MMM');
}

export function AreaTrend({ data, name, color = '#36E2C4', height = 220 }: AreaTrendProps) {
  const rows = data.map((p) => ({ label: label(p.date), count: p.count }));
  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={rows} margin={{ top: 8, right: 4, bottom: 0, left: -12 }}>
          <CartesianGrid vertical={false} stroke="rgb(28 34 44)" />
          <XAxis dataKey="label" tickLine={false} axisLine={false} minTickGap={28} dy={6} />
          <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={36} />
          <Tooltip content={<ChartTooltip />} cursor={{ stroke: 'rgb(44 52 65)' }} />
          <Area type="monotone" dataKey="count" name={name} stroke={color} strokeWidth={1.75} fill={color} fillOpacity={0.08} animationDuration={800} />
        </AreaChart>
      </ResponsiveContainer>
    </div>);

}