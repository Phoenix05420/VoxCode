import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Code2,
  History,
  Zap,
  BookOpen,
  Settings,
  LogOut,
  Mic,
  Activity,
  Sparkles,
} from 'lucide-react';
import { cn } from '../utils/cn';

const NAV_ITEMS = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard', badge: null },
  { label: 'Voice Studio', icon: Code2, path: '/editor', badge: 'Live' },
  { label: 'History', icon: History, path: '/history', badge: null },
  { label: 'Templates', icon: BookOpen, path: '/templates', badge: '12+' },
  { label: 'Commands', icon: Zap, path: '/commands', badge: '40+' },
  { label: 'Settings', icon: Settings, path: '/settings', badge: null },
];

export function Sidebar({ onLogout }) {
  const location = useLocation();

  return (
    <aside className="w-64 glass border-r border-[color:var(--border-color)] flex flex-col h-screen fixed left-0 top-0 z-40 backdrop-blur-2xl bg-[color:var(--bg-secondary)]/90 transition-colors duration-300">
      {/* Logo */}
      <div className="p-6 border-b border-[color:var(--border-color)] flex items-center justify-between">
        <Link to="/dashboard" className="flex items-center gap-3 group">
          <div className="brand-gradient flex h-10 w-10 items-center justify-center rounded-2xl shadow-lg shadow-orange-500/20 text-white transform transition-transform group-hover:scale-105">
            <Mic size={20} />
          </div>
          <div>
            <span className="display-title text-xl font-bold tracking-tight text-[color:var(--text-primary)]">VoxCode</span>
            <span className="block text-[10px] uppercase tracking-widest font-semibold text-[color:var(--accent-primary)]">Pro Studio</span>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto space-y-1">
        <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-[color:var(--text-secondary)] opacity-75">
          Workspace
        </div>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex items-center justify-between px-4 py-3 rounded-2xl transition-all duration-200 group relative',
                isActive
                  ? 'brand-gradient text-white shadow-lg shadow-orange-500/20 font-bold translate-x-1'
                  : 'text-[color:var(--text-secondary)] hover:bg-[color:var(--bg-tertiary)] hover:text-[color:var(--text-primary)]'
              )}
            >
              <div className="flex items-center gap-3">
                <Icon className={cn("w-5 h-5 transition-transform group-hover:scale-110", isActive ? "text-white" : "text-[color:var(--accent-primary)]")} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className={cn(
                  "text-[10px] font-bold px-2 py-0.5 rounded-full",
                  isActive 
                    ? "bg-white/20 text-white" 
                    : "bg-[color:var(--bg-tertiary)] text-[color:var(--accent-primary)] border border-[color:var(--border-color)]"
                )}>
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Speech Engine Live Indicator */}
      <div className="p-4 mx-4 mb-4 rounded-2xl bg-[color:var(--bg-tertiary)] border border-[color:var(--border-color)]">
        <div className="flex items-center gap-2 mb-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-bold text-[color:var(--text-primary)] flex items-center gap-1">
            <Activity size={12} className="text-emerald-500" />
            Speech Pipeline Active
          </span>
        </div>
        <p className="text-[11px] text-[color:var(--text-secondary)] leading-relaxed">
          Vosk real-time ASR & Whisper neural transcription ready.
        </p>
      </div>

      {/* Logout */}
      <div className="p-4 border-t border-[color:var(--border-color)]">
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-2xl text-[color:var(--text-secondary)] hover:bg-rose-500/10 hover:text-rose-500 transition-all font-semibold"
        >
          <LogOut className="w-5 h-5" />
          <span>Exit Workspace</span>
        </button>
      </div>
    </aside>
  );
}
