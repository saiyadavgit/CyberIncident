import React from 'react';
import { twMerge } from 'tailwind-merge';
import type { RiskSignal } from '../../utils/riskSignals';

const LEVEL_BG = ['', 'bg-low', 'bg-med', 'bg-high', 'bg-crit'];
const LEVEL_TEXT = ['', 'text-muted', 'text-med', 'text-high', 'text-crit'];

export function RiskSignals({ signals, columns = 2 }: {signals: RiskSignal[];columns?: 1 | 2 | 3;}) {
  const cols = columns === 1 ? '' : columns === 2 ? 'sm:grid-cols-2' : 'sm:grid-cols-3';
  return (
    <dl className={twMerge('grid gap-x-6', cols)}>
      {signals.map((s) =>
      <div key={s.key} className="flex items-center justify-between gap-3 border-b border-line py-2.5">
          <dt className="text-xs text-muted">{s.label}</dt>
          <dd className="flex min-w-0 items-center gap-2.5">
            <span className={twMerge('truncate text-sm', s.level >= 3 ? LEVEL_TEXT[s.level] : 'text-ink')}>{s.value}</span>
            <span className="flex gap-[2px]" aria-label={`Risk level ${s.level} of 4`}>
              {[1, 2, 3, 4].map((n) =>
            <span key={n} className={twMerge('h-2.5 w-[3px] rounded-[1px]', n <= s.level ? LEVEL_BG[s.level] : 'bg-line-strong')} />
            )}
            </span>
          </dd>
        </div>
      )}
    </dl>);

}