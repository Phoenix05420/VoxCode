'use client';

import { FolderOpen, Trash2, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function ProjectCard({ project, onOpen, onDelete }) {
  if (!project) return null;

  return (
    <div className="surface-card group flex flex-col p-5">
      {/* Top row */}
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)]',
              'bg-[var(--accent-violet-bg)]',
            )}
          >
            <FolderOpen className="h-5 w-5 text-[var(--accent-violet)]" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">
              {project.name}
            </h3>
            {project.language && (
              <span className="badge badge-violet mt-0.5">{project.language}</span>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={() => onDelete?.(project)}
          className={cn(
            'rounded-[var(--radius-sm)] p-1.5 text-[var(--text-tertiary)]',
            'opacity-0 transition-all group-hover:opacity-100',
            'hover:bg-rose-50 hover:text-[var(--accent-rose)]',
            'dark:hover:bg-rose-950/30',
          )}
          title="Delete project"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {/* Description */}
      {project.description && (
        <p className="mb-3 line-clamp-2 text-xs leading-relaxed text-[var(--text-secondary)]">
          {project.description}
        </p>
      )}

      {/* Code preview */}
      {project.code && (
        <pre
          className={cn(
            'mb-3 max-h-16 overflow-hidden rounded-[var(--radius-sm)]',
            'bg-[var(--bg-secondary)] px-3 py-2 text-xs text-[var(--text-secondary)]',
          )}
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          {project.code.slice(0, 150)}
          {project.code.length > 150 && '…'}
        </pre>
      )}

      {/* Footer */}
      <div className="mt-auto flex items-center justify-between pt-2">
        <span className="text-xs text-[var(--text-tertiary)]">
          {formatDate(project.updatedAt)}
        </span>
        <button
          type="button"
          onClick={() => onOpen?.(project)}
          className={cn(
            'flex items-center gap-1.5 rounded-[var(--radius-md)] px-3 py-1.5',
            'text-xs font-medium text-white transition-all',
            'bg-[var(--accent-violet)] hover:opacity-90',
            'shadow-[var(--shadow-xs)] hover:shadow-[var(--shadow-sm)]',
          )}
        >
          Open in Studio
          <ExternalLink className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}

export default ProjectCard;
