import React from 'react';
import { LucideIcon, Search, Inbox, Sparkles, FolderSearch } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = FolderSearch,
  title,
  description,
  action,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-10 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 my-6">
      <div className="w-14 h-14 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 dark:text-slate-500 shadow-sm mb-4">
        <Icon className="w-7 h-7 stroke-[1.5]" />
      </div>
      <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 tracking-tight">
        {title}
      </h3>
      {description && (
        <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed">
          {description}
        </p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-sm"
        >
          {action.label}
        </button>
      )}
    </div>
  );
};
