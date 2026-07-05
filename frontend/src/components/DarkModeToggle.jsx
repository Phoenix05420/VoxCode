import { useTheme } from '../context/ThemeContext';
import { Moon, Sun } from 'lucide-react';
import { cn } from '../utils/cn';

export function DarkModeToggle() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        'p-2 rounded-lg transition-colors',
        'hover:bg-slate-200 dark:hover:bg-slate-700'
      )}
      aria-label="Toggle dark mode"
    >
      {isDark ? (
        <Sun className="w-5 h-5 text-slate-400" />
      ) : (
        <Moon className="w-5 h-5 text-slate-600" />
      )}
    </button>
  );
}
