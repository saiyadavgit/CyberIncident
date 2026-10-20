import React from 'react';
import { twMerge } from 'tailwind-merge';

interface PanelProps {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
  as?: 'section' | 'div' | 'aside';
  id?: string;
}

export function Panel({ title, subtitle, action, children, className, bodyClassName, as: Tag = 'section', id }: PanelProps) {
  return (
    <Tag id={id} className={twMerge('rounded-xl border border-line bg-surface', className)}>
      {(title || action) &&
      <div className="flex items-start justify-between gap-4 px-5 pb-1 pt-4">
          <div className="min-w-0">
            {title && <h2 className="text-sm font-semibold text-ink">{title}</h2>}
            {subtitle && <p className="mt-0.5 text-xs text-muted">{subtitle}</p>}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      }
      <div className={twMerge('p-5', title || action ? 'pt-3' : '', bodyClassName)}>{children}</div>
    </Tag>);

}