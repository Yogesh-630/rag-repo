import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Filter, Activity, RefreshCw, MessageSquarePlus, ChevronDown } from 'lucide-react';
import ChatMessage from './ChatMessage';
import PromptSuggestions from './PromptSuggestions';
import VoiceInputButton from './VoiceInputButton';
import ExecutionTimeline from '../ExecutionVisualizer/ExecutionTimeline';
import { useChatStore } from '../../store/chatStore';

const CATEGORIES = ['All', 'Admissions', 'Fees', 'Exams', 'Hostel', 'Placements'];

export default function ChatInterface() {
  const [inputQuery, setInputQuery] = useState('');
  const [showTelemetry, setShowTelemetry] = useState(false);
  const messagesEndRef = useRef(null);

  const {
    messages,
    isQuerying,
    streamingMessage,
    activeExecutionLogs,
    selectedCategory,
    setCategory,
    sendQuery,
    startNewChat,
  } = useChatStore();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingMessage]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputQuery.trim() || isQuerying) return;
    const q = inputQuery;
    setInputQuery('');
    sendQuery(q);
  };

  const handleVoiceTranscript = (text) => {
    setInputQuery(text);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] bg-surface-200/50 rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
      {/* Top Bar: Category Filters & New Chat Button */}
      <div className="px-5 py-3 border-b border-white/10 bg-surface-100/60 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 overflow-x-auto py-1">
          <span className="text-xs font-mono text-slate-400 flex items-center gap-1 shrink-0">
            <Filter className="w-3.5 h-3.5 text-brand-400" />
            Topic:
          </span>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all shrink-0 ${
                selectedCategory === cat
                  ? 'bg-brand-600 text-white shadow-glow-indigo'
                  : 'bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 border border-white/5'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {/* Toggle Live Telemetry */}
          <button
            onClick={() => setShowTelemetry(!showTelemetry)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono border transition-all ${
              showTelemetry
                ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                : 'bg-surface-100 text-slate-400 border-white/10 hover:text-slate-200'
            }`}
            title="Inspect RAG Execution Telemetry"
          >
            <Activity className="w-3.5 h-3.5 text-purple-400" />
            <span>Telemetry ({activeExecutionLogs.length})</span>
          </button>

          {/* New Chat Button */}
          <button
            onClick={startNewChat}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-surface-100 hover:bg-brand-600/20 text-slate-300 hover:text-brand-300 border border-white/10 hover:border-brand-500/30 text-xs font-medium transition-all"
          >
            <MessageSquarePlus className="w-3.5 h-3.5" />
            <span>New Chat</span>
          </button>
        </div>
      </div>

      {/* Main Canvas Area: Chat + Optional Side Telemetry Drawer */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* Messages Feed */}
        <div className="flex-1 overflow-y-auto p-5 space-y-2">
          {messages.length === 0 && !streamingMessage ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4 max-w-xl mx-auto">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-600 to-cyan-500 flex items-center justify-center text-white shadow-glow-indigo animate-bounce">
                <Sparkles className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white tracking-tight">
                  Institutional Knowledge Assistant
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Query official handbooks, admissions guidelines, hostel rules, exam policies, and placement records strictly grounded with citations.
                </p>
              </div>

              <PromptSuggestions />
            </div>
          ) : (
            <>
              {messages.map((msg, index) => (
                <ChatMessage key={msg.id || index} message={msg} />
              ))}

              {/* Streaming Bubble */}
              {isQuerying && (
                <div className="flex gap-3.5 py-4 justify-start animate-fade-in">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 to-cyan-500 flex items-center justify-center text-white shrink-0 shadow-glow-indigo animate-pulse mt-0.5">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div className="max-w-2xl space-y-2">
                    <div className="p-4 rounded-2xl bg-surface-100/90 text-slate-100 border border-brand-500/30 rounded-tl-sm shadow-md">
                      {streamingMessage ? (
                        <div className="whitespace-pre-wrap font-sans text-sm">{streamingMessage}</div>
                      ) : (
                        <div className="flex items-center gap-2 text-xs font-mono text-slate-400 py-1">
                          <RefreshCw className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
                          <span>Searching vector index and verifying source documents...</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Live Execution Telemetry Side Panel (Collapsible) */}
        {showTelemetry && (
          <div className="w-80 border-l border-white/10 bg-surface-300/60 p-4 overflow-y-auto animate-fade-in hidden md:block">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-purple-400" />
                Live Execution Logs
              </h4>
              <span className="text-[10px] font-mono text-emerald-400">Streaming</span>
            </div>
            <ExecutionTimeline logs={activeExecutionLogs} />
          </div>
        )}
      </div>

      {/* Query Input Bar */}
      <div className="p-4 border-t border-white/10 bg-surface-100/80">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder={`Ask any college-related question regarding ${selectedCategory === 'All' ? 'official policies, fees, hostel, exams...' : selectedCategory + '...'}`}
              disabled={isQuerying}
              className="w-full pl-4 pr-12 py-3 bg-surface-200 border border-white/10 focus:border-brand-500/60 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 shadow-inner"
            />
          </div>

          <VoiceInputButton onTranscript={handleVoiceTranscript} />

          <button
            type="submit"
            disabled={!inputQuery.trim() || isQuerying}
            className="p-3 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl shadow-glow-indigo transition-all shrink-0 font-medium"
            title="Send query"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
