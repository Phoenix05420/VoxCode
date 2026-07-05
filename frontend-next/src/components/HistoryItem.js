'use client';

import { useState } from 'react';
import { Clock, Copy, Eye, Trash2, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

function formatTimestamp(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now - d;
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDays = Math.floor(diffHr / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function HistoryItem({ item, onDelete, onCopy, onView }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(item.code || '');
    }
    setCopied(true);
    onCopy?.(item);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="surface-card group p-4">
      {/* Top row */}
      <div className="mb-2 flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h4 className="truncate text-sm font-semibold text-[var(--text-primary)]">
            {item.title || 'Untitled'}
          </h4>
          <div className="mt-1 flex items-center gap-2">
            {item.language && (
              <span className="badge badge-violet">{item.language}</span>
            )}
            <span className="flex items-center gap-1 text-xs text-[var(--text-tertiary)]">
              <Clock className="h-3 w-3" />
              {formatTimestamp(item.createdAt)}
            </span>
          </div>
        </div>
      </div>

      {/* Code preview */}
      {item.code && (
        <pre
          className={cn(
            'mb-3 max-h-20 overflow-hidden rounded-[var(--radius-sm)]',
            'bg-[var(--bg-secondary)] px-3 py-2 text-xs leading-relaxed',
            'text-[var(--text-secondary)]',
          )}
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          {item.code.slice(0, 200)}
          {item.code.length > 200 && '…'}
        </pre>
      )}

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        <button
          type="button"
          onClick={() => onView?.(item)}
          className={cn(
            'flex items-center gap-1.5 rounded-[var(--radius-sm)] px-2.5 py-1.5 text-xs font-medium',
            'text-[var(--text-secondary)] transition-colors',
            'hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]',
          )}
        >
          <Eye className="h-3.5 w-3.5" />
          View
        </button>
        <button
          type="button"
          onClick={handleCopy}
          className={cn(
            'flex items-center gap-1.5 rounded-[var(--radius-sm)] px-2.5 py-1.5 text-xs font-medium',
            'text-[var(--text-secondary)] transition-colors',
            'hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]',
          )}
        >
          {copied ? (
            <Check className="h-3.5 w-3.5 text-[var(--accent-emerald)]" />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
          {copied ? 'Copied' : 'Copy'}
        </button>
        <button
          type="button"
          onClick={() => onDelete?.(item)}
          className={cn(
            'flex items-center gap-1.5 rounded-[var(--radius-sm)] px-2.5 py-1.5 text-xs font-medium',
            'text-[var(--text-secondary)] transition-colors',
            'hover:bg-rose-50 hover:text-[var(--accent-rose)]',
            'dark:hover:bg-rose-950/30',
          )}
        >
          <Trash2 className="h-3.5 w-3.5" />
          Delete
        </button>
      </div>
    </div>
  );
}

export default HistoryItem;
