import React from "react";
import { InboxIcon, BoxIcon } from "lucide-react";
interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: BoxIcon;
  action?: React.ReactNode;
}
export function EmptyState({
  title,
  description,
  icon: Icon = InboxIcon,
  action
}: EmptyStateProps) {
  return <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg border border-line bg-raised">
        <Icon className="h-5 w-5 text-muted" aria-hidden />
      </div>
      <p className="text-sm font-medium text-ink">{title}</p>
      {description && <p className="mt-1 max-w-sm text-sm text-muted">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>;
}