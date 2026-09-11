import React from 'react';

export const CardSkeleton: React.FC = () => {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 overflow-hidden animate-pulse">
      <div className="h-44 bg-slate-200 dark:bg-slate-800 w-full" />
      <div className="p-5 space-y-3">
        <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded-md w-3/4" />
        <div className="h-3.5 bg-slate-200 dark:bg-slate-800 rounded-md w-full" />
        <div className="h-3.5 bg-slate-200 dark:bg-slate-800 rounded-md w-5/6" />
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
          <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
          <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-2/3" />
        </div>
        <div className="pt-2">
          <div className="h-9 bg-slate-200 dark:bg-slate-800 rounded-xl w-full" />
        </div>
      </div>
    </div>
  );
};

export const CardGridSkeleton: React.FC<{ count?: number }> = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
};

export const DetailSkeleton: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6 animate-pulse">
      <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-1/4" />
      <div className="h-72 bg-slate-200 dark:bg-slate-800 rounded-2xl w-full" />
      <div className="space-y-3">
        <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
      </div>
    </div>
  );
};
