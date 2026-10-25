// src/services/evaluation.ts
// Evaluation Service: Robust scoring rubric, explicit schema validation preventing 'N/A' defaults,
// multi-step answer quality check correlating performance with specific technical keywords,
// and identifying missing concepts by distinct name keys rather than generic labels.

export interface RubricMetric {
  key: 'correctness' | 'technicalDepth' | 'completeness' | 'communication' | 'clarity';
  label: string;
  score: number;
  weight: number;
  weightPercentage: string;
  benchmark: number;
  status: 'Mastered' | 'Proficient' | 'Developing' | 'Needs Remediation';
  statusColor: string;
  badgeBg: string;
  badgeText: string;
  progressColor: string;
  description: string;
  actionableTip: string;
}

export interface ConceptCorrelation {
  conceptKey: string;
  matched: boolean;
  confidence: number;
  matchedKeywords: string[];
  expectedKeywords: string[];
}

export interface RubricEvaluationResult {
  overallScore: number;
  correctness: number;
  technicalDepth: number;
  completeness: number;
  communication: number;
  clarity: number;
  strengths: string[];
  weaknesses: string[];
  missingConcepts: string[];
  conceptCorrelations?: ConceptCorrelation[];
  feedback: string;
  improvedAnswer: string;
  isNonAnswer: boolean;
  nonAnswerReason?: string;
  keywordDensityScore?: number;
}

// Generic labels that must never be shown as missing concepts
const GENERIC_FORBIDDEN = [
  'trade-offs',
  'trade-off',
  'core principles',
  'principles',
  'technical concepts',
  'n/a',
  'na',
  'none',
  'general concepts',
  'best practices',
  'basics',
  'mechanics',
];

// Technical depth indicators used in heuristic analysis
const TECHNICAL_DEPTH_TERMS = [
  'latency',
  'throughput',
  'concurrency',
  'asynchronous',
  'thread',
  'lock',
  'mutex',
  'complexity',
  'cache',
  'index',
  'sharding',
  'partition',
  'gradient',
  'backpropagation',
  'regularization',
  'overfitting',
  'underfitting',
  'imbalance',
  'focal loss',
  'smote',
  'auc',
  'precision',
  'recall',
  'tradeoff',
  'benchmark',
  'failover',
  'idempotent',
  'transaction',
  'isolation',
  'acid',
];

export function isNonAnswer(answer: string | undefined): boolean {
  if (!answer) return true;
  const clean = answer.trim().toLowerCase();
  if (clean.length === 0) return true;
  const nonAnswerPhrases = [
    'n/a',
    'na',
    'none',
    'no answer',
    'idk',
    "i don't know",
    'dont know',
    'no idea',
    'skip',
    'pass',
    'not sure',
    'blank',
    'unanswered',
    'test',
    'asdf',
  ];
  return nonAnswerPhrases.includes(clean) || (clean.length < 5 && !/[a-zA-Z0-9]/.test(clean));
}

export function extractExpectedConcepts(question: any): string[] {
  if (!question) return ['Core principles', 'Implementation trade-offs'];
  if (Array.isArray(question.expectedConcepts) && question.expectedConcepts.length > 0) {
    return question.expectedConcepts.map((c: any) => String(c).trim());
  }
  if (Array.isArray(question.expected_concepts) && question.expected_concepts.length > 0) {
    return question.expected_concepts.map((c: any) => String(c).trim());
  }
  if (question.topic) {
    return [question.topic, 'Edge cases & trade-offs', 'Scalability considerations'];
  }
  return ['Foundational mechanics', 'System trade-offs'];
}

export function correlateAnswerWithConcepts(expectedConcepts: string[], answer: string) {
  const lowerAnswer = answer.toLowerCase();
  const matchedKeys: string[] = [];
  const missingKeys: string[] = [];
  const conceptCorrelations: ConceptCorrelation[] = [];

  for (const concept of expectedConcepts) {
    const rawTerms = concept
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 3);

    const matchedTerms = rawTerms.filter((term) => lowerAnswer.includes(term));
    const isMatched = matchedTerms.length > 0 || lowerAnswer.includes(concept.toLowerCase());

    if (isMatched) {
      matchedKeys.push(concept);
    } else {
      missingKeys.push(concept);
    }

    conceptCorrelations.push({
      conceptKey: concept,
      matched: isMatched,
      confidence: isMatched ? Math.min(1, matchedTerms.length / Math.max(1, rawTerms.length)) : 0,
      matchedKeywords: matchedTerms,
      expectedKeywords: rawTerms,
    });
  }

  const depthTermsCount = TECHNICAL_DEPTH_TERMS.filter((term) => lowerAnswer.includes(term)).length;

  return {
    matchedKeys,
    missingKeys,
    depthTermsCount,
    conceptCorrelations,
  };
}

