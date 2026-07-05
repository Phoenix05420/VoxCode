import { Trash2, Copy, Eye, Check, Clock } from 'lucide-react';
import { useState } from 'react';
import { cn } from '../utils/cn';

export function HistoryItem({ item, onDelete, onCopy, onView }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(item.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    onCopy?.();
  };

  return (
    <div className="editorial-card rounded-[1.8rem] p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl group border border-[color:var(--border-color)] bg-[color:var(--bg-secondary)]">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="display-title font-bold text-base text-[color:var(--text-primary)] truncate group-hover:text-[color:var(--accent-primary)] transition-colors">
              {item.title || 'Untitled Snippet'}
            </h3>
            <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold bg-[color:var(--bg-tertiary)] text-[color:var(--accent-primary)] border border-[color:var(--border-color)]">
              {item.language}
            </span>
          </div>
          <p className="text-xs text-[color:var(--text-secondary)] flex items-center gap-1">
            <Clock size={12} />
            <span>Saved {new Date(item.createdAt).toLocaleString()}</span>
          </p>
        </div>
        <div className="flex gap-1.5 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onView?.(item)}
            className="p-2 rounded-xl bg-[color:var(--bg-tertiary)] hover:bg-[color:var(--accent-primary)] hover:text-white text-[color:var(--text-primary)] transition-all shadow-sm"
            title="Open in Editor Studio"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={handleCopy}
            className={cn(
              'p-2 rounded-xl transition-all shadow-sm flex items-center gap-1',
              copied ? 'bg-emerald-500 text-white font-bold' : 'bg-[color:var(--bg-tertiary)] hover:bg-sky-500 hover:text-white text-[color:var(--text-primary)]'
            )}
            title="Copy Code"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          </button>
          <button
            onClick={() => onDelete?.(item.id)}
            className="p-2 rounded-xl bg-[color:var(--bg-tertiary)] hover:bg-rose-500 text-rose-500 hover:text-white transition-all shadow-sm"
            title="Delete Snippet"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="rounded-[1.25rem] bg-[color:var(--code-bg)] p-3.5 text-xs font-mono text-slate-300 overflow-hidden shadow-inner">
        <pre className="overflow-x-auto max-h-24 scrollbar-thin">
          <code>{item.code?.substring(0, 300)}...</code>
        </pre>
      </div>
    </div>
  );
}
