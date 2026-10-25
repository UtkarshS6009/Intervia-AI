import React, { useState } from 'react';
import { submitCodeEvaluation } from '../services/api';
import { 
  Code2, 
  Play, 
  Cpu, 
  RotateCcw,
} from 'lucide-react';

export const CodingRound: React.FC = () => {
  const [problemId, setProblemId] = useState<'two-sum' | 'lru-cache'>('two-sum');
  const [language, setLanguage] = useState<'python' | 'javascript'>('python');
  
  // Consolidated state for evaluation
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState<any>(null);

  const defaultCodes: Record<string, Record<string, string>> = {
    'two-sum': {
      python: `class Solution:
    def twoSum(self, nums, target):
        """
        Given an array of integers nums and an integer target,
        return indices of the two numbers such that they add up to target.
        """
        seen = {}
        for i, num in enumerate(nums):
            complement = target - num
            if complement in seen:
                return [seen[complement], i]
            seen[num] = i
        return []

# Local Test
sol = Solution()
print(sol.twoSum([2, 7, 11, 15], 9)) # Expected: [0, 1]`,
      // ... keep your javascript code exactly as it is below this
      javascript: `function twoSum(nums, target) {
  const seen = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (seen.has(complement)) {
      return [seen.get(complement), i];
    }
    seen.set(nums[i], i);
  }
  return [];
}

console.log(twoSum([2, 7, 11, 15], 9)); // Expected: [0, 1]`,
    },
    'lru-cache': {
      python: `class LRUCache:
    def __init__(self, capacity: int):
        self.capacity = capacity
        self.cache = {} # In Python 3.7+, dict preserves insertion order

    def get(self, key: int) -> int:
        if key not in self.cache:
            return -1
        val = self.cache.pop(key)
        self.cache[key] = val # mark recently used
        return val

    def put(self, key: int, value: int) -> None:
        if key in self.cache:
            self.cache.pop(key)
        elif len(self.cache) >= self.capacity:
            oldest_key = next(iter(self.cache))
            del self.cache[oldest_key]
        self.cache[key] = value`,
      javascript: `class LRUCache {
  constructor(capacity) {
    this.capacity = capacity;
    this.map = new Map();
  }

  get(key) {
    if (!this.map.has(key)) return -1;
    const val = this.map.get(key);
    this.map.delete(key);
    this.map.set(key, val);
    return val;
  }

  put(key, value) {
    if (this.map.has(key)) {
      this.map.delete(key);
    } else if (this.map.size >= this.capacity) {
      const firstKey = this.map.keys().next().value;
      this.map.delete(firstKey);
    }
    this.map.set(key, value);
  }
}`,
    },
  };

  const [code, setCode] = useState(defaultCodes[problemId][language]);

  const handleProblemChange = (id: 'two-sum' | 'lru-cache') => {
    setProblemId(id);
    setCode(defaultCodes[id][language]);
    setEvaluation(null);
  };

  const handleLanguageChange = (lang: 'python' | 'javascript') => {
    setLanguage(lang);
    setCode(defaultCodes[problemId][lang]);
  };

  const handleRunCode = async () => {
    if (!code || !code.trim()) {
      alert("Error: The 'code' variable is empty. Make sure it is linked to your text editor!");
      return;
    }
    
    setIsEvaluating(true);
    setEvaluation(null);

    try {
      // Pass the raw strings directly to bypass undefined variable bugs
      const res = await submitCodeEvaluation(code, 'python', 'two-sum');
      
      if (res.evaluation) {
        setEvaluation(res.evaluation);
      }
    } catch (error) {
      console.error('Execution error:', error);
      setEvaluation({
        isCorrect: false,
        timeComplexity: "N/A",
        spaceComplexity: "N/A",
        executionOutput: "Server Error: Could not reach backend.",
        feedback: "Please ensure your FastAPI backend is running.",
        optimizationHint: "",
        score: 0
      });
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-6 space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-2xl bg-slate-900 border border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Code2 className="w-6 h-6 text-indigo-400" />
            Live Coding Round & Complexity Analyzer
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Safe sandbox evaluation of data structures, Big-O runtime, and algorithmic optimizations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={problemId}
            onChange={(e) => handleProblemChange(e.target.value as any)}
            className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
          >
            <option value="two-sum">Problem 1: Two Sum (Hash Map O(N))</option>
            <option value="lru-cache">Problem 2: LRU Cache (O(1) Get & Put)</option>
          </select>

          <select
            value={language}
            onChange={(e) => handleLanguageChange(e.target.value as any)}
            className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-indigo-300 font-mono focus:outline-none focus:border-indigo-500"
          >
            <option value="python">Python 3</option>
            <option value="javascript">JavaScript (Node.js)</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Editor Area */}
        <div className="xl:col-span-7 space-y-4">
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 shadow-xl space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-mono text-slate-400">solution.{language === 'python' ? 'py' : 'js'}</span>
              <button
                onClick={() => setCode(defaultCodes[problemId][language])}
                className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1"
                title="Reset code template"
              >
                <RotateCcw className="w-3 h-3" /> Reset
              </button>
            </div>

            <textarea
              rows={17}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full bg-transparent font-mono text-xs text-indigo-200 focus:outline-none resize-none leading-relaxed selection:bg-indigo-600"
            />

            <div className="flex items-center justify-between pt-2 border-t border-slate-800">
              <span className="text-[11px] text-slate-500 font-mono">Sandbox: Safe Execution Layer Active</span>
              <button
                onClick={handleRunCode}
                disabled={isEvaluating}
                className={`px-6 py-3 rounded-xl font-bold shadow-lg flex items-center gap-2 transition-all ${
                  isEvaluating 
                    ? 'bg-slate-700 text-slate-400 cursor-not-allowed' 
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white hover:scale-105 active:scale-95'
                }`}
              >
                {isEvaluating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Evaluating...
                  </>
                ) : (
                  "Run Code & Get AI Review"
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Results & Big-O Feedback Area */}
        <div className="xl:col-span-5 space-y-4">
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl min-h-[400px]">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-5">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Cpu className="w-4 h-4 text-cyan-400" />
                Execution & Test Results
              </span>
            </div>

            {evaluation ? (
              <div className="space-y-4 animate-in fade-in">
                <div className="flex items-center justify-between pb-2">
                  <h3 className="text-sm font-bold flex items-center gap-2">
                    {evaluation.isCorrect ? (
                      <span className="text-emerald-400 flex items-center gap-2">✅ Execution Success</span>
                    ) : (
                      <span className="text-red-400 flex items-center gap-2">❌ Execution Failed</span>
                    )}
                  </h3>
                  <div className="px-3 py-1 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-slate-300">
                    Score: <span className={evaluation.score >= 80 ? 'text-emerald-400' : 'text-amber-400'}>{evaluation.score}/100</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-center shadow-inner">
                    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Time Complexity</span>
                    <div className="text-indigo-400 font-mono text-lg mt-1">{evaluation.timeComplexity}</div>
                  </div>
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-center shadow-inner">
                    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Space Complexity</span>
                    <div className="text-cyan-400 font-mono text-lg mt-1">{evaluation.spaceComplexity}</div>
                  </div>
                </div>

                <div className="space-y-1.5 pt-2">
                  <span className="text-[10px] text-slate-500 font-bold ml-1 uppercase tracking-wider">Raw Console Logs</span>
                  <pre className="w-full p-4 bg-black rounded-xl border border-slate-800 text-[11px] font-mono text-slate-300 overflow-x-auto shadow-inner whitespace-pre-wrap">
                    {evaluation.executionOutput || "No standard output returned."}
                  </pre>
                </div>

                <div className="space-y-3 text-xs pt-2">
                  <div className="p-4 bg-indigo-950/30 border border-indigo-500/20 rounded-xl text-slate-300 leading-relaxed">
                    <strong className="text-indigo-300 block mb-1">AI Feedback:</strong>
                    {evaluation.feedback}
                  </div>
                  
                  {evaluation.optimizationHint && (
                    <div className="p-4 bg-amber-950/30 border border-amber-500/20 rounded-xl text-slate-300 leading-relaxed">
                      <strong className="text-amber-400 block mb-1">Optimization Hint:</strong>
                      {evaluation.optimizationHint}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center py-12 text-center space-y-3 text-slate-500 text-xs">
                <Play className="w-10 h-10 opacity-30 text-indigo-400" />
                <p>Click "Run Code & Get AI Review" to test your solution.<br/>The sandbox will execute your code against hidden unit tests.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};