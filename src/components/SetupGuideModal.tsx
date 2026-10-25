import React, { useState } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  Terminal, 
  Cpu, 
  Database, 
  Sparkles, 
  ExternalLink,
  Server,
  Code
} from 'lucide-react';

interface SetupGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SetupGuideModal: React.FC<SetupGuideModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'ollama' | 'fastapi' | 'providers' | 'docker'>('ollama');
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(id);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl text-slate-100 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
              <Cpu className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">System Architecture & AI Providers Guide</h2>
              <p className="text-xs text-slate-400">Step-by-step instructions to connect Ollama, Gemini, Groq, & FastAPI backend</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-800 px-6 bg-slate-950/40">
          <button
            onClick={() => setActiveTab('ollama')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'ollama'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Cpu className="w-4 h-4" /> 1. Connect Ollama (Local & Free)
          </button>
          <button
            onClick={() => setActiveTab('fastapi')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'fastapi'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Server className="w-4 h-4" /> 2. Standalone FastAPI
          </button>
          <button
            onClick={() => setActiveTab('providers')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'providers'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4" /> 3. Gemini & Groq APIs
          </button>
          <button
            onClick={() => setActiveTab('docker')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'docker'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Database className="w-4 h-4" /> 4. Docker Compose
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6 text-sm text-slate-300">
          {activeTab === 'ollama' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-200">
                <p className="font-semibold text-white mb-1">Zero-Cost Offline AI Engine</p>
                <p className="text-xs">
                  Ollama allows you to run high-performance models (Qwen 2.5, Llama 3.1, Gemma 2) completely on your local GPU/CPU with no API keys or token charges.
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-white text-xs uppercase tracking-wider text-slate-400">Step 1: Install Ollama</h4>
                <div className="relative group bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-xs flex items-center justify-between">
                  <span className="text-indigo-300">curl -fsSL https://ollama.com/install.sh | sh</span>
                  <button
                    onClick={() => handleCopy('curl -fsSL https://ollama.com/install.sh | sh', 'ollama-install')}
                    className="p-1 rounded bg-slate-800 text-slate-300 hover:text-white"
                  >
                    {copiedIndex === 'ollama-install' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>

                <h4 className="font-semibold text-white text-xs uppercase tracking-wider text-slate-400">Step 2: Pull & Run Recommended Model</h4>
                <div className="relative group bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-xs flex items-center justify-between">
                  <span className="text-indigo-300">ollama run qwen2.5</span>
                  <button
                    onClick={() => handleCopy('ollama run qwen2.5', 'ollama-pull')}
                    className="p-1 rounded bg-slate-800 text-slate-300 hover:text-white"
                  >
                    {copiedIndex === 'ollama-pull' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>

                <h4 className="font-semibold text-white text-xs uppercase tracking-wider text-slate-400">Step 3: Verification Endpoint</h4>
                <p className="text-xs text-slate-400">Ollama serves standard REST endpoints at port 11434. Confirm with:</p>
                <div className="relative group bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-xs flex items-center justify-between">
                  <span className="text-indigo-300">curl http://localhost:11434/api/tags</span>
                  <button
                    onClick={() => handleCopy('curl http://localhost:11434/api/tags', 'ollama-verify')}
                    className="p-1 rounded bg-slate-800 text-slate-300 hover:text-white"
                  >
                    {copiedIndex === 'ollama-verify' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'fastapi' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-200">
                <p className="font-semibold text-white mb-1">Standalone Python FastAPI Engine</p>
                <p className="text-xs">
                  We included the complete Python codebase in <code className="text-white bg-slate-800 px-1 rounded">/backend</code> with PyMuPDF, spaCy, sentence-transformers, FAISS vector store, and SQLAlchemy!
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-white text-xs uppercase tracking-wider text-slate-400">Step 1: Set up Virtual Environment</h4>
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-xs flex items-center justify-between">
                  <span className="text-purple-300">cd backend && python3 -m venv venv && source venv/bin/activate</span>
                  <button
                    onClick={() => handleCopy('cd backend && python3 -m venv venv && source venv/bin/activate', 'venv')}
                    className="p-1 rounded bg-slate-800 text-slate-300 hover:text-white"
                  >
                    {copiedIndex === 'venv' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>

                <h4 className="font-semibold text-white text-xs uppercase tracking-wider text-slate-400">Step 2: Install Python Dependencies</h4>
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-xs flex items-center justify-between">
                  <span className="text-purple-300">pip install -r requirements.txt</span>
                  <button
                    onClick={() => handleCopy('pip install -r requirements.txt', 'pip')}
                    className="p-1 rounded bg-slate-800 text-slate-300 hover:text-white"
                  >
                    {copiedIndex === 'pip' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>

                <h4 className="font-semibold text-white text-xs uppercase tracking-wider text-slate-400">Step 3: Run FastAPI with Uvicorn</h4>
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-xs flex items-center justify-between">
                  <span className="text-purple-300">uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload</span>
                  <button
                    onClick={() => handleCopy('uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload', 'uvicorn')}
                    className="p-1 rounded bg-slate-800 text-slate-300 hover:text-white"
                  >
                    {copiedIndex === 'uvicorn' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'providers' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-200">
                <p className="font-semibold text-white mb-1">Active Cloud AI Providers</p>
                <p className="text-xs">
                  This web app is currently connected to <strong>Google Gemini 3.8 Flash</strong> through the official <code className="text-white bg-slate-800 px-1 rounded">@google/genai</code> SDK with native server-side telemetry.
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-white text-sm">Google Gemini (Active)</span>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Auto Injected</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Powers resume skill extraction, intelligent RAG question generation, multi-criteria answer scoring, and 30-day learning roadmap building.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-white text-sm">Groq Cloud (Optional)</span>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">Optional</span>
                  </div>
                  <p className="text-xs text-slate-400 mb-2">
                    For ultra-fast token streaming (500+ tokens/sec) using Llama 3.3 70B on Groq LPUs.
                  </p>
                  <div className="bg-slate-900 p-2.5 rounded font-mono text-xs text-slate-300">
                    export GROQ_API_KEY="gsk_your_key_here"
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'docker' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-200">
                <p className="font-semibold text-white mb-1">Production Docker Stack</p>
                <p className="text-xs">
                  Run the complete full-stack architecture (PostgreSQL 16 Database + FastAPI Backend container) with a single command:
                </p>
              </div>

              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-xs flex items-center justify-between">
                <span className="text-cyan-300">docker-compose up -d --build</span>
                <button
                  onClick={() => handleCopy('docker-compose up -d --build', 'docker')}
                  className="p-1 rounded bg-slate-800 text-slate-300 hover:text-white"
                >
                  {copiedIndex === 'docker' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              <p className="text-xs text-slate-400">
                PostgreSQL is accessible on port <strong>5432</strong> and the backend service is on <strong>8000</strong>. Data is persisted automatically in docker volumes.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 px-6 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <span className="text-xs text-slate-400">All configurations are hot-swappable in <code className="text-indigo-400">.env</code></span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-500/20 transition-all"
          >
            Got it, Let's Prepare!
          </button>
        </div>
      </div>
    </div>
  );
};
