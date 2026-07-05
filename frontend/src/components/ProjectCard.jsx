import { ExternalLink, Code2, Clock, Sparkles } from 'lucide-react';
import { cn } from '../utils/cn';

export function ProjectCard({ project, onOpen, onDelete }) {
  return (
    <div className="editorial-card rounded-[2rem] overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl group flex flex-col justify-between border border-[color:var(--border-color)] bg-[color:var(--bg-secondary)]">
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-pulse" />
            <h3 className="display-title font-bold text-lg text-[color:var(--text-primary)] group-hover:text-[color:var(--accent-primary)] transition-colors">
              {project.name}
            </h3>
          </div>
          <span className="text-xs px-3 py-1 rounded-full font-bold bg-[color:var(--bg-tertiary)] text-[color:var(--accent-primary)] border border-[color:var(--border-color)] shadow-sm">
            {project.language}
          </span>
        </div>
        <p className="text-xs text-[color:var(--text-secondary)] leading-relaxed line-clamp-2">
          {project.description || 'Voice-generated code session.'}
        </p>
      </div>

      {/* Code Preview */}
      <div className="mx-6 my-2 rounded-[1.25rem] bg-[color:var(--code-bg)] p-4 text-xs font-mono text-slate-300 overflow-hidden relative shadow-inner">
        <div className="absolute top-2 right-3 flex items-center gap-1.5 opacity-40">
          <Code2 size={12} className="text-orange-400" />
          <span className="text-[10px] text-slate-400 font-sans uppercase tracking-widest">Draft</span>
        </div>
        <pre className="overflow-x-auto max-h-24 scrollbar-thin">
          <code>{project.code?.substring(0, 280) || '// No code snippet recorded'}...</code>
        </pre>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 mt-2 border-t border-[color:var(--border-color)] bg-[color:var(--bg-tertiary)]/40 flex items-center justify-between">
        <span className="text-[11px] font-medium text-[color:var(--text-secondary)] flex items-center gap-1.5">
          <Clock size={12} />
          {new Date(project.updatedAt).toLocaleDateString()}
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => onOpen?.(project)}
            className="brand-gradient text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md shadow-orange-500/20 hover:opacity-95 transition-all flex items-center gap-1.5 transform hover:scale-105"
          >
            <span>Open in Studio</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
