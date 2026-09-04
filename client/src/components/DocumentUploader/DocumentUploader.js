import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, CheckCircle2, AlertCircle, RefreshCw, X } from 'lucide-react';
import api from '../../services/api';
import { getSocket } from '../../services/socket';

const CATEGORIES = ['Admissions', 'Fees', 'Exams', 'Hostel', 'Placements', 'Curriculum', 'Scholarships', 'General'];

export default function DocumentUploader({ onUploadComplete }) {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('General');
  const [department, setDepartment] = useState('All');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      selectFile(e.dataTransfer.files[0]);
    }
  };

  const selectFile = (f) => {
    const ext = f.name.split('.').pop().toLowerCase();
    if (!['pdf', 'docx', 'txt'].includes(ext)) {
      setError('Only .pdf, .docx, and .txt files are supported.');
      return;
    }
    setError(null);
    setFile(f);
    if (!title) {
      setTitle(f.name.replace(/\.[^/.]+$/, ''));
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    setProgress(15);
    setStatusMessage('Uploading document payload to secure storage...');
    setError(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title || file.name);
    formData.append('category', category);
    formData.append('department', department);

    // Listen to real-time socket progress
    const socket = getSocket();
    const handleProgress = (data) => {
      setProgress(data.percentage || 50);
      setStatusMessage(data.message || 'Processing...');
    };

    if (socket) {
      socket.on('doc_progress', handleProgress);
    }

    try {
      const res = await api.post('/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setProgress(100);
      setStatusMessage('Ingestion and vector indexing completed!');
      setTimeout(() => {
        setFile(null);
        setTitle('');
        setUploading(false);
        setProgress(0);
        setStatusMessage('');
        if (onUploadComplete) onUploadComplete();
      }, 1200);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Upload failed');
      setUploading(false);
    } finally {
      if (socket) {
        socket.off('doc_progress', handleProgress);
      }
    }
  };

  return (
    <div className="p-6 rounded-2xl bg-surface-200/80 border border-white/10 shadow-xl space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div>
          <h3 className="text-sm font-bold text-white tracking-tight">Upload Institutional Document</h3>
          <p className="text-xs text-slate-400 font-mono">Ingest PDFs, Handbooks, Notices, or Word files into RAG Index</p>
        </div>
      </div>

      <form onSubmit={handleUpload} className="space-y-4">
        {/* Drag & Drop Surface */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`p-6 rounded-xl border-2 border-dashed transition-all text-center cursor-pointer flex flex-col items-center justify-center gap-2 ${
            dragActive
              ? 'border-brand-500 bg-brand-500/10'
              : 'border-white/15 hover:border-brand-500/50 bg-surface-100/50 hover:bg-surface-100'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,.txt"
            onChange={(e) => e.target.files?.[0] && selectFile(e.target.files[0])}
            className="hidden"
          />

          <div className="w-10 h-10 rounded-xl bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-brand-400">
            <UploadCloud className="w-5 h-5" />
          </div>

          {file ? (
            <div className="space-y-1">
              <span className="text-xs font-semibold text-white truncate max-w-sm block">{file.name}</span>
              <span className="text-[10px] font-mono text-cyan-400">{(file.size / 1024).toFixed(1)} KB ready for indexing</span>
            </div>
          ) : (
            <div className="space-y-1">
              <p className="text-xs font-medium text-slate-300">
                Drag and drop your file here, or <span className="text-brand-400 underline">browse</span>
              </p>
              <p className="text-[11px] text-slate-500 font-mono">Supported formats: PDF (with OCR), DOCX, TXT (Max 25MB)</p>
            </div>
          )}
        </div>

        {/* Metadata Inputs */}
        {file && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 animate-fade-in">
            <div>
              <label className="text-[11px] font-mono text-slate-400 block mb-1">Document Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Admissions Handbook 2025"
                className="w-full px-3 py-2 bg-surface-100 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-brand-500/50"
              />
            </div>

            <div>
              <label className="text-[11px] font-mono text-slate-400 block mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 bg-surface-100 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-brand-500/50"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c} className="bg-surface-200">
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-mono text-slate-400 block mb-1">Department Scope</label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="All / Computer Science / Finance"
                className="w-full px-3 py-2 bg-surface-100 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-brand-500/50"
              />
            </div>
          </div>
        )}

        {/* Progress Bar & Status */}
        {uploading && (
          <div className="space-y-1.5 animate-fade-in">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-cyan-400 flex items-center gap-1.5">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                {statusMessage || 'Processing pipeline...'}
              </span>
              <span className="text-white font-bold">{progress}%</span>
            </div>
            <div className="w-full bg-surface-100 rounded-full h-2 overflow-hidden border border-white/5">
              <div
                className="bg-gradient-to-r from-brand-500 to-cyan-400 h-full transition-all duration-300 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex justify-end gap-2">
          {file && !uploading && (
            <button
              type="button"
              onClick={() => setFile(null)}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-400 text-xs rounded-xl transition-colors"
            >
              Cancel
            </button>
          )}

          <button
            type="submit"
            disabled={!file || uploading}
            className="px-5 py-2.5 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-xl shadow-glow-indigo transition-all flex items-center gap-1.5"
          >
            {uploading ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Ingesting Chunks...</span>
              </>
            ) : (
              <>
                <UploadCloud className="w-4 h-4" />
                <span>Upload & Chunk Document</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
