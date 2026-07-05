'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Mic,
  Clock,
  Layers,
  Terminal,
  Settings,
  LogOut,
  Activity,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Voice Studio', href: '/editor', icon: Mic },
  { label: 'History', href: '/history', icon: Clock },
  { label: 'Templates', href: '/templates', icon: Layers },
  { label: 'Commands', href: '/commands', icon: Terminal },
  { label: 'Settings', href: '/settings', icon: Settings },
];

/**
 * Sidebar — the primary "tiny dark" element.
 * Fixed left sidebar, 260px wide, using var(--bg-accent-ink) background.
 */
export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sidebar">
      {/* ─── Brand ─── */}
      <div className="sidebar-brand">
        <Link href="/" className="block group">
          <h1
            className={cn(
              'text-xl font-bold tracking-tight',
              'brand-gradient-text'
            )}
            style={{ fontFamily: 'var(--font-display)' }}
          >
            VoxCode
          </h1>
          <span className="text-[11px] font-medium tracking-widest uppercase text-[var(--text-on-dark-muted)] group-hover:text-[var(--text-on-dark)] transition-colors">
            Pro Studio
          </span>
        </Link>
      </div>

      {/* ─── Navigation ─── */}
      <nav className="sidebar-nav">
        <div className="space-y-1">
          {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
            const isActive =
              pathname === href || pathname?.startsWith(href + '/');
            return (
              <Link
                key={href}
                href={href}
                className={cn('sidebar-nav-item', isActive && 'active')}
              >
                <Icon size={18} strokeWidth={isActive ? 2 : 1.5} />
                <span>{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* ─── Footer ─── */}
      <div className="sidebar-footer">
        {/* Speech Pipeline Status */}
        <div className="mb-4 rounded-[var(--radius-md)] bg-[rgba(255,255,255,0.04)] p-3">
          <div className="flex items-center gap-2 mb-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-pulse-ring absolute inline-flex h-full w-full rounded-full bg-[var(--accent-emerald)] opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--accent-emerald)]" />
            </span>
            <span className="text-xs font-semibold text-[var(--text-on-dark)]">
              Speech Pipeline Active
            </span>
          </div>
          <div className="flex items-center gap-2 ml-4">
            <Activity size={12} className="text-[var(--accent-emerald)]" />
            <div className="flex gap-1.5 text-[10px] text-[var(--text-on-dark-muted)]">
              <span className="rounded-full bg-[rgba(16,185,129,0.15)] px-2 py-0.5 text-[var(--accent-emerald)] font-medium">
                Vosk ASR
              </span>
              <span className="rounded-full bg-[rgba(124,92,252,0.12)] px-2 py-0.5 text-[var(--accent-violet-soft)] font-medium">
                Whisper
              </span>
            </div>
          </div>
        </div>

        {/* Logout */}
        <button
          type="button"
          className={cn(
            'sidebar-nav-item w-full',
            'hover:!bg-[rgba(244,63,94,0.1)] hover:!text-[var(--accent-rose)]',
            'transition-colors'
          )}
        >
          <LogOut size={18} strokeWidth={1.5} />
          <span>Log Out</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
