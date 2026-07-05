import { AlertCircle, CheckCircle, Info } from 'lucide-react';
import { cn } from '../utils/cn';

export function Alert({ type = 'info', title, message, onClose }) {
  const iconClasses = {
    info: 'text-blue-500',
    success: 'text-green-500',
    warning: 'text-yellow-500',
    error: 'text-red-500',
  };

  const borderClasses = {
    info: 'border-blue-500/30 bg-blue-500/10',
    success: 'border-green-500/30 bg-green-500/10',
    warning: 'border-yellow-500/30 bg-yellow-500/10',
    error: 'border-red-500/30 bg-red-500/10',
  };

  const Icon = type === 'success' ? CheckCircle : AlertCircle;

  return (
    <div className={cn(
      'flex items-start gap-3 rounded-lg border p-4',
      borderClasses[type]
    )}>
      <Icon className={cn('w-5 h-5 flex-shrink-0 mt-0.5', iconClasses[type])} />
      <div className="flex-1">
        {title && <p className="font-semibold text-white">{title}</p>}
        {message && <p className="text-sm text-slate-300 mt-1">{message}</p>}
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-300 transition-colors"
        >
          ×
        </button>
      )}
    </div>
  );
}
