import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { Activity, Search, Filter, RefreshCw, Clock, ArrowRight, CheckCircle2, AlertTriangle, ThumbsUp, ThumbsDown } from 'lucide-react';
import AppShell from '../../components/AppShell/AppShell';
import ProtectedRoute from '../../components/ProtectedRoute/ProtectedRoute';
import api from '../../services/api';

export default function ExecutionsListPage() {
  const [executions, setExecutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterFeedback, setFilterFeedback] = useState('');

  const fetchExecutions = async () => {
    try {
      setLoading(true);
      const res = await api.get('/executions', {
        params: {
          search: search.trim() || undefined,
          feedback: filterFeedback || undefined,
        },
      });
      setExecutions(res.data.executions || []);
    } catch (err) {
      console.warn('Could not fetch executions:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExecutions();
  }, [search, filterFeedback]);

  return (
    <ProtectedRoute>
      <Head>
        <title>Audit Executions - CollegeRAG_AI</title>
      </Head>
      <AppShell title="Audit Execution Logs" subtitle="Granular RAG Ingestion, Retrieval & Synthesis Traceability">
        <div className="space-y-6 animate-fade-in">
          {/* Header */}
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">RAG Query Execution Trail</h3>
              <p className="text-xs text-slate-400 font-mono">
                Inspect cosine similarity confidence, latency bottlenecks, and retrieved chunk payloads
              </p>
            </div>

            <button
              onClick={fetchExecutions}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-surface-100 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-xs font-mono transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Trail</span>
            </button>
          </div>

          {/* Search & Feedback Filter */}
          <div className="p-4 rounded-2xl bg-surface-200/60 border border-white/10 flex items-center justify-between gap-4 flex-wrap">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search queries or responses..."
                className="w-full pl-10 pr-4 py-2 bg-surface-100 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500/50"
              />
            </div>

            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="text-slate-400">Feedback:</span>
              {['', 'upvote', 'downvote'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilterFeedback(f)}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    filterFeedback === f
                      ? 'bg-brand-600 text-white'
                      : 'bg-white/5 text-slate-400 hover:text-white'
                  }`}
                >
                  {f === '' ? 'All' : f === 'upvote' ? '👍 Upvoted' : '👎 Downvoted'}
                </button>
              ))}
            </div>
          </div>

          {/* Executions Table */}
          <div className="rounded-2xl bg-surface-200/70 border border-white/10 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-sans">
                <thead className="bg-surface-100/90 text-slate-400 font-mono uppercase tracking-wider text-[10px] border-b border-white/10">
                  <tr>
                    <th className="py-3 px-4">Query Input</th>
                    <th className="py-3 px-4">Confidence Score</th>
                    <th className="py-3 px-4">Chunks</th>
                    <th className="py-3 px-4">Duration</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {executions.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-500 font-mono">
                        No query executions found.
                      </td>
                    </tr>
                  ) : (
                    executions.map((exec) => {
                      const scorePct = Math.round((exec.topSimilarityScore || 0) * 100);
                      const isConfident = scorePct >= 70;

                      return (
                        <tr key={exec._id || exec.id} className="hover:bg-white/5 transition-colors">
                          <td className="py-3.5 px-4 max-w-sm">
                            <p className="font-semibold text-white truncate">{exec.query}</p>
                            <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                              {new Date(exec.createdAt).toLocaleString()}
                            </p>
                          </td>

                          <td className="py-3.5 px-4">
                            <span
                              className={`px-2.5 py-1 rounded-lg font-mono text-[11px] border ${
                                isConfident
                                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                                  : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                              }`}
                            >
                              {scorePct}% Match
                            </span>
                          </td>

                          <td className="py-3.5 px-4 font-mono text-slate-300">
                            {exec.retrievedChunks?.length || 0} chunks
                          </td>

                          <td className="py-3.5 px-4 font-mono text-slate-300">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-cyan-400" /> {exec.durationMs || 320}ms
                            </span>
                          </td>

                          <td className="py-3.5 px-4">
                            <span className="px-2 py-0.5 rounded-full bg-surface-100 text-slate-300 border border-white/10 text-[10px] font-mono">
                              {exec.status}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <Link
                              href={`/executions/${exec._id || exec.id}`}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-surface-100 hover:bg-brand-600/20 text-slate-300 hover:text-brand-300 border border-white/10 hover:border-brand-500/30 transition-all font-mono text-xs"
                            >
                              <span>Inspect</span>
                              <ArrowRight className="w-3 h-3" />
                            </Link>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
