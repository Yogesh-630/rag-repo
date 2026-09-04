import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';
import {
  Activity,
  ArrowLeft,
  Clock,
  Database,
  FileText,
  Sparkles,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Code,
} from 'lucide-react';
import AppShell from '../../components/AppShell/AppShell';
import ProtectedRoute from '../../components/ProtectedRoute/ProtectedRoute';
import ExecutionTimeline from '../../components/ExecutionVisualizer/ExecutionTimeline';
import api from '../../services/api';

export default function ExecutionDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchDetail = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/executions/${id}`);
        setData(res.data);
      } catch (err) {
        console.error('Could not fetch execution detail:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  const exec = data?.execution;
  const logs = data?.logs || [];
  const scorePct = exec ? Math.round((exec.topSimilarityScore || 0) * 100) : 0;
  const isConfident = scorePct >= 70;

  return (
    <ProtectedRoute>
      <Head>
        <title>Execution Snapshot - CollegeRAG_AI</title>
      </Head>
      <AppShell title="Execution Telemetry Snapshot" subtitle={`Trace ID: ${id}`}>
        <div className="space-y-6 animate-fade-in">
          {/* Back button & Snapshot Header */}
          <div className="flex items-center justify-between flex-wrap gap-4">
            <Link
              href="/executions"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-100 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-xs font-mono transition-all"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Executions</span>
            </Link>

            {exec && (
              <div className="flex items-center gap-2">
                <span
                  className={`px-3 py-1 rounded-full font-mono text-xs border ${
                    isConfident
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                  }`}
                >
                  Score: {scorePct}% Match
                </span>
                <span className="px-3 py-1 rounded-full bg-brand-500/10 text-brand-300 border border-brand-500/20 font-mono text-xs">
                  {exec.provider || 'local-synthesis'}
                </span>
              </div>
            )}
          </div>

          {loading || !exec ? (
            <div className="p-12 text-center text-xs font-mono text-slate-500">
              Loading execution trace snapshot...
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left 2 Cols: Query, Response, and Retrieved Chunks */}
              <div className="lg:col-span-2 space-y-6">
                {/* Query & Grounded Response Box */}
                <div className="p-6 rounded-2xl bg-surface-200/80 border border-white/10 shadow-xl space-y-4">
                  <div className="space-y-1">
                    <span className="text-[11px] font-mono text-slate-400 uppercase">Student Query Input:</span>
                    <h3 className="text-base font-bold text-white leading-snug">{exec.query}</h3>
                  </div>

                  <div className="space-y-1.5 pt-3 border-t border-white/10">
                    <span className="text-[11px] font-mono text-slate-400 uppercase flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-brand-400" />
                      Grounded Answer Synthesis:
                    </span>
                    <div className="p-4 rounded-xl bg-surface-100/90 border border-white/5 text-xs text-slate-200 leading-relaxed whitespace-pre-wrap font-sans">
                      {exec.response}
                    </div>
                  </div>
                </div>

                {/* Retrieved Context Chunks */}
                <div className="p-6 rounded-2xl bg-surface-200/80 border border-white/10 shadow-xl space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-white/10">
                    <div className="flex items-center gap-2">
                      <Layers className="w-4 h-4 text-cyan-400" />
                      <h4 className="text-sm font-bold text-white">Retrieved Context Payloads ({exec.retrievedChunks?.length || 0})</h4>
                    </div>
                    <span className="text-xs font-mono text-slate-400">Top-K Candidate Pool</span>
                  </div>

                  <div className="space-y-3">
                    {exec.retrievedChunks?.map((chunk, idx) => (
                      <div key={idx} className="p-4 rounded-xl bg-surface-100 border border-white/5 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-white font-mono flex items-center gap-1.5">
                            <FileText className="w-3.5 h-3.5 text-cyan-400" />
                            {chunk.fileName} (Page {chunk.pageNumber})
                          </span>
                          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono text-[10px] border border-emerald-500/30">
                            Match: {Math.round((chunk.score || 0) * 100)}%
                          </span>
                        </div>

                        <p className="text-xs text-slate-300 font-sans leading-relaxed whitespace-pre-wrap bg-surface-200/60 p-3 rounded-lg border border-white/5">
                          {chunk.content}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Execution Timeline Logs & Telemetry Stats */}
              <div className="space-y-6">
                {/* Latency & Token Breakdown */}
                <div className="p-5 rounded-2xl bg-surface-200/80 border border-white/10 shadow-xl space-y-3 font-mono text-xs">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider pb-2 border-b border-white/10">
                    Telemetry Metadata
                  </h4>
                  <div className="flex justify-between text-slate-400">
                    <span>Duration:</span>
                    <span className="text-white font-bold">{exec.durationMs || 340} ms</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Prompt Tokens:</span>
                    <span className="text-white">{exec.tokenUsage?.promptTokens || 0}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Completion Tokens:</span>
                    <span className="text-white">{exec.tokenUsage?.completionTokens || 0}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Threshold:</span>
                    <span className="text-emerald-400 font-bold">0.70</span>
                  </div>
                </div>

                {/* Step Timeline */}
                <div className="p-5 rounded-2xl bg-surface-200/80 border border-white/10 shadow-xl space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-white/10">
                    <Activity className="w-4 h-4 text-purple-400" />
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">Pipeline Steps</h4>
                  </div>
                  <ExecutionTimeline logs={logs} />
                </div>
              </div>
            </div>
          )}
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
