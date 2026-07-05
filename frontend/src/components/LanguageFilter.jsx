import { Filter, Code2 } from 'lucide-react';
import { cn } from '../utils/cn';

export function LanguageFilter({ languages, selected, onChange, label = 'Language' }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[color:var(--text-secondary)]">
        <Code2 className="w-4 h-4 text-[color:var(--accent-primary)]" />
        <span className="hidden sm:inline">{label}:</span>
      </div>
      <select
        value={selected}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          'px-4 py-2 rounded-2xl bg-[color:var(--bg-secondary)] border border-[color:var(--border-color)]',
          'text-[color:var(--text-primary)] text-xs font-bold shadow-sm',
          'hover:border-[color:var(--accent-primary)] focus:outline-none focus:ring-2 focus:ring-[color:var(--accent-primary)]/50',
          'transition-all cursor-pointer'
        )}
      >
        <option value="">All {label}s</option>
        {languages.map((lang) => (
          <option key={lang} value={lang}>
            {lang.charAt(0).toUpperCase() + lang.slice(1)}
          </option>
        ))}
      </select>
    </div>
  );
}
