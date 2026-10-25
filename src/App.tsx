import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { SetupGuideModal } from './components/SetupGuideModal';
import { Landing } from './pages/Landing';
import { Dashboard } from './pages/Dashboard';
import { ResumeAnalysis } from './pages/ResumeAnalysis';
import { InterviewSetup } from './pages/InterviewSetup';
import { InterviewSession } from './pages/InterviewSession';
import { InterviewResults } from './pages/InterviewResults';
import { LearningRoadmap } from './pages/LearningRoadmap';
import { CodingRound } from './pages/CodingRound';
import { fetchProviders } from './services/api';
import { Terminal, Heart } from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('landing');
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [isSetupGuideOpen, setIsSetupGuideOpen] = useState(false);
  const [providerStatus, setProviderStatus] = useState<any>(null);

  useEffect(() => {
    fetchProviders()
      .then((data) => setProviderStatus(data))
      .catch((e) => console.warn('Could not load provider status:', e));
  }, []);

  const handleStartInterview = () => {
    setCurrentTab('setup');
  };

  const handleSessionCreated = (sessionId: string) => {
    setActiveSessionId(sessionId);
    setCurrentTab('session');
  };

  const handleSessionFinished = (sessionId: string) => {
    setActiveSessionId(sessionId);
    setCurrentTab('results');
  };

  const handleViewPastSession = (sessionId: string) => {
    setActiveSessionId(sessionId);
    setCurrentTab('results');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-600 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={(tab) => {
          setCurrentTab(tab);
        }}
        onOpenSetupGuide={() => setIsSetupGuideOpen(true)}
        providerStatus={providerStatus}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {currentTab === 'landing' && (
          <Landing
            onStartInterview={() => setCurrentTab('setup')}
            onAnalyzeResume={() => setCurrentTab('resume')}
            onOpenRoadmap={() => setCurrentTab('roadmap')}
            onOpenCoding={() => setCurrentTab('coding')}
          />
        )}

        {currentTab === 'dashboard' && (
          <Dashboard
            onStartInterview={() => setCurrentTab('setup')}
            onOpenRoadmap={() => setCurrentTab('roadmap')}
            onViewSession={handleViewPastSession}
          />
        )}

        {currentTab === 'resume' && (
          <ResumeAnalysis
            onStartTailoredInterview={() => setCurrentTab('setup')}
          />
        )}

        {currentTab === 'setup' && (
          <InterviewSetup
            onSessionCreated={handleSessionCreated}
          />
        )}

        {currentTab === 'session' && activeSessionId && (
          <InterviewSession
            sessionId={activeSessionId}
            onFinish={handleSessionFinished}
            onExit={() => setCurrentTab('dashboard')}
          />
        )}

        {currentTab === 'results' && activeSessionId && (
          <InterviewResults
            sessionId={activeSessionId}
            onOpenRoadmap={() => setCurrentTab('roadmap')}
            onNewInterview={() => setCurrentTab('setup')}
          />
        )}

        {currentTab === 'roadmap' && (
          <LearningRoadmap />
        )}

        {currentTab === 'coding' && (
          <CodingRound />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-8 px-4 sm:px-6 lg:px-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold">
              AI
            </div>
            <span className="font-semibold text-slate-400">AI Interview Coach</span>
            <span>— Intelligent Mock Arena & Career Acceleration Engine</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSetupGuideOpen(true)}
              className="text-indigo-400 hover:text-indigo-300 font-semibold"
            >
              Setup Guide (Ollama / FastAPI)
            </button>
            <span>•</span>
            <span className="text-slate-500">Powered by Gemini 3.8 Flash & Ollama RAG</span>
          </div>
        </div>
      </footer>

      {/* AI Engine & Providers Setup Modal */}
      <SetupGuideModal
        isOpen={isSetupGuideOpen}
        onClose={() => setIsSetupGuideOpen(false)}
      />
    </div>
  );
}
