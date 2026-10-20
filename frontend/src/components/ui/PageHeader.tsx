import React from 'react';

interface PageHeaderProps {
  title: string;
  description?: React.ReactNode;
  context?: React.ReactNode;
  actions?: React.ReactNode;
}

export function PageHeader({ title, description, context, actions }: PageHeaderProps) {
  return (
    <header className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="min-w-0">
        {context && <div className="mb-2 font-mono text-xs text-muted">{context}</div>}
        <h1 className="text-2xl font-semibold tracking-tight text-ink md:text-[28px]">{title}</h1>
        {description && <p className="mt-1.5 max-w-2xl text-sm text-muted">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </header>);

}