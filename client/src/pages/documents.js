import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { Files, Filter, Search, RefreshCw, UploadCloud, Layers } from 'lucide-react';
import AppShell from '../components/AppShell/AppShell';
import ProtectedRoute from '../components/ProtectedRoute/ProtectedRoute';
import DocumentUploader from '../components/DocumentUploader/DocumentUploader';
import DocumentList from '../components/DocumentUploader/DocumentList';
import { useAuthStore } from '../store/authStore';
import api from '../services/api';

const CATEGORIES = ['All', 'Admissions', 'Fees', 'Exams', 'Hostel', 'Placements', 'Curriculum', 'Scholarships', 'General'];

export default function DocumentsPage() {
  const { user } = useAuthStore();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showUploader, setShowUploader] = useState(false);

  const fetchDocs = async () => {
    try {
      setLoading(true);
      const res = await api.get('/documents', {
        params: {
          category: selectedCategory !== 'All' ? selectedCategory : undefined,
          search: searchQuery.trim() || undefined,
        },
      });
      setDocuments(res.data.documents || []);
    } catch (err) {
      console.warn('Could not fetch documents:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, [selectedCategory, searchQuery]);

  return (
    <ProtectedRoute>
      <Head>
        <title>Knowledge Base - CollegeRAG_AI</title>
      </Head>
      <AppShell title="Knowledge Base Documents" subtitle="Institutional PDF & Text Resource Management">
        <div className="space-y-6 animate-fade-in">
          {/* Header Actions */}
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">Institutional Document Repository</h3>
              <p className="text-xs text-slate-400 font-mono">
                {documents.length} verified documents actively chunked and indexed into 1536-dim vector space
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={fetchDocs}
                disabled={loading}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-surface-100 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-xs font-mono transition-all"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>

              {user?.role === 'admin' && (
                <button
                  onClick={() => setShowUploader(!showUploader)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-glow-indigo transition-all"
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>{showUploader ? 'Hide Uploader' : 'Upload New Document'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Conditional Uploader */}
          {showUploader && user?.role === 'admin' && (
            <div className="animate-slide-up">
              <DocumentUploader
                onUploadComplete={() => {
                  fetchDocs();
                  setShowUploader(false);
                }}
              />
            </div>
          )}

          {/* Search and Category Filter Bar */}
          <div className="p-4 rounded-2xl bg-surface-200/60 border border-white/10 flex items-center justify-between gap-4 flex-wrap">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search documents by title or filename..."
                className="w-full pl-10 pr-4 py-2 bg-surface-100 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500/50"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto py-1">
              <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all shrink-0 ${
                    selectedCategory === cat
                      ? 'bg-brand-600 text-white shadow-glow-indigo'
                      : 'bg-white/5 text-slate-400 hover:text-slate-200 hover:bg-white/10 border border-white/5'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Document Table */}
          <DocumentList
            documents={documents}
            onRefresh={fetchDocs}
            userRole={user?.role}
          />
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
