'use client';

import { useState, useMemo } from 'react';
import {
  Search,
  Copy,
  ArrowRight,
  Command as CommandIcon,
  Check,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function CommandPalette({ commands = [], onSelect }) {
  const [query, setQuery] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  const filtered = useMemo(() => {
    if (!query.trim()) return commands;
    const q = query.toLowerCase();
    return commands.filter(
      (cmd) =>
        (cmd.label || '').toLowerCase().includes(q) ||
        (cmd.description || '').toLowerCase().includes(q) ||
        (cmd.code || '').toLowerCase().includes(q),
    );
  }, [commands, query]);

  const handleCopy = async (cmd) => {
    try {
      await navigator.clipboard.writeText(cmd.code || cmd.label);
      setCopiedId(cmd.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <div className="mx-auto w-full max-w-2xl">
      {/* Search input */}
      <div className="relative mb-4">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-tertiary)]" />
        <input
          type="text"
          placeholder="Search commands…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className={cn(
            'w-full rounded-[var(--radius-md)] border border-[var(--border-light)] py-2.5 pl-10 pr-4',
            'bg-[var(--bg-elevated)] text-sm text-[var(--text-primary)]',
            'placeholder:text-[var(--text-tertiary)]',
            'outline-none transition-shadow focus:border-[var(--accent-violet)]',
            'focus:shadow-[var(--shadow-glow)]',
          )}
          style={{ fontFamily: 'var(--font-sans)' }}
        />
      </div>

      {/* Command list */}
      <div className="space-y-2">
        {filtered.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-10 text-center">
            <CommandIcon className="h-8 w-8 text-[var(--text-tertiary)]" />
            <p className="text-sm text-[var(--text-tertiary)]">
              No commands found
            </p>
          </div>
        )}

        {filtered.map((cmd) => (
          <div
            key={cmd.id}
            className={cn(
              'surface-card group flex items-center justify-between gap-3 px-4 py-3',
            )}
          >
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-[var(--text-primary)]">
                {cmd.label}
              </p>
              {cmd.description && (
                <p className="mt-0.5 truncate text-xs text-[var(--text-secondary)]">
                  {cmd.description}
                </p>
              )}
              {cmd.code && (
                <code
                  className="mt-1 inline-block max-w-full truncate rounded-[var(--radius-sm)] bg-[var(--bg-secondary)] px-2 py-0.5 text-xs"
                  style={{ fontFamily: 'var(--font-mono)' }}
                >
                  {cmd.code}
                </code>
              )}
            </div>

            <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
              <button
                type="button"
                onClick={() => handleCopy(cmd)}
                className={cn(
                  'rounded-[var(--radius-sm)] p-1.5 text-[var(--text-secondary)]',
                  'transition-colors hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]',
                )}
                title="Copy"
              >
                {copiedId === cmd.id ? (
                  <Check className="h-3.5 w-3.5 text-[var(--accent-emerald)]" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </button>
              <button
                type="button"
                onClick={() => onSelect?.(cmd)}
                className={cn(
                  'flex items-center gap-1 rounded-[var(--radius-sm)] px-2 py-1 text-xs font-medium',
                  'bg-[var(--accent-violet-bg)] text-[var(--accent-violet)]',
                  'transition-colors hover:bg-[var(--accent-violet)] hover:text-white',
                )}
              >
                Use in Studio
                <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CommandPalette;
