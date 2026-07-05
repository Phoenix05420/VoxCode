import { cn } from '../utils/cn';

export function StatsCard({ title, value, icon: Icon, trend = null, color = 'purple' }) {
  const colorClasses = {
    purple: 'from-purple-600 to-indigo-500 shadow-purple-500/20',
    blue: 'from-blue-600 to-cyan-500 shadow-blue-500/20',
    green: 'from-emerald-600 to-teal-500 shadow-emerald-500/20',
    orange: 'from-orange-500 to-amber-500 shadow-orange-500/20',
  };

  return (
    <div className="editorial-card rounded-[2rem] p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl relative overflow-hidden group">
      <div className="flex items-start justify-between relative z-10">
        <div>
          <p className="text-[color:var(--text-secondary)] text-xs uppercase tracking-wider font-bold">{title}</p>
          <p className="display-title text-4xl font-extrabold text-[color:var(--text-primary)] mt-3 tracking-tight">{value}</p>
          {trend && (
            <div className="inline-flex items-center gap-1 mt-3 px-2.5 py-1 rounded-full bg-[color:var(--bg-tertiary)] border border-[color:var(--border-color)]">
              <span className={cn(
                'text-xs font-bold',
                trend > 0 ? 'text-emerald-500 dark:text-emerald-400' : 'text-rose-500 dark:text-rose-400'
              )}>
                {trend > 0 ? '↑ +' : '↓ '}{trend}%
              </span>
              <span className="text-[10px] text-[color:var(--text-secondary)] font-medium">vs last week</span>
            </div>
          )}
        </div>
        <div className={cn('p-4 rounded-2xl bg-gradient-to-br text-white shadow-lg transform transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3', colorClasses[color] || colorClasses.orange)}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      {/* Subtle background glow */}
      <div className={cn("absolute -right-6 -bottom-6 w-24 h-24 rounded-full blur-2xl opacity-15 pointer-events-none bg-gradient-to-br", colorClasses[color] || colorClasses.orange)} />
    </div>
  );
}