export function validateEvaluationSchema(
  rawEvaluation: any,
  question: any,
  answer: string
): RubricEvaluationResult {
  const expectedConcepts = extractExpectedConcepts(question);
  const cleanAnswer = (answer || '').trim();

  // If unattempted or N/A
  if (isNonAnswer(cleanAnswer)) {
    return {
      overallScore: 0,
      correctness: 0,
      technicalDepth: 0,
      completeness: 0,
      communication: 0,
      clarity: 0,
      strengths: [],
      weaknesses: [
        'Candidate response was unattempted, left blank, or submitted as N/A.',
        'No technical substance provided to evaluate against benchmark.',
      ],
      missingConcepts: expectedConcepts,
      feedback: `The question asked about ${question?.topic || 'the topic'} with focus on: ${expectedConcepts.join(
        ', '
      )}. Under technical interview rubrics, blank answers receive 0/100 marks. Review the model benchmark answer to prepare this concept.`,
      improvedAnswer: question?.sampleAnswer || 'Provide a structured technical definition and architecture trade-off.',
      isNonAnswer: true,
      nonAnswerReason: 'Response marked as N/A or left blank',
      keywordDensityScore: 0,
    };
  }

  if (!rawEvaluation || typeof rawEvaluation !== 'object') {
    return evaluateAnswerLocally(question, cleanAnswer);
  }

  const clamp = (val: any, fallback: number) => {
    const n = Number(val);
    return isNaN(n) ? fallback : Math.max(0, Math.min(100, Math.round(n)));
  };

  const correctness = clamp(rawEvaluation.correctness, 70);
  const technicalDepth = clamp(rawEvaluation.technicalDepth ?? rawEvaluation.technical_depth, 65);
  const completeness = clamp(rawEvaluation.completeness, 65);
  const communication = clamp(rawEvaluation.communication, 75);
  const clarity = clamp(rawEvaluation.clarity, 75);

  const overall = clamp(
    rawEvaluation.overallScore ?? rawEvaluation.overall_score,
    Math.round(
      correctness * 0.35 +
      technicalDepth * 0.25 +
      completeness * 0.2 +
      communication * 0.1 +
      clarity * 0.1
    )
  );

  // Clean missing concepts to prevent generic labels
  let missing = Array.isArray(rawEvaluation.missingConcepts)
    ? rawEvaluation.missingConcepts
    : Array.isArray(rawEvaluation.missing_concepts)
    ? rawEvaluation.missing_concepts
    : [];

  missing = missing
    .map((c: any) => String(c).trim())
    .filter((c: string) => c.length > 2 && !GENERIC_FORBIDDEN.includes(c.toLowerCase()));

  if (correctness < 90 && missing.length === 0) {
    const correlation = correlateAnswerWithConcepts(expectedConcepts, cleanAnswer);
    missing = correlation.missingKeys.length > 0 ? correlation.missingKeys : [expectedConcepts[0]];
  }

  let strengths = Array.isArray(rawEvaluation.strengths)
    ? rawEvaluation.strengths.map((s: any) => String(s).trim()).filter((s: string) => s.length > 0)
    : [];

  let weaknesses = Array.isArray(rawEvaluation.weaknesses)
    ? rawEvaluation.weaknesses.map((w: any) => String(w).trim()).filter((w: string) => w.length > 0)
    : [];

  if (strengths.length === 0 && overall >= 50) {
    strengths = ['Addressed the foundational requirements of the problem'];
  }

  if (weaknesses.length === 0 && overall < 90) {
    weaknesses = [
      `Deepen technical explanation of ${missing.slice(0, 2).join(' and ') || 'internal mechanisms'}`,
    ];
  }

  const feedback =
    typeof rawEvaluation.feedback === 'string' && rawEvaluation.feedback.trim().length > 10
      ? rawEvaluation.feedback.trim()
      : `Answer scored ${overall}%. Focus on articulating underlying mechanisms: ${expectedConcepts.join(', ')}.`;

  const improvedAnswer =
    typeof rawEvaluation.improvedAnswer === 'string' && rawEvaluation.improvedAnswer.trim().length > 10
      ? rawEvaluation.improvedAnswer.trim()
      : question?.sampleAnswer || 'Structure answers using Definition -> Mechanics -> Trade-offs.';

  return {
    overallScore: overall,
    correctness,
    technicalDepth,
    completeness,
    communication,
    clarity,
    strengths,
    weaknesses,
    missingConcepts: missing,
    feedback,
    improvedAnswer,
    isNonAnswer: false,
  };
}

