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
  ShieldAlert,
  ChevronRight,
  Database,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

const navItems = [
  { label: 'RAG Assistant', href: '/chat', icon: MessageSquare, role: 'all' },
  { label: 'Operations Dashboard', href: '/dashboard', icon: LayoutDashboard, role: 'all' },
  { label: 'Knowledge Base Docs', href: '/documents', icon: Files, role: 'all' },
  { label: 'Audit Executions', href: '/executions', icon: Activity, role: 'all' },
  { label: 'System Settings', href: '/settings', icon: Settings, role: 'all' },
];

export default function Sidebar() {
  const router = useRouter();
  const { user, logout, isAuthenticated } = useAuthStore();

  return (
    <aside className="w-64 bg-surface-200/95 border-r border-white/10 flex flex-col justify-between h-screen sticky top-0 backdrop-blur-xl z-20">
      <div>
        {/* Brand Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-cyan-500 flex items-center justify-center shadow-glow-indigo text-white transition-transform group-hover:scale-105">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-bold text-base tracking-tight text-white flex items-center gap-1.5">
                CollegeRAG <span className="text-xs px-1.5 py-0.5 rounded bg-brand-500/20 text-brand-400 border border-brand-500/30">AI</span>
              </h1>
              <p className="text-[11px] text-slate-400 font-mono">Institutional Intelligence</p>
            </div>
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="p-3 space-y-1">
          <div className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Console Navigation
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = router.pathname === item.href || (item.href !== '/' && router.pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-brand-600/20 text-brand-400 border border-brand-500/30 shadow-glow-indigo'
                    : 'text-slate-300 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-brand-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-brand-400" />}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User Card / Auth Footer */}
      <div className="p-3 border-t border-white/10 bg-surface-300/40">
        {isAuthenticated && user ? (
          <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-xs text-white uppercase shadow-sm">
                  {user.name ? user.name.charAt(0) : 'U'}
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs font-semibold text-white truncate w-32">{user.name}</p>
                  <p className="text-[10px] text-slate-400 truncate w-32">{user.email}</p>
                </div>
              </div>
              <span className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded-full border ${
                user.role === 'admin'
                  ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
              }`}>
                {user.role}
              </span>
            </div>

            <button
              onClick={logout}
              className="w-full flex items-center justify-center gap-2 py-1.5 text-xs text-rose-300 hover:text-rose-200 hover:bg-rose-500/10 rounded-lg transition-colors border border-rose-500/20"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <Link
              href="/login"
              className="w-full flex items-center justify-center py-2 text-xs font-semibold bg-brand-600 hover:bg-brand-500 text-white rounded-xl shadow-glow-indigo transition-all"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="w-full flex items-center justify-center py-2 text-xs font-medium text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/5"
            >
              Create Account
            </Link>
          </div>
        )}
      </div>
    </aside>
  );
}
