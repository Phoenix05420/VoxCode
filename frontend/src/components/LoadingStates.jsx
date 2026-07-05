import { Loader2 } from 'lucide-react';

export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center p-8">
      <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg border border-slate-700 p-4 animate-pulse">
      <div className="h-4 bg-slate-700 rounded w-3/4 mb-3" />
      <div className="h-3 bg-slate-700 rounded w-1/2 mb-3" />
      <div className="h-20 bg-slate-700 rounded" />
    </div>
  );
}

export function SkeletonLine() {
  return <div className="h-4 bg-slate-700 rounded animate-pulse" />;
}