export function evaluateAnswerLocally(question: any, answer: string): RubricEvaluationResult {
  const expectedConcepts = extractExpectedConcepts(question);
  const trimmed = (answer || '').trim();

  if (isNonAnswer(trimmed)) {
    return validateEvaluationSchema(null, question, trimmed);
  }

  const correlation = correlateAnswerWithConcepts(expectedConcepts, trimmed);
  const words = trimmed.split(/\s+/).filter(Boolean);
  const coverageRatio = correlation.matchedKeys.length / Math.max(1, expectedConcepts.length);
  const lengthFactor = Math.min(1, words.length / 85);

  const correctness = Math.round(coverageRatio * 80 + (correlation.matchedKeys.length > 0 ? lengthFactor * 10 : 0));
  const technicalDepth = Math.round(coverageRatio * 65 + Math.min(25, correlation.depthTermsCount * 6));
  const completeness = Math.round(coverageRatio * 90);
  const communication = Math.round(Math.min(92, Math.max(20, words.length * 1.2)));
  const clarity = Math.round(Math.min(90, Math.max(20, words.length * 1.1)));

  const overall = Math.round(
    correctness * 0.35 +
    technicalDepth * 0.25 +
    completeness * 0.2 +
    communication * 0.1 +
    clarity * 0.1
  );

  return {
    overallScore: Math.max(10, Math.min(95, overall)),
    correctness: Math.max(5, Math.min(95, correctness)),
    technicalDepth: Math.max(5, Math.min(92, technicalDepth)),
    completeness: Math.max(5, Math.min(95, completeness)),
    communication: Math.max(15, Math.min(92, communication)),
    clarity: Math.max(15, Math.min(90, clarity)),
    strengths:
      correlation.matchedKeys.length > 0
        ? correlation.matchedKeys.map((c) => `Demonstrated technical understanding of ${c}`)
        : ['Attempted a technical response structure'],
    weaknesses:
      correlation.missingKeys.length > 0
        ? correlation.missingKeys.map((c) => `Did not adequately articulate ${c}`)
        : ['Could expand on edge cases and concrete performance benchmarks under scale'],
    missingConcepts: correlation.missingKeys.length > 0 ? correlation.missingKeys : [expectedConcepts[0]],
    feedback:
      correlation.missingKeys.length > 0
        ? `Identified missing concepts: ${correlation.missingKeys.join(
            ', '
          )}. While you covered ${
            correlation.matchedKeys.length > 0 ? correlation.matchedKeys.join(', ') : 'part of the problem'
          }, senior benchmarks require clearly articulating ${correlation.missingKeys
            .slice(0, 2)
            .join(' and ')} with concrete trade-offs.`
        : `Strong coverage of key concepts (${expectedConcepts.join(
            ', '
          )}). To reach staff bar, discuss operational failover modes and latency implications.`,
    improvedAnswer: question?.sampleAnswer || 'Structure answers using Definition -> Mechanics -> Trade-offs.',
    isNonAnswer: false,
  };
}

export function formatCandidateAnswer(answer: string | undefined): {
  displayText: string;
  badgeLabel: string;
  badgeColor: string;
} {
  if (!answer || isNonAnswer(answer)) {
    return {
      displayText: '(Candidate submitted an empty answer or marked N/A)',
      badgeLabel: 'Unattempted / N/A',
      badgeColor: 'bg-red-500/10 text-red-400 border-red-500/20',
    };
  }
  return {
    displayText: answer.trim(),
    badgeLabel: `${answer.trim().split(/\s+/).length} Words`,
    badgeColor: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20',
  };
}

