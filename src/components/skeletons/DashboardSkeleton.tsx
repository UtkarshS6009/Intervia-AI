import React from 'react';
import { Skeleton } from './Skeleton';

export const DashboardSkeleton: React.FC = () => {
  return (
    <div className="space-y-8 py-4 animate-in fade-in duration-300">
      {/* Top Banner Skeleton */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/20 to-slate-900 border border-slate-800/80">
        <div className="space-y-2.5 w-full max-w-lg">
          <Skeleton className="h-8 w-64 rounded-xl" />
          <Skeleton className="h-4 w-96 max-w-full rounded-md" />
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Skeleton className="h-10 w-36 rounded-xl" />
          <Skeleton className="h-10 w-24 rounded-xl" />
        </div>
      </div>

      {/* 4 Metric Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-3.5 w-24 rounded" />
              <Skeleton className="w-8 h-8 rounded-lg" />
            </div>
            <div className="flex items-baseline gap-2 pt-1">
              <Skeleton className="h-7 w-20 rounded-md" />
              <Skeleton className="h-3.5 w-12 rounded" />
            </div>
            <Skeleton className="h-3 w-32 rounded mt-2" />
          </div>
        ))}
      </div>

      {/* Charts Row Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Score Trend Skeleton */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-5">
          <div className="flex items-center justify-between">
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-48 rounded" />
              <Skeleton className="h-3 w-64 rounded" />
            </div>
            <Skeleton className="h-6 w-24 rounded-md" />
          </div>

          {/* Chart Wireframe Placeholder */}
          <div className="h-[250px] w-full flex items-end gap-3 pt-6 px-2">
            {[40, 55, 68, 75, 84, 92].map((height, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                <Skeleton
                  className="w-full rounded-t-lg bg-indigo-500/10"
                  style={{ height: `${height}%` }}
                />
                <Skeleton className="h-2.5 w-8 rounded" />
              </div>
            ))}
          </div>
        </div>

        {/* Competency Radar Skeleton */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4">
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-36 rounded" />
            <Skeleton className="h-3 w-52 rounded" />
          </div>

          {/* Circular polygon placeholder */}
          <div className="h-[250px] w-full flex items-center justify-center">
            <div className="relative w-44 h-44 rounded-full border border-slate-800/80 flex items-center justify-center">
              <div className="w-32 h-32 rounded-full border border-slate-800/60 flex items-center justify-center">
                <div className="w-20 h-20 rounded-full border border-slate-800/40 flex items-center justify-center">
                  <Skeleton className="w-12 h-12 rounded-full bg-cyan-500/10" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Performance & Weak Topics Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Category Breakdown Bars Skeleton */}
        <div className="lg:col-span-6 p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4">
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-44 rounded" />
            <Skeleton className="h-3 w-56 rounded" />
          </div>

          <div className="space-y-3.5 pt-2">
            {[80, 72, 85, 65, 60].map((width, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between">
                  <Skeleton className="h-3 w-28 rounded" />
                  <Skeleton className="h-3 w-8 rounded" />
                </div>
                <div className="w-full bg-slate-800/40 rounded-full h-3">
                  <Skeleton className="h-3 rounded-full bg-indigo-500/20" style={{ width: `${width}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Priority Weak Topics Skeleton */}
        <div className="lg:col-span-6 p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4">
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-52 rounded" />
            <Skeleton className="h-3 w-64 rounded" />
          </div>

          <div className="space-y-3 pt-2">
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
              <div className="flex justify-between items-center">
                <Skeleton className="h-3.5 w-60 rounded" />
                <Skeleton className="h-4 w-20 rounded" />
              </div>
              <Skeleton className="h-2.5 w-72 rounded" />
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
              <div className="flex justify-between items-center">
                <Skeleton className="h-3.5 w-56 rounded" />
                <Skeleton className="h-4 w-16 rounded" />
              </div>
              <Skeleton className="h-2.5 w-64 rounded" />
            </div>
          </div>

          <Skeleton className="h-10 w-full rounded-xl mt-2" />
        </div>
      </div>

      {/* Recent Interviews Table Skeleton */}
      <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-40 rounded" />
          <Skeleton className="h-3 w-32 rounded" />
        </div>

        <div className="space-y-3 pt-2">
          {[1, 2, 3].map((row) => (
            <div key={row} className="flex items-center justify-between p-3 rounded-xl bg-slate-950/40 border border-slate-800/60">
              <div className="flex items-center gap-3">
                <Skeleton className="w-2.5 h-2.5 rounded-full" />
                <Skeleton className="h-3.5 w-44 rounded" />
              </div>
              <Skeleton className="h-3 w-24 rounded hidden sm:block" />
              <Skeleton className="h-5 w-16 rounded-md" />
              <Skeleton className="h-3 w-20 rounded hidden sm:block" />
              <Skeleton className="h-4 w-12 rounded" />
              <Skeleton className="h-3 w-16 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
