import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  MessageSquare,
  LayoutDashboard,
  Files,
  Activity,
  Settings,
  LogOut,
  GraduationCap,
  ChevronRight,
  Sparkles,
  Zap,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

const navItems = [
  { label: 'RAG Assistant', href: '/chat', icon: MessageSquare, badge: 'Live' },
  { label: 'Operations Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Knowledge Base Docs', href: '/documents', icon: Files },
  { label: 'Audit Executions', href: '/executions', icon: Activity },
  { label: 'System Settings', href: '/settings', icon: Settings },
];

export default function Sidebar() {
  const router = useRouter();
  const { user, logout, isAuthenticated } = useAuthStore();

  return (
    <aside className="w-64 bg-surface-300/85 border-r border-white/10 flex flex-col justify-between h-screen sticky top-0 backdrop-blur-2xl z-20 shadow-2xl">
      <div>
        {/* Brand Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-brand-600/10 via-cyber-cyan/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
          <Link href="/" className="flex items-center gap-3 relative z-10">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 via-indigo-500 to-cyber-cyan flex items-center justify-center shadow-glow-indigo text-white transition-all duration-300 group-hover:scale-105 group-hover:shadow-glow-cyan">
              <GraduationCap className="w-6 h-6 animate-pulse-slow" />
            </div>
            <div>
              <h1 className="font-extrabold text-base tracking-tight text-white flex items-center gap-1.5">
                CollegeRAG
                <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-gradient-to-r from-brand-500 to-cyber-cyan text-white font-mono font-bold shadow-sm">
                  AI
                </span>
              </h1>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <p className="text-[10px] text-slate-400 font-mono tracking-wider uppercase">Neural Engine</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="p-3 space-y-1.5">
          <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center justify-between">
            <span>Navigation Modules</span>
            <Sparkles className="w-3 h-3 text-brand-400 opacity-60" />
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              router.pathname === item.href ||
              (item.href !== '/' && router.pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group relative flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-brand-600/25 to-cyber-cyan/15 text-white border border-brand-500/40 shadow-glow-indigo'
                    : 'text-slate-300 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10'
                }`}
              >
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full bg-gradient-to-b from-brand-400 to-cyber-cyan shadow-glow-cyan" />
                )}
                <div className="flex items-center gap-3">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                      isActive
                        ? 'bg-brand-500 text-white shadow-glow-indigo'
                        : 'bg-white/5 text-slate-400 group-hover:text-white group-hover:bg-white/10'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <span className="tracking-wide">{item.label}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  {item.badge && (
                    <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[9px] font-mono uppercase">
                      {item.badge}
                    </span>
                  )}
                  <ChevronRight
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${
                      isActive ? 'text-cyber-cyan translate-x-0.5' : 'text-slate-500 opacity-0 group-hover:opacity-100'
                    }`}
                  />
                </div>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User Card / Auth Footer */}
      <div className="p-3 border-t border-white/10 bg-surface-300/80 backdrop-blur-xl">
        {isAuthenticated && user ? (
          <div className="p-3 rounded-2xl bg-gradient-to-br from-surface-100/90 to-surface-200/90 border border-white/10 shadow-lg space-y-3 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-brand-500/10 rounded-full blur-xl pointer-events-none" />
            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 via-indigo-600 to-purple-600 flex items-center justify-center font-bold text-xs text-white uppercase shadow-glow-indigo border border-white/20">
                  {user.name ? user.name.charAt(0) : 'U'}
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs font-bold text-white truncate w-28">{user.name || 'User'}</p>
                  <p className="text-[10px] text-slate-400 font-mono truncate w-28">{user.email}</p>
                </div>
              </div>
              <span
                className={`text-[9px] uppercase font-mono px-2 py-0.5 rounded-full border tracking-wider font-semibold ${
                  user.role === 'admin'
                    ? 'bg-purple-500/20 text-purple-300 border-purple-500/40 shadow-glow-purple'
                    : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-glow-emerald'
                }`}
              >
                {user.role}
              </span>
            </div>

            <button
              onClick={logout}
              className="w-full flex items-center justify-center gap-2 py-2 text-xs font-semibold text-rose-300 hover:text-white hover:bg-rose-600/20 rounded-xl transition-all border border-rose-500/25 hover:border-rose-500/50 shadow-sm"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <Link
              href="/login"
              className="w-full flex items-center justify-center py-2.5 text-xs font-bold bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white rounded-xl shadow-glow-indigo transition-all transform hover:-translate-y-0.5"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="w-full flex items-center justify-center py-2 text-xs font-medium text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/10"
            >
              Create Account
            </Link>
          </div>
        )}
      </div>
    </aside>
  );
}
