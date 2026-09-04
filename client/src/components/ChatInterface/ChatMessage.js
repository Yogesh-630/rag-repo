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
    <div className={`flex gap-3.5 py-3 ${isUser ? 'justify-end' : 'justify-start'} animate-fade-in group`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-cyber-cyan flex items-center justify-center text-white shrink-0 shadow-glow-indigo mt-0.5 border border-white/20">
          <Sparkles className="w-4 h-4" />
        </div>
      )}

      <div className={`max-w-2xl space-y-2.5 ${isUser ? 'items-end' : 'items-start'}`}>
        {/* Message Bubble */}
        <div
          className={`p-4 rounded-2xl text-sm leading-relaxed ${
            isUser
              ? 'bg-gradient-to-r from-brand-600 to-indigo-600 text-white shadow-glow-indigo rounded-tr-sm ml-auto border border-white/15'
              : 'glass-card-premium text-slate-100 rounded-tl-sm shadow-xl'
          }`}
        >
          <div className="whitespace-pre-wrap font-sans leading-relaxed">{message.content}</div>
        </div>

        {/* Source Citations & Metadata (for assistant responses) */}
        {!isUser && (
          <div className="space-y-2">
            {/* Citations list */}
            {message.citations && message.citations.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[11px] font-mono text-slate-400 mr-1 flex items-center gap-1 font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5 text-cyber-cyan" />
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
                  <span
                    className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full border font-bold flex items-center gap-1 shadow-sm ${
                      scorePct >= 80
                        ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                        : scorePct >= 70
                        ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30'
                        : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                    }`}
                  >
                    <span>Confidence:</span>
                    <span>{scorePct}%</span>
                  </span>
                )}
                {message.executionId && (
                  <span className="text-[10px] font-mono text-slate-400">
                    ID: {message.executionId.slice(0, 8)}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                {/* Copy Button */}
                <button
                  onClick={handleCopy}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors border border-transparent hover:border-white/10"
                  title="Copy to clipboard"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>

                {/* Upvote Feedback */}
                <button
                  onClick={() => submitMessageFeedback(message.id, message.executionId, 'upvote')}
                  className={`p-1.5 rounded-lg transition-all ${
                    message.feedback === 'upvote'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-glow-emerald'
                      : 'text-slate-400 hover:text-emerald-400 hover:bg-white/10'
                  }`}
                  title="Helpful verified answer"
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                </button>

                {/* Downvote Feedback */}
                <button
                  onClick={() => submitMessageFeedback(message.id, message.executionId, 'downvote')}
                  className={`p-1.5 rounded-lg transition-all ${
                    message.feedback === 'downvote'
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 shadow-sm'
                      : 'text-slate-400 hover:text-rose-400 hover:bg-white/10'
                  }`}
                  title="Needs correction"
                >
                  <ThumbsDown className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {isUser && (
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shrink-0 shadow-sm mt-0.5 border border-white/20">
          <User className="w-4 h-4" />
        </div>
      )}
    </div>
  );
}
