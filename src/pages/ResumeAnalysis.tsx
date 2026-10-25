import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Upload, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Briefcase, 
  GraduationCap, 
  Award, 
  Layers, 
  ArrowRight, 
  RefreshCw,
  FolderGit2
} from 'lucide-react';
import { SAMPLE_RESUMES } from '../data/sample_resumes';
import { uploadResume, getCandidateProfile, parsePDF } from '../services/api';
import { ResumeAnalysisSkeleton } from '../components/ui/ResumeAnalysisSkeleton';

interface ResumeAnalysisProps {
  onStartTailoredInterview: () => void;
}

export const ResumeAnalysis: React.FC<ResumeAnalysisProps> = ({ onStartTailoredInterview }) => {
  const [resumeText, setResumeText] = useState(SAMPLE_RESUMES[0].text);
  const [targetRole, setTargetRole] = useState('Machine Learning Engineer');
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [atsScore, setAtsScore] = useState<number>(84);
  const [atsBreakdown, setAtsBreakdown] = useState<any>(null);

  // Alias for backward compatibility
  const loading = isLoading;

  useEffect(() => {
    async function loadInitial() {
      setIsLoading(true);
      try {
        const res = await getCandidateProfile();
        if (res?.profile) {
          setProfile(res.profile);
          setAtsScore(res.profile.atsScore || 84);
          setAtsBreakdown(res.profile.atsBreakdown);
        }
      } catch (e) {
        console.error('Failed to load initial profile:', e);
      } finally {
        setIsLoading(false);
      }
    }
    loadInitial();
  }, []);

  const handleAnalyze = async (textToUse?: string, filename?: string) => {
    const text = textToUse || resumeText;
    if (!text.trim()) return;
    setIsLoading(true);
    try {
      const res = await uploadResume({
        text,
        targetRole,
        filename: filename || 'Candidate_Resume.pdf',
      });
      if (res?.profile) {
        setProfile(res.profile);
        setAtsScore(res.atsScore || 84);
        setAtsBreakdown(res.atsBreakdown);
      }
    } catch (err) {
      console.error('Resume processing failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsLoading(true);

    // Notice the capital "W" in endsWith()
    if (file.name.toLowerCase().endsWith('.pdf')) {
      try {
        const res = await parsePDF(file);
        if (res.text) {
          setResumeText(res.text); // Populates the UI textbox with clean text
          await handleAnalyze(res.text, file.name); // Sends clean text to LLM
        } else {
          setIsLoading(false);
        }
      } catch (err) {
        console.error('PDF parsing error:', err);
        setIsLoading(false);
      }
    } else {
      // If it's a standard text file, read it locally
      const reader = new FileReader();
      reader.onload = async (event) => {
        const content = event.target?.result as string;
        if (content) {
          setResumeText(content);
          await handleAnalyze(content, file.name);
        } else {
          setIsLoading(false);
        }
      };
      reader.onerror = () => setIsLoading(false);
      reader.readAsText(file);
    }
  };

  const handleSelectSample = (sampleId: string) => {
    const found = SAMPLE_RESUMES.find((s) => s.id === sampleId);
    if (found) {
      setResumeText(found.text);
      setTargetRole(found.targetRole);
      handleAnalyze(found.text, found.filename);
    }
  };

  // Group detected skills by category
  const skillsByCategory = (profile?.skills || []).reduce((acc: Record<string, string[]>, s: any) => {
    acc[s.category] = acc[s.category] || [];
    acc[s.category].push(s.name);
    return acc;
  }, {});

  return (
    <div className="space-y-8 py-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-2xl bg-slate-900 border border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <FileText className="w-6 h-6 text-indigo-400" />
            Resume Intelligence & ATS Readiness Score
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Extracts skills against standard taxonomies, calculates ATS compatibility, and personalizes interview questions.
          </p>
        </div>
        <button
          onClick={onStartTailoredInterview}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-500/20 flex items-center gap-2 transition-all hover:scale-105"
        >
          <Sparkles className="w-4 h-4 text-cyan-200" />
          <span>Launch Tailored Interview</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* 1-Click Sample Previews Banner */}
      <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-500/20 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-indigo-300 font-medium">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span>Test Instant ATS Extraction with Sample Resumes:</span>
        </div>
        <div className="flex items-center gap-2">
          {SAMPLE_RESUMES.map((sample) => (
            <button
              key={sample.id}
              onClick={() => handleSelectSample(sample.id)}
              className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-slate-200 font-semibold hover:border-indigo-400/50 transition-colors flex items-center gap-1.5"
            >
              <span>{sample.name} ({sample.targetRole})</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Input / Editor Area */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase tracking-wider">Target Job Role</span>
              <span className="text-[11px] text-indigo-400">Used for gap analysis</span>
            </div>
            <input
              type="text"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              placeholder="e.g. Machine Learning Engineer, Senior Full Stack Developer"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
            />

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs font-bold text-white uppercase tracking-wider">Resume Text / Content</span>
              <span className="text-[11px] text-slate-400 font-mono">{resumeText.length} characters</span>
            </div>
            <textarea
              rows={16}
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Paste plain resume text or extracted PDF content here..."
              className="w-full p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 font-mono leading-relaxed focus:outline-none focus:border-indigo-500 resize-none"
            />

            {/* File Upload & Text Input Controls */}
            <div className="space-y-2">
              <label className="flex items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-slate-700 hover:border-indigo-500 bg-slate-950/60 cursor-pointer transition-colors text-xs text-slate-300">
                <Upload className="w-4 h-4 text-indigo-400" />
                <span>Upload PDF or Text File</span>
                <input
                  type="file"
                  accept=".pdf,.txt,.doc,.docx"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            <button
              onClick={() => handleAnalyze()}
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 transition-all"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Analyzing Skills & Computing ATS...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Analyze Resume & Extract Profile</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: ATS Score & Extracted Candidate Profile */}
        <div className="lg:col-span-7 space-y-6">
          {isLoading ? (
            <ResumeAnalysisSkeleton />
          ) : (
            <>
              {/* ATS Readiness Score Card */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950/40 border border-slate-800 space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400">AI Resume Diagnostic</span>
                    <h3 className="text-lg font-bold text-white">ATS Readiness Score</h3>
                    <p className="text-xs text-slate-400">Candidate benchmark for modern Applicant Tracking Systems</p>
                  </div>

                  {/* Big Score Dial */}
                  <div className="flex items-center gap-3 bg-slate-950/80 px-4 py-2 rounded-2xl border border-slate-800">
                    <div className="text-right">
                      <span className="text-3xl font-extrabold text-white font-mono">{atsScore}</span>
                      <span className="text-xs text-slate-500">/100</span>
                      <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">High Match</p>
                    </div>
                  </div>
                </div>

                {/* ATS Sub-Pillars */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80">
                    <span className="text-[11px] text-slate-400">Keyword Match</span>
                    <p className="text-base font-bold text-indigo-300 font-mono mt-1">
                      {atsBreakdown?.keywordMatch || 86}%
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80">
                    <span className="text-[11px] text-slate-400">Formatting Signals</span>
                    <p className="text-base font-bold text-cyan-300 font-mono mt-1">
                      {atsBreakdown?.formatting || 92}%
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80">
                    <span className="text-[11px] text-slate-400">Project Impact</span>
                    <p className="text-base font-bold text-emerald-300 font-mono mt-1">
                      {atsBreakdown?.projectImpact || 88}%
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80">
                    <span className="text-[11px] text-slate-400">Role Relevance</span>
                    <p className="text-base font-bold text-amber-300 font-mono mt-1">
                      {atsBreakdown?.experienceRelevance || 84}%
                    </p>
                  </div>
                </div>

                {/* ATS Recommendations */}
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2 text-xs">
                  <span className="font-bold text-slate-300 flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                    Key Recommendations to Boost Score:
                  </span>
                  <ul className="space-y-1.5 text-slate-400 list-disc list-inside text-[11px]">
                    {(atsBreakdown?.recommendations || [
                      'Quantify latency or throughput impact in your primary project bullet.',
                      'Add missing industry keywords: Docker, Distributed Caching (Redis), CI/CD.',
                    ]).map((rec: string, i: number) => (
                      <li key={i}>{rec}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Categorized Skills Taxonomy */}
              <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Layers className="w-4 h-4 text-indigo-400" />
                    Detected Skills by Taxonomy ({profile?.skills?.length || 0})
                  </h3>
                  <span className="text-[11px] font-mono text-emerald-400 font-semibold">
                    Level: {profile?.experienceLevel || 'Intermediate'}
                  </span>
                </div>

                <div className="space-y-4">
                  {Object.keys(skillsByCategory).length > 0 ? (
                    Object.entries(skillsByCategory).map(([cat, skills]: [string, any]) => (
                      <div key={cat} className="space-y-1.5">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{cat}</span>
                        <div className="flex flex-wrap gap-1.5">
                          {skills.map((skill: string) => (
                            <span
                              key={skill}
                              className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-950 border border-slate-800 text-indigo-300 hover:border-indigo-500/50 transition-colors"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400">No skills parsed yet. Click "Analyze Resume" above.</p>
                  )}
                </div>
              </div>

              {/* Extracted Projects */}
              <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <FolderGit2 className="w-4 h-4 text-cyan-400" />
                  Parsed Projects & Architectural Focus
                </h3>

                <div className="space-y-3">
                  {(profile?.projects || []).map((proj: any, idx: number) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">{proj.title}</span>
                        <div className="flex gap-1">
                          {proj.techStack?.map((t: string) => (
                            <span key={t} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800 font-mono">
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">{proj.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Education Section */}
              <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-emerald-400" />
                  Education & Academic Credentials
                </h3>

                <div className="space-y-3">
                  {(profile?.education && profile.education.length > 0 ? profile.education : [
                    { degree: 'B.S. in Computer Science', institution: 'University of Engineering & Tech', year: '2022' }
                  ]).map((edu: any, idx: number) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold text-white">{edu.degree}</span>
                        <p className="text-[11px] text-slate-400">{edu.institution}</p>
                      </div>
                      <span className="text-xs font-mono font-medium text-slate-500">{edu.year}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
