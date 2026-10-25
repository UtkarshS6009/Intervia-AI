import React, { useState } from 'react';
import { 
  Sparkles, 
  BrainCircuit, 
  Building2, 
  Mic, 
  FileText, 
  Sliders, 
  HelpCircle, 
  Play, 
  Zap,
  CheckCircle2
} from 'lucide-react';
import { createInterview } from '../services/api';

interface InterviewSetupProps {
  onSessionCreated: (sessionId: string) => void;
}

export const InterviewSetup: React.FC<InterviewSetupProps> = ({ onSessionCreated }) => {
  const [targetRole, setTargetRole] = useState('Machine Learning Engineer');
  const [category, setCategory] = useState('Machine Learning');
  const [company, setCompany] = useState('Google');
  const [difficulty, setDifficulty] = useState('Adaptive');
  const [mode, setMode] = useState<'text' | 'voice'>('text');
  const [totalQuestions, setTotalQuestions] = useState(5);
  const [loading, setLoading] = useState(false);

  const categories = [
    { id: 'Machine Learning', label: 'Machine Learning & AI', desc: 'Models, feature engineering, loss functions, PyTorch' },
    { id: 'Python', label: 'Python Internals', desc: 'GIL, generators, asyncio, memory management, OOP' },
    { id: 'SQL', label: 'SQL & Database Design', desc: 'Joins, indexing, execution plans, window functions' },
    { id: 'Data Structures & Algorithms', label: 'DSA & Dynamic Programming', desc: 'Trees, graphs, DP, binary search, Big-O' },
    { id: 'System Design', label: 'System Design & Scalability', desc: 'Microservices, caching, sharding, message queues' },
    { id: 'HR & Behavioral', label: 'Behavioral & Leadership (STAR)', desc: 'Conflict resolution, ownership, trade-offs' },
    { id: 'Mixed', label: 'Comprehensive Mixed Simulation', desc: 'Blends technical deep dives, coding, and STAR' },
  ];

  const companies = [
    { id: 'Google', name: 'Google', emoji: '🔍', focus: 'Scalability, Big-O rigor, distributed systems' },
    { id: 'Amazon', name: 'Amazon', emoji: '📦', focus: '16 Leadership Principles & customer obsession' },
    { id: 'Microsoft', name: 'Microsoft', emoji: '🪟', focus: 'Clean design patterns, growth mindset' },
    { id: 'Startup', name: 'High-Growth Startup', emoji: '🚀', focus: 'Speed, full-stack pragmatism, product intuition' },
  ];

  const handleLaunch = async () => {
    setLoading(true);
    try {
      const res = await createInterview({
        category,
        difficulty,
        mode,
        targetRole,
        company,
        totalQuestions,
      });
      if (res?.sessionId) {
        onSessionCreated(res.sessionId);
      }
    } catch (err) {
      console.error('Failed to create interview:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-6 space-y-8">
      {/* Title */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
          <span>Interactive Simulation Setup</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Configure Your Mock Interview</h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
          Tailor question categories, target company focus, mode, and adaptive difficulty.
        </p>
      </div>

      <div className="p-6 sm:p-8 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-8 backdrop-blur-xl">
        {/* Target Role input */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-white uppercase tracking-wider flex items-center justify-between">
            <span>1. Target Job Role</span>
            <span className="text-slate-400 font-normal">Personalizes AI questions</span>
          </label>
          <input
            type="text"
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
            placeholder="e.g. Machine Learning Engineer, Senior Full Stack Developer"
          />
        </div>

        {/* Category Selection */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-white uppercase tracking-wider">
            2. Select Interview Category Track
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {categories.map((cat) => {
              const isSelected = category === cat.id;
              return (
                <div
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-indigo-600/10 border-indigo-500 shadow-sm shadow-indigo-500/20'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/40'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-sm font-bold ${isSelected ? 'text-indigo-300' : 'text-slate-200'}`}>
                      {cat.label}
                    </span>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-indigo-400" />}
                  </div>
                  <p className="text-xs text-slate-400">{cat.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Company Style */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-white uppercase tracking-wider flex items-center justify-between">
            <span>3. Company Practice Profile</span>
            <span className="text-slate-400 font-normal">Public interview style emulation</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {companies.map((comp) => {
              const isSelected = company === comp.id;
              return (
                <div
                  key={comp.id}
                  onClick={() => setCompany(comp.id)}
                  className={`p-3.5 rounded-xl border text-center cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-indigo-600/15 border-indigo-500 text-white shadow-sm shadow-indigo-500/20'
                      : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <span className="text-2xl mb-1 block">{comp.emoji}</span>
                  <p className="text-xs font-bold">{comp.name}</p>
                  <p className="text-[10px] text-slate-400 mt-1 line-clamp-1">{comp.focus}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Difficulty & Mode & Length */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
          {/* Difficulty */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-white uppercase tracking-wider flex items-center justify-between">
              <span>Difficulty</span>
              <span className="text-indigo-400 font-semibold text-[11px]">Recommended: Adaptive</span>
            </label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="Adaptive">⚡ Adaptive (Auto-adjusts based on answers)</option>
              <option value="Easy">Easy (Fundamentals & Core syntax)</option>
              <option value="Medium">Medium (Industry standard depth)</option>
              <option value="Hard">Hard (Staff / Senior architecture)</option>
            </select>
          </div>

          {/* Mode */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-white uppercase tracking-wider">
              Interview Mode
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setMode('text')}
                className={`py-2.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  mode === 'text'
                    ? 'bg-indigo-600 text-white border-indigo-500'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Text Mode</span>
              </button>
              <button
                type="button"
                onClick={() => setMode('voice')}
                className={`py-2.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  mode === 'voice'
                    ? 'bg-indigo-600 text-white border-indigo-500'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <Mic className="w-3.5 h-3.5" />
                <span>Voice Mode</span>
              </button>
            </div>
          </div>

          {/* Questions Count */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-white uppercase tracking-wider">
              Questions Count
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[5, 10, 15].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setTotalQuestions(num)}
                  className={`py-2.5 rounded-xl border text-xs font-mono font-semibold transition-all ${
                    totalQuestions === num
                      ? 'bg-indigo-600 text-white border-indigo-500'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {num} Qs
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Launch Button */}
        <button
          onClick={handleLaunch}
          disabled={loading}
          className="w-full py-4 rounded-xl bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-bold text-sm shadow-xl shadow-indigo-500/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Retrieving Curated Questions & Personalizing via Gemini...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" />
              <span>Enter Mock Interview Arena ({totalQuestions} Questions)</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
