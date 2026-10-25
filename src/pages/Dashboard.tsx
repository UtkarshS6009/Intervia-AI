import React from 'react';
import { 
  Brain, 
  Target, 
  Zap, 
  Clock, 
  Play, 
  ChevronRight, 
  Activity,
  Code2,
  TrendingUp
} from 'lucide-react';

interface DashboardProps {
  // Optional prop so your App.tsx can pass down a navigation function
  onNavigate?: (page: string) => void; 
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  
  // Safe navigation helper
  const handleNavigate = (page: string) => {
    if (onNavigate) {
      onNavigate(page);
    } else {
      console.log(`Navigation to ${page} triggered!`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12 animate-in fade-in duration-500">
      
      {/* --- Premium Welcome Banner --- */}
      <div className="glass-panel p-8 sm:p-10 rounded-3xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        {/* Abstract Background Glow */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-500/20 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-cyan-500/10 blur-[100px] rounded-full pointer-events-none" />
        
        <div className="relative z-10 space-y-2">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Utkarsh</span>
          </h1>
          <p className="text-slate-400 text-sm sm:text-base max-w-xl leading-relaxed">
            Your AI Interview V3 engine is ready. You have mastered 4 concepts this week. Let's keep the momentum going!
          </p>
        </div>

        <div className="relative z-10 w-full md:w-auto flex shrink-0">
          <button 
            onClick={() => handleNavigate('interview')}
            className="w-full md:w-auto px-8 py-4 rounded-xl bg-white text-slate-950 font-bold shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_rgba(255,255,255,0.5)] flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95"
          >
            <Play className="w-5 h-5 fill-slate-950" />
            Start Mock Interview
          </button>
        </div>
      </div>

      {/* --- Stats Grid (Responsive: 1 col mobile, 2 sm, 4 lg) --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {[
          { label: 'Avg Technical Score', value: '88%', icon: Target, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
          { label: 'Interviews Completed', value: '12', icon: Activity, color: 'text-indigo-400', bg: 'bg-indigo-500/10 border-indigo-500/20' },
          { label: 'Live Coding Solved', value: '24', icon: Code2, color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/20' },
          { label: 'Practice Time', value: '14h', icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
        ].map((stat, i) => (
          <div key={i} className="glass-panel p-6 rounded-2xl flex items-start gap-4 transition-transform hover:-translate-y-1 hover:shadow-2xl">
            <div className={`p-3 rounded-xl border ${stat.bg}`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider truncate">{stat.label}</p>
              <h3 className="text-2xl font-black text-white mt-1">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* --- Main Content Grid --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        
        {/* Left Column: Recent Activity (Takes up 2/3 of space on desktop) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-400" />
              Recent Interview Sessions
            </h2>
            <button className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors">View All</button>
          </div>
          
          <div className="glass-panel rounded-2xl overflow-hidden">
            <div className="divide-y divide-slate-800/50">
              {[
                { role: 'Senior Frontend Engineer', company: 'Google Style', score: 92, date: 'Today', status: 'Passed' },
                { role: 'Full Stack Developer', company: 'Startup Style', score: 85, date: 'Yesterday', status: 'Passed' },
                { role: 'System Design', company: 'Meta Style', score: 68, date: 'Oct 10', status: 'Needs Review' },
              ].map((session, i) => (
                <div key={i} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-800/30 transition-colors cursor-pointer group">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
                      <Brain className="w-5 h-5 text-slate-300 group-hover:text-indigo-400 transition-colors" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-slate-200 truncate">{session.role}</h4>
                      <p className="text-xs text-slate-500 truncate">{session.company} • {session.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right">
                      <div className={`text-sm font-bold font-mono ${session.score >= 80 ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {session.score}/100
                      </div>
                      <div className="text-[10px] text-slate-500 uppercase">{session.status}</div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-indigo-400 transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Quick Actions (Takes up 1/3 of space on desktop) */}
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-400" />
            Recommended Focus
          </h2>
          
          <div className="space-y-4">
            <div 
              onClick={() => handleNavigate('coding')}
              className="block glass-panel p-5 rounded-2xl border border-indigo-500/20 hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all group cursor-pointer"
            >
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-lg bg-indigo-500/10">
                  <Code2 className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors">Practice Algorithms</h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    You missed "Hash Map O(1) Lookups" in your last session. Jump into the sandbox.
                  </p>
                </div>
              </div>
            </div>

            <div 
              onClick={() => handleNavigate('roadmap')}
              className="block glass-panel p-5 rounded-2xl hover:bg-slate-800/30 transition-all group cursor-pointer"
            >
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-lg bg-slate-800">
                  <Target className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors">View Learning Roadmap</h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Check your personalized curriculum based on recent performance.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};