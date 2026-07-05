import { Copy, Download, Check, Sparkles, Terminal } from 'lucide-react';
import { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { cn } from '../utils/cn';

export function CodePanel({ code, language = 'javascript', title = 'Generated Code', onCopy, onDownload }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    if (onCopy) onCopy();
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([code], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `voxcode_snippet.${getFileExtension(language)}`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    if (onDownload) onDownload();
  };

  return (
    <div className="editorial-card rounded-[2rem] border border-[color:var(--border-color)] overflow-hidden flex flex-col h-full bg-[color:var(--bg-secondary)] shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[color:var(--border-color)] bg-[color:var(--bg-tertiary)]/50">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-rose-400" />
          <div className="w-3 h-3 rounded-full bg-amber-400" />
          <div className="w-3 h-3 rounded-full bg-emerald-400" />
          <span className="ml-2 text-xs font-bold text-[color:var(--text-primary)] flex items-center gap-1.5">
            <Terminal size={14} className="text-[color:var(--accent-primary)]" />
            {title}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            disabled={!code}
            className={cn(
              'px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm disabled:opacity-40',
              copied ? 'bg-emerald-500 text-white' : 'bg-[color:var(--bg-secondary)] hover:bg-[color:var(--bg-tertiary)] text-[color:var(--text-primary)] border border-[color:var(--border-color)]'
            )}
            title="Copy code"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied!' : 'Copy Code'}</span>
          </button>
          <button
            onClick={handleDownload}
            disabled={!code}
            className="p-1.5 rounded-xl bg-[color:var(--bg-secondary)] hover:bg-[color:var(--bg-tertiary)] text-[color:var(--text-primary)] border border-[color:var(--border-color)] transition-all shadow-sm disabled:opacity-40"
            title="Download file"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Code Area */}
      <div className="flex-1 overflow-auto bg-[color:var(--code-bg)] p-2">
        {code ? (
          <SyntaxHighlighter
            language={language}
            style={atomDark}
            customStyle={{ margin: 0, padding: '1rem', background: 'transparent', fontSize: '0.85rem', lineHeight: '1.6' }}
            showLineNumbers={true}
          >
            {code}
          </SyntaxHighlighter>
        ) : (
          <div className="h-full flex flex-col items-center justify-center p-8 text-center text-slate-500 gap-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-800/60 flex items-center justify-center text-slate-400 animate-pulse">
              <Sparkles size={24} />
            </div>
            <p className="text-sm font-medium">No code generated yet.</p>
            <p className="text-xs max-w-xs text-slate-600">Use the voice microphone or speak a command to generate your first draft!</p>
          </div>
        )}
      </div>
    </div>
  );
}

function getFileExtension(language) {
  const extensions = {
    javascript: 'js',
    typescript: 'ts',
    python: 'py',
    java: 'java',
    cpp: 'cpp',
    csharp: 'cs',
    go: 'go',
    rust: 'rs',
    php: 'php',
    ruby: 'rb',
    kotlin: 'kt',
    swift: 'swift',
    html: 'html',
    css: 'css',
    sql: 'sql'
  };
  return extensions[language] || 'txt';
}