export function buildScorecardMetrics(scores: any): RubricMetric[] {
  const getVal = (k: string, fb: number) => (typeof scores?.[k] === 'number' ? scores[k] : fb);

  const correctness = getVal('correctness', 75);
  const technicalDepth = getVal('technicalDepth', 70);
  const completeness = getVal('completeness', 70);
  const communication = getVal('communication', 80);
  const clarity = getVal('clarity', 78);

  const getMeta = (score: number) => {
    if (score >= 85) {
      return {
        status: 'Mastered' as const,
        statusColor: 'text-emerald-400',
        badgeBg: 'bg-emerald-500/10 border-emerald-500/20',
        badgeText: 'text-emerald-400',
        progressColor: 'from-emerald-500 to-cyan-400',
      };
    }
    if (score >= 70) {
      return {
        status: 'Proficient' as const,
        statusColor: 'text-indigo-300',
        badgeBg: 'bg-indigo-500/10 border-indigo-500/20',
        badgeText: 'text-indigo-300',
        progressColor: 'from-indigo-500 to-cyan-400',
      };
    }
    if (score >= 50) {
      return {
        status: 'Developing' as const,
        statusColor: 'text-amber-400',
        badgeBg: 'bg-amber-500/10 border-amber-500/20',
        badgeText: 'text-amber-400',
        progressColor: 'from-amber-500 to-yellow-400',
      };
    }
    return {
      status: 'Needs Remediation' as const,
      statusColor: 'text-red-400',
      badgeBg: 'bg-red-500/10 border-red-500/20',
      badgeText: 'text-red-400',
      progressColor: 'from-red-500 to-pink-500',
    };
  };

  const cMeta = getMeta(correctness);
  const dMeta = getMeta(technicalDepth);
  const cmpMeta = getMeta(completeness);
  const commMeta = getMeta(communication);
  const clrMeta = getMeta(clarity);

  return [
    {
      key: 'correctness',
      label: 'Correctness',
      score: correctness,
      weight: 0.35,
      weightPercentage: '35%',
      benchmark: 75,
      ...cMeta,
      description: 'Factual accuracy, absence of hallucinations, and technical correctness.',
      actionableTip: 'Ensure technical definitions, equations, and invariant properties are exact.',
    },
    {
      key: 'technicalDepth',
      label: 'Technical Depth',
      score: technicalDepth,
      weight: 0.25,
      weightPercentage: '25%',
      benchmark: 75,
      ...dMeta,
      description: 'Understanding of internal mechanics, low-level execution, and Big-O trade-offs.',
      actionableTip: 'Explain why an architecture works under the hood rather than just naming tools.',
    },
    {
      key: 'completeness',
      label: 'Completeness',
      score: completeness,
      weight: 0.2,
      weightPercentage: '20%',
      benchmark: 75,
      ...cmpMeta,
      description: 'Coverage of all expected architectural dimensions, edge cases, and failure modes.',
      actionableTip: 'Address edge cases, cold starts, concurrency contention, and recovery.',
    },
    {
      key: 'communication',
      label: 'Communication',
      score: communication,
      weight: 0.1,
      weightPercentage: '10%',
      benchmark: 75,
      ...commMeta,
      description: 'Answer structure (Definition -> Mechanism -> Real-world Trade-off).',
      actionableTip: 'Use bulleted frameworks and lead with bottom-line conclusions.',
    },
    {
      key: 'clarity',
      label: 'Clarity',
      score: clarity,
      weight: 0.1,
      weightPercentage: '10%',
      benchmark: 75,
      ...clrMeta,
      description: 'Conciseness, active voice, and avoidance of circular filler phrases.',
      actionableTip: 'Eliminate conversational hedges like "I guess" or repetitive restatements.',
    },
  ];
}

export function getScoreLetterGrade(score: number): {
  grade: string;
  label: string;
  color: string;
  badgeBg: string;
} {
  if (score >= 90) {
    return {
      grade: 'A+',
      label: 'Strong Hire (Senior Bar)',
      color: 'text-emerald-400',
      badgeBg: 'bg-emerald-500/10 border-emerald-500/30',
    };
  }
  if (score >= 80) {
    return {
      grade: 'A',
      label: 'Hire (Standard Bar)',
      color: 'text-indigo-300',
      badgeBg: 'bg-indigo-500/10 border-indigo-500/30',
    };
  }
  if (score >= 70) {
    return {
      grade: 'B',
      label: 'Leaning Hire',
      color: 'text-cyan-400',
      badgeBg: 'bg-cyan-500/10 border-cyan-500/30',
    };
  }
  if (score >= 55) {
    return {
      grade: 'C',
      label: 'Needs Growth (Gaps Detected)',
      color: 'text-amber-400',
      badgeBg: 'bg-amber-500/10 border-amber-500/30',
    };
  }
  if (score > 0) {
    return {
      grade: 'D',
      label: 'Significant Skill Gaps',
      color: 'text-red-400',
      badgeBg: 'bg-red-500/10 border-red-500/30',
    };
  }
  return {
    grade: 'F',
    label: 'Unattempted / Incomplete',
    color: 'text-red-500',
    badgeBg: 'bg-red-500/10 border-red-500/40',
  };
}