'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Breadcrumb({ items = [] }) {
  const allItems = [{ label: 'Studio', href: '/dashboard' }, ...items];

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm">
      {allItems.map((item, idx) => {
        const isLast = idx === allItems.length - 1;

        return (
          <span key={idx} className="flex items-center gap-1">
            {idx > 0 && (
              <ChevronRight className="h-3.5 w-3.5 text-[var(--text-tertiary)]" />
            )}

            {item.href && !isLast ? (
              <Link
                href={item.href}
                className={cn(
                  'rounded-[var(--radius-sm)] px-1.5 py-0.5 font-medium transition-colors',
                  'text-[var(--text-secondary)] hover:text-[var(--text-primary)]',
                  'hover:bg-[var(--bg-tertiary)]',
                )}
              >
                {item.label}
              </Link>
            ) : (
              <span
                className={cn(
                  'px-1.5 py-0.5 font-medium',
                  isLast
                    ? 'text-[var(--text-primary)]'
                    : 'text-[var(--text-secondary)]',
                )}
              >
                {item.label}
              </span>
            )}
          </span>
        );
      })}
    </nav>
  );
}

export default Breadcrumb;
