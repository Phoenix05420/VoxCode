'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, LayoutDashboard, Mic } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--bg-primary)] text-[var(--text-primary)] px-6">
      {/* Brand mark */}
      <div className="mb-8 h-14 w-14 rounded-2xl brand-gradient flex items-center justify-center shadow-lg animate-float">
        <Mic className="h-7 w-7 text-white" />
      </div>

      {/* 404 number */}
      <h1
        className="text-8xl md:text-9xl font-extrabold brand-gradient-text tracking-tighter"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        404
      </h1>

      <h2
        className="mt-4 text-2xl md:text-3xl font-bold tracking-tight"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        Page Not Found
      </h2>

      <p className="mt-3 text-[var(--text-secondary)] text-center max-w-md leading-relaxed">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
        Let&apos;s get you back on track.
      </p>

      {/* Actions */}
      <div className="mt-8 flex items-center gap-4">
        <button
          type="button"
          onClick={() => router.back()}
          className={cn(
            'inline-flex items-center gap-2 rounded-full px-6 py-2.5',
            'text-sm font-semibold',
            'border border-[var(--border-light)] bg-[var(--bg-elevated)]',
            'text-[var(--text-primary)]',
            'hover:border-[var(--accent-violet)] hover:shadow-[var(--shadow-glow)]',
            'transition-all duration-300'
          )}
        >
          <ArrowLeft className="h-4 w-4" />
          Go Back
        </button>
        <Link
          href="/dashboard"
          className={cn(
            'inline-flex items-center gap-2 rounded-full px-6 py-2.5',
            'text-sm font-semibold text-white brand-gradient',
            'shadow-md hover:shadow-[var(--shadow-glow)]',
            'transition-all duration-300 hover:scale-[1.03]'
          )}
        >
          <LayoutDashboard className="h-4 w-4" />
          Dashboard
        </Link>
      </div>
    </div>
  );
}
