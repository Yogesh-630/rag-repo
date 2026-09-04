import React, { useState } from 'react';
import { ThumbsUp, ThumbsDown, Copy, Check, Sparkles, User, ShieldCheck } from 'lucide-react';
import SourceCitationBadge from '../SourceCitationBadge/SourceCitationBadge';
import { useChatStore } from '../../store/chatStore';

export default function ChatMessage({ message }) {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);
  const { submitMessageFeedback } = useChatStore();

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const scorePct = message.score ? Math.round(message.score * 100) : null;

  return (
    <div className={`flex gap-3.5 py-4 ${isUser ? 'justify-end' : 'justify-start'} animate-fade-in`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 to-cyan-500 flex items-center justify-center text-white shrink-0 shadow-glow-indigo mt-0.5">
          <Sparkles className="w-4 h-4" />
        </div>
      )}

      <div className={`max-w-2xl space-y-2.5 ${isUser ? 'items-end' : 'items-start'}`}>
        {/* Message Bubble */}
        <div
          className={`p-4 rounded-2xl text-sm leading-relaxed ${
            isUser
              ? 'bg-brand-600 text-white shadow-glow-indigo rounded-tr-sm ml-auto'
              : 'bg-surface-100/90 text-slate-100 border border-white/10 rounded-tl-sm shadow-md'
          }`}
        >
          <div className="whitespace-pre-wrap font-sans">{message.content}</div>
        </div>

        {/* Source Citations & Metadata (for assistant responses) */}
        {!isUser && (
          <div className="space-y-2">
            {/* Citations list */}
            {message.citations && message.citations.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[11px] font-mono text-slate-400 mr-1 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                  Sources:
                </span>
                {message.citations.map((citation, idx) => (
                  <SourceCitationBadge key={idx} citation={citation} index={idx} />
                ))}
              </div>
            )}

            {/* Bottom Actions Bar */}
            <div className="flex items-center justify-between pt-1 text-xs text-slate-400 px-1">
              <div className="flex items-center gap-2">
                {scorePct !== null && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface-200 border border-white/10 text-slate-300">
                    Confidence: <span className="font-bold text-emerald-400">{scorePct}%</span>
                  </span>
                )}
                {message.executionId && (
                  <span className="text-[10px] font-mono text-slate-400">
                    ID: {message.executionId.slice(0, 8)}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1">
                {/* Copy Button */}
                <button
                  onClick={handleCopy}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                  title="Copy to clipboard"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>

                {/* Upvote Feedback */}
                <button
                  onClick={() => submitMessageFeedback(message.id, message.executionId, 'upvote')}
                  className={`p-1.5 rounded-lg transition-colors ${
                    message.feedback === 'upvote'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'text-slate-400 hover:text-emerald-400 hover:bg-white/10'
                  }`}
                  title="Helpful verified answer"
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                </button>

                {/* Downvote Feedback */}
                <button
                  onClick={() => submitMessageFeedback(message.id, message.executionId, 'downvote')}
                  className={`p-1.5 rounded-lg transition-colors ${
                    message.feedback === 'downvote'
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      : 'text-slate-400 hover:text-rose-400 hover:bg-white/10'
                  }`}
                  title="Inaccurate or incomplete"
                >
                  <ThumbsDown className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {isUser && (
        <div className="w-8 h-8 rounded-xl bg-surface-100 border border-white/10 flex items-center justify-center text-slate-300 shrink-0 mt-0.5">
          <User className="w-4 h-4" />
        </div>
      )}
    </div>
  );
}
