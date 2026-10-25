import React, { useState } from 'react';
import { 
  Sparkles, 
  Terminal, 
  FileText, 
  Compass, 
  BarChart3, 
  Code2, 
  HelpCircle, 
  Cpu,
  ChevronDown
} from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onOpenSetupGuide: () => void;
  providerStatus?: {
    gemini?: { status: string };
    ollama?: { status: string };
  };
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  onOpenSetupGuide,
  providerStatus,
}) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'setup', label: 'Mock Interview', icon: Sparkles },
    { id: 'resume', label: 'Resume & ATS', icon: FileText },
    { id: 'roadmap', label: 'Learning Roadmap', icon: Compass },
    { id: 'coding', label: 'Coding Sandbox', icon: Code2 },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <div 
          onClick={() => setCurrentTab('landing')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 p-0.5 shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-200">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Terminal className="w-5 h-5 text-indigo-400 group-hover:text-cyan-300 transition-colors" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-indigo-200 bg-clip-text text-transparent">
                AI Interview Coach
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                PRO
              </span>
            </div>
            <p className="text-[11px] text-slate-400 -mt-0.5">Career Intelligence & Mock Arena</p>
          </div>
        </div>

        {/* Center Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-900/60 p-1 rounded-xl border border-slate-800/60">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Action Icons & Profile */}
        <div className="flex items-center gap-3">
          {/* AI Engine Status Pill / Connection Guide */}
          <button
            onClick={onOpenSetupGuide}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 transition-colors"
            title="Configure AI Provider & FastAPI"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="hidden sm:inline">AI Engine:</span>
            <span className="font-semibold text-white">Gemini + Ollama</span>
            <HelpCircle className="w-3.5 h-3.5 text-emerald-400 ml-0.5" />
          </button>

          {/* Quick Start Button */}
          <button
            onClick={() => setCurrentTab('setup')}
            className="hidden lg:flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 text-white shadow-md shadow-indigo-500/20 transition-all hover:scale-[1.02]"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-200" />
            <span>Start Drill</span>
          </button>

          {/* User Profile Chip */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2 p-1 pl-1.5 rounded-full border border-slate-800 bg-slate-900/60 hover:bg-slate-800 transition-colors"
            >
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                alt="Profile"
                className="w-7 h-7 rounded-full object-cover border border-indigo-400/40"
              />
              <span className="hidden sm:inline text-xs font-medium text-slate-200 pr-1">Alex M.</span>
              <ChevronDown className="w-3 h-3 text-slate-400 mr-1" />
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-800 bg-slate-900/95 backdrop-blur-xl shadow-2xl py-2 z-50">
                <div className="px-4 py-2 border-b border-slate-800/80">
                  <p className="text-xs font-bold text-slate-200">Alex Mercer</p>
                  <p className="text-[11px] text-slate-400">ML Engineer Candidate</p>
                </div>
                <button
                  onClick={() => { setCurrentTab('dashboard'); setShowProfileMenu(false); }}
                  className="w-full text-left px-4 py-2 text-xs text-slate-300 hover:bg-slate-800 hover:text-white flex items-center gap-2"
                >
                  <BarChart3 className="w-3.5 h-3.5 text-indigo-400" /> Dashboard Analytics
                </button>
                <button
                  onClick={() => { setCurrentTab('resume'); setShowProfileMenu(false); }}
                  className="w-full text-left px-4 py-2 text-xs text-slate-300 hover:bg-slate-800 hover:text-white flex items-center gap-2"
                >
                  <FileText className="w-3.5 h-3.5 text-cyan-400" /> Candidate Profile & ATS
                </button>
                <button
                  onClick={() => { setCurrentTab('roadmap'); setShowProfileMenu(false); }}
                  className="w-full text-left px-4 py-2 text-xs text-slate-300 hover:bg-slate-800 hover:text-white flex items-center gap-2"
                >
                  <Compass className="w-3.5 h-3.5 text-emerald-400" /> 30-Day Learning Plan
                </button>
                <div className="border-t border-slate-800/80 my-1" />
                <button
                  onClick={() => { onOpenSetupGuide(); setShowProfileMenu(false); }}
                  className="w-full text-left px-4 py-2 text-xs text-slate-300 hover:bg-slate-800 hover:text-white flex items-center gap-2"
                >
                  <Cpu className="w-3.5 h-3.5 text-purple-400" /> Connect Ollama / FastAPI
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
