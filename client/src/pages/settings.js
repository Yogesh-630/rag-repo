import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import {
  Settings,
  User,
  Database,
  Key,
  Shield,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Server,
  Layers,
  Sparkles,
  Download,
} from 'lucide-react';
import AppShell from '../components/AppShell/AppShell';
import ProtectedRoute from '../components/ProtectedRoute/ProtectedRoute';
import { useAuthStore } from '../store/authStore';
import api from '../services/api';

export default function SettingsPage() {
  const { user } = useAuthStore();
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [seedResult, setSeedResult] = useState(null);

  const fetchHealth = async () => {
    try {
      setLoading(true);
      const res = await api.get('/health');
      setHealth(res.data);
    } catch (err) {
      console.warn('Health check error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  const handleSeed = async () => {
    if (!window.confirm('Reset and seed the default official college knowledge base and user accounts?')) {
      return;
    }
    setSeeding(true);
    setSeedResult(null);
    try {
      const res = await api.post('/admin/seed');
      setSeedResult(res.data);
      fetchHealth();
    } catch (err) {
      alert(err.response?.data?.message || 'Seed failed');
    } finally {
      setSeeding(false);
    }
  };

  return (
    <ProtectedRoute>
      <Head>
        <title>Settings - CollegeRAG_AI</title>
      </Head>
      <AppShell title="System & Profile Settings" subtitle="Vector Database Health, Model Routing & Configuration">
        <div className="space-y-6 max-w-4xl animate-fade-in">
          {/* User Profile Card */}
          <div className="p-6 rounded-2xl bg-surface-200/80 border border-white/10 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-purple-600 flex items-center justify-center text-white font-bold text-sm uppercase shadow-glow-indigo">
                  {user?.name?.charAt(0) || 'U'}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">{user?.name || 'Operator Profile'}</h3>
                  <p className="text-xs text-slate-400 font-mono">{user?.email}</p>
                </div>
              </div>

              <span className={`px-3 py-1 rounded-full text-xs font-mono border uppercase ${
                user?.role === 'admin'
                  ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
              }`}>
                {user?.role}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
              <div className="p-3.5 rounded-xl bg-surface-100 border border-white/5 space-y-1">
                <span className="text-slate-500">Department Scope:</span>
                <p className="text-white font-semibold">{user?.department || 'General'}</p>
              </div>
              <div className="p-3.5 rounded-xl bg-surface-100 border border-white/5 space-y-1">
                <span className="text-slate-500">Access Permissions:</span>
                <p className="text-white font-semibold">
                  {user?.role === 'admin' ? 'Read / Write / Delete / Ingestion' : 'Query Operator / Read Only'}
                </p>
              </div>
            </div>
          </div>

          {/* Vector Database & Server Status */}
          <div className="p-6 rounded-2xl bg-surface-200/80 border border-white/10 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-cyan-400" />
                <h4 className="text-sm font-bold text-white">Vector Similarity Engine Status</h4>
              </div>

              <button
                onClick={fetchHealth}
                className="flex items-center gap-1 text-xs font-mono text-slate-400 hover:text-white"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>Check Status</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
              <div className="p-3.5 rounded-xl bg-surface-100 border border-white/5 space-y-1">
                <span className="text-slate-500">Active Vectors:</span>
                <p className="text-xl font-bold text-cyan-400">{health?.vectorDb?.totalVectors || 22}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-surface-100 border border-white/5 space-y-1">
                <span className="text-slate-500">Embedding Dimensions:</span>
                <p className="text-xl font-bold text-brand-400">{health?.vectorDb?.dimensions || 1536}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-surface-100 border border-white/5 space-y-1">
                <span className="text-slate-500">Database Layer:</span>
                <p className="text-xl font-bold text-emerald-400">{health?.database || 'Connected'}</p>
              </div>
            </div>
          </div>

          {/* Model Provider & API Key Status */}
          <div className="p-6 rounded-2xl bg-surface-200/80 border border-white/10 shadow-xl space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-white/10">
              <Key className="w-4 h-4 text-purple-400" />
              <h4 className="text-sm font-bold text-white">AI Provider Integrations</h4>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="p-3.5 rounded-xl bg-surface-100 border border-white/5 flex items-center justify-between">
                <div>
                  <span className="text-white font-semibold block">OpenAI (gpt-4o-mini & text-embedding-3-small)</span>
                  <span className="text-[11px] text-slate-400">Configured via OPENAI_API_KEY</span>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[10px] border ${
                  health?.aiProviders?.openai
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                    : 'bg-white/5 text-slate-400 border-white/10'
                }`}>
                  {health?.aiProviders?.openai ? 'Active' : 'Unset (Fallback Active)'}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-surface-100 border border-white/5 flex items-center justify-between">
                <div>
                  <span className="text-white font-semibold block">Google Generative AI (Gemini 1.5 Flash)</span>
                  <span className="text-[11px] text-slate-400">Configured via GEMINI_API_KEY</span>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[10px] border ${
                  health?.aiProviders?.gemini
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                    : 'bg-white/5 text-slate-400 border-white/10'
                }`}>
                  {health?.aiProviders?.gemini ? 'Active' : 'Unset (Fallback Active)'}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-surface-100 border border-white/5 flex items-center justify-between">
                <div>
                  <span className="text-white font-semibold block">Supabase (Cloud PostgreSQL & Storage)</span>
                  <span className="text-[11px] text-slate-400">Configured via SUPABASE_URL & SUPABASE_KEY</span>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[10px] border ${
                  health?.supabase?.configured
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                    : 'bg-white/5 text-slate-400 border-white/10'
                }`}>
                  {health?.supabase?.configured ? 'Connected' : 'Unset'}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-surface-100 border border-white/5 flex items-center justify-between">
                <div>
                  <span className="text-white font-semibold block">Smart Deterministic Semantic Fallback Engine</span>
                  <span className="text-[11px] text-slate-400">Zero-friction offline vectorizer and synthesizer</span>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px]">
                  Always Ready
                </span>
              </div>
            </div>
          </div>

          {/* Sample Knowledge Base Seeder (Admin Only) */}
          {user?.role === 'admin' && (
            <div className="p-6 rounded-2xl bg-surface-200/80 border border-white/10 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-brand-400" />
                  <h4 className="text-sm font-bold text-white">Sample College Knowledge Base Seeder</h4>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                Clicking the button below re-initializes and indexes 5 official sample college documents (Admissions 2025, Tuition Fees & Scholarships, Hostel Rules & Mess Timings, Exam Regulations, and Placements Report) along with standard student/admin accounts.
              </p>

              {seedResult && (
                <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 space-y-1 font-mono">
                  <p className="font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> Seed Completed Successfully:
                  </p>
                  <p>• {seedResult.documentsSeeded} documents indexed ({seedResult.chunksIndexed} chunks)</p>
                </div>
              )}

              <button
                onClick={handleSeed}
                disabled={seeding}
                className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-brand-600 hover:from-purple-500 hover:to-brand-500 disabled:opacity-40 text-white text-xs font-semibold rounded-xl shadow-glow-indigo transition-all flex items-center gap-2"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${seeding ? 'animate-spin' : ''}`} />
                <span>{seeding ? 'Seeding Knowledge Base...' : 'Re-Seed Sample Documents'}</span>
              </button>
            </div>
          )}
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
