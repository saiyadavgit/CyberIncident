import React from 'react';
import { AlertOctagonIcon, RotateCwIcon } from 'lucide-react';
import { Button } from './Button';

interface ErrorStateProps {
  message: string;
  title?: string;
  onRetry?: () => void;
}

export function ErrorState({ message, title = "Couldn't load this data", onRetry }: ErrorStateProps) {
  return (
    <div role="alert" className="flex flex-col items-start gap-4 rounded-lg border border-crit/30 bg-crit/[0.06] p-5 sm:flex-row sm:items-center">
      <AlertOctagonIcon className="h-5 w-5 shrink-0 text-crit" aria-hidden />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-ink">{title}</p>
        <p className="mt-0.5 text-sm text-muted">{message}</p>
      </div>
      {onRetry &&
      <Button size="sm" icon={RotateCwIcon} onClick={onRetry}>
          Retry
        </Button>
      }
    </div>);

}