'use client';

import { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Check, ClipboardCopy, Download } from 'lucide-react';
import { cn } from '@/lib/utils';

/** Map language names to file extensions */
function getFileExtension(language) {
  const map = {
    javascript: 'js',
    typescript: 'ts',
    python: 'py',
    java: 'java',
    cpp: 'cpp',
    c: 'c',
    csharp: 'cs',
    go: 'go',
    rust: 'rs',
    ruby: 'rb',
    php: 'php',
    swift: 'swift',
    kotlin: 'kt',
    html: 'html',
    css: 'css',
  };
  return map[(language || '').toLowerCase()] || 'txt';
}

export function CodePanel({
  code = '',
  language = 'javascript',
  title,
  onCopy,
  onDownload,
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      onCopy?.();
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard API may fail in insecure contexts
    }
  };

  const handleDownload = () => {
    const ext = getFileExtension(language);
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `code.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    onDownload?.();
  };

  return (
    <div
      className="overflow-hidden rounded-[var(--radius-lg)] shadow-[var(--shadow-dark-card)]"
      style={{ background: 'var(--code-bg)' }}
    >
      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-white/8 px-4 py-2.5">
        {/* macOS dots */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-[#FF5F57]" />
            <span className="h-3 w-3 rounded-full bg-[#FEBC2E]" />
            <span className="h-3 w-3 rounded-full bg-[#28C840]" />
          </div>
          {title && (
            <span
              className="text-xs font-medium tracking-wide"
              style={{ color: 'var(--text-on-dark-muted)' }}
            >
              {title}
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <span
            className="badge mr-2 text-[10px]"
            style={{
              background: 'var(--accent-violet-bg)',
              color: 'var(--accent-violet-soft)',
            }}
          >
            {language}
          </span>

          <button
            type="button"
            onClick={handleCopy}
            className={cn(
              'rounded-[var(--radius-sm)] p-1.5 transition-colors',
              'hover:bg-white/10',
            )}
            style={{ color: 'var(--text-on-dark-muted)' }}
            title="Copy code"
          >
            {copied ? (
              <Check className="h-4 w-4 text-[var(--accent-emerald)]" />
            ) : (
              <ClipboardCopy className="h-4 w-4" />
            )}
          </button>

          <button
            type="button"
            onClick={handleDownload}
            className={cn(
              'rounded-[var(--radius-sm)] p-1.5 transition-colors',
              'hover:bg-white/10',
            )}
            style={{ color: 'var(--text-on-dark-muted)' }}
            title="Download file"
          >
            <Download className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Code body */}
      <div className="overflow-auto">
        <SyntaxHighlighter
          language={language}
          style={atomDark}
          showLineNumbers
          customStyle={{
            margin: 0,
            padding: '16px',
            background: 'transparent',
            fontSize: '13px',
            lineHeight: '1.65',
            fontFamily: 'var(--font-mono)',
          }}
          lineNumberStyle={{
            minWidth: '2.5em',
            paddingRight: '1em',
            color: 'rgba(255,255,255,0.2)',
            userSelect: 'none',
          }}
        >
          {code}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}

export default CodePanel;
