import React from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  FileText, 
  Compass, 
  Mic, 
  BrainCircuit, 
  Code2, 
  Building2, 
  ShieldCheck, 
  TrendingUp, 
  Play
} from 'lucide-react';

interface LandingProps {
  onStartInterview: () => void;
  onAnalyzeResume: () => void;
  onOpenRoadmap: () => void;
  onOpenCoding: () => void;
}

export const Landing: React.FC<LandingProps> = ({
  onStartInterview,
  onAnalyzeResume,
  onOpenRoadmap,
  onOpenCoding,
}) => {
  return (
    <div className="space-y-24 py-8">
      {/* Hero Section */}
      <section className="relative overflow-hidden text-center max-w-5xl mx-auto px-4 pt-6">
        {/* Glow ambient background elements */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gradient-to-tr from-indigo-600/20 via-purple-600/15 to-cyan-500/10 blur-[120px] pointer-events-none rounded-full" />

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-6 shadow-sm shadow-indigo-500/10 animate-in fade-in slide-in-from-bottom-2">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Next-Gen Full-Stack AI Interview Intelligence</span>
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
          <span className="text-slate-400 font-normal">Gemini 3.8 & Ollama RAG</span>
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1] mb-6">
          Ace Your Next Interview with <br />
          <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-cyan-400 bg-clip-text text-transparent">
            Real-Time AI Coaching
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed">
          Upload your resume to extract skills, engage in voice and text mock interviews with adaptive difficulty, receive granular Big-Tech evaluations, and master a personalized 30-day learning roadmap.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <button
            onClick={onStartInterview}
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-bold text-sm shadow-xl shadow-indigo-500/25 flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Start Mock Interview</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </button>

          <button
            onClick={onAnalyzeResume}
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-slate-200 font-semibold text-sm flex items-center justify-center gap-2 transition-all hover:border-indigo-500/40"
          >
            <FileText className="w-4 h-4 text-indigo-400" />
            <span>Upload Resume & Check ATS</span>
          </button>
        </div>

        {/* Interactive Hero Preview Card */}
        <div className="relative mx-auto max-w-4xl rounded-2xl border border-slate-800 bg-slate-900/80 shadow-2xl backdrop-blur-xl overflow-hidden text-left p-6 sm:p-8">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500/80" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
              <span className="ml-3 text-xs font-mono text-slate-400">Live Mock Session — Machine Learning Engineer (Google Practice)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                ADAPTIVE DIFFICULTY: MEDIUM → HARD
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Question column */}
            <div className="lg:col-span-7 space-y-4">
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-indigo-400">INTERVIEWER QUESTION (Q1 of 5)</span>
                  <span className="text-xs text-slate-400 font-mono">02:45 remaining</span>
                </div>
                <p className="text-sm text-slate-100 font-medium leading-relaxed">
                  "In your fraud detection project, how did you handle extreme class imbalance (99.9% legit vs 0.1% fraud), and why is accuracy a misleading metric?"
                </p>
              </div>

              {/* Candidate Voice/Text Answer Simulation */}
              <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Mic className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                    <span>Candidate Answer (Voice-Transcribed)</span>
                  </div>
                  <span className="text-[11px] text-emerald-400 font-medium">98 Words Transcribed</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-mono bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/60">
                  "Accuracy fails because a dummy classifier predicting all zeros gets 99.9% accuracy. I prioritized Precision-Recall AUC and calibrated decision thresholds using cost-sensitive Focal Loss..."
                </p>
              </div>
            </div>

            {/* Live AI Evaluation side column */}
            <div className="lg:col-span-5 p-4 rounded-xl bg-gradient-to-b from-indigo-950/40 to-slate-950/80 border border-indigo-500/30 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300">AI Evaluation Engine</span>
                <span className="text-xs font-extrabold px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  SCORE: 88 / 100
                </span>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Technical Depth</span>
                  <span className="text-indigo-300 font-mono font-bold">90%</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-gradient-to-r from-indigo-500 to-cyan-400 h-full rounded-full w-[90%]" />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Correctness & Precision</span>
                  <span className="text-indigo-300 font-mono font-bold">92%</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-gradient-to-r from-indigo-500 to-cyan-400 h-full rounded-full w-[92%]" />
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-[11px] text-indigo-200">
                <strong>Feedback:</strong> Stellar breakdown of the accuracy paradox. Next question promoted to <strong>Hard</strong> to assess distributed feature store scaling.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Target Companies Section */}
      <section className="max-w-6xl mx-auto px-4 text-center">
        <p className="text-xs uppercase tracking-widest font-bold text-slate-400 mb-6">
          Tailored Practice Tracks for Premier Engineering Cultures
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-center gap-3">
            <span className="text-2xl">🔍</span>
            <div className="text-left">
              <p className="text-sm font-bold text-white">Google</p>
              <p className="text-[11px] text-slate-400">Distributed & Big-O Depth</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-center gap-3">
            <span className="text-2xl">📦</span>
            <div className="text-left">
              <p className="text-sm font-bold text-white">Amazon</p>
              <p className="text-[11px] text-slate-400">STAR & Leadership Principles</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-center gap-3">
            <span className="text-2xl">🪟</span>
            <div className="text-left">
              <p className="text-sm font-bold text-white">Microsoft</p>
              <p className="text-[11px] text-slate-400">Architecture & Collaboration</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-center gap-3">
            <span className="text-2xl">🚀</span>
            <div className="text-left">
              <p className="text-sm font-bold text-white">High-Growth Startup</p>
              <p className="text-[11px] text-slate-400">Velocity & Full-Stack Rigor</p>
            </div>
          </div>
        </div>
      </section>

      {/* Comprehensive Features Grid */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
            Everything You Need to Turn Mock Practice Into Real Offers
          </h2>
          <p className="text-slate-400 text-sm sm:text-base">
            Engineered with deep skill taxonomies, retrieval-augmented questioning, and actionable roadmaps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Feature 1 */}
          <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-indigo-500/40 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <FileText className="w-6 h-6 text-indigo-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Resume Parsing & ATS Readiness</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Detects tech stacks across 12 taxonomies, extracts bullet points, and provides a clear ATS score with missing keywords and formatting advice.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-indigo-500/40 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <BrainCircuit className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Adaptive Question Engine</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Dynamically scales question difficulty from Easy to Hard based on your answers, generating follow-ups when you mention key architectural concepts.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-indigo-500/40 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Mic className="w-6 h-6 text-cyan-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Voice & Speech-to-Text</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Practice speaking naturally with audio recording and Whisper / Gemini transcription. Features Text-to-Speech audio questions to simulate live interviewers.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-indigo-500/40 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Multi-Factor Answer Scoring</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Scores Correctness, Technical Depth, Completeness, Communication, and Clarity. Supplies model answers and pinpoint missing concepts.
            </p>
          </div>

          {/* Feature 5 */}
          <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-indigo-500/40 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Compass className="w-6 h-6 text-amber-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">30-Day Learning Roadmap</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Automatically builds custom daily study plans targeting your specific interview mistakes, linked to authoritative documentation and practice exercises.
            </p>
          </div>

          {/* Feature 6 */}
          <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-indigo-500/40 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Code2 className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Live Coding Sandbox</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Solve LeetCode-style algorithms in Python and JavaScript with automated test case validation and AI feedback on time and space complexity.
            </p>
          </div>
        </div>
      </section>

      {/* Action Banner */}
      <section className="max-w-5xl mx-auto px-4">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-indigo-900/50 via-slate-900 to-purple-900/50 border border-indigo-500/30 text-center space-y-6 relative overflow-hidden">
          <div className="max-w-2xl mx-auto space-y-3">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
              Ready to Master Your Next Technical Round?
            </h3>
            <p className="text-sm text-slate-300">
              Pick your target role, launch an adaptive mock session, and receive actionable insights in under 10 minutes.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={onStartInterview}
              className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-500/30 flex items-center gap-2 transition-all hover:scale-105"
            >
              <Sparkles className="w-4 h-4" />
              <span>Launch Practice Interview</span>
            </button>
            <button
              onClick={onOpenRoadmap}
              className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm border border-slate-700 flex items-center gap-2 transition-all"
            >
              <Compass className="w-4 h-4 text-amber-400" />
              <span>Explore 30-Day Roadmap</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
