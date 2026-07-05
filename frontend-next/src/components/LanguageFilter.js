import { cn } from '@/lib/utils';

export function LanguageFilter({
  languages = [],
  selected = '',
  onChange,
  label = 'Language',
}) {
  return (
    <div className="flex items-center gap-2">
      {label && (
        <label
          className="text-xs font-medium text-[var(--text-secondary)]"
          htmlFor="language-filter"
        >
          {label}
        </label>
      )}
      <select
        id="language-filter"
        value={selected}
        onChange={(e) => onChange?.(e.target.value)}
        className={cn(
          'rounded-[var(--radius-md)] border border-[var(--border-light)]',
          'bg-[var(--bg-elevated)] px-3 py-1.5 text-sm text-[var(--text-primary)]',
          'outline-none transition-shadow focus:border-[var(--accent-violet)]',
          'focus:shadow-[var(--shadow-glow)]',
          'cursor-pointer appearance-none',
        )}
        style={{ fontFamily: 'var(--font-sans)' }}
      >
        <option value="">All Languages</option>
        {languages.map((lang) => (
          <option key={lang} value={lang}>
            {lang.charAt(0).toUpperCase() + lang.slice(1)}
          </option>
        ))}
      </select>
    </div>
  );
}

export default LanguageFilter;
