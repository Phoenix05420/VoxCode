'use client';

import { AlertCircle, CheckCircle, Info, X, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const typeConfig = {
  info: {
    icon: Info,
    border: 'border-l-[var(--accent-blue)]',
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    iconColor: 'text-[var(--accent-blue)]',
    titleColor: 'text-blue-900 dark:text-blue-200',
    textColor: 'text-blue-800 dark:text-blue-300',
  },
  success: {
    icon: CheckCircle,
    border: 'border-l-[var(--accent-emerald)]',
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    iconColor: 'text-[var(--accent-emerald)]',
    titleColor: 'text-emerald-900 dark:text-emerald-200',
    textColor: 'text-emerald-800 dark:text-emerald-300',
  },
  warning: {
    icon: AlertCircle,
    border: 'border-l-[var(--accent-amber)]',
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    iconColor: 'text-[var(--accent-amber)]',
    titleColor: 'text-amber-900 dark:text-amber-200',
    textColor: 'text-amber-800 dark:text-amber-300',
  },
  error: {
    icon: XCircle,
    border: 'border-l-[var(--accent-rose)]',
    bg: 'bg-rose-50 dark:bg-rose-950/30',
    iconColor: 'text-[var(--accent-rose)]',
    titleColor: 'text-rose-900 dark:text-rose-200',
    textColor: 'text-rose-800 dark:text-rose-300',
  },
};

export function Alert({ type = 'info', title, message, onClose }) {
  const config = typeConfig[type] || typeConfig.info;
  const Icon = config.icon;

  return (
    <div
      className={cn(
        'relative flex items-start gap-3 rounded-[var(--radius-md)] border-l-4 px-4 py-3',
        'shadow-[var(--shadow-xs)] transition-all duration-[var(--transition-fast)]',
        config.border,
        config.bg,
      )}
      role="alert"
    >
      <Icon className={cn('mt-0.5 h-5 w-5 shrink-0', config.iconColor)} />

      <div className="min-w-0 flex-1">
        {title && (
          <p className={cn('text-sm font-semibold leading-snug', config.titleColor)}>
            {title}
          </p>
        )}
        {message && (
          <p className={cn('mt-0.5 text-sm leading-relaxed', config.textColor)}>
            {message}
          </p>
        )}
      </div>

      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className={cn(
            'shrink-0 rounded-[var(--radius-sm)] p-1 transition-colors',
            'hover:bg-black/5 dark:hover:bg-white/10',
            config.iconColor,
          )}
          aria-label="Dismiss alert"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

export default Alert;
