import { cn } from '@/lib/utils';

/** Violet accent spinning loader */
export function LoadingSpinner({ size = 'md', className }) {
  const sizeMap = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-[3px]',
    lg: 'h-12 w-12 border-4',
  };

  return (
    <div
      className={cn(
        'animate-spin rounded-full',
        'border-[var(--bg-tertiary)] border-t-[var(--accent-violet)]',
        sizeMap[size] || sizeMap.md,
        className,
      )}
      role="status"
      aria-label="Loading"
    />
  );
}

/** Shimmer skeleton line */
export function SkeletonLine({ width = '100%', height = '14px', className }) {
  return (
    <div
      className={cn(
        'animate-shimmer rounded-[var(--radius-sm)]',
        className,
      )}
      style={{
        width,
        height,
        background:
          'linear-gradient(90deg, var(--bg-secondary) 0%, var(--bg-tertiary) 50%, var(--bg-secondary) 100%)',
        backgroundSize: '200% 100%',
      }}
    />
  );
}

/** Shimmer skeleton card */
export function SkeletonCard({ lines = 3, className }) {
  return (
    <div
      className={cn(
        'rounded-[var(--radius-lg)] border border-[var(--border-light)]',
        'bg-[var(--bg-elevated)] p-5',
        className,
      )}
    >
      {/* Title line */}
      <SkeletonLine width="60%" height="18px" className="mb-3" />
      {/* Content lines */}
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <SkeletonLine
            key={i}
            width={i === lines - 1 ? '45%' : '100%'}
            height="14px"
          />
        ))}
      </div>
    </div>
  );
}

export default { LoadingSpinner, SkeletonLine, SkeletonCard };
