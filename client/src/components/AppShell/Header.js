import React, { useEffect, useState } from 'react';
import { Bell, Database, Sparkles, Activity, ShieldCheck, Cpu } from 'lucide-react';
import { useNotificationStore } from '../../store/notificationStore';
import { useAuthStore } from '../../store/authStore';
import api from '../../services/api';

export default function Header({ title, subtitle }) {
  const { toggleDrawer, notifications } = useNotificationStore();
  const { user } = useAuthStore();
  const [vectorStats, setVectorStats] = useState({ totalVectors: 22, status: 'healthy' });
  const [latency, setLatency] = useState(18);
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  useEffect(() => {
    const fetchHealth = async () => {
      const t0 = performance.now();
      try {
        const res = await api.get('/health');
        const t1 = performance.now();
        setLatency(Math.round(t1 - t0));
        if (res.data?.vectorDb) {
          setVectorStats(res.data.vectorDb);
        }
      } catch (_) {}
    };
    fetchHealth();
    const interval = setInterval(fetchHealth, 12000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-16 border-b border-white/10 bg-surface-300/75 backdrop-blur-2xl px-6 flex items-center justify-between sticky top-0 z-10 shadow-lg">
      <div className="flex items-center gap-3">
        <div>
          <h2 className="text-base font-extrabold text-white tracking-tight flex items-center gap-2">
            <span>{title || 'College Information Assistant'}</span>
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-brand-400"></span>
          </h2>
          {subtitle && (
            <p className="text-[11px] text-slate-400 font-mono tracking-wide">{subtitle}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Latency Indicator */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-100/90 border border-white/10 text-[11px] font-mono text-slate-400">
          <Activity className="w-3 h-3 text-emerald-400" />
          <span>Ping:</span>
          <span className="text-white font-bold">{latency}ms</span>
        </div>

        {/* Vector DB Engine Status */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-xl bg-surface-100/90 border border-white/10 text-xs font-mono text-slate-300 shadow-sm relative group overflow-hidden">
          <div className="absolute inset-0 bg-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          <Database className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <span className="text-slate-400">Vectors:</span>
          <span className="text-white font-bold tracking-wider">{vectorStats.totalVectors || 22}</span>
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
        </div>

        {/* AI Mode Pill */}
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-xl bg-gradient-to-r from-brand-600/20 via-cyber-cyan/15 to-purple-600/20 border border-brand-500/35 text-brand-300 text-xs font-mono shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin-slow" />
          <span className="font-semibold text-slate-200">Hybrid RAG</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded bg-brand-500/30 text-brand-200 font-bold">Top-4</span>
        </div>

        {/* Notifications Bell */}
        <button
          onClick={toggleDrawer}
          className="relative p-2.5 rounded-xl bg-surface-100/90 hover:bg-surface-50 border border-white/10 text-slate-300 hover:text-white hover:border-brand-500/40 transition-all shadow-sm group"
          title="System Notifications"
        >
          <Bell className="w-4 h-4 group-hover:scale-110 transition-transform" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-gradient-to-r from-rose-500 to-amber-500 text-white text-[10px] font-bold flex items-center justify-center shadow-lg animate-pulse">
              {unreadCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
