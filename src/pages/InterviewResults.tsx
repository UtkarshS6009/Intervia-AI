import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  Award, 
  Download, 
  Sparkles, 
  Compass, 
  RotateCcw, 
  CheckCircle2, 
  AlertTriangle, 
  ChevronDown, 
  ChevronUp, 
  FileText,
  Target,
  AlertCircle,
  HelpCircle,
  TrendingUp,
  BarChart3,
  Layers
} from 'lucide-react';
import { getSessionResults } from '../services/api';
import { downloadPDFReport } from '../services/pdfReport';
import { 
  buildScorecardMetrics, 
  getScoreLetterGrade, 
  formatCandidateAnswer,
  extractExpectedConcepts,
  RubricMetric 
} from '../services/evaluation';

interface InterviewResultsProps {
  sessionId: string;
  onOpenRoadmap: () => void;
  onNewInterview: () => void;
}

export const InterviewResults: React.FC<InterviewResultsProps> = ({
  sessionId,
  onOpenRoadmap,
  onNewInterview,
}) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  useEffect(() => {
    async function loadResults() {
      try {
        const res = await getSessionResults(sessionId);
        setData(res);

        // Only fire celebration confetti if score is at or above passing bar (70%)
        const totalScore = res?.aggregateScores?.overall ?? (res?.session?.overallScore ?? 0);
        if (totalScore >= 70) {
          try {
            confetti({
              particleCount: 80,
              spread: 70,
              origin: { y: 0.6 },
              colors: ['#6366f1', '#06b6d4', '#10b981', '#f59e0b'],
            });
          } catch (e) {
            // Ignored if canvas unavailable
          }
        }
      } catch (err) {
        console.error('Failed to load session results:', err);
      } finally {
        setLoading(false);
      }
    }
    loadResults();
  }, [sessionId]);

  const handleDownloadPDF = () => {
    if (!data) return;
    const overall = data.aggregateScores?.overall ?? (data.session?.overallScore ?? 0);
    downloadPDFReport({
      candidateName: 'Alex Mercer',
      targetRole: data.session?.targetRole || 'Machine Learning Engineer',
      category: data.session?.category || 'Technical Drill',
      company: data.session?.company,
      date: data.session?.completedAt || new Date().toISOString(),
      overallScore: overall,
      aggregateScores: {
        correctness: data.aggregateScores?.correctness ?? 0,
        technicalDepth: data.aggregateScores?.technicalDepth ?? 0,
        completeness: data.aggregateScores?.completeness ?? 0,
        communication: data.aggregateScores?.communication ?? 0,
        clarity: data.aggregateScores?.clarity ?? 0,
      },
      strengths: (data.strengths && data.strengths.length > 0)
        ? data.strengths
        : ['Attempted technical problem framing'],
      weaknesses: (data.weaknesses && data.weaknesses.length > 0)
        ? data.weaknesses
        : ['Address missing concepts and provide concrete mechanics'],
      missingConcepts: (data.missingConcepts && data.missingConcepts.length > 0)
        ? data.missingConcepts
        : ['Core architectural mechanics', 'Trade-off analysis'],
      questions: (data.questions || []).map((q: any) => ({
        question: q.question,
        topic: q.topic,
        difficulty: q.difficulty,
        userAnswer: q.userAnswer,
        evaluation: q.evaluation,
      })),
    });
  };

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-400 font-mono">Compiling objective AI evaluation scorecard...</p>
        </div>
      </div>
    );
  }

  const overall = typeof data.aggregateScores?.overall === 'number' 
    ? data.aggregateScores.overall 
    : (typeof data.session?.overallScore === 'number' ? data.session.overallScore : 0);

  const gradeMeta = getScoreLetterGrade(overall);
  const rubricMetrics = buildScorecardMetrics(data.aggregateScores || {});

  // Identify any questions that were submitted as N/A or unattempted
  const nonAnswerQuestions = (data.questions || []).filter((q: any) => {
    const raw = (q.userAnswer || '').toLowerCase().trim();
    return raw === 'n/a' || raw === 'na' || raw === '' || q.evaluation?.overallScore === 0;
  });
  const hasNonAnswers = nonAnswerQuestions.length > 0;

  // Compile unique missing concepts by name
  const allMissingConcepts: string[] = Array.from(
    new Set([
      ...(data.missingConcepts || []),
      ...(data.questions || []).flatMap((q: any) => q.evaluation?.missingConcepts || []),
    ])
  ).filter(Boolean);

  return (
    <div className="max-w-4xl mx-auto py-6 space-y-8">
      {/* Top Banner & Celebration Card */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center sm:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Evaluation Scorecard</span>
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Performance Summary Report</h1>
            <p className="text-xs sm:text-sm text-slate-400">
              {data.session?.category} Track • {data.session?.company ? `${data.session.company} Benchmark` : 'Standard Hiring Bar'} • {data.questions?.length ?? 0} Questions Evaluated
            </p>
          </div>

          {/* Big Score and Grade */}
          <div className="flex items-center gap-4 bg-slate-950/80 p-4 px-6 rounded-2xl border border-slate-800 shadow-inner">
            <div className="text-right">
              <span className={`text-4xl font-extrabold font-mono ${gradeMeta.color}`}>{overall}</span>
              <span className="text-xs text-slate-500">/100</span>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-0.5">Overall Score</p>
            </div>
            <div className="h-10 w-px bg-slate-800" />
            <div className={`w-14 h-14 rounded-xl border flex flex-col items-center justify-center ${gradeMeta.badgeBg}`}>
              <span className={`text-2xl font-black font-mono leading-none ${gradeMeta.color}`}>{gradeMeta.grade}</span>
              <span className="text-[9px] font-semibold text-slate-400 mt-0.5">Grade</span>
            </div>
          </div>
        </div>

        {/* Warning notification banner if any question was marked N/A */}
        {hasNonAnswers && (
          <div className="mt-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 text-xs text-amber-200">
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold text-amber-300">
                Notice: {nonAnswerQuestions.length} Question(s) Submitted as N/A or Left Unanswered
              </span>
              <p className="text-amber-200/80 leading-relaxed text-[11px]">
                Under standard technical interview rubrics, non-answers and "N/A" receive 0/100 marks across all evaluation criteria. Review the missing concepts identified by name below to prepare model answers for these topics.
              </p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 pt-6 mt-6 border-t border-slate-800/80">
          <button
            onClick={handleDownloadPDF}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-500/20 flex items-center gap-2 transition-all hover:scale-105"
          >
            <Download className="w-4 h-4" />
            <span>Download Official PDF Report</span>
          </button>

          <button
            onClick={onOpenRoadmap}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-purple-500/20 flex items-center gap-2 transition-all hover:scale-105"
          >
            <Compass className="w-4 h-4 text-amber-300" />
            <span>Generate Targeted 30-Day Roadmap</span>
          </button>

          <button
            onClick={onNewInterview}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center gap-2 transition-all"
          >
            <RotateCcw className="w-4 h-4 text-slate-400" />
            <span>Retake / New Drill</span>
          </button>
        </div>
      </div>

      {/* AI Evaluation Scorecard: Pillar Breakdown with Actionable Progress Indicators */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-indigo-400" />
              Evaluation Rubric Breakdown & Benchmark Comparison
            </h2>
            <p className="text-xs text-slate-400">
              Weighted rubric against the Big Tech hiring benchmark (75% passing threshold)
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <span>Target: 75%+</span>
          </div>
        </div>

        {/* 5 Rubric Pillar Cards with Progress Bars */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rubricMetrics.map((metric: RubricMetric) => (
            <div
              key={metric.key}
              className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-3.5 hover:border-slate-700 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-slate-200">{metric.label}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                    {metric.weightPercentage} Weight
                  </span>
                </div>

                <div className="flex items-baseline justify-between mb-2">
                  <span className="text-2xl font-extrabold font-mono text-white">
                    {metric.score}%
                  </span>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${metric.badgeBg} ${metric.badgeText}`}>
                    {metric.status}
                  </span>
                </div>

                {/* Visual Progress Indicator with 75% target benchmark line */}
                <div className="space-y-1">
                  <div className="relative w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${metric.progressColor} transition-all duration-700`}
                      style={{ width: `${Math.min(100, Math.max(0, metric.score))}%` }}
                    />
                    {/* 75% Benchmark Target Marker */}
                    <div
                      className="absolute top-0 bottom-0 w-0.5 bg-white/40"
                      style={{ left: '75%' }}
                      title="Passing Benchmark (75%)"
                    />
                  </div>
                  <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                    <span>0%</span>
                    <span className="text-indigo-400">Bar: 75%</span>
                    <span>100%</span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 mt-2.5 leading-relaxed">
                  {metric.description}
                </p>
              </div>

              {/* Actionable coaching tip */}
              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/60 text-[11px] text-slate-300 flex items-start gap-2">
                <Target className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                <span className="leading-snug">{metric.actionableTip}</span>
              </div>
            </div>
          ))}

          {/* Quick Summary Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-950/40 to-slate-950 border border-indigo-500/20 space-y-3 flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider block mb-1">
                Rubric Verdict
              </span>
              <h3 className="text-lg font-bold text-white mb-2">{gradeMeta.label}</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                {overall >= 75
                  ? 'Your answers demonstrated sufficient technical depth and accuracy to surpass the competitive hiring threshold.'
                  : overall >= 40
                  ? 'Your baseline reasoning is sound, but gaps in internal mechanics and missing concepts lowered your aggregate score.'
                  : 'Critical concept gaps detected. Review the missing technical dimensions and study the model solutions below.'}
              </p>
            </div>

            <button
              onClick={onOpenRoadmap}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all flex items-center justify-center gap-2"
            >
              <Compass className="w-3.5 h-3.5 text-amber-300" />
              <span>Target Weak Topics</span>
            </button>
          </div>
        </div>
      </div>

      {/* Identified Missing Concepts by Name */}
      {allMissingConcepts.length > 0 && (
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-indigo-300 flex items-center gap-2 uppercase tracking-wider">
              <Layers className="w-4 h-4 text-indigo-400" />
              Missing Concepts Identified by Name
            </h3>
            <span className="text-xs text-slate-400 font-mono">
              {allMissingConcepts.length} Priority Topic(s)
            </span>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            The AI evaluator detected that the following specific technical concepts were either omitted, incomplete, or marked as N/A in your responses:
          </p>

          <div className="flex flex-wrap gap-2 pt-1">
            {allMissingConcepts.map((concept: string, idx: number) => (
              <span
                key={idx}
                className="px-3 py-1.5 rounded-xl bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 text-xs font-medium flex items-center gap-1.5 shadow-sm"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                <span>{concept}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Strengths & Weaknesses Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
          <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> Candidate Key Strengths
          </h3>
          {data.strengths && data.strengths.length > 0 ? (
            <ul className="space-y-2 text-xs text-slate-300">
              {data.strengths.map((s: string, idx: number) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-400 space-y-1">
              <span className="font-bold text-slate-300">No Technical Credit Awarded</span>
              <p className="text-[11px] leading-relaxed">
                Candidate answers were unattempted or marked as N/A. To earn credit in technical interviews, always articulate your thought process and domain fundamentals.
              </p>
            </div>
          )}
        </div>

        <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
          <h3 className="text-sm font-bold text-amber-400 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" /> Priority Areas for Growth
          </h3>
          {data.weaknesses && data.weaknesses.length > 0 ? (
            <ul className="space-y-2 text-xs text-slate-300">
              {data.weaknesses.map((w: string, idx: number) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                  <span>{w}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-slate-400">Continue practicing advanced architectural trade-offs.</p>
          )}
        </div>
      </div>

      {/* Question-by-Question Accordion Review */}
      <div className="p-6 sm:p-8 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <FileText className="w-5 h-5 text-indigo-400" />
          Question-by-Question Detailed AI Breakdown
        </h3>

        <div className="space-y-3 pt-2">
          {(data.questions || []).map((q: any, idx: number) => {
            const isExpanded = expandedIndex === idx;
            const evalObj = q.evaluation;
            const qScore = typeof evalObj?.overallScore === 'number' ? evalObj.overallScore : 0;
            const formattedAnswer = formatCandidateAnswer(q.userAnswer);
            const expected = extractExpectedConcepts(q);
            const missing = evalObj?.missingConcepts && evalObj.missingConcepts.length > 0
              ? evalObj.missingConcepts
              : expected;

            return (
              <div
                key={idx}
                className="rounded-xl border border-slate-800 bg-slate-950/60 overflow-hidden transition-all"
              >
                {/* Header Row */}
                <div
                  onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                  className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-900/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-md bg-slate-800 text-xs font-bold text-indigo-300 flex items-center justify-center font-mono">
                      Q{idx + 1}
                    </span>
                    <div>
                      <p className="text-xs font-bold text-white line-clamp-1">{q.question}</p>
                      <p className="text-[11px] text-slate-500 font-mono">
                        {q.topic} • {q.difficulty}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span
                      className={`text-xs font-bold font-mono px-2 py-0.5 rounded ${
                        qScore >= 75
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : qScore > 0
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : 'bg-red-500/10 text-red-400 border border-red-500/20'
                      }`}
                    >
                      {qScore}%
                    </span>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="p-4 pt-0 border-t border-slate-800/80 space-y-4 text-xs mt-2">
                    {/* User Answer with intelligent fallback formatting */}
                    <div className="p-3.5 rounded-lg bg-slate-900/80 border border-slate-800/80 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Candidate Response:</span>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${formattedAnswer.badgeColor}`}>
                          {formattedAnswer.badgeLabel}
                        </span>
                      </div>
                      <p className="text-slate-200 leading-relaxed font-mono text-[11px]">
                        "{formattedAnswer.displayText}"
                      </p>
                    </div>

                    {/* Question Mini Rubric Indicators */}
                    {evalObj && (
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                          <span className="text-[10px] text-slate-400 block">Correctness</span>
                          <span className="text-xs font-bold font-mono text-indigo-300">
                            {evalObj.correctness ?? 0}%
                          </span>
                        </div>
                        <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                          <span className="text-[10px] text-slate-400 block">Tech Depth</span>
                          <span className="text-xs font-bold font-mono text-cyan-300">
                            {evalObj.technicalDepth ?? 0}%
                          </span>
                        </div>
                        <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                          <span className="text-[10px] text-slate-400 block">Completeness</span>
                          <span className="text-xs font-bold font-mono text-purple-300">
                            {evalObj.completeness ?? 0}%
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Missing Concepts Identified by Name */}
                    {missing && missing.length > 0 && (
                      <div className="space-y-1.5">
                        <span className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                          Missing Concepts to Review:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {missing.map((conceptName: string, cIdx: number) => (
                            <span
                              key={cIdx}
                              className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-[11px]"
                            >
                              {conceptName}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Evaluator Feedback naming concepts */}
                    <div className="space-y-1">
                      <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider">AI Coach Feedback:</span>
                      <p className="text-slate-300 leading-relaxed">
                        {evalObj?.feedback || 'Answer evaluated.'}
                      </p>
                    </div>

                    {/* Model Answer */}
                    {(evalObj?.improvedAnswer || q.sampleAnswer) && (
                      <div className="p-3.5 rounded-lg bg-indigo-950/20 border border-indigo-500/20 space-y-1">
                        <span className="text-[11px] font-bold text-cyan-300 uppercase tracking-wider">Production Benchmark Answer:</span>
                        <p className="text-slate-300 leading-relaxed font-mono text-[11px]">
                          {evalObj?.improvedAnswer || q.sampleAnswer}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
