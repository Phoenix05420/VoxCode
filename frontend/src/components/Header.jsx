import { DarkModeToggle } from './DarkModeToggle';
import { Search, Bell, Mic, Sparkles, Cpu } from 'lucide-react';
import { cn } from '../utils/cn';

export function Header({ title = 'VoxCode', showSearch = true }) {
  return (
    <header className="h-16 glass border-b border-[color:var(--border-color)] fixed right-0 top-0 left-64 z-30 backdrop-blur-2xl bg-[color:var(--bg-secondary)]/80 transition-colors duration-300">
      <div className="h-full flex items-center justify-between px-6 md:px-8">
        {/* Title & Status */}
        <div className="flex items-center gap-4">
          <h1 className="display-title text-2xl font-bold text-[color:var(--text-primary)]">{title}</h1>
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-[color:var(--bg-tertiary)] border border-[color:var(--border-color)] text-xs font-semibold text-[color:var(--text-secondary)]">
            <Cpu size={14} className="text-[color:var(--accent-primary)] animate-pulse" />
            <span>AI Model: Qwen / Llama-3</span>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3 md:gap-4">
          {showSearch && (
            <div className="hidden md:flex items-center bg-[color:var(--bg-tertiary)] border border-[color:var(--border-color)] rounded-2xl px-4 py-2 focus-within:ring-2 focus-within:ring-[color:var(--accent-primary)]/50 transition-all w-64">
              <Search className="w-4 h-4 text-[color:var(--text-secondary)]" />
              <input
                type="text"
                placeholder="Search commands, templates..."
                className="ml-2 bg-transparent text-sm text-[color:var(--text-primary)] placeholder-[color:var(--text-secondary)] focus:outline-none w-full"
              />
            </div>
          )}

          {/* Quick Action Button */}
          <a
            href="/editor"
            className="hidden sm:inline-flex items-center gap-2 brand-gradient text-white px-4 py-2 rounded-2xl text-xs font-bold shadow-md shadow-orange-500/20 hover:opacity-95 transition-transform transform hover:-translate-y-0.5"
          >
            <Mic size={14} />
            <span>Voice Studio</span>
          </a>

          {/* Notifications */}
          <button className="p-2.5 rounded-2xl bg-[color:var(--bg-tertiary)] border border-[color:var(--border-color)] text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)] transition-colors relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-orange-500 rounded-full animate-ping" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-orange-500 rounded-full" />
          </button>

          {/* Dark mode */}
          <div className="p-0.5 rounded-2xl bg-[color:var(--bg-tertiary)] border border-[color:var(--border-color)]">
            <DarkModeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
