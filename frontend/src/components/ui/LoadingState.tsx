import React from 'react';

interface LoadingStateProps {
  rows?: number;
  label?: string;
}

export function LoadingState({ rows = 4, label = 'Loading' }: LoadingStateProps) {
  return (
    <div role="status" aria-live="polite" className="space-y-3 p-1">
      <span className="sr-only">{label}…</span>
      {Array.from({ length: rows }).map((_, i) =>
      <div key={i} className="relative h-10 overflow-hidden rounded-md bg-raised/70">
          <div className="absolute inset-y-0 left-0 w-1/3 animate-scan bg-line-strong/40" style={{ animationDelay: `${i * 80}ms` }} />
        </div>
      )}
    </div>);

}