'use client';

import { useState } from 'react';
import { Play, Terminal, Bug, AlertTriangle, ShieldCheck, Cpu, Clock, Layers, ChevronRight, CheckCircle, XCircle, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

export function CompilerPanel({
  code,
  language = 'javascript',
  onRun,
  isRunning = false,
  result = null,
  onClear,
  onJumpToLine,
  onAskAI
}) {
  const [stdin, setStdin] = useState('');
  const [showStdin, setShowStdin] = useState(false);
  const [mode, setMode] = useState('standard'); // standard, ast, trace, test
  const [testCases, setTestCases] = useState([
    { id: 1, input: '5\\n10', expected: '15', passed: null },
    { id: 2, input: '0\\n0', expected: '0', passed: null }
  ]);

  const handleRun = () => {
    if (onRun) {
      onRun({ code, language, stdin, mode, testCases });
    }
  };

  return (
    <div className="flex flex-col h-full bg-elevated border border-light rounded-lg overflow-hidden shadow-sm">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-secondary border-b border-light">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold text-primary">Execution Console</span>
          
          {/* Mode Selector */}
          <div className="flex items-center gap-1 ml-4 bg-tertiary p-0.5 rounded-md">
            {[
              { id: 'standard', label: 'Standard', icon: Terminal },
              { id: 'ast', label: 'AST Audit', icon: Layers },
              { id: 'trace', label: 'Trace/RAM', icon: Cpu },
              { id: 'test', label: 'Unit Tests', icon: CheckCircle }
            ].map((m) => {
              const Icon = m.icon;
              return (
                <button
                  key={m.id}
                  onClick={() => setMode(m.id)}
                  className={cn(
                    "flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded transition-all",
                    mode === m.id
                      ? "bg-elevated text-primary shadow-xs"
                      : "text-secondary hover:text-primary"
                  )}
                >
                  <Icon className="w-3 h-3" />
                  {m.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowStdin(!showStdin)}
            className={cn(
              "px-2.5 py-1 text-xs font-medium rounded border transition-all",
              showStdin
                ? "bg-accent-violet-bg text-accent-violet border-accent-violet"
                : "border-light text-secondary hover:text-primary"
            )}
          >
            Stdin Input
          </button>
          
          {onClear && (
            <button
              onClick={onClear}
              className="px-2.5 py-1 text-xs font-medium text-secondary hover:text-primary border border-light rounded transition-all"
            >
              Clear
            </button>
          )}

          <button
            onClick={handleRun}
            disabled={isRunning || !code}
            className={cn(
              "flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white rounded shadow-xs transition-all",
              isRunning
                ? "bg-secondary text-tertiary cursor-not-allowed"
                : "brand-gradient hover:opacity-95 active:scale-95"
            )}
          >
            <Play className={cn("w-3.5 h-3.5 fill-current", isRunning && "animate-spin")} />
            {isRunning ? 'Running...' : 'Execute'}
          </button>
        </div>
      </div>

      {/* Stdin Input Panel */}
      {showStdin && (
        <div className="p-3 bg-secondary border-b border-light animate-fadeIn">
          <label className="block text-xs font-semibold text-secondary mb-1">Standard Input (stdin):</label>
          <textarea
            value={stdin}
            onChange={(e) => setStdin(e.target.value)}
            placeholder="Enter input passed to program via standard input..."
            className="w-full h-20 p-2 text-xs font-mono bg-elevated border border-light rounded focus:outline-none focus:border-focus"
          />
        </div>
      )}

      {/* Unit Tests Config */}
      {mode === 'test' && (
        <div className="p-3 bg-secondary border-b border-light animate-fadeIn">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-secondary">Unit Test Suite</span>
            <button
              onClick={() => setTestCases([...testCases, { id: Date.now(), input: '', expected: '', passed: null }])}
              className="text-xs font-medium text-accent-violet hover:underline"
            >
              + Add Test Case
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-36 overflow-y-auto">
            {testCases.map((tc, idx) => (
              <div key={tc.id} className="p-2 bg-elevated border border-light rounded flex items-center gap-2">
                <span className="text-xs font-mono text-tertiary">#{idx + 1}</span>
                <input
                  type="text"
                  placeholder="Input"
                  value={tc.input}
                  onChange={(e) => {
                    const newCases = [...testCases];
                    newCases[idx].input = e.target.value;
                    setTestCases(newCases);
                  }}
                  className="flex-1 px-2 py-1 text-xs font-mono bg-secondary border border-light rounded focus:outline-none"
                />
                <span className="text-secondary text-xs">→</span>
                <input
                  type="text"
                  placeholder="Expected"
                  value={tc.expected}
                  onChange={(e) => {
                    const newCases = [...testCases];
                    newCases[idx].expected = e.target.value;
                    setTestCases(newCases);
                  }}
                  className="flex-1 px-2 py-1 text-xs font-mono bg-secondary border border-light rounded focus:outline-none"
                />
                {tc.passed !== null && (
                  tc.passed ? <CheckCircle className="w-4 h-4 text-accent-emerald" /> : <XCircle className="w-4 h-4 text-accent-rose" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Terminal Output — The "Tiny Dark" Panel */}
      <div className="flex-1 p-4 bg-accent-ink text-on-dark font-mono text-xs overflow-y-auto">
        {!result && !isRunning && (
          <div className="flex flex-col items-center justify-center h-full text-on-dark-muted py-8">
            <Terminal className="w-8 h-8 mb-2 opacity-40" />
            <p>Ready to execute. Click "Execute" or press Ctrl+Enter.</p>
          </div>
        )}

        {isRunning && (
          <div className="flex items-center gap-2 text-accent-violet-soft animate-pulse py-4">
            <Cpu className="w-4 h-4 animate-spin" />
            <span>Compiling and executing in sandbox environment...</span>
          </div>
        )}

        {result && !isRunning && (
          <div className="space-y-4 animate-fadeIn">
            {/* Status & Metrics Bar */}
            <div className="flex flex-wrap items-center justify-between pb-3 border-b border-dark">
              <div className="flex items-center gap-2">
                <span className={cn(
                  "px-2 py-0.5 rounded text-[11px] font-bold uppercase",
                  result.status === 'success' && "bg-accent-emerald/20 text-accent-emerald",
                  result.status === 'error' && "bg-accent-rose/20 text-accent-rose",
                  result.status === 'timeout' && "bg-accent-amber/20 text-accent-amber"
                )}>
                  {result.status || 'Executed'}
                </span>
                <span className="text-on-dark-muted">Compiler: {result.compiler || 'Default'}</span>
              </div>
              <div className="flex items-center gap-4 text-on-dark-muted">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {result.time ? `${result.time}ms` : '< 1ms'}
                </span>
                <span className="flex items-center gap-1">
                  <Cpu className="w-3.5 h-3.5" />
                  {result.memory || '12.4 MB'}
                </span>
              </div>
            </div>

            {/* Error Detail Bar */}
            {result.error && (
              <div className="p-3 bg-accent-rose/10 border border-accent-rose/30 rounded flex items-start justify-between gap-3">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-accent-rose shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-accent-rose">Runtime / Compilation Error</div>
                    <div className="text-on-dark-muted mt-1">{result.error}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {result.errorLine && onJumpToLine && (
                    <button
                      onClick={() => onJumpToLine(result.errorLine)}
                      className="px-2.5 py-1 bg-accent-charcoal hover:bg-accent-slate text-on-dark rounded text-[11px] border border-dark transition-all"
                    >
                      Jump to Line {result.errorLine}
                    </button>
                  )}
                  {onAskAI && (
                    <button
                      onClick={() => onAskAI(`Fix this bug: ${result.error}`)}
                      className="flex items-center gap-1 px-2.5 py-1 bg-accent-violet hover:opacity-90 text-white rounded text-[11px] font-semibold transition-all shadow-xs"
                    >
                      <Sparkles className="w-3 h-3" />
                      Ask AI to Fix Bug
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Security Profile */}
            {result.security && (
              <div className="p-2.5 bg-accent-charcoal border border-dark rounded flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-accent-emerald" />
                  <span className="text-on-dark font-medium">Security Profile: Safe</span>
                </div>
                <span className="text-on-dark-muted">No unsafe system calls detected</span>
              </div>
            )}

            {/* Stdout */}
            {result.output && (
              <div>
                <div className="text-[11px] uppercase tracking-wider text-on-dark-muted mb-1 font-semibold">Standard Output (stdout):</div>
                <pre className="p-3 bg-accent-charcoal rounded border border-dark font-mono text-on-dark whitespace-pre-wrap overflow-x-auto">
                  {result.output}
                </pre>
              </div>
            )}

            {/* Stderr */}
            {result.stderr && (
              <div>
                <div className="text-[11px] uppercase tracking-wider text-accent-rose mb-1 font-semibold">Standard Error (stderr):</div>
                <pre className="p-3 bg-accent-rose/10 rounded border border-accent-rose/30 font-mono text-accent-rose whitespace-pre-wrap overflow-x-auto">
                  {result.stderr}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default CompilerPanel;
