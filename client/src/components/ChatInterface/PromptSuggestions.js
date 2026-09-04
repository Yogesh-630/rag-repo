import React from 'react';
import { Sparkles } from 'lucide-react';
import { useChatStore } from '../../store/chatStore';

export default function PromptSuggestions() {
  const { promptSuggestions, sendQuery, isQuerying } = useChatStore();

  return (
    <div className="space-y-2 py-2">
      <div className="flex items-center gap-1.5 text-xs text-slate-400">
        <Sparkles className="w-3.5 h-3.5 text-brand-400" />
        <span>Frequently Inquired Topics:</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {promptSuggestions.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => sendQuery(prompt)}
            disabled={isQuerying}
            className="px-3 py-1.5 rounded-xl bg-surface-100/90 hover:bg-brand-600/20 text-slate-300 hover:text-white border border-white/10 hover:border-brand-500/40 text-xs font-medium transition-all text-left shadow-sm disabled:opacity-50"
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  );
}
