import { type ReactNode } from "react";

interface EmptyStateProps {
  title: string;
  description: string;
  action?: ReactNode;
}

export default function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 p-8 text-center dark:border-slate-700 dark:bg-slate-900">
      <div className="mx-auto max-w-md">
        <h3 className="text-xl font-semibold">{title}</h3>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          {description}
        </p>
        {action && <div className="mt-6">{action}</div>}
      </div>
    </div>
  );
}