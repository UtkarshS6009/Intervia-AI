import React, { useState, useEffect } from 'react';
import { 
  Compass, 
  Calendar, 
  CheckCircle2, 
  Circle, 
  ExternalLink, 
  Clock, 
  Sparkles, 
  RefreshCw,
  BookOpen,
  Code2
} from 'lucide-react';
import { getRoadmap, generateRoadmap, toggleRoadmapDay } from '../services/api';

export const LearningRoadmap: React.FC = () => {
  const [roadmap, setRoadmap] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [targetRole, setTargetRole] = useState('Machine Learning Engineer');

  useEffect(() => {
    async function fetchRoadmap() {
      try {
        const res = await getRoadmap();
        if (res?.roadmap) {
          setRoadmap(res.roadmap);
          setTargetRole(res.roadmap.targetRole || 'Machine Learning Engineer');
        }
      } catch (e) {
        console.error('Failed to load roadmap:', e);
      } finally {
        setLoading(false);
      }
    }
    fetchRoadmap();
  }, []);

  const handleToggle = async (dayNumber: number) => {
    try {
      const res = await toggleRoadmapDay(dayNumber);
      if (res?.success) {
        setRoadmap((prev: any) => {
          if (!prev) return prev;
          const newWeeks = prev.weeks.map((w: any) => ({
            ...w,
            days: w.days.map((d: any) => (d.day === dayNumber ? { ...d, completed: !d.completed } : d)),
          }));
          return { ...prev, weeks: newWeeks };
        });
      }
    } catch (e) {
      console.error('Toggle error:', e);
    }
  };

  const handleRegenerate = async () => {
    setGenerating(true);
    try {
      const res = await generateRoadmap(targetRole, roadmap?.weakTopics);
      if (res?.roadmap) {
        setRoadmap(res.roadmap);
      }
    } catch (e) {
      console.error('Regenerate error:', e);
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-400 font-mono">Loading personalized 30-day curriculum...</p>
        </div>
      </div>
    );
  }

  // Calculate completion percentage
  const allDays = (roadmap?.weeks || []).flatMap((w: any) => w.days || []);
  const completedCount = allDays.filter((d: any) => d.completed).length;
  const totalDays = allDays.length || 1;
  const progressPercent = Math.round((completedCount / totalDays) * 100);

  return (
    <div className="max-w-5xl mx-auto py-6 space-y-8">
      {/* Top Banner */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border border-slate-800 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold">
              <Compass className="w-3.5 h-3.5" />
              <span>Personalized Skill-Gap Acceleration Plan</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              30-Day Engineering Roadmap
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              Target Role: <strong className="text-indigo-300">{targetRole}</strong> • Focused on your lowest scoring mock topics.
            </p>
          </div>

          {/* Progress Dial */}
          <div className="bg-slate-950/80 p-4 px-6 rounded-2xl border border-slate-800 text-right shrink-0">
            <span className="text-3xl font-extrabold text-white font-mono">{progressPercent}%</span>
            <p className="text-[11px] text-emerald-400 font-semibold mt-0.5">
              {completedCount} of {totalDays} Tasks Mastered
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
          <div
            className="bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 h-full rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Weak Topics Targeted */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs border-t border-slate-800/80">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-semibold">Targeted Weak Topics:</span>
            {(roadmap?.weakTopics || ['SQL Joins', 'System Design', 'Dynamic Programming']).map((topic: string) => (
              <span key={topic} className="px-2 py-0.5 rounded bg-slate-800 text-indigo-300 border border-slate-700 text-[11px]">
                {topic}
              </span>
            ))}
          </div>

          <button
            onClick={handleRegenerate}
            disabled={generating}
            className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${generating ? 'animate-spin' : ''}`} />
            <span>Regenerate with Ollama</span>
          </button>
        </div>
      </div>

      {/* 4-Week Milestone Timeline */}
      <div className="space-y-8">
        {(roadmap?.weeks || []).map((week: any) => (
          <div key={week.weekNumber} className="space-y-4">
            {/* Week Header */}
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-xl bg-indigo-600 text-white text-xs font-bold font-mono">
                WEEK {week.weekNumber}
              </span>
              <div>
                <h3 className="text-base font-bold text-white">{week.theme}</h3>
                <p className="text-xs text-slate-400">{week.description}</p>
              </div>
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(week.days || []).map((day: any) => {
                const isCompleted = day.completed;

                return (
                  <div
                    key={day.day}
                    className={`p-5 rounded-2xl border transition-all ${
                      isCompleted
                        ? 'bg-slate-950/40 border-emerald-500/30'
                        : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggle(day.day)}
                          className="text-slate-400 hover:text-emerald-400 transition-colors"
                        >
                          {isCompleted ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                          ) : (
                            <Circle className="w-5 h-5 text-slate-600" />
                          )}
                        </button>
                        <span className="text-xs font-mono font-bold text-slate-400">
                          Day {day.day}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            day.priority === 'High'
                              ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}
                        >
                          {day.priority} Priority
                        </span>
                        <span className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                          <Clock className="w-3 h-3 text-cyan-400" /> {day.estimatedHours}h
                        </span>
                      </div>
                    </div>

                    <h4 className={`text-sm font-bold mb-2 ${isCompleted ? 'line-through text-slate-500' : 'text-white'}`}>
                      {day.title}
                    </h4>

                    {/* Task checklist */}
                    <div className="space-y-1 mb-3 text-xs">
                      {day.tasks?.map((task: string, tIdx: number) => (
                        <div key={tIdx} className="flex items-start gap-1.5 text-slate-300">
                          <span className="text-indigo-400 font-bold">•</span>
                          <span className="text-[11px]">{task}</span>
                        </div>
                      ))}
                    </div>

                    {/* Official Curated Documentation Resources */}
                    {day.resources?.length > 0 && (
                      <div className="pt-2 border-t border-slate-800/80 space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                          Curated Learning Links:
                        </span>
                        <div className="flex flex-col gap-1">
                          {day.resources.map((res: any, rIdx: number) => (
                            <a
                              key={rIdx}
                              href={res.url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5 group"
                            >
                              <BookOpen className="w-3 h-3 text-cyan-400 shrink-0" />
                              <span className="underline-offset-2 hover:underline truncate">{res.title}</span>
                              <ExternalLink className="w-2.5 h-2.5 opacity-60 group-hover:opacity-100 shrink-0" />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
