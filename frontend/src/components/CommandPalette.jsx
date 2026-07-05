import { Search, Copy, Check, Terminal, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { cn } from '../utils/cn';

export function CommandPalette({ commands, onSelect }) {
  const [search, setSearch] = useState('');
  const [copied, setCopied] = useState(null);

  const filtered = commands.filter(cmd =>
    cmd.command.toLowerCase().includes(search.toLowerCase()) ||
    cmd.description.toLowerCase().includes(search.toLowerCase())
  );

  const handleCopy = (cmd) => {
    navigator.clipboard.writeText(cmd.command);
    setCopied(cmd.command);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="editorial-card rounded-[2.5rem] border border-[color:var(--border-color)] p-6 bg-[color:var(--bg-secondary)] shadow-xl">
      <div className="mb-6 flex items-center bg-[color:var(--bg-tertiary)]/60 rounded-2xl px-4 py-3 border border-[color:var(--border-color)] focus-within:ring-2 focus-within:ring-[color:var(--accent-primary)]/50 transition-all">
        <Search className="w-5 h-5 text-[color:var(--text-secondary)]" />
        <input
          type="text"
          placeholder="Search 40+ spoken commands by keyword or description..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="ml-3 flex-1 bg-transparent text-sm font-medium text-[color:var(--text-primary)] placeholder-[color:var(--text-secondary)]/60 focus:outline-none"
        />
      </div>

      <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1 scrollbar-thin">
        {filtered.map((cmd) => (
          <div
            key={cmd.command}
            className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-[color:var(--bg-tertiary)]/40 hover:bg-[color:var(--bg-tertiary)] border border-[color:var(--border-color)]/50 transition-all group gap-3"
          >
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <div className="p-2.5 rounded-xl brand-gradient text-white shadow-sm shrink-0 mt-0.5">
                <Terminal size={16} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-mono text-sm font-bold text-[color:var(--text-primary)] group-hover:text-[color:var(--accent-primary)] transition-colors">
                    "{cmd.command}"
                  </p>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-[color:var(--bg-secondary)] text-[color:var(--text-secondary)] border border-[color:var(--border-color)]">
                    {cmd.category}
                  </span>
                </div>
                <p className="text-xs text-[color:var(--text-secondary)] mt-1 leading-relaxed">{cmd.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 self-end sm:self-center">
              {onSelect && (
                <button
                  onClick={() => onSelect(cmd.command)}
                  className="px-3 py-1.5 rounded-xl bg-[color:var(--bg-secondary)] hover:bg-[color:var(--accent-primary)] hover:text-white text-xs font-bold text-[color:var(--text-primary)] border border-[color:var(--border-color)] transition-all shadow-sm flex items-center gap-1"
                >
                  <Sparkles size={13} />
                  <span>Use in Studio</span>
                </button>
              )}
              <button
                onClick={() => handleCopy(cmd)}
                className={cn(
                  'p-2 rounded-xl transition-all shadow-sm flex items-center gap-1 text-xs font-bold',
                  copied === cmd.command
                    ? 'bg-emerald-500 text-white'
                    : 'bg-[color:var(--bg-secondary)] hover:bg-[color:var(--bg-tertiary)] text-[color:var(--text-primary)] border border-[color:var(--border-color)]'
                )}
                title="Copy Command"
              >
                {copied === cmd.command ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span className="sm:hidden">{copied === cmd.command ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-[color:var(--text-secondary)]">
          <p className="text-base font-semibold">No commands found matching "{search}"</p>
          <p className="text-xs mt-1">Try searching for keywords like "create", "rust", "api", "explain", or "optimize".</p>
        </div>
      )}
    </div>
  );
}
