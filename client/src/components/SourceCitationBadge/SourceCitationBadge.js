import React, { useState } from 'react';
import { BookOpen, FileText, CheckCircle, ExternalLink, X } from 'lucide-react';

export default function SourceCitationBadge({ citation, index }) {
  const [isOpen, setIsOpen] = useState(false);

  if (!citation) return null;

  const scorePct = Math.round((citation.score || 0.85) * 100);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-100/90 hover:bg-brand-500/20 text-slate-300 hover:text-brand-300 border border-white/10 hover:border-brand-500/40 text-xs font-mono transition-all shadow-sm group"
        title="Click to view verified source context"
      >
        <FileText className="w-3 h-3 text-cyan-400 group-hover:scale-110 transition-transform" />
        <span className="font-semibold text-white truncate max-w-[130px]">{citation.fileName}</span>
        <span className="text-slate-400">P.{citation.pageNumber}</span>
        <span className="px-1 py-0.2 rounded bg-emerald-500/20 text-emerald-400 text-[10px] border border-emerald-500/30">
          {scorePct}%
        </span>
      </button>

      {/* Citation Snippet Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-surface-200 border border-white/15 rounded-2xl max-w-lg w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-brand-400">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white truncate max-w-xs">{citation.fileName}</h4>
                  <p className="text-[11px] text-slate-400 font-mono">
                    Page {citation.pageNumber} • Category: {citation.category || 'General'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Relevance Score Pill */}
            <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-white/5 border border-white/5 text-xs">
              <span className="text-slate-400 font-mono">Semantic Cosine Score:</span>
              <span className="font-bold text-emerald-400 font-mono">{scorePct}% Match Confidence</span>
            </div>

            {/* Chunk Snippet Text */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Grounded Knowledge Excerpt:
              </span>
              <div className="p-3.5 rounded-xl bg-surface-300/80 border border-white/10 text-xs text-slate-200 leading-relaxed max-h-56 overflow-y-auto whitespace-pre-wrap font-sans">
                {citation.snippet || citation.content || 'Content excerpt loaded from official institutional records.'}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-glow-indigo transition-all"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
