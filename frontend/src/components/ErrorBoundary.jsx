import { AlertCircle } from 'lucide-react';

export function ErrorBoundary({ children, error, reset }) {
  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg border border-red-700/50 p-8 max-w-md">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="w-6 h-6 text-red-500" />
            <h1 className="text-xl font-bold text-white">Something went wrong</h1>
          </div>
          <p className="text-slate-300 text-sm mb-6">{error?.message || 'An unexpected error occurred'}</p>
          <button
            onClick={reset}
            className="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium hover:shadow-lg transition-all"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return children;
}
