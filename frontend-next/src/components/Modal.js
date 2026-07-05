'use client';

import { useEffect, useCallback } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

const sizeClasses = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  full: 'max-w-[90vw]',
};

export function Modal({
  isOpen,
  title,
  children,
  onClose,
  size = 'md',
}) {
  const handleEscape = useCallback(
    (e) => {
      if (e.key === 'Escape') onClose?.();
    },
    [onClose],
  );

  useEffect(() => {
    if (!isOpen) return;
    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleEscape]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div
        className={cn(
          'relative w-full animate-fadeIn',
          'rounded-[var(--radius-xl)] border border-[var(--border-light)]',
          'bg-[var(--bg-elevated)] shadow-[var(--shadow-xl)]',
          sizeClasses[size] || sizeClasses.md,
        )}
        role="dialog"
        aria-modal="true"
        aria-label={title || 'Modal'}
      >
        {/* Header */}
        {(title || onClose) && (
          <div className="flex items-center justify-between border-b border-[var(--border-light)] px-6 py-4">
            {title && (
              <h2
                className="text-base font-semibold text-[var(--text-primary)]"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {title}
              </h2>
            )}
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className={cn(
                  'rounded-[var(--radius-sm)] p-1.5 text-[var(--text-tertiary)]',
                  'transition-colors hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]',
                )}
                aria-label="Close modal"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div className="max-h-[70vh] overflow-y-auto px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

export default Modal;
