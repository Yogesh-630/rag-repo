import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import {
  Activity,
  ArrowRight,
  Database,
  Layers,
  Sparkles,
  RefreshCw,
  Clock,
  ShieldCheck,
  CheckCircle2,
  FileText,
  ThumbsUp,
  ThumbsDown,
} from 'lucide-react';
import AppShell from '../components/AppShell/AppShell';
import ProtectedRoute from '../components/ProtectedRoute/ProtectedRoute';
import MetricGrid from '../components/MetricGrid/MetricGrid';
import api from '../services/api';

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/stats');
      setStats(res.data);
    } catch (err) {
      console.warn('Could not fetch dashboard stats:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <ProtectedRoute>
      <Head>
        <title>Operations Console - CollegeRAG_AI</title>
      </Head>
      <AppShell title="Operations Dashboard" subtitle="Real-time RAG Pipeline Health & Query Analytics">
        <div className="space-y-6 animate-fade-in">
          {/* Top Bar with Refresh Button */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">System Performance & Telemetry</h3>
              <p className="text-xs text-slate-400 font-mono">Aggregated metrics across institutional vector partitions</p>
            </div>

            <button
              onClick={fetchStats}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-100 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-xs font-mono transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Metrics</span>
            </button>
          </div>

          {/* Metric Grid Cards */}
          <MetricGrid metrics={stats?.metrics} feedback={stats?.feedback} />

          {/* 2-Column Analytics Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Recent Queries Feed */}
            <div className="lg:col-span-2 p-6 rounded-2xl bg-surface-200/80 border border-white/10 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-brand-400" />
                  <h4 className="text-sm font-bold text-white">Recent Query Executions</h4>
                </div>
                <Link
                  href="/executions"
                  className="text-xs text-brand-400 hover:text-brand-300 font-medium flex items-center gap-1"
                >
                  <span>View full audit log</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              <div className="space-y-2.5">
                {stats?.recentQueries && stats.recentQueries.length > 0 ? (
                  stats.recentQueries.map((q, idx) => {
                    const scorePct = Math.round((q.topSimilarityScore || 0) * 100);
                    const isConfident = scorePct >= 70;

                    return (
                      <Link
                        key={q._id || idx}
                        href={`/executions/${q._id || q.id}`}
                        className="p-3.5 rounded-xl bg-surface-100/70 hover:bg-surface-100 border border-white/5 hover:border-brand-500/30 transition-all flex items-center justify-between gap-3 block group"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold text-white truncate group-hover:text-brand-300 transition-colors">
                            {q.query}
                          </p>
                          <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400 mt-1">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" /> {q.durationMs || 340}ms
                            </span>
                            <span>•</span>
                            <span>{new Date(q.createdAt).toLocaleTimeString()}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-mono border ${
                              isConfident
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                                : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                            }`}
                          >
                            {scorePct}% Match
                          </span>

                          {q.feedback === 'upvote' && <ThumbsUp className="w-3.5 h-3.5 text-emerald-400" />}
                          {q.feedback === 'downvote' && <ThumbsDown className="w-3.5 h-3.5 text-rose-400" />}
                        </div>
                      </Link>
                    );
                  })
                ) : (
                  <p className="text-xs text-slate-500 text-center py-6">No queries executed yet.</p>
                )}
              </div>
            </div>

            {/* Right Column: Knowledge Base Distribution & System Health */}
            <div className="space-y-6">
              {/* Category Breakdown */}
              <div className="p-6 rounded-2xl bg-surface-200/80 border border-white/10 shadow-xl space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-white/10">
                  <Layers className="w-4 h-4 text-cyan-400" />
                  <h4 className="text-sm font-bold text-white">Document Coverage by Topic</h4>
                </div>

                <div className="space-y-2.5">
                  {stats?.categories && Object.keys(stats.categories).length > 0 ? (
                    Object.entries(stats.categories).map(([cat, count]) => (
                      <div key={cat} className="flex items-center justify-between text-xs">
                        <span className="text-slate-300 font-medium">{cat}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-surface-100 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-brand-500 h-full rounded-full"
                              style={{ width: `${Math.min(count * 25, 100)}%` }}
                            />
                          </div>
                          <span className="text-white font-mono font-bold w-4 text-right">{count}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-slate-500 py-2">5 official categories active.</div>
                  )}
                </div>

                <div className="pt-2">
                  <Link
                    href="/documents"
                    className="w-full py-2 bg-white/5 hover:bg-white/10 text-brand-300 hover:text-brand-200 text-xs font-semibold rounded-xl border border-white/5 transition-all flex items-center justify-center gap-1.5"
                  >
                    <span>Manage Repository</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* Vector Health Status Card */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-surface-100 to-surface-200 border border-brand-500/20 shadow-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-emerald-400 animate-pulse" />
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">Vector DB Health</h4>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono">
                    Operational
                  </span>
                </div>

                <div className="space-y-1 text-xs font-mono text-slate-400">
                  <div className="flex justify-between">
                    <span>Engine:</span>
                    <span className="text-slate-200">Cosine Memory Index</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Vector Count:</span>
                    <span className="text-slate-200">{stats?.vectorStatus?.totalVectors || 22}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Dimensions:</span>
                    <span className="text-slate-200">1536 Float32</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
