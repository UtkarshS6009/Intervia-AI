import React from 'react';
import { Skeleton } from './Skeleton';
import { Layers, FolderGit2, GraduationCap, AlertCircle } from 'lucide-react';

/**
 * Skeleton component matching the layout of the Categorized Skill Tags section
 */
export const SkillTagsSkeleton: React.FC = () => {
  return (
    <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-indigo-400 opacity-60" />
          <Skeleton className="h-4 w-48 rounded" />
        </div>
        <Skeleton className="h-4 w-28 rounded-md" />
      </div>

      {/* Categories and Skill Tag Pills */}
      <div className="space-y-4 pt-1">
        {[
          { labelWidth: 'w-36', tagWidths: ['w-16', 'w-24', 'w-20', 'w-28', 'w-18'] },
          { labelWidth: 'w-44', tagWidths: ['w-20', 'w-18', 'w-24', 'w-28'] },
          { labelWidth: 'w-32', tagWidths: ['w-24', 'w-28', 'w-16', 'w-20', 'w-22'] },
        ].map((cat, idx) => (
          <div key={idx} className="space-y-2">
            <Skeleton className={`h-3 ${cat.labelWidth} rounded`} />
            <div className="flex flex-wrap gap-1.5">
              {cat.tagWidths.map((width, tIdx) => (
                <div
                  key={tIdx}
                  className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center"
                >
                  <Skeleton className={`h-4 ${width} rounded`} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Skeleton component matching the layout of the Parsed Project List section
 */
export const ProjectListSkeleton: React.FC = () => {
  return (
    <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <FolderGit2 className="w-4 h-4 text-cyan-400 opacity-60" />
        <Skeleton className="h-4 w-52 rounded" />
      </div>

      {/* Project Cards List */}
      <div className="space-y-3 pt-1">
        {[1, 2].map((proj) => (
          <div
            key={proj}
            className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2.5"
          >
            {/* Title & Tech Stack Pills */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <Skeleton className="h-4 w-56 rounded" />
              <div className="flex gap-1">
                <Skeleton className="h-4 w-14 rounded bg-slate-900 border border-slate-800" />
                <Skeleton className="h-4 w-16 rounded bg-slate-900 border border-slate-800" />
                <Skeleton className="h-4 w-12 rounded bg-slate-900 border border-slate-800" />
              </div>
            </div>

            {/* Description lines */}
            <div className="space-y-1.5 pt-0.5">
              <Skeleton className="h-3 w-full rounded" />
              <Skeleton className="h-3 w-4/5 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Skeleton component matching the layout of the Education section
 */
export const EducationSkeleton: React.FC = () => {
  return (
    <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <GraduationCap className="w-4 h-4 text-emerald-400 opacity-60" />
        <Skeleton className="h-4 w-48 rounded" />
      </div>

      {/* Education Credentials List */}
      <div className="space-y-3 pt-1">
        {[1, 2].map((edu) => (
          <div
            key={edu}
            className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between"
          >
            <div className="space-y-1.5 w-full max-w-sm">
              <Skeleton className="h-3.5 w-48 rounded" />
              <Skeleton className="h-3 w-36 rounded" />
            </div>
            <Skeleton className="h-4 w-14 rounded font-mono" />
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Full Composite Skeleton mocking the layout of the Resume Analysis page
 */
export const ResumeAnalysisSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* ATS Readiness Score Card Skeleton */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950/30 border border-slate-800 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-3 w-32 rounded" />
            <Skeleton className="h-6 w-52 rounded" />
            <Skeleton className="h-3.5 w-72 rounded" />
          </div>

          {/* Big Score Dial Placeholder */}
          <div className="flex items-center gap-3 bg-slate-950/80 px-5 py-3 rounded-2xl border border-slate-800">
            <div className="space-y-1 text-right">
              <Skeleton className="h-8 w-16 rounded-md ml-auto" />
              <Skeleton className="h-2.5 w-20 rounded" />
            </div>
          </div>
        </div>

        {/* 4 ATS Pillars Skeleton */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
              <Skeleton className="h-3 w-20 rounded" />
              <Skeleton className="h-6 w-12 rounded" />
            </div>
          ))}
        </div>

        {/* Recommendations skeleton */}
        <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2.5">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-3.5 h-3.5 text-amber-400 opacity-60" />
            <Skeleton className="h-3.5 w-48 rounded" />
          </div>
          <div className="space-y-1.5 pl-5">
            <Skeleton className="h-3 w-full rounded" />
            <Skeleton className="h-3 w-4/5 rounded" />
          </div>
        </div>
      </div>

      {/* Matching Skill Tags Block */}
      <SkillTagsSkeleton />

      {/* Matching Project List Block */}
      <ProjectListSkeleton />

      {/* Matching Education Block */}
      <EducationSkeleton />
    </div>
  );
};

export default ResumeAnalysisSkeleton;
