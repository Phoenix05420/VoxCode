import { ChevronRight, Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../utils/cn';

export function Breadcrumb({ items = [] }) {
  if (items.length === 0) return null;

  return (
    <nav className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[color:var(--text-secondary)] mb-2">
      <Link to="/dashboard" className="hover:text-[color:var(--accent-primary)] transition-colors flex items-center gap-1">
        <Home size={13} />
        <span>Studio</span>
      </Link>
      <ChevronRight className="w-3.5 h-3.5 opacity-50" />
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          {item.href ? (
            <Link
              to={item.href}
              className="hover:text-[color:var(--accent-primary)] transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-[color:var(--text-primary)] font-extrabold">{item.label}</span>
          )}
          {index < items.length - 1 && (
            <ChevronRight className="w-3.5 h-3.5 opacity-50" />
          )}
        </div>
      ))}
    </nav>
  );
}
