'use client';

import { useState } from 'react';
import { ArrowRight, Check, Copy, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';

export function TemplateCard({ template, language, onUse }) {
  const [favorited, setFavorited] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!template) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(template.code || '');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <div className="surface-card group flex flex-col p-4">
      {/* Header */}
      <div className="mb-2 flex items-start justify-between gap-2">
        <h4 className="text-sm font-semibold text-[var(--text-primary)]">
          {template.title}
        </h4>
        <button
          type="button"
          onClick={() => setFavorited(!favorited)}
          className={cn(
            'shrink-0 rounded-[var(--radius-sm)] p-1 transition-colors',
            favorited
              ? 'text-[var(--accent-rose)]'
              : 'text-[var(--text-tertiary)] hover:text-[var(--accent-rose)]',
          )}
          aria-label={favorited ? 'Unfavorite' : 'Favorite'}
        >
          <Heart
            className="h-4 w-4"
            fill={favorited ? 'currentColor' : 'none'}
          />
        </button>
      </div>

      {/* Language badge */}
      {language && <span className="badge badge-violet mb-2 self-start">{language}</span>}

      {/* Code preview */}
      {template.code && (
        <pre
          className={cn(
            'mb-3 max-h-24 flex-1 overflow-hidden rounded-[var(--radius-sm)]',
            'bg-[var(--bg-secondary)] px-3 py-2 text-xs leading-relaxed',
            'text-[var(--text-secondary)]',
          )}
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          {template.code.slice(0, 250)}
          {template.code.length > 250 && '…'}
        </pre>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between gap-2 pt-1">
        <button
          type="button"
          onClick={handleCopy}
          className={cn(
            'flex items-center gap-1 rounded-[var(--radius-sm)] px-2 py-1 text-xs font-medium',
            'text-[var(--text-secondary)] transition-colors',
            'hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]',
          )}
        >
          {copied ? (
            <Check className="h-3 w-3 text-[var(--accent-emerald)]" />
          ) : (
            <Copy className="h-3 w-3" />
          )}
          {copied ? 'Copied' : 'Copy'}
        </button>

        <button
          type="button"
          onClick={() => onUse?.(template)}
          className={cn(
            'flex items-center gap-1 rounded-[var(--radius-md)] px-3 py-1.5',
            'text-xs font-medium text-white transition-all',
            'bg-[var(--accent-violet)] hover:opacity-90',
            'shadow-[var(--shadow-xs)] hover:shadow-[var(--shadow-sm)]',
          )}
        >
          Use in Studio
          <ArrowRight className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}

export default TemplateCard;
