import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { GraduationCap, Lock, Mail, User, Building, ArrowRight, AlertCircle, RefreshCw, Sparkles, ShieldCheck } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export default function RegisterPage() {
  const router = useRouter();
  const { register, loginWithGoogle, error, clearError } = useAuthStore();
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleGoogle = async () => {
    setGoogleLoading(true);
    clearError();
    await loginWithGoogle();
    setGoogleLoading(false);
  };
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [department, setDepartment] = useState('Computer Science');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password || submitting) return;
    setSubmitting(true);
    clearError();

    const res = await register({ name, email, password, role, department });
    setSubmitting(false);
    if (res.success) {
      router.push('/chat');
    }
  };

  return (
    <div className="min-h-screen bg-background text-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans relative overflow-hidden">
      <Head>
        <title>Create Account - CollegeRAG_AI Institutional Intelligence</title>
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
        <h2 className="text-3xl font-black text-white tracking-tight">Institutional Account Registration</h2>
        <p className="text-xs text-slate-400 font-mono flex items-center justify-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-cyber-cyan" />
          <span>Join the grounded college knowledge operations platform</span>
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

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5 font-mono">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Alex Johnson"
                  className="w-full pl-11 pr-4 py-3 bg-surface-300/80 border border-white/10 focus:border-cyber-cyan/60 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyber-cyan/20 transition-all font-sans"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5 font-mono">Institutional Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex.johnson@college.edu"
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
                  placeholder="Minimum 6 characters"
                  className="w-full pl-11 pr-4 py-3 bg-surface-300/80 border border-white/10 focus:border-cyber-cyan/60 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyber-cyan/20 transition-all font-sans"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5 font-mono">Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3 py-3 bg-surface-300/80 border border-white/10 focus:border-cyber-cyan/60 rounded-xl text-xs text-white focus:outline-none font-sans"
                >
                  <option value="student" className="bg-surface-200">Student (Query Operator)</option>
                  <option value="admin" className="bg-surface-200">Administrator (Doc Manager)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5 font-mono">Department</label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="Computer Science"
                  className="w-full px-3 py-3 bg-surface-300/80 border border-white/10 focus:border-cyber-cyan/60 rounded-xl text-xs text-white focus:outline-none font-sans"
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
                  <span>Registering Account...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="text-center text-xs text-slate-400 pt-2 border-t border-white/10">
            Already have an account?{' '}
            <Link href="/login" className="text-brand-400 hover:text-brand-300 font-bold underline">
              Sign In Instead
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
