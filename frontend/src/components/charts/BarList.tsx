import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { twMerge } from 'tailwind-merge';

export interface BarListItem {
  key: string;
  label: string;
  value: number;
  color?: string;
  hint?: string;
}

export function BarList({ items, emptyLabel = 'No data', limit }: {items: BarListItem[];emptyLabel?: string;limit?: number;}) {
  const reduce = useReducedMotion();
  const shown = limit ? items.slice(0, limit) : items;
  const max = Math.max(1, ...shown.map((i) => i.value));
  if (!shown.length) return <p className="py-6 text-center text-sm text-muted">{emptyLabel}</p>;
  return (
    <ul className="space-y-3">
      {shown.map((item, i) =>
      <li key={item.key}>
          <div className="flex items-baseline justify-between gap-4 text-sm">
            <span className="truncate text-muted">
              {item.label}
              {item.hint && <span className="ml-2 font-mono text-2xs text-faint">{item.hint}</span>}
            </span>
            <span className="font-mono text-ink tabular">{item.value}</span>
          </div>
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-raised">
            <motion.div
            initial={reduce ? false : { scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.5, delay: Math.min(i * 0.04, 0.3), ease: [0.23, 1, 0.32, 1] }}
            style={{ width: `${item.value / max * 100}%`, transformOrigin: 'left', background: item.color }}
            className={twMerge('h-full rounded-full', item.color ? '' : 'bg-accent/80')} />
          
          </div>
        </li>
      )}
    </ul>);

}