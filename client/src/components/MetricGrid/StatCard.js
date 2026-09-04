import React from 'react';

export default function StatCard({ title, value, unit, change, icon: Icon, color = 'indigo' }) {
  const colorMap = {
    indigo: 'from-indigo-500/20 to-brand-600/10 border-indigo-500/30 text-indigo-400',
    cyan: 'from-cyan-500/20 to-blue-600/10 border-cyan-500/30 text-cyan-400',
    emerald: 'from-emerald-500/20 to-teal-600/10 border-emerald-500/30 text-emerald-400',
    amber: 'from-amber-500/20 to-orange-600/10 border-amber-500/30 text-amber-400',
    purple: 'from-purple-500/20 to-pink-600/10 border-purple-500/30 text-purple-400',
  };

  const style = colorMap[color] || colorMap.indigo;

  return (
    <div className={`p-5 rounded-2xl bg-gradient-to-br ${style} border backdrop-blur-xl relative overflow-hidden group shadow-lg transition-transform hover:-translate-y-1`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">{title}</span>
        {Icon && (
          <div className="p-2 rounded-xl bg-white/5 border border-white/10 text-white group-hover:scale-110 transition-transform">
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="mt-3 flex items-baseline gap-1.5">
        <span className="text-3xl font-extrabold text-white tracking-tight">{value}</span>
        {unit && <span className="text-xs font-mono text-slate-400">{unit}</span>}
      </div>

      {change && (
        <div className="mt-2 text-xs font-medium text-emerald-400 flex items-center gap-1">
          <span>{change}</span>
        </div>
      )}
    </div>
  );
}
