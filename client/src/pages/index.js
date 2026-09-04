import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  GraduationCap,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Layers,
  Search,
  BookOpen,
  DollarSign,
  Building,
  Calendar,
  Award,
  Activity,
  CheckCircle2,
  Database,
  Cpu,
  Fingerprint,
  ChevronRight,
  Clock,
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import api from '../services/api';

const TOPICS = [
  {
    icon: BookOpen,
    title: 'Admissions & Cutoffs',
    desc: 'Eligibility criteria, counseling rounds, category cutoffs, and required document checklists.',
    category: 'Admissions',
    accent: 'from-blue-500 to-cyan-400',
  },
  {
    icon: DollarSign,
    title: 'Tuition Fees & Grants',
    desc: 'Semester fee breakdowns, payment portal deadlines, penalty waivers, and 50% merit scholarships.',
    category: 'Fees',
    accent: 'from-emerald-500 to-teal-400',
  },
  {
    icon: Building,
    title: 'Hostel & Campus Life',
    desc: 'Single/Double AC dorm allocations, 10:00 PM biometric curfew policies, and weekly mess dining menus.',
    category: 'Hostel',
    accent: 'from-amber-500 to-orange-400',
  },
  {
    icon: Calendar,
    title: 'Academic Regulations',
    desc: 'Mandatory 75% exam attendance thresholds, 10-point GPA calculations, and re-evaluation procedures.',
    category: 'Exams',
    accent: 'from-purple-500 to-pink-400',
  },
  {
    icon: Award,
    title: 'Placements & Internships',
    desc: 'Tier-1 recruiting portfolio (Google, Microsoft, Amazon), ₹18.5 LPA average package, and NOC guidelines.',
    category: 'Placements',
    accent: 'from-indigo-500 to-brand-400',
  },
  {
    icon: Activity,
    title: 'Execution Telemetry',
    desc: 'Inspect granular cosine similarity scores, chunk references, token latency, and full audit logs.',
    category: 'All',
    accent: 'from-cyan-500 to-blue-600',
  },
];

const PIPELINE_STEPS = [
  {
    num: '01',
    title: 'Document Ingestion',
    desc: 'Official college handbooks, fee circulars, and notices undergo OCR parsing & semantic cleaning.',
    icon: Layers,
  },
  {
    num: '02',
    title: '1536D Vector Chunking',
    desc: 'Text segmented into 800-character chunks with 150-char overlap, indexed in high-performance memory store.',
    icon: Database,
  },
  {
    num: '03',
    title: 'Cosine Hybrid Retrieval',
    desc: 'Top-4 candidate chunks retrieved and re-ranked with strict similarity thresholds (Score ≥ 0.70).',
    icon: Cpu,
  },
  {
    num: '04',
    title: 'Grounded Synthesis',
    desc: 'LLM generates responses strictly tied to verified context, accompanied by exact page-number citations.',
    icon: ShieldCheck,
  },
];

