import React from 'react';

export const SkeletonBox: React.FC<{ className?: string }> = ({ className = 'h-4 w-full' }) => (
  <div className={`bg-slate-200/70 dark:bg-slate-800/60 rounded-lg animate-shimmer ${className}`} />
);

export const LandingSkeleton: React.FC = () => {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12 animate-pulse">
      {/* Top Banner Skeleton */}
      <div className="flex flex-col items-center space-y-4 text-center max-w-3xl mx-auto">
        <SkeletonBox className="h-8 w-48 rounded-full" />
        <SkeletonBox className="h-12 w-3/4 rounded-xl" />
        <SkeletonBox className="h-12 w-1/2 rounded-xl" />
        <SkeletonBox className="h-6 w-full max-w-xl" />
        <div className="flex gap-4 pt-4">
          <SkeletonBox className="h-11 w-36 rounded-xl" />
          <SkeletonBox className="h-11 w-36 rounded-xl" />
        </div>
      </div>

      {/* Hero Dashboard Preview Skeleton */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 md:p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <SkeletonBox className="h-6 w-6 rounded-md" />
            <SkeletonBox className="h-5 w-64" />
          </div>
          <SkeletonBox className="h-6 w-24 rounded-full" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4">
            <SkeletonBox className="h-6 w-48" />
            <SkeletonBox className="h-20 w-full rounded-xl" />
            <SkeletonBox className="h-20 w-full rounded-xl" />
            <SkeletonBox className="h-20 w-full rounded-xl" />
          </div>
          <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 flex flex-col items-center justify-center space-y-4">
            <SkeletonBox className="h-28 w-28 rounded-full" />
            <SkeletonBox className="h-4 w-32" />
            <SkeletonBox className="h-6 w-44 rounded-lg" />
          </div>
        </div>
      </div>

      {/* Features Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3">
            <SkeletonBox className="h-10 w-10 rounded-xl" />
            <SkeletonBox className="h-6 w-40" />
            <SkeletonBox className="h-4 w-full" />
            <SkeletonBox className="h-4 w-3/4" />
          </div>
        ))}
      </div>
    </div>
  );
};

export const DashboardSkeleton: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <SkeletonBox className="h-8 w-48" />
          <SkeletonBox className="h-4 w-64" />
        </div>
        <SkeletonBox className="h-10 w-36 rounded-xl" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
            <SkeletonBox className="h-4 w-24" />
            <SkeletonBox className="h-8 w-16" />
            <SkeletonBox className="h-3 w-32" />
          </div>
        ))}
      </div>

      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 space-y-4">
        <SkeletonBox className="h-6 w-48" />
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <SkeletonBox key={i} className="h-12 w-full rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
};
