import { jsPDF } from 'jspdf';

interface PDFReportData {
  candidateName: string;
  targetRole: string;
  category: string;
  company?: string;
  date: string;
  overallScore: number;
  aggregateScores: {
    correctness: number;
    technicalDepth: number;
    completeness: number;
    communication: number;
    clarity: number;
  };
  strengths: string[];
  weaknesses: string[];
  missingConcepts: string[];
  questions: {
    question: string;
    topic: string;
    difficulty: string;
    userAnswer?: string;
    evaluation?: {
      overallScore: number;
      feedback: string;
      improvedAnswer: string;
    };
  }[];
}

export function downloadPDFReport(data: PDFReportData) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let y = 20;

  // Header Banner
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 40, 'F');

  // Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(255, 255, 255);
  doc.text('AI INTERVIEW COACH', 14, 18);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text('Official Candidate Performance Assessment & Feedback Report', 14, 26);
  doc.text(`Generated: ${new Date(data.date).toLocaleDateString()} | Session Verified`, 14, 32);

  y = 48;

  // Candidate Overview Card
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, y, pageWidth - 28, 28, 3, 3, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(30, 41, 59);
  doc.text(`Candidate: ${data.candidateName}`, 18, y + 8);
  doc.text(`Target Role: ${data.targetRole}`, 18, y + 16);
  doc.text(`Category: ${data.category} (${data.company || 'Standard Practice'})`, 18, y + 24);

  // Score Badge
  doc.setFillColor(99, 102, 241); // indigo-500
  doc.roundedRect(pageWidth - 52, y + 4, 34, 20, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.text('OVERALL SCORE', pageWidth - 50, y + 10);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(`${data.overallScore}/100`, pageWidth - 47, y + 19);

  y += 36;

  // Competency Metrics
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text('1. Core Competency Breakdown', 14, y);
  y += 6;

  const metrics = [
    { label: 'Correctness', val: data.aggregateScores.correctness },
    { label: 'Technical Depth', val: data.aggregateScores.technicalDepth },
    { label: 'Completeness', val: data.aggregateScores.completeness },
    { label: 'Communication', val: data.aggregateScores.communication },
    { label: 'Clarity', val: data.aggregateScores.clarity },
  ];

  const colWidth = (pageWidth - 28) / metrics.length;
  metrics.forEach((m, idx) => {
    const x = 14 + idx * colWidth;
    doc.setFillColor(241, 245, 249);
    doc.roundedRect(x, y, colWidth - 2, 16, 2, 2, 'F');
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(m.label, x + 3, y + 6);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text(`${m.val}%`, x + 3, y + 13);
  });

  y += 24;

  // Strengths & Weaknesses
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('2. Key Observations & Skill Gaps', 14, y);
  y += 6;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(22, 101, 52); // green-800
  data.strengths.slice(0, 3).forEach((s) => {
    doc.text(`+ [Strength]: ${s}`, 14, y);
    y += 5;
  });

  doc.setTextColor(185, 28, 28); // red-700
  data.weaknesses.slice(0, 3).forEach((w) => {
    doc.text(`- [Improvement]: ${w}`, 14, y);
    y += 5;
  });

  y += 4;

  // Question-by-Question Breakdown
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('3. Question-by-Question Detailed Analysis', 14, y);
  y += 8;

  data.questions.forEach((q, idx) => {
    // Check if new page needed
    if (y > pageHeight - 45) {
      doc.addPage();
      y = 20;
    }

    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(14, y, pageWidth - 28, 38, 2, 2, 'FD');

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text(`Q${idx + 1}: ${q.question.slice(0, 90)}...`, 18, y + 6);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(`Topic: ${q.topic} | Difficulty: ${q.difficulty} | Score: ${q.evaluation?.overallScore || 0}%`, 18, y + 12);

    doc.setTextColor(71, 85, 105);
    const feedbackLines = doc.splitTextToSize(`Feedback: ${q.evaluation?.feedback || 'Answer evaluated.'}`, pageWidth - 36);
    doc.text(feedbackLines.slice(0, 3), 18, y + 18);

    doc.setTextColor(79, 70, 229); // indigo-600
    const improvedPreview = doc.splitTextToSize(`Model Answer: ${q.evaluation?.improvedAnswer || ''}`, pageWidth - 36);
    doc.text(improvedPreview.slice(0, 2), 18, y + 29);

    y += 44;
  });

  // Footer on last page
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text('Confidential - Generated by AI Interview Coach. Designed for career preparation.', 14, pageHeight - 10);

  // Save PDF
  const filename = `${data.candidateName.replace(/\s+/g, '_')}_Interview_Report_${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(filename);
}
