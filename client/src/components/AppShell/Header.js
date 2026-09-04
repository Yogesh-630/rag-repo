import React, { useEffect, useState } from 'react';
import { Bell, Activity, Database, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';
import { useNotificationStore } from '../../store/notificationStore';
import { useAuthStore } from '../../store/authStore';
import api from '../../services/api';

export default function Header({ title, subtitle }) {
  const { toggleDrawer, notifications } = useNotificationStore();
  const { user } = useAuthStore();
  const [vectorStats, setVectorStats] = useState({ totalVectors: 22, status: 'healthy' });
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const res = await api.get('/health');
        if (res.data?.vectorDb) {
          setVectorStats(res.data.vectorDb);
        }
      } catch (_) {}
    };
    fetchHealth();
    const interval = setInterval(fetchHealth, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-16 border-b border-white/10 bg-surface-200/60 backdrop-blur-xl px-6 flex items-center justify-between sticky top-0 z-10">
      <div>
        <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
          {title || 'College Information Assistant'}
        </h2>
        {subtitle && <p className="text-xs text-slate-400 font-mono">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-3">
        {/* Vector DB Engine Status */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-lg bg-surface-100 border border-white/10 text-xs font-mono text-slate-300 shadow-sm">
          <Database className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <span>Vectors:</span>
          <span className="text-white font-bold">{vectorStats.totalVectors || 22}</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
        </div>

        {/* AI Mode Pill */}
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-lg bg-brand-500/10 border border-brand-500/30 text-brand-400 text-xs font-mono">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Hybrid RAG (Top-4)</span>
        </div>

        {/* Notifications Bell */}
        <button
          onClick={toggleDrawer}
          className="relative p-2 rounded-lg bg-surface-100 border border-white/10 text-slate-300 hover:text-white hover:border-brand-500/40 transition-all"
          title="System Notifications"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
              {unreadCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
