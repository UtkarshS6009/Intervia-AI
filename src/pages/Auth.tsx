import React, { useState } from 'react';
import { 
  Terminal, 
  ArrowRight, 
  Mail, 
  Lock, 
  User, 
  Briefcase, 
  CheckCircle2, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  Sparkles,
  ShieldCheck,
  BrainCircuit
} from 'lucide-react';
import { loginUser, registerUser } from '../services/api';

interface AuthProps {
  initialMode?: 'login' | 'register';
  onSuccess: (user: any) => void;
  onNavigateHome: () => void;
}

export const Auth: React.FC<AuthProps> = ({
  initialMode = 'login',
  onSuccess,
  onNavigateHome,
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [targetRole, setTargetRole] = useState('Machine Learning Engineer');
  const [experienceLevel, setExperienceLevel] = useState('Intermediate');

  const roleOptions = [
    'Machine Learning Engineer',
    'Full-Stack Developer',
    'Backend Engineer (Python / Go)',
    'Cloud & Systems Architect',
    'Data Scientist',
    'Frontend Engineer (React / TypeScript)',
    'DevOps & MLOps Engineer',
  ];

  // Demo accounts for instant sign in
  const demoAccounts = [
    { name: 'Alex Mercer', email: 'alex.mercer@example.com', role: 'Machine Learning Engineer' },
    { name: 'Sarah Connor', email: 'sarah.connor@example.com', role: 'Full-Stack Developer' },
    { name: 'Jordan Lee', email: 'jordan.lee@example.com', role: 'Cloud & Systems Architect' },
  ];

  const handleDemoLogin = async (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('DemoPassword2026!');
    setError(null);
    setLoading(true);
    try {
      const res = await loginUser(demoEmail);
      if (res?.user) {
        if (res.token) {
          localStorage.setItem('auth_token', res.token);
        }
        onSuccess(res.user);
      } else {
        setError(res?.error || 'Login failed. Please verify credentials.');
      }
    } catch (err: any) {
      setError(err?.message || 'Authentication service unreachable.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError('Please provide a valid email address.');
      return;
    }

    if (mode === 'register' && !name.trim()) {
      setError('Please enter your full name.');
      return;
    }

    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'login') {
        const res = await loginUser(email.trim());
        if (res?.user) {
          if (res.token) {
            localStorage.setItem('auth_token', res.token);
          }
          onSuccess(res.user);
        } else {
          setError(res?.error || 'User not found. Try one of the demo profiles or create a new account.');
        }
      } else {
        const res = await registerUser({
          name: name.trim(),
          email: email.trim(),
          targetRole,
        });
        if (res?.user) {
          if (res.token) {
            localStorage.setItem('auth_token', res.token);
          }
          onSuccess(res.user);
        } else {
          setError(res?.error || 'Could not complete registration.');
        }
      }
    } catch (err: any) {
      setError(err?.message || 'Authentication service error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-10 px-4">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <button
            onClick={onNavigateHome}
            className="inline-flex items-center gap-2 group transition-transform hover:scale-105 mb-2"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 p-0.5 shadow-lg shadow-indigo-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Terminal className="w-5 h-5 text-indigo-400 group-hover:text-cyan-300 transition-colors" />
              </div>
            </div>
            <span className="font-extrabold text-xl tracking-tight text-white">
              AI Interview Coach
            </span>
          </button>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {mode === 'login' ? 'Sign in to your account' : 'Create candidate profile'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            {mode === 'login'
              ? 'Access your interview scores, ATS metrics, and tailored 30-day roadmap.'
              : 'Join to practice adaptive mock interviews scored against Big Tech rubrics.'}
          </p>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="p-1 rounded-xl bg-slate-900 border border-slate-800 grid grid-cols-2 gap-1 text-xs font-semibold">
          <button
            type="button"
            onClick={() => { setMode('login'); setError(null); }}
            className={`py-2 rounded-lg transition-all ${
              mode === 'login'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setError(null); }}
            className={`py-2 rounded-lg transition-all ${
              mode === 'register'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 rounded-xl bg-red-950/30 border border-red-500/30 flex items-start gap-2.5 text-xs text-red-300 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{error}</span>
          </div>
        )}

        {/* Main Auth Form */}
        <div className="p-6 sm:p-8 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl backdrop-blur-xl space-y-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Registration Name Field */}
            {mode === 'register' && (
              <div className="space-y-1.5 text-xs">
                <label className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-indigo-400" /> Full Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex Mercer"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-1.5 text-xs">
              <label className="font-semibold text-slate-300 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-indigo-400" /> Work / Personal Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            {/* Password Field */}
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <label className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-indigo-400" /> Password
                </label>
                {mode === 'login' && (
                  <span className="text-[11px] text-slate-500 cursor-pointer hover:text-indigo-400 transition-colors">
                    Forgot password?
                  </span>
                )}
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-3.5 py-2.5 pr-10 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Registration Additional Fields */}
            {mode === 'register' && (
              <>
                <div className="space-y-1.5 text-xs">
                  <label className="font-semibold text-slate-300 flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-indigo-400" /> Target Technical Role
                  </label>
                  <select
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
                  >
                    {roleOptions.map((role) => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5 text-xs">
                  <label className="font-semibold text-slate-300">Experience Level</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['Fresher / Junior', 'Intermediate (2-5 yrs)', 'Senior (5+ yrs)', 'Staff / Lead'].map((level) => {
                      const isSelected = experienceLevel === level;
                      return (
                        <button
                          key={level}
                          type="button"
                          onClick={() => setExperienceLevel(level)}
                          className={`p-2 rounded-lg border text-left text-[11px] transition-all ${
                            isSelected
                              ? 'bg-indigo-600/20 border-indigo-500 text-white font-semibold'
                              : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                          }`}
                        >
                          {level}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}

            {/* Submit CTA */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 disabled:opacity-50 text-white text-xs font-bold shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-98 mt-2"
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>{mode === 'login' ? 'Sign In to Dashboard' : 'Complete Registration & Begin'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Login Preset Buttons */}
          {mode === 'login' && (
            <div className="pt-4 border-t border-slate-800/80 space-y-2.5">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span className="font-semibold text-slate-300">Quick Demo Logins (1-Click):</span>
                <span>Pre-seeded accounts</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {demoAccounts.map((account) => (
                  <button
                    key={account.email}
                    type="button"
                    onClick={() => handleDemoLogin(account.email)}
                    disabled={loading}
                    className="p-2 rounded-lg bg-slate-950 border border-slate-800 hover:border-indigo-500/40 text-left transition-colors group"
                  >
                    <p className="text-[11px] font-bold text-white group-hover:text-indigo-300 line-clamp-1">{account.name}</p>
                    <p className="text-[9px] text-slate-500 line-clamp-1">{account.role}</p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Toggle Mode Footer */}
        <div className="text-center text-xs text-slate-400">
          {mode === 'login' ? (
            <span>
              New candidate?{' '}
              <button
                onClick={() => { setMode('register'); setError(null); }}
                className="font-bold text-indigo-400 hover:text-indigo-300 underline underline-offset-4 ml-1"
              >
                Create a free profile
              </button>
            </span>
          ) : (
            <span>
              Already registered?{' '}
              <button
                onClick={() => { setMode('login'); setError(null); }}
                className="font-bold text-indigo-400 hover:text-indigo-300 underline underline-offset-4 ml-1"
              >
                Sign in here
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
