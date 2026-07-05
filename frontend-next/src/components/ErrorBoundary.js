'use client';

import { AlertCircle, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ErrorBoundary({ children, error, reset }) {
  if (!error) return children;

  return (
    <div className="flex min-h-[320px] items-center justify-center p-8">
      <div
        className={cn(
          'mx-auto w-full max-w-md rounded-[var(--radius-lg)] border border-[var(--border-light)]',
          'bg-[var(--bg-elevated)] p-8 text-center shadow-[var(--shadow-md)]',
        )}
      >
        <div
          className={cn(
            'mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full',
            'bg-rose-50 dark:bg-rose-950/30',
          )}
        >
          <AlertCircle className="h-7 w-7 text-[var(--accent-rose)]" />
        </div>

        <h2
          className="mb-2 text-lg font-semibold"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
        >
          Something went wrong
        </h2>

        <p className="mb-6 text-sm leading-relaxed text-[var(--text-secondary)]">
          {error?.message || 'An unexpected error occurred. Please try again.'}
        </p>

        {reset && (
          <button
            type="button"
            onClick={reset}
            className={cn(
              'inline-flex items-center gap-2 rounded-[var(--radius-md)] px-5 py-2.5',
              'text-sm font-medium text-white transition-all',
              'bg-[var(--accent-violet)] hover:opacity-90',
              'shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)]',
            )}
          >
            <RotateCcw className="h-4 w-4" />
            Try Again
          </button>
        )}
      </div>
    </div>
  );
}

export default ErrorBoundary;
