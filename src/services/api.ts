// API Client service communicating with backend REST endpoints

export async function fetchProviders() {
  const res = await fetch('/api/config/providers');
  return res.json();
}

export async function loginUser(email: string) {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  return res.json();
}

export async function registerUser(data: { name: string; email: string; targetRole?: string }) {
  const res = await fetch('/api/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function parsePDF(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch('/api/resume/parse_pdf', {
    method: 'POST',
    body: formData,
  });
  return res.json();
}

export async function getCurrentUser() {
  const res = await fetch('/api/auth/me');
  return res.json();
}

export async function uploadResume(data: { text: string; filename?: string; targetRole?: string }) {
  const res = await fetch('/api/resume/upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function getCandidateProfile() {
  const res = await fetch('/api/resume/profile');
  return res.json();
}

export async function evaluateATS(resumeText: string, targetRole: string) {
  const res = await fetch('/api/resume/ats', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ resumeText, targetRole }),
  });
  return res.json();
}

export async function createInterview(config: {
  category: string;
  difficulty: string;
  mode: string;
  targetRole: string;
  company?: string;
  totalQuestions: number;
}) {
  const res = await fetch('/api/interview/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config),
  });
  return res.json();
}

export async function getSessionQuestion(sessionId: string) {
  const res = await fetch(`/api/interview/${sessionId}/question`);
  return res.json();
}

export async function submitSessionAnswer(sessionId: string, answer: string) {
  const res = await fetch(`/api/interview/${sessionId}/answer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ answer }),
  });
  return res.json();
}

export async function advanceSessionQuestion(sessionId: string) {
  const res = await fetch(`/api/interview/${sessionId}/next`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  return res.json();
}

export async function getSessionResults(sessionId: string) {
  const res = await fetch(`/api/interview/${sessionId}/results`);
  return res.json();
}

export async function transcribeAudio(audioBase64: string, mimeType?: string) {
  const res = await fetch('/api/speech/transcribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ audioBase64, mimeType }),
  });
  return res.json();
}

export async function generateRoadmap(targetRole: string, weakTopics?: string[]) {
  const res = await fetch('/api/roadmap/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ targetRole, weakTopics }),
  });
  return res.json();
}

export async function getRoadmap() {
  const res = await fetch('/api/roadmap');
  return res.json();
}

export async function toggleRoadmapDay(dayNumber: number) {
  const res = await fetch('/api/roadmap/toggle', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ dayNumber }),
  });
  return res.json();
}

export async function runCodingProblem(code: string, language: string, problemId: string) {
  const res = await fetch('/api/code/run', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, language, problemId }),
  });
  return res.json();
}

export async function getDashboardOverview() {
  const res = await fetch('/api/dashboard/overview');
  return res.json();
}

export async function getDashboardAnalytics() {
  const res = await fetch('/api/dashboard/analytics');
  return res.json();
}

export async function submitCodeEvaluation(code: string, language: string, problemId: string) {
  const response = await fetch('/api/coding/execute', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, language, problemId })
  });
  
  if (!response.ok) {
    throw new Error('Code execution API failed');
  }
  
  return response.json();
}

// Re-export evaluation service types and helpers
export * from './evaluation';
