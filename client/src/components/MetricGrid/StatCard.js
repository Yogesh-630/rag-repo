import React from 'react';

export default function StatCard({ title, value, unit, change, icon: Icon, color = 'indigo' }) {
  const colorMap = {
    indigo: {
      bg: 'from-brand-600/20 via-indigo-600/10 to-surface-200/80',
      border: 'border-brand-500/35 hover:border-brand-500/60',
      iconBg: 'bg-brand-500/20 text-brand-300 border-brand-500/40',
      glow: 'shadow-glow-indigo',
    },
    cyan: {
      bg: 'from-cyan-500/20 via-blue-600/10 to-surface-200/80',
      border: 'border-cyan-500/35 hover:border-cyan-500/60',
      iconBg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
      glow: 'shadow-glow-cyan',
    },
    emerald: {
      bg: 'from-emerald-500/20 via-teal-600/10 to-surface-200/80',
      border: 'border-emerald-500/35 hover:border-emerald-500/60',
      iconBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      glow: 'shadow-glow-emerald',
    },
    amber: {
      bg: 'from-amber-500/20 via-orange-600/10 to-surface-200/80',
      border: 'border-amber-500/35 hover:border-amber-500/60',
      iconBg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      glow: 'shadow-sm',
    },
    purple: {
      bg: 'from-purple-500/20 via-pink-600/10 to-surface-200/80',
      border: 'border-purple-500/35 hover:border-purple-500/60',
      iconBg: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
      glow: 'shadow-glow-purple',
    },
  };

  const scheme = colorMap[color] || colorMap.indigo;

  return (
    <div
      className={`p-5 rounded-2xl bg-gradient-to-br ${scheme.bg} border ${scheme.border} backdrop-blur-2xl relative overflow-hidden group shadow-xl transition-all duration-300 hover:-translate-y-1.5`}
    >
      <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-xl pointer-events-none group-hover:scale-150 transition-transform duration-500" />

      <div className="flex items-center justify-between relative z-10">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono">{title}</span>
        {Icon && (
          <div className={`p-2 rounded-xl border transition-all duration-300 group-hover:scale-110 ${scheme.iconBg}`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="mt-3 flex items-baseline gap-1.5 relative z-10">
        <span className="text-3xl font-black text-white tracking-tight font-sans">{value}</span>
        {unit && <span className="text-xs font-mono text-slate-400">{unit}</span>}
      </div>

      {change && (
        <div className="mt-2 text-xs font-medium text-emerald-400 flex items-center gap-1 relative z-10 font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>{change}</span>
        </div>
      )}
    </div>
  );
}
