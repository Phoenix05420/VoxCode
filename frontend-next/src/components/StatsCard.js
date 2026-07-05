import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const colorMap = {
  violet: {
    bg: 'from-[var(--accent-violet)] to-[var(--accent-blue)]',
    trend: 'text-[var(--accent-violet)]',
    trendBg: 'bg-[var(--accent-violet-bg)]',
  },
  emerald: {
    bg: 'from-[var(--accent-emerald)] to-teal-400',
    trend: 'text-[var(--accent-emerald)]',
    trendBg: 'bg-emerald-50 dark:bg-emerald-950/30',
  },
  amber: {
    bg: 'from-[var(--accent-amber)] to-orange-400',
    trend: 'text-[var(--accent-amber)]',
    trendBg: 'bg-amber-50 dark:bg-amber-950/30',
  },
  rose: {
    bg: 'from-[var(--accent-rose)] to-pink-400',
    trend: 'text-[var(--accent-rose)]',
    trendBg: 'bg-rose-50 dark:bg-rose-950/30',
  },
  blue: {
    bg: 'from-[var(--accent-blue)] to-cyan-400',
    trend: 'text-[var(--accent-blue)]',
    trendBg: 'bg-blue-50 dark:bg-blue-950/30',
  },
};

export function StatsCard({
  title,
  value,
  icon: Icon,
  trend,
  color = 'violet',
}) {
  const palette = colorMap[color] || colorMap.violet;
  const isPositive = trend != null && trend >= 0;

  return (
    <div className="glass-card flex items-center gap-4 p-5">
      {/* Icon */}
      {Icon && (
        <div
          className={cn(
            'flex h-12 w-12 shrink-0 items-center justify-center rounded-[var(--radius-md)]',
            'bg-gradient-to-br shadow-sm',
            palette.bg,
          )}
        >
          <Icon className="h-6 w-6 text-white" />
        </div>
      )}

      {/* Content */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-medium uppercase tracking-wider text-[var(--text-tertiary)]">
          {title}
        </p>
        <p
          className="mt-0.5 text-2xl font-bold text-[var(--text-primary)]"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {value}
        </p>
      </div>

      {/* Trend */}
      {trend != null && (
        <div
          className={cn(
            'flex items-center gap-1 rounded-[var(--radius-full)] px-2.5 py-1',
            'text-xs font-semibold',
            palette.trendBg,
            isPositive ? 'text-[var(--accent-emerald)]' : 'text-[var(--accent-rose)]',
          )}
        >
          {isPositive ? (
            <TrendingUp className="h-3 w-3" />
          ) : (
            <TrendingDown className="h-3 w-3" />
          )}
          {Math.abs(trend)}%
        </div>
      )}
    </div>
  );
}

export default StatsCard;
