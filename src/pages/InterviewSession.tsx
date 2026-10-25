import { FaceDetector, FilesetResolver } from "@mediapipe/tasks-vision";
import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  Clock, 
  Send, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight, 
  Pause, 
  Play, 
  MessageSquare,
  Lightbulb,
  Video,
  VideoOff,
  ScanFace
} from 'lucide-react';

import { 
  getSessionQuestion, 
  submitSessionAnswer, 
  advanceSessionQuestion 
} from '../services/api';

import { 
  evaluateAnswerLocally, 
  formatCandidateAnswer, 
  buildScorecardMetrics, 
  extractExpectedConcepts,
  RubricMetric
} from '../services/evaluation';

import { InterviewSessionSkeleton } from '../components/skeletons/InterviewSessionSkeleton';

interface InterviewSessionProps {
  sessionId: string;
  onFinish: (sessionId: string) => void;
  onExit: () => void;
}

export const InterviewSession: React.FC<InterviewSessionProps> = ({
  sessionId,
  onFinish,
  onExit,
}) => {
  const [session, setSession] = useState<any>(null);
  const [question, setQuestion] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [answerText, setAnswerText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [evalResult, setEvalResult] = useState<any>(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [speechNotice, setSpeechNotice] = useState<string | null>(null);

  // Timer state
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [timerActive, setTimerActive] = useState(true);

  // Audio / Speech recording state
  const [isRecording, setIsRecording] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const recognitionRef = useRef<any>(null);

  // Webcam & Eye Tracking state
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isWebcamOn, setIsWebcamOn] = useState(false);
  const [focusScore, setFocusScore] = useState(92);

  // Evaluation loader step simulation
  const [evalStep, setEvalStep] = useState(0);
  const evalSteps = [
    'Analyzing technical correctness...',
    'Checking depth against expected concepts...',
    'Evaluating clarity and communication delivery...',
    'Synthesizing actionable feedback & model answer...',
  ];

  // Load question on mount
  useEffect(() => {
    async function fetchQuestion() {
      setIsLoading(true);
      try {
        const res = await getSessionQuestion(sessionId);
        if (res?.question) {
          setSession(res.session);
          setQuestion(res.question);
          setAnswerText(res.question.userAnswer || '');
          if (res.question.evaluation) {
            setEvalResult(res.question.evaluation);
          }
        }
      } catch (err) {
        console.error('Failed to load session question:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchQuestion();
  }, [sessionId]);

  // Timer effect
  useEffect(() => {
    let interval: any = null;
    if (timerActive && !showFeedbackModal) {
      interval = setInterval(() => {
        setSecondsElapsed((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerActive, showFeedbackModal]);


  // Real, Hardware-Agnostic Face Detection using Google MediaPipe
  useEffect(() => {
    let focusInterval: any = null;
    let detector: FaceDetector | null = null;
    let isModelLoaded = false;

    const initializeMediaPipe = async () => {
      try {
        // Fetch the WebAssembly core and the lightweight BlazeFace model directly from Google's CDN
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
        );
        detector = await FaceDetector.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: "https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite",
            delegate: "CPU"
          },
          runningMode: "VIDEO"
        });
        isModelLoaded = true;
      } catch (err) {
        console.error("Failed to load MediaPipe model:", err);
      }
    };

    if (isWebcamOn) {
      // 1. Download and initialize the AI model into browser memory
      initializeMediaPipe();

      // 2. Scan the video frame exactly twice a second
      focusInterval = setInterval(() => {
        if (isModelLoaded && detector && videoRef.current && videoRef.current.readyState >= 2) {
          const startTimeMs = performance.now();
          const results = detector.detectForVideo(videoRef.current, startTimeMs);

          if (results.detections.length === 0) {
            // VERIFIED OUT OF FRAME: Rapidly drop score
            setFocusScore(prev => Math.max(0, prev - 15));
          } else {
            // VERIFIED IN FRAME: Restore and maintain score
            // We add a tiny 1% fluctuation to make the UI feel "live", but the detection is 100% real
            const liveJitter = (Math.random() * 2) - 1;
            setFocusScore(prev => Math.min(100, Math.max(85, prev + 8 + liveJitter)));
          }
        }
      }, 500);
    }

    return () => {
      clearInterval(focusInterval);
      if (detector) {
        detector.close();
      }
    };
  }, [isWebcamOn]);

  // Cleanup Webcam on unmount
  useEffect(() => {
    return () => {
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Initialize Speech Recognition if supported
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      
      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
        }
        setAnswerText((prev) => prev + (prev.length > 0 && !prev.endsWith(' ') ? ' ' : '') + transcript);
      };
      
      recognition.onerror = (e: any) => {
        console.warn('Speech recognition event:', e);
        setIsRecording(false);
      };
      
      recognitionRef.current = recognition;
    } else {
      setSpeechSupported(false);
    }
  }, []);

  const toggleRecording = () => {
    if (!speechSupported || !recognitionRef.current) {
      setSpeechNotice('Speech recognition is not supported in this browser. Please type your answer.');
      setTimeout(() => setSpeechNotice(null), 4000);
      return;
    }
    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (e) {
        console.warn('Recognition start issue:', e);
        setIsRecording(false);
      }
    }
  };

  const toggleWebcam = async () => {
    if (isWebcamOn) {
      const stream = videoRef.current?.srcObject as MediaStream;
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      setIsWebcamOn(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        
        // 1. Tell React to show the video box UI first
        setIsWebcamOn(true); 
        
        // 2. Wait a split second for the DOM to render, THEN attach the camera feed
        setTimeout(() => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        }, 50);
        
      } catch (err) {
        console.error("Webcam error:", err);
        setSpeechNotice('Camera access denied or unavailable.');
        setTimeout(() => setSpeechNotice(null), 4000);
      }
    }
  };

  const handleSpeakQuestion = () => {
    if ('speechSynthesis' in window && question?.question) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(question.question);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleSubmit = async () => {
    if (!answerText.trim()) return;
    
    if (isRecording && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
    
    setIsSubmitting(true);
    setEvalStep(0);
    
    const stepInterval = setInterval(() => {
      setEvalStep((prev) => (prev < evalSteps.length - 1 ? prev + 1 : prev));
    }, 600);
    
    try {
      const res = await submitSessionAnswer(sessionId, answerText);
      clearInterval(stepInterval);
      
      if (res?.evaluation) {
        setEvalResult(res.evaluation);
        setShowFeedbackModal(true);
      } else {
        const fallback = evaluateAnswerLocally(question, answerText);
        setEvalResult(fallback);
        setShowFeedbackModal(true);
      }
    } catch (err) {
      clearInterval(stepInterval);
      console.error('Answer evaluation API error, using intelligent local rubric:', err);
      const fallback = evaluateAnswerLocally(question, answerText);
      setEvalResult(fallback);
      setShowFeedbackModal(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNextQuestion = async () => {
    setShowFeedbackModal(false);
    setIsLoading(true);
    setAnswerText('');
    setEvalResult(null);
    
    try {
      const res = await advanceSessionQuestion(sessionId);
      if (res?.completed) {
        onFinish(sessionId);
      } else if (res?.nextQuestion) {
        setQuestion(res.nextQuestion);
        setSession((prev: any) => ({
          ...prev,
          currentQuestionIndex: res.currentQuestionIndex,
          totalQuestions: res.totalQuestions,
        }));
      }
    } catch (err) {
      console.error('Failed to advance question:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (isLoading || !question) {
    return <InterviewSessionSkeleton />;
  }

  const currentIndex = session?.currentQuestionIndex ?? 0;
  const total = session?.totalQuestions ?? 5;
  const progressPercent = Math.round(((currentIndex + 1) / total) * 100);

  return (
    <div className="max-w-4xl mx-auto py-4 space-y-6 relative">
      {/* Session Top Bar */}
      <div className="flex items-center justify-between p-4 px-6 rounded-2xl bg-slate-900 border border-slate-800">
        <div className="flex items-center gap-3">
          <button
            onClick={onExit}
            className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 transition-colors"
          >
            Exit Session
          </button>
          <div className="h-4 w-px bg-slate-800" />
          <span className="text-xs font-bold text-white uppercase tracking-wider">
            {session?.category} Practice
          </span>
          {session?.company && (
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-indigo-300 border border-slate-700">
              {session.company} Style
            </span>
          )}
        </div>

        <div className="flex items-center gap-4">
          <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-mono">
            DIFFICULTY: {question.difficulty.toUpperCase()}
          </span>
          <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-950 border border-slate-800 font-mono text-xs text-slate-300">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span>{formatTimer(secondsElapsed)}</span>
            <button
              onClick={() => setTimerActive(!timerActive)}
              className="text-slate-500 hover:text-white ml-1"
              title={timerActive ? 'Pause timer' : 'Resume timer'}
            >
              {timerActive ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            </button>
          </div>
        </div>
      </div>

      {speechNotice && (
        <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-300 flex items-center justify-between animate-in fade-in">
          <span>{speechNotice}</span>
          <button
            onClick={() => setSpeechNotice(null)}
            className="text-amber-400 hover:text-white font-bold ml-2 text-sm"
          >
            ×
          </button>
        </div>
      )}

      {/* Progress Bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs text-slate-400 font-mono">
          <span>Question {currentIndex + 1} of {total}</span>
          <span>{progressPercent}% Complete</span>
        </div>
        <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
          <div
            className="bg-gradient-to-r from-indigo-500 to-cyan-400 h-full rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Main Question Card */}
      <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-900/80 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              TOPIC: {question.topic}
            </span>
            {question.isFollowUp && (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                DYNAMIC ADAPTIVE FOLLOW-UP
              </span>
            )}
          </div>
          <button
            onClick={handleSpeakQuestion}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
          >
            <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>Read Aloud</span>
          </button>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-white leading-relaxed tracking-tight">
          "{question.question}"
        </h2>
        
        <div className="pt-2">
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-start gap-2.5 text-xs text-slate-400">
            <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-300">Target Discussion Dimensions: </span>
              {extractExpectedConcepts(question).join(' • ')}
            </div>
          </div>
        </div>
      </div>

      {/* Answer Area */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 relative">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
            <MessageSquare className="w-4 h-4 text-indigo-400" />
            <span>Your Response</span>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Webcam Toggle */}
            <button
              onClick={toggleWebcam}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                isWebcamOn
                  ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-md shadow-emerald-500/20'
                  : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
              }`}
            >
              {isWebcamOn ? <VideoOff className="w-3.5 h-3.5" /> : <Video className="w-3.5 h-3.5 text-emerald-400" />}
              <span className="hidden sm:inline">{isWebcamOn ? 'Stop Camera' : 'Video Analysis'}</span>
            </button>

            {/* Voice Mic Toggle */}
            <button
              onClick={toggleRecording}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                isRecording
                  ? 'bg-red-500/20 border-red-500 text-red-400 animate-pulse shadow-md shadow-red-500/20'
                  : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
              }`}
            >
              {isRecording ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5 text-cyan-400" />}
              <span>{isRecording ? 'Listening...' : 'Dictate'}</span>
            </button>
          </div>
        </div>

        {isRecording && (
          <div className="p-3 rounded-xl bg-red-950/20 border border-red-500/30 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              <span className="text-xs text-red-300 font-medium">Recording voice answer... Speak clearly</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-1 h-4 bg-red-400 animate-bounce" />
              <span className="w-1 h-6 bg-red-400 animate-bounce delay-75" />
              <span className="w-1 h-3 bg-red-400 animate-bounce delay-150" />
              <span className="w-1 h-5 bg-red-400 animate-bounce delay-100" />
            </div>
          </div>
        )}

        <textarea
          rows={7}
          value={answerText}
          onChange={(e) => setAnswerText(e.target.value)}
          placeholder="Articulate your answer thoroughly. Structure with core definition, architectural mechanism, and concrete trade-offs or production lessons..."
          className="w-full p-4 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-colors resize-none leading-relaxed"
        />

        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-slate-500 font-mono">
            {answerText.trim() ? answerText.trim().split(/\s+/).length : 0} words
          </span>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !answerText.trim()}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 disabled:opacity-50 text-white text-xs font-bold shadow-lg shadow-indigo-500/20 flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
          >
            {isSubmitting ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Evaluating Response...</span>
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>Submit Answer for AI Evaluation</span>
              </>
            )}
          </button>
        </div>

        {isSubmitting && (
          <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-500/20 space-y-2 text-xs">
            <div className="flex items-center gap-2 text-indigo-300 font-semibold">
              <Sparkles className="w-4 h-4 text-cyan-300 animate-spin" />
              <span>{evalSteps[evalStep]}</span>
            </div>
            <div className="w-full bg-slate-950 rounded-full h-1 overflow-hidden">
              <div
                className="bg-indigo-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${((evalStep + 1) / evalSteps.length) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Floating PIP Webcam with Focus Overlay */}
        {isWebcamOn && (
          <div className="fixed bottom-6 right-6 sm:bottom-10 sm:right-10 w-44 sm:w-56 aspect-video bg-slate-950 rounded-xl border border-slate-700 overflow-hidden shadow-2xl z-50 animate-in slide-in-from-bottom-8">
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted 
              className="w-full h-full object-cover scale-x-[-1]" 
            />
            <div className="absolute top-2 left-2 px-2 py-1 rounded-md bg-slate-950/70 border border-slate-700/50 backdrop-blur-md flex items-center gap-1.5">
              <ScanFace className={`w-3.5 h-3.5 ${focusScore > 80 ? 'text-emerald-400' : 'text-amber-400'}`} />
              <span className="text-[10px] text-white font-mono font-bold">
                FOCUS: {Math.round(focusScore)}%
              </span>
            </div>
            {/* Reticle UI Elements */}
            <div className="absolute inset-0 pointer-events-none border-[0.5px] border-indigo-500/20">
              <div className="absolute top-2 right-2 w-2 h-2 border-t-2 border-r-2 border-cyan-400/70" />
              <div className="absolute bottom-2 left-2 w-2 h-2 border-b-2 border-l-2 border-cyan-400/70" />
            </div>
          </div>
        )}
      </div>

      {/* Immediate Evaluation Feedback Modal (Restructured for Scrolling) */}
      {showFeedbackModal && evalResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-2xl max-h-[85vh] flex flex-col rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden">
            
            {/* 1. Modal Header (Fixed at top) */}
            <div className="flex items-center justify-between p-6 border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">AI Evaluation Scorecard</h3>
                  <p className="text-xs text-slate-400">Objective analysis against technical benchmark</p>
                </div>
              </div>
              <div className="px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-right">
                <span
                  className={`text-2xl font-extrabold font-mono ${
                    evalResult.overallScore >= 75
                      ? 'text-emerald-400'
                      : evalResult.overallScore >= 50
                      ? 'text-amber-400'
                      : 'text-red-400'
                  }`}
                >
                  {evalResult.overallScore}
                </span>
                <span className="text-xs text-slate-500">/100</span>
              </div>
            </div>

            {/* 2. Modal Body (Scrollable Area) */}
            <div className="p-6 overflow-y-auto space-y-6 custom-scrollbar">
              
              {/* Metrics Breakdown Grid */}
              {(() => {
                const modalMetrics = buildScorecardMetrics(evalResult);
                return (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                      {modalMetrics.map((m) => (
                        <div
                          key={m.key}
                          className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5"
                        >
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-slate-400 font-medium">{m.label}</span>
                            <span className="text-slate-500 font-mono text-[9px]">{m.weightPercentage}</span>
                          </div>
                          <div className="flex items-baseline justify-between">
                            <span className="text-sm font-bold font-mono text-white">
                              {m.score}%
                            </span>
                            <span className={`text-[9px] font-semibold px-1.5 py-0.2 rounded ${m.badgeBg} ${m.badgeText}`}>
                              {m.status}
                            </span>
                          </div>
                          <div className="relative w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-full rounded-full bg-gradient-to-r ${m.progressColor} transition-all duration-500`}
                              style={{ width: `${Math.min(100, Math.max(0, m.score))}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* Strengths & Weaknesses */}
              <div className="space-y-3 text-xs">
                {evalResult.strengths && evalResult.strengths.length > 0 ? (
                  <div>
                    <span className="font-bold text-emerald-400 flex items-center gap-1.5 mb-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" /> What You Explained Well:
                    </span>
                    <ul className="space-y-1 text-slate-300 list-disc list-inside">
                      {evalResult.strengths.map((s: string, idx: number) => (
                        <li key={idx}>{s}</li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-red-950/20 border border-red-500/20 text-red-300">
                    <span className="font-bold flex items-center gap-1.5 mb-1 text-red-400">
                      <AlertCircle className="w-3.5 h-3.5" /> No Technical Credit Awarded
                    </span>
                    <p className="text-[11px] text-slate-400">
                      The submitted answer was blank, marked as N/A, or did not attempt the technical question.
                    </p>
                  </div>
                )}

                {evalResult.weaknesses && evalResult.weaknesses.length > 0 && (
                  <div>
                    <span className="font-bold text-amber-400 flex items-center gap-1.5 mb-1.5">
                      <AlertCircle className="w-3.5 h-3.5" /> Identified Weaknesses / Gaps:
                    </span>
                    <ul className="space-y-1 text-slate-300 list-disc list-inside">
                      {evalResult.weaknesses.map((w: string, idx: number) => (
                        <li key={idx}>{w}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {evalResult.missingConcepts && evalResult.missingConcepts.length > 0 && (
                  <div>
                    <span className="font-bold text-indigo-400 flex items-center gap-1.5 mb-1.5">
                      <AlertCircle className="w-3.5 h-3.5" /> Missing Concepts to Review:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {evalResult.missingConcepts.map((m: string, idx: number) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-[11px] font-medium"
                        >
                          {m}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Actionable Feedback */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1">
                <span className="font-bold text-slate-300">Actionable Feedback:</span>
                <p className="text-slate-400 leading-relaxed">{evalResult.feedback}</p>
              </div>

              {/* Improved Exemplary Answer */}
              {evalResult.improvedAnswer && (
                <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-500/20 text-xs space-y-1.5">
                  <span className="font-bold text-indigo-300">Production Benchmark Model Answer:</span>
                  <p className="text-slate-300 leading-relaxed font-mono text-[11px]">
                    {evalResult.improvedAnswer}
                  </p>
                </div>
              )}
            </div>

            {/* 3. Modal Footer CTA (Fixed at bottom) */}
            <div className="p-6 border-t border-slate-800 shrink-0 flex items-center justify-between bg-slate-900/90 backdrop-blur">
              <span className="text-[11px] text-slate-400">
                {evalResult.overallScore > 80 ? '✦ High score: Next question difficulty adapted' : 'Next question ready'}
              </span>
              <button
                onClick={handleNextQuestion}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-500/25 flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
              >
                <span>Continue to Next Question</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};