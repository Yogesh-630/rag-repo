import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { GraduationCap, Lock, Mail, ArrowRight, ShieldCheck, UserCheck, AlertCircle, RefreshCw, Sparkles, Zap } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export default function LoginPage() {
  const router = useRouter();
  const { login, loginWithGoogle, isAuthenticated, isLoading, error, clearError, initialize } = useAuthStore();
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleGoogle = async () => {
    setGoogleLoading(true);
    clearError();
    await loginWithGoogle();
    setGoogleLoading(false);
  };

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (isAuthenticated) {
      const redirect = router.query.redirect || '/chat';
      router.push(redirect);
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password || submitting) return;
    setSubmitting(true);
    clearError();

    const res = await login(email, password);
    setSubmitting(false);
    if (res.success) {
      router.push('/chat');
    }
  };

  const fillCredentials = (testEmail, testPassword) => {
    setEmail(testEmail);
    setPassword(testPassword);
    clearError();
  };

  return (
    <div className="min-h-screen bg-background text-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans relative overflow-hidden">
      <Head>
        <title>Sign In - CollegeRAG_AI Institutional Intelligence</title>
      </Head>

      {/* Dynamic Ambient Aurora Orbs */}
      <div className="aurora-bg">
        <div className="orb-1" />
        <div className="orb-2" />
        <div className="orb-3" />
      </div>

      {/* Cyber Grid Texture */}
      <div className="absolute inset-0 cyber-grid opacity-25 pointer-events-none z-0" />

      <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3">
        <Link href="/" className="inline-flex items-center gap-3 group">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-600 via-indigo-500 to-cyber-cyan flex items-center justify-center shadow-glow-indigo text-white transition-all duration-300 group-hover:scale-110 group-hover:shadow-glow-cyan border border-white/20">
            <GraduationCap className="w-8 h-8 animate-pulse-slow" />
          </div>
        </Link>
        <h2 className="text-3xl font-black text-white tracking-tight">Institutional Portal Sign In</h2>
        <p className="text-xs text-slate-400 font-mono flex items-center justify-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-cyber-cyan" />
          <span>Access grounded RAG assistant & administration console</span>
        </p>
      </div>

      <div className="relative z-10 mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="glass-card-premium p-8 rounded-3xl shadow-2xl space-y-6 border border-white/15 relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-brand-500 to-cyber-cyan rounded-3xl blur opacity-20 group-hover:opacity-35 transition duration-500 -z-10" />

          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/40 text-xs text-rose-200 flex items-center gap-2.5 animate-slide-up shadow-sm">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          {/* Quick 1-Click Demo Fill Buttons */}
          <div className="p-3.5 rounded-2xl bg-surface-300/80 border border-white/10 space-y-2.5">
            <span className="text-[11px] font-mono text-slate-400 block text-center font-semibold flex items-center justify-center gap-1">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              1-Click Instant Demo Login:
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => fillCredentials('admin@college.edu', 'Admin@123')}
                className="px-3 py-2.5 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 text-purple-200 border border-purple-500/35 text-xs font-mono transition-all flex items-center justify-center gap-1.5 font-bold shadow-sm transform hover:scale-[1.02] active:scale-[0.98]"
              >
                <ShieldCheck className="w-4 h-4 text-purple-400" />
                <span>Admin Login</span>
              </button>

              <button
                type="button"
                onClick={() => fillCredentials('student@college.edu', 'Student@123')}
                className="px-3 py-2.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-200 border border-emerald-500/35 text-xs font-mono transition-all flex items-center justify-center gap-1.5 font-bold shadow-sm transform hover:scale-[1.02] active:scale-[0.98]"
              >
                <UserCheck className="w-4 h-4 text-emerald-400" />
                <span>Student Login</span>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5 font-mono">Institutional Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@college.edu or admin@college.edu"
                  className="w-full pl-11 pr-4 py-3 bg-surface-300/80 border border-white/10 focus:border-cyber-cyan/60 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyber-cyan/20 transition-all font-sans"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5 font-mono">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-3 bg-surface-300/80 border border-white/10 focus:border-cyber-cyan/60 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyber-cyan/20 transition-all font-sans"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 bg-gradient-to-r from-brand-600 via-indigo-600 to-cyber-cyan hover:from-brand-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-glow-indigo transition-all flex items-center justify-center gap-2 transform hover:scale-[1.01] active:scale-[0.99] border border-white/15"
            >
              {submitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>Authenticate Session</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Google OAuth (Optional) */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleGoogle}
              disabled={googleLoading}
              className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-slate-300 hover:text-white text-xs font-medium transition-all"
            >
              {googleLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              )}
              <span>Continue with Google</span>
            </button>
          </div>

          <div className="text-center text-xs text-slate-400 pt-2 border-t border-white/10">
            Don't have an account?{' '}
            <Link href="/register" className="text-brand-400 hover:text-brand-300 font-bold underline">
              Register New Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
