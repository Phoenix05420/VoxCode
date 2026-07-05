'use client';

import Link from 'next/link';
import { Search, Bell, Sun, Moon, Mic } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { cn } from '@/lib/utils';

/**
 * Header — fixed top bar offset by the sidebar width (260px).
 * Displays page title, AI model badge, search, notifications, and dark mode toggle.
 */
export function Header({ title = 'Dashboard' }) {
  const { isDark, toggleTheme, mounted } = useTheme();

  return (
    <header className="header-bar">
      {/* ─── Left: Page Title ─── */}
      <div className="flex items-center gap-4">
        <h2
          className="text-lg font-semibold tracking-tight text-[var(--text-primary)]"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {title}
        </h2>

        {/* AI Model Badge */}
        <span
          className={cn(
            'hidden sm:inline-flex items-center gap-1.5',
            'rounded-full px-3 py-1',
            'bg-[var(--bg-accent-dark)] text-[var(--text-on-dark)]',
            'text-[11px] font-semibold tracking-wide',
            'shadow-sm'
          )}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent-emerald)] animate-pulse-dot" />
          Qwen / Llama-3
        </span>
      </div>

      {/* ─── Right: Actions ─── */}
      <div className="flex items-center gap-2">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] pointer-events-none"
          />
          <input
            type="text"
            placeholder="Search commands…"
            aria-label="Search commands"
            className={cn(
              'w-52 rounded-[var(--radius-md)] border border-[var(--border-light)]',
              'bg-[var(--bg-sunken)] py-1.5 pl-9 pr-3',
              'text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)]',
              'outline-none transition-all duration-200',
              'focus:w-64 focus:border-[var(--border-focus)] focus:shadow-[var(--shadow-glow)]'
            )}
          />
        </div>

        {/* Voice Studio Quick Link */}
        <Link
          href="/editor"
          className={cn(
            'hidden sm:inline-flex items-center gap-1.5',
            'rounded-[var(--radius-md)] px-3 py-1.5',
            'text-xs font-semibold',
            'bg-[var(--accent-violet-bg)] text-[var(--accent-violet)]',
            'hover:bg-[var(--accent-violet)] hover:text-white',
            'transition-all duration-200'
          )}
        >
          <Mic size={13} strokeWidth={2} />
          Voice Studio
        </Link>

        {/* Notification Bell */}
        <button
          type="button"
          aria-label="Notifications"
          className={cn(
            'relative p-2 rounded-[var(--radius-md)]',
            'text-[var(--text-secondary)] hover:text-[var(--text-primary)]',
            'hover:bg-[var(--bg-secondary)]',
            'transition-colors duration-200'
          )}
        >
          <Bell size={18} strokeWidth={1.5} />
          {/* Animated ping */}
          <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--accent-rose)] opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[var(--accent-rose)]" />
          </span>
        </button>

        {/* Dark Mode Toggle */}
        <button
          type="button"
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          onClick={toggleTheme}
          className={cn(
            'p-2 rounded-[var(--radius-md)]',
            'text-[var(--text-secondary)] hover:text-[var(--text-primary)]',
            'hover:bg-[var(--bg-secondary)]',
            'transition-all duration-200'
          )}
        >
          {mounted ? (
            isDark ? (
              <Sun size={18} strokeWidth={1.5} className="transition-transform duration-300 rotate-0 hover:rotate-90" />
            ) : (
              <Moon size={18} strokeWidth={1.5} className="transition-transform duration-300 rotate-0 hover:-rotate-12" />
            )
          ) : (
            // SSR placeholder to avoid hydration mismatch
            <div className="h-[18px] w-[18px]" />
          )}
        </button>
      </div>
    </header>
  );
}

export default Header;
