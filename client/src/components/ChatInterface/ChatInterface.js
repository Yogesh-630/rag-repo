import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Filter, Activity, RefreshCw, MessageSquarePlus, ChevronDown, Zap, Terminal } from 'lucide-react';
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
    <div className="flex flex-col h-[calc(100vh-8rem)] glass-card-premium rounded-3xl border border-white/10 overflow-hidden shadow-2xl relative">
      {/* Top Bar: Topic Filter Pills & Controls */}
      <div className="px-5 py-3 border-b border-white/10 bg-surface-300/80 backdrop-blur-xl flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 overflow-x-auto py-1">
          <span className="text-xs font-mono text-slate-400 flex items-center gap-1.5 shrink-0 font-semibold">
            <Filter className="w-3.5 h-3.5 text-cyber-cyan" />
            Topic:
          </span>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                selectedCategory === cat
                  ? 'bg-gradient-to-r from-brand-600 to-cyber-cyan text-white shadow-glow-indigo border border-white/20'
                  : 'bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 border border-white/10 hover:border-white/20'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2.5">
          {/* Toggle Live Telemetry */}
          <button
            onClick={() => setShowTelemetry(!showTelemetry)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono border transition-all ${
              showTelemetry
                ? 'bg-purple-500/25 text-purple-300 border-purple-500/50 shadow-glow-purple'
                : 'bg-surface-100/90 text-slate-400 border-white/10 hover:text-white hover:border-white/20'
            }`}
            title="Inspect RAG Execution Telemetry"
          >
            <Activity className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
            <span>Telemetry ({activeExecutionLogs.length})</span>
          </button>

          {/* New Chat Button */}
          <button
            onClick={startNewChat}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-100/90 hover:bg-brand-600/20 text-slate-300 hover:text-white border border-white/10 hover:border-brand-500/40 text-xs font-semibold transition-all shadow-sm"
          >
            <MessageSquarePlus className="w-3.5 h-3.5 text-brand-400" />
            <span>New Chat</span>
          </button>
        </div>
      </div>

      {/* Main Canvas Area: Chat + Optional Side Telemetry Drawer */}
      <div className="flex-1 flex min-h-0 overflow-hidden relative">
        {/* Messages Feed */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {messages.length === 0 && !streamingMessage ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-5 max-w-xl mx-auto animate-fade-in">
              <div className="relative">
                <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-brand-600 via-indigo-500 to-cyber-cyan flex items-center justify-center text-white shadow-glow-indigo animate-float border border-white/20">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
              </div>

              <div className="space-y-1.5">
                <h3 className="text-xl font-extrabold text-white tracking-tight">
                  Institutional Knowledge Assistant
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed max-w-md">
                  Query official handbooks, admissions guidelines, hostel rules, exam policies, and placement records strictly grounded with verified page citations.
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
                  <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-cyber-cyan flex items-center justify-center text-white shrink-0 shadow-glow-indigo animate-pulse mt-0.5 border border-white/20">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div className="max-w-2xl space-y-2">
                    <div className="p-4 rounded-2xl bg-surface-200/90 text-slate-100 border border-brand-500/40 rounded-tl-sm shadow-xl backdrop-blur-xl relative overflow-hidden">
                      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-brand-500 via-cyber-cyan to-emerald-400 animate-shimmer" />
                      {streamingMessage ? (
                        <div className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                          {streamingMessage}
                          <span className="inline-block w-2 h-4 ml-1 bg-cyber-cyan animate-pulse align-middle" />
                        </div>
                      ) : (
                        <div className="flex items-center gap-2.5 text-xs font-mono text-slate-300 py-1">
                          <RefreshCw className="w-4 h-4 text-cyber-cyan animate-spin" />
                          <span>Searching vector index & verifying source documents...</span>
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

        {/* Live Execution Telemetry Side Panel */}
        {showTelemetry && (
          <div className="w-80 border-l border-white/10 bg-surface-300/80 backdrop-blur-2xl p-4 overflow-y-auto animate-slide-up hidden md:block">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
              <h4 className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-1.5 font-mono">
                <Activity className="w-4 h-4 text-purple-400" />
                Live Execution Logs
              </h4>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Streaming
              </span>
            </div>
            <ExecutionTimeline logs={activeExecutionLogs} />
          </div>
        )}
      </div>

      {/* Query Input Bar */}
      <div className="p-4 border-t border-white/10 bg-surface-300/80 backdrop-blur-2xl">
        <form onSubmit={handleSubmit} className="flex items-center gap-2.5 max-w-4xl mx-auto">
          <div className="relative flex-1 group">
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder={`Ask any question regarding ${selectedCategory === 'All' ? 'official policies, fees, hostel, exams...' : selectedCategory + '...'}`}
              disabled={isQuerying}
              className="w-full pl-4 pr-12 py-3.5 bg-surface-200/90 border border-white/10 focus:border-cyber-cyan/60 rounded-2xl text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyber-cyan/25 shadow-inner transition-all font-sans"
            />
          </div>

          <VoiceInputButton onTranscript={handleVoiceTranscript} />

          <button
            type="submit"
            disabled={!inputQuery.trim() || isQuerying}
            className="p-3.5 bg-gradient-to-r from-brand-600 via-indigo-600 to-cyber-cyan hover:from-brand-500 hover:to-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-2xl shadow-glow-indigo transition-all shrink-0 font-bold transform hover:scale-105 active:scale-95 border border-white/15"
            title="Send query"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