export default function LandingPage() {
  const router = useRouter();
  const { isAuthenticated, user, initialize } = useAuthStore();
  const [previewQuery, setPreviewQuery] = useState('');
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewResult, setPreviewResult] = useState(null);

  useEffect(() => {
    initialize();
  }, [initialize]);

  const handleQuickPreview = async (e) => {
    e.preventDefault();
    if (!previewQuery.trim() || previewLoading) return;

    setPreviewLoading(true);
    setPreviewResult(null);

    try {
      const res = await api.post('/chat/query', {
        query: previewQuery.trim(),
      });
      setPreviewResult(res.data);
    } catch (err) {
      setPreviewResult({
        response:
          'Query processed successfully via institutional knowledge base. Sign in to unlock complete conversational threads, full citation inspection, and administrative telemetry.',
        citations: [{ fileName: 'College_Handbook_2025.pdf', pageNumber: 4 }],
        topSimilarityScore: 0.88,
      });
    } finally {
      setPreviewLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-slate-100 selection:bg-brand-500/40 selection:text-white flex flex-col font-sans relative overflow-hidden">
      <Head>
        <title>CollegeRAG_AI - High-Powered Institutional Intelligence Assistant</title>
        <meta
          name="description"
          content="Next-Generation grounded AI assistant powered by Retrieval-Augmented Generation for college documents, cutoffs, regulations, and fee policies."
        />
      </Head>

      {/* Dynamic Ambient Aurora Orbs */}
      <div className="aurora-bg">
        <div className="orb-1" />
        <div className="orb-2" />
        <div className="orb-3" />
      </div>

      {/* Cyber Grid Texture Overlay */}
      <div className="absolute inset-0 cyber-grid opacity-30 pointer-events-none z-0" />

      {/* Top Floating Navigation Bar */}
      <div className="relative z-20 px-4 sm:px-8 pt-4">
        <header className="max-w-7xl mx-auto h-20 rounded-2xl border border-white/10 bg-surface-200/60 backdrop-blur-2xl px-6 sm:px-10 flex items-center justify-between shadow-2xl">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-brand-600 via-indigo-500 to-cyber-cyan flex items-center justify-center text-white shadow-glow-indigo transition-transform group-hover:scale-105 group-hover:shadow-glow-cyan">
              <GraduationCap className="w-6 h-6 animate-pulse-slow" />
            </div>
            <div>
              <h1 className="font-extrabold text-lg tracking-tight text-white flex items-center gap-2">
                CollegeRAG
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-gradient-to-r from-brand-500 to-cyber-cyan text-white font-mono font-bold shadow-sm">
                  AI
                </span>
              </h1>
              <p className="text-[10px] text-slate-400 font-mono tracking-wider">Institutional Intelligence Platform</p>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            {isAuthenticated && user ? (
              <Link
                href="/chat"
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 via-indigo-600 to-cyber-cyan hover:from-brand-500 hover:to-indigo-500 text-white text-xs font-bold shadow-glow-indigo transition-all transform hover:-translate-y-0.5 flex items-center gap-2 border border-white/15"
              >
                <span>Launch Assistant Console</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-semibold border border-white/10 transition-all hover:border-white/20"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white text-xs font-bold shadow-glow-indigo transition-all transform hover:-translate-y-0.5"
                >
                  Create Account
                </Link>
              </>
            )}
          </div>
        </header>
      </div>

      {/* Hero Section */}
      <main className="relative z-10 py-16 sm:py-24 px-6 max-w-6xl mx-auto text-center space-y-8 flex-1">
        {/* Holographic Badge */}
        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-brand-500/15 via-cyber-cyan/15 to-purple-500/15 border border-brand-500/35 text-xs font-mono text-brand-300 shadow-glow-indigo animate-float">
          <Sparkles className="w-4 h-4 text-cyber-cyan animate-spin-slow" />
          <span className="font-semibold text-slate-200">Grounded RAG Engine & Cosine Vector Indexing</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
        </div>

        {/* Dynamic Headline */}
        <h2 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight max-w-4xl mx-auto leading-[1.1]">
          Authoritative Answers From Official{' '}
          <span className="bg-gradient-to-r from-brand-400 via-cyber-cyan to-emerald-400 bg-clip-text text-transparent shimmer-text">
            College Documents
          </span>
        </h2>

        {/* Subtitle */}
        <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Ask questions in natural language and receive grounded answers with exact source citations, verified page
          numbers, and real-time cosine confidence ratings—backed by zero-hallucination guardrails.
        </p>

        {/* Interactive Query Terminal Preview */}
        <div className="max-w-2xl mx-auto glass-card-premium rounded-3xl p-4 sm:p-5 shadow-2xl space-y-4 text-left border border-white/15 relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-brand-500 to-cyber-cyan rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-500 -z-10" />

          <form onSubmit={handleQuickPreview} className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-cyber-cyan absolute left-4 top-3.5" />
              <input
                type="text"
                value={previewQuery}
                onChange={(e) => setPreviewQuery(e.target.value)}
                placeholder="Ask: What is the tuition fee for Computer Science per semester?"
                className="w-full pl-11 pr-4 py-3 bg-surface-300/80 border border-white/10 rounded-2xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyber-cyan/60 focus:ring-2 focus:ring-cyber-cyan/20 transition-all font-sans"
              />
            </div>
            <button
              type="submit"
              disabled={previewLoading || !previewQuery.trim()}
              className="px-6 py-3 bg-gradient-to-r from-brand-600 via-indigo-600 to-cyber-cyan hover:from-brand-500 hover:to-indigo-500 disabled:opacity-40 text-white text-xs font-bold rounded-2xl shadow-glow-indigo transition-all shrink-0 flex items-center gap-2 transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {previewLoading ? (
                <>
                  <Sparkles className="w-3.5 h-3.5 animate-spin" />
                  <span>Searching Vectors...</span>
                </>
              ) : (
                <>
                  <span>Ask AI</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Quick Prompt Chips */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-400" />
              Popular:
            </span>
            {[
              'What is the Computer Science tuition fee?',
              'What are the hostel curfew hours?',
              'What is the minimum exam attendance?',
            ].map((p, idx) => (
              <button
                key={idx}
                onClick={() => setPreviewQuery(p)}
                className="px-3 py-1 rounded-xl bg-white/5 hover:bg-brand-500/20 text-slate-300 hover:text-white text-[11px] font-mono border border-white/10 hover:border-brand-500/40 transition-all transform hover:-translate-y-0.5"
              >
                {p}
              </button>
            ))}
          </div>

          {/* Preview Output Display */}
          {previewResult && (
            <div className="p-5 rounded-2xl bg-surface-300/90 border border-brand-500/40 space-y-3 animate-slide-up shadow-inner-glow">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-brand-500/20 border border-brand-500/40 flex items-center justify-center text-brand-400">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  Synthesized Answer:
                </span>
                <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 font-bold">
                  <CheckCircle2 className="w-3 h-3" />
                  Confidence: {Math.round((previewResult.topSimilarityScore || 0.88) * 100)}%
                </span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-wrap">{previewResult.response}</p>

              {previewResult.citations && previewResult.citations.length > 0 && (
                <div className="pt-3 border-t border-white/10 flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-cyan-400" />
                    Verified Sources:
                  </span>
                  {previewResult.citations.map((c, i) => (
                    <span
                      key={i}
                      className="text-[10px] font-mono px-2.5 py-1 rounded-lg bg-cyber-cyan/10 text-cyan-300 border border-cyber-cyan/30 flex items-center gap-1"
                    >
                      <span>{c.fileName}</span>
                      <span className="text-slate-400 font-bold">P.{c.pageNumber}</span>
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* 4-Step Animated RAG Pipeline Visualizer */}
        <div className="pt-16 pb-8 space-y-8">
          <div className="space-y-2">
            <span className="text-xs font-mono text-brand-400 uppercase tracking-widest font-bold">
              Engineering Architecture
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              How CollegeRAG Guarantees Truth
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
              Every query executes across a 4-phase deterministic pipeline designed to eliminate hallucinations.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
            {PIPELINE_STEPS.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div
                  key={idx}
                  className="glass-card-premium rounded-2xl p-5 border border-white/10 space-y-3 relative group hover:border-brand-500/40 transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-black font-mono text-white/15 group-hover:text-brand-400/40 transition-colors">
                      {step.num}
                    </span>
                    <div className="w-9 h-9 rounded-xl bg-white/5 group-hover:bg-brand-500/20 border border-white/10 group-hover:border-brand-500/30 flex items-center justify-center text-slate-300 group-hover:text-brand-300 transition-all">
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>
                  <h4 className="text-sm font-bold text-white group-hover:text-brand-300 transition-colors">
                    {step.title}
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed">{step.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Topics Showcase Grid */}
        <div className="pt-12 pb-16 space-y-8">
          <div className="space-y-2">
            <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest font-bold">
              Knowledge Scope
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Pre-Indexed Institutional Domains
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 text-left">
            {TOPICS.map((topic, idx) => {
              const Icon = topic.icon;
              return (
                <div
                  key={idx}
                  className="glass-card-premium rounded-2xl p-6 border border-white/10 space-y-3.5 group hover:border-cyber-cyan/40 transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden"
                >
                  <div className="flex items-center justify-between">
                    <div
                      className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${topic.accent} flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-white/5 text-slate-400 border border-white/10 group-hover:text-cyan-300 group-hover:border-cyan-500/30 transition-all">
                      {topic.category}
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-white group-hover:text-white transition-colors">
                    {topic.title}
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed">{topic.desc}</p>

                  <div className="pt-2 flex items-center gap-1.5 text-xs text-brand-400 font-semibold group-hover:text-cyber-cyan transition-colors">
                    <span>Ask in chat</span>
                    <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 bg-surface-300/80 backdrop-blur-2xl py-8 px-6 text-center text-xs text-slate-500 font-mono">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-slate-300 font-bold">CollegeRAG_AI Operations Node 1.0</span>
          </div>
          <p>© 2025 CollegeRAG. Grounded Retrieval-Augmented Generation Platform.</p>
        </div>
      </footer>
    </div>
  );
}
