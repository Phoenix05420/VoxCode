import { Copy, Star, Check, Sparkles, ExternalLink } from 'lucide-react';
import { useState } from 'react';
import { cn } from '../utils/cn';

export function TemplateCard({ template, language, onUse }) {
  const [copied, setCopied] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(template.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="editorial-card rounded-[2rem] p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl flex flex-col justify-between border border-[color:var(--border-color)] bg-[color:var(--bg-secondary)] group">
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <h3 className="display-title font-bold text-base text-[color:var(--text-primary)] group-hover:text-[color:var(--accent-primary)] transition-colors">
              {template.title}
            </h3>
            <span className="inline-block mt-1 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-[color:var(--bg-tertiary)] text-[color:var(--accent-primary)] border border-[color:var(--border-color)]">
              {language}
            </span>
          </div>
          <button
            onClick={() => setIsFavorite(!isFavorite)}
            className="p-2 rounded-xl bg-[color:var(--bg-tertiary)]/60 hover:bg-[color:var(--bg-tertiary)] transition-colors"
            title="Star Template"
          >
            <Star
              className={cn(
                'w-4 h-4 transition-transform transform active:scale-125',
                isFavorite ? 'fill-amber-400 text-amber-400' : 'text-[color:var(--text-secondary)]'
              )}
            />
          </button>
        </div>

        <div className="rounded-[1.25rem] bg-[color:var(--code-bg)] p-3.5 text-xs font-mono text-slate-300 overflow-hidden my-3 shadow-inner">
          <pre className="overflow-x-auto max-h-28 scrollbar-thin">
            <code>{template.code}</code>
          </pre>
        </div>
      </div>

      <div className="flex gap-2 mt-2 pt-2 border-t border-[color:var(--border-color)]">
        <button
          onClick={handleCopy}
          className={cn(
            'flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm',
            copied
              ? 'bg-emerald-500 text-white'
              : 'bg-[color:var(--bg-tertiary)] text-[color:var(--text-primary)] hover:bg-[color:var(--bg-tertiary)]/80'
          )}
        >
          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
        <button
          onClick={() => onUse?.(template.code)}
          className="flex-1 py-2.5 rounded-xl text-xs font-bold brand-gradient text-white shadow-md shadow-orange-500/20 hover:opacity-95 transition-all flex items-center justify-center gap-1.5 transform hover:scale-105"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Use in Studio</span>
        </button>
      </div>
    </div>
  );
}
