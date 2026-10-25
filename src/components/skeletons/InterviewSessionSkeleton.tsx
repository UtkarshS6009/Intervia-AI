import React from 'react';
import { Skeleton } from './Skeleton';

export const InterviewSessionSkeleton: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto py-4 space-y-6 animate-in fade-in duration-300">
      {/* Top Bar Skeleton */}
      <div className="flex items-center justify-between p-4 px-6 rounded-2xl bg-slate-900 border border-slate-800">
        <div className="flex items-center gap-3">
          <Skeleton className="h-7 w-24 rounded-lg" />
          <div className="h-4 w-px bg-slate-800" />
          <Skeleton className="h-4 w-36 rounded" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>

        <div className="flex items-center gap-4">
          <Skeleton className="h-7 w-32 rounded-lg" />
          <Skeleton className="h-7 w-20 rounded-lg" />
        </div>
      </div>

      {/* Progress Bar Skeleton */}
      <div className="space-y-1.5">
        <div className="flex justify-between">
          <Skeleton className="h-3 w-32 rounded" />
          <Skeleton className="h-3 w-20 rounded" />
        </div>
        <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
          <Skeleton className="h-full w-1/3 rounded-full bg-indigo-500/30" />
        </div>
      </div>

      {/* Main Question Card Skeleton */}
      <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-900/80 border border-slate-800 shadow-xl space-y-5">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-36 rounded" />
          <Skeleton className="h-8 w-28 rounded-lg" />
        </div>

        {/* Multiline Question Text Placeholder */}
        <div className="space-y-2.5 pt-1">
          <Skeleton className="h-6 w-full rounded-md" />
          <Skeleton className="h-6 w-5/6 rounded-md" />
          <Skeleton className="h-6 w-3/4 rounded-md" />
        </div>

        {/* Expected Concepts Hint Box Skeleton */}
        <div className="pt-2">
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-start gap-3">
            <Skeleton className="w-4 h-4 rounded-full shrink-0 mt-0.5" />
            <div className="space-y-1.5 w-full">
              <Skeleton className="h-3 w-44 rounded" />
              <Skeleton className="h-3 w-4/5 rounded" />
            </div>
          </div>
        </div>
      </div>

      {/* Answer Box Skeleton */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="w-4 h-4 rounded" />
            <Skeleton className="h-4 w-40 rounded" />
          </div>
          <Skeleton className="h-8 w-36 rounded-xl" />
        </div>

        {/* Textarea Placeholder */}
        <Skeleton className="h-44 w-full rounded-xl bg-slate-950 border border-slate-800" />

        <div className="flex items-center justify-between pt-2">
          <Skeleton className="h-3.5 w-20 rounded" />
          <Skeleton className="h-10 w-52 rounded-xl" />
        </div>
      </div>
    </div>
  );
};
