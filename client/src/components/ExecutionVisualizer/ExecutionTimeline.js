import React from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, Sparkles, Filter, Search, FileInput } from 'lucide-react';

const stepConfig = {
  ingestion: { label: 'Query Ingestion', icon: FileInput, color: 'text-blue-400 bg-blue-500/10 border-blue-500/30' },
  retrieval: { label: 'Vector Retrieval', icon: Search, color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30' },
  rerank: { label: 'Score & Rerank', icon: Filter, color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' },
  synthesis: { label: 'Grounded Synthesis', icon: Sparkles, color: 'text-purple-400 bg-purple-500/10 border-purple-500/30' },
  general: { label: 'Pipeline Step', icon: Info, color: 'text-slate-400 bg-slate-500/10 border-slate-500/30' },
};

export default function ExecutionTimeline({ logs = [] }) {
  if (!logs || logs.length === 0) {
    return (
      <div className="p-4 rounded-xl bg-surface-100/40 border border-white/5 text-center text-xs text-slate-400">
        No execution telemetry steps recorded for this inquiry.
      </div>
    );
  }

  const getLevelBadge = (level) => {
    switch (level) {
      case 'success':
        return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />;
      case 'warning':
        return <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />;
      case 'error':
        return <AlertCircle className="w-3.5 h-3.5 text-rose-400" />;
      default:
        return <Info className="w-3.5 h-3.5 text-cyan-400" />;
    }
  };

  return (
    <div className="space-y-3 font-sans">
      <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-white/10">
        {logs.map((log, index) => {
          const config = stepConfig[log.step] || stepConfig.general;
          const StepIcon = config.icon;
          const time = log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : '';

          return (
            <div key={log._id || index} className="relative group">
              {/* Step indicator node */}
              <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-surface-200 border border-white/20 flex items-center justify-center shadow-sm">
                {getLevelBadge(log.level)}
              </div>

              {/* Step body */}
              <div className="p-3 rounded-xl bg-surface-100/90 border border-white/10 space-y-1.5 hover:border-brand-500/30 transition-all">
                <div className="flex items-center justify-between">
                  <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[11px] font-mono border ${config.color}`}>
                    <StepIcon className="w-3 h-3" />
                    <span>{config.label}</span>
                  </span>
                  {time && <span className="text-[10px] font-mono text-slate-400">{time}</span>}
                </div>

                <p className="text-xs text-slate-200 leading-relaxed font-sans">{log.message}</p>

                {log.metadata && Object.keys(log.metadata).length > 0 && (
                  <pre className="text-[11px] font-mono text-slate-400 bg-surface-300/80 p-2 rounded-lg overflow-x-auto border border-white/5 mt-1">
                    {JSON.stringify(log.metadata, null, 2)}
                  </pre>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
