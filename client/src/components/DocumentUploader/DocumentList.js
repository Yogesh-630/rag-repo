import React from 'react';
import { FileText, CheckCircle2, RefreshCw, Trash2, Shield, AlertTriangle, Eye, Layers } from 'lucide-react';
import api from '../../services/api';

export default function DocumentList({ documents, onRefresh, userRole }) {
  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to purge "${title}" and all its vector embeddings from the index?`)) {
      return;
    }
    try {
      await api.delete(`/documents/${id}`);
      if (onRefresh) onRefresh();
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  const handleReindex = async (id) => {
    try {
      await api.post(`/documents/${id}/reindex`);
      if (onRefresh) onRefresh();
    } catch (err) {
      alert(err.response?.data?.message || 'Re-index failed');
    }
  };

  if (!documents || documents.length === 0) {
    return (
      <div className="p-8 rounded-2xl bg-surface-200/50 border border-white/10 text-center space-y-2">
        <FileText className="w-8 h-8 text-slate-500 mx-auto" />
        <p className="text-sm font-semibold text-slate-300">No institutional documents found</p>
        <p className="text-xs text-slate-500">Upload a PDF or text file to populate the vector search index.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-surface-200/70 border border-white/10 overflow-hidden shadow-xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-sans">
          <thead className="bg-surface-100/90 text-slate-400 font-mono uppercase tracking-wider text-[10px] border-b border-white/10">
            <tr>
              <th className="py-3 px-4">Document / File</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Department</th>
              <th className="py-3 px-4">Chunks</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {documents.map((doc) => {
              const isIndexed = doc.status === 'indexed';
              const isProcessing = doc.status === 'processing';
              const isFailed = doc.status === 'failed';

              return (
                <tr key={doc._id || doc.id} className="hover:bg-white/5 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-surface-100 border border-white/10 flex items-center justify-center text-cyan-400 shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-semibold text-white truncate max-w-xs">{doc.title}</h4>
                        <p className="text-[11px] text-slate-400 font-mono flex items-center gap-1.5">
                          <span>{doc.fileName}</span>
                          {doc.ocrApplied && (
                            <span className="px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 text-[9px] border border-purple-500/30">
                              OCR
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-1 rounded-lg bg-brand-500/10 text-brand-300 border border-brand-500/20 font-mono text-[11px]">
                      {doc.category || 'General'}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-slate-300 font-mono text-[11px]">
                    {doc.department || 'All'}
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1 font-mono text-slate-200">
                      <Layers className="w-3 h-3 text-cyan-400" />
                      <span>{doc.chunkCount || 0}</span>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    {isIndexed && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono text-[10px]">
                        <CheckCircle2 className="w-3 h-3" /> Indexed
                      </span>
                    )}
                    {isProcessing && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono text-[10px]">
                        <RefreshCw className="w-3 h-3 animate-spin" /> Ingesting
                      </span>
                    )}
                    {isFailed && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 font-mono text-[10px]">
                        <AlertTriangle className="w-3 h-3" /> Failed
                      </span>
                    )}
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleReindex(doc._id || doc.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                        title="Re-run chunking and vector embedding"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                      </button>

                      {userRole === 'admin' && (
                        <button
                          onClick={() => handleDelete(doc._id || doc.id, doc.title)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                          title="Purge document & embeddings"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
