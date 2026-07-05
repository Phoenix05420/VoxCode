import React, { useState } from 'react';
import { 
  Terminal, Play, RefreshCw, Trash2, AlertTriangle, CheckCircle2, Clock, 
  Cpu, ShieldAlert, ChevronDown, ChevronUp, ShieldCheck, HardDrive, 
  Sparkles, ArrowRight, Check, Copy, Bug, TestTube, Zap
} from 'lucide-react';
import { cn } from '../utils/cn';

export function CompilerPanel({ 
  code, 
  language, 
  onRun, 
  isRunning, 
  result, 
  onClear,
  onJumpToLine,
  onAskAI
}) {
  const [stdin, setStdin] = useState('');
  const [showStdin, setShowStdin] = useState(false);
  const [mode, setMode] = useState('standard'); // 'standard' | 'audit' | 'trace' | 'test'
  
  // Unit test cases state
  const [testCases, setTestCases] = useState([
    { id: 1, stdin: "5\n", expected_stdout: "25" },
    { id: 2, stdin: "10\n", expected_stdout: "100" }
  ]);
  const [copiedCmd, setCopiedCmd] = useState(false);

  const handleRunClick = () => {
    if (onRun) {
      onRun(stdin, mode, mode === 'test' ? testCases : null);
    }
  };

  const addTestCase = () => {
    setTestCases([
      ...testCases, 
      { id: Date.now(), stdin: "", expected_stdout: "" }
    ]);
  };

  const updateTestCase = (index, field, value) => {
    const updated = [...testCases];
    updated[index][field] = value;
    setTestCases(updated);
  };

  const removeTestCase = (index) => {
    setTestCases(testCases.filter((_, i) => i !== index));
  };

  const getStatusBadge = () => {
    if (isRunning) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-bold border border-amber-500/20 animate-pulse">
          <RefreshCw size={12} className="animate-spin" />
          <span>Executing ({mode.toUpperCase()})...</span>
        </span>
      );
    }
    if (!result) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[color:var(--bg-tertiary)] text-[color:var(--text-secondary)] text-xs font-bold border border-[color:var(--border-color)]">
          <Terminal size={12} />
          <span>Ready ({mode.toUpperCase()} Mode)</span>
        </span>
      );
    }
    if (result.status === 'success') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/20">
          <CheckCircle2 size={12} />
          <span>{result.mode === 'audit' ? 'Security Audit Complete' : result.mode === 'test' ? 'All Tests Passed (100%)' : 'Success (Exit 0)'}</span>
        </span>
      );
    }
    if (result.status === 'timeout') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 text-rose-400 text-xs font-bold border border-rose-500/20">
          <Clock size={12} />
          <span>Execution Timed Out</span>
        </span>
      );
    }
    if (result.status === 'test_failure') {
      const passRate = result.test_report?.pass_rate || 0;
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 text-rose-400 text-xs font-bold border border-rose-500/20">
          <TestTube size={12} />
          <span>Test Failure ({passRate}% Passed)</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 text-rose-400 text-xs font-bold border border-rose-500/20">
        <AlertTriangle size={12} />
        <span>{result.status === 'compilation_error' ? 'Compilation Failed' : `Runtime Error (Exit ${result.exit_code})`}</span>
      </span>
    );
  };

  return (
    <div className="flex flex-col h-full bg-[#0d1117] rounded-2xl border border-[color:var(--border-color)] overflow-hidden shadow-2xl font-mono">
      {/* Console Header Bar */}
      <div className="flex flex-wrap items-center justify-between px-4 py-3 bg-[#161b22] border-b border-[color:var(--border-color)] gap-2">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm font-bold text-gray-200">
            <Terminal size={16} className="text-[color:var(--accent-primary)]" />
            <span>Extreme Compiler 2.0</span>
          </div>
          {getStatusBadge()}
        </div>

        {/* Execution Mode Selector Tabs */}
        <div className="flex items-center gap-1 bg-[#0d1117] p-1 rounded-xl border border-gray-800 text-xs">
          <button
            onClick={() => setMode('standard')}
            className={cn("px-2.5 py-1 rounded-lg font-bold transition-all flex items-center gap-1", mode === 'standard' ? "bg-sky-500/20 text-sky-400 border border-sky-500/30" : "text-gray-400 hover:text-white")}
            title="Standard Execution"
          >
            <Play size={11} />
            <span>Standard</span>
          </button>
          <button
            onClick={() => setMode('audit')}
            className={cn("px-2.5 py-1 rounded-lg font-bold transition-all flex items-center gap-1", mode === 'audit' ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" : "text-gray-400 hover:text-white")}
            title="Deep AST & Vulnerability Audit"
          >
            <ShieldCheck size={11} />
            <span>AST Audit</span>
          </button>
          <button
            onClick={() => setMode('trace')}
            className={cn("px-2.5 py-1 rounded-lg font-bold transition-all flex items-center gap-1", mode === 'trace' ? "bg-purple-500/20 text-purple-400 border border-purple-500/30" : "text-gray-400 hover:text-white")}
            title="RAM Profiling & Step Trace"
          >
            <Bug size={11} />
            <span>Trace / RAM</span>
          </button>
          <button
            onClick={() => setMode('test')}
            className={cn("px-2.5 py-1 rounded-lg font-bold transition-all flex items-center gap-1", mode === 'test' ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "text-gray-400 hover:text-white")}
            title="Automated Unit Test Benchmarking"
          >
            <TestTube size={11} />
            <span>Unit Tests</span>
          </button>
        </div>

        {/* Right Action Toolbar */}
        <div className="flex items-center gap-3">
          {result?.execution_time_ms !== undefined && (
            <div className="flex items-center gap-1.5 text-xs text-gray-300 bg-[#0d1117] px-2.5 py-1 rounded-lg border border-gray-800">
              <Cpu size={12} className="text-sky-400" />
              <span>{result.execution_time_ms} ms</span>
            </div>
          )}

          {result?.memory_peak_mb !== undefined && result.memory_peak_mb !== null && (
            <div className="flex items-center gap-1.5 text-xs text-purple-300 bg-purple-950/30 px-2.5 py-1 rounded-lg border border-purple-500/30">
              <HardDrive size={12} className="text-purple-400" />
              <span>{result.memory_peak_mb} MB</span>
            </div>
          )}

          {result?.security_profile && (
            <div className={cn(
              "flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg border font-bold",
              result.security_profile.risk_level === 'LOW' ? "bg-emerald-950/30 text-emerald-400 border-emerald-500/30" :
              result.security_profile.risk_level === 'MEDIUM' ? "bg-amber-950/30 text-amber-400 border-amber-500/30" :
              "bg-rose-950/30 text-rose-400 border-rose-500/30"
            )}>
              <ShieldCheck size={12} />
              <span>Safety: {result.security_profile.safety_score}/100</span>
            </div>
          )}

          {mode !== 'test' && (
            <button
              onClick={() => setShowStdin(!showStdin)}
              className={cn(
                "px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 border",
                showStdin || stdin ? "bg-sky-500/10 text-sky-400 border-sky-500/30" : "bg-gray-800 text-gray-400 border-gray-700 hover:text-white"
              )}
            >
              <span>Stdin {stdin ? '(Active)' : ''}</span>
              {showStdin ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </button>
          )}

          <button
            onClick={onClear}
            className="p-1.5 rounded-lg text-gray-400 hover:text-rose-400 hover:bg-gray-800 transition-colors"
            title="Clear Console"
          >
            <Trash2 size={14} />
          </button>

          <button
            onClick={handleRunClick}
            disabled={isRunning || !code}
            className="brand-gradient text-white px-4 py-1.5 rounded-xl font-bold text-xs shadow-lg shadow-orange-500/20 hover:opacity-95 transition-all flex items-center gap-1.5 disabled:opacity-50 transform active:scale-95"
          >
            {isRunning ? (
              <>
                <RefreshCw size={14} className="animate-spin" />
                <span>Running...</span>
              </>
            ) : (
              <>
                <Play size={14} className="fill-white" />
                <span>Execute ({mode.toUpperCase()})</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Interactive Error & Recommendation Bar (v2.0 Jump-to-Line & AI Debug) */}
      {result?.error_details && (
        <div className="bg-rose-950/60 border-b border-rose-500/40 px-4 py-3 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs text-rose-200">
          <div className="flex items-start gap-2.5">
            <AlertTriangle size={18} className="text-rose-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-rose-300 flex items-center gap-2">
                <span>{result.error_details.error_type}</span>
                {result.error_details.line_number && (
                  <span className="bg-rose-500/20 px-2 py-0.5 rounded text-[11px] border border-rose-500/30">
                    Line {result.error_details.line_number}
                  </span>
                )}
              </div>
              <div className="mt-0.5 text-gray-300">{result.error_details.message}</div>
              {result.error_details.recommendation && (
                <div className="mt-1.5 p-2 bg-[#0d1117] rounded-lg border border-amber-500/30 text-amber-300 flex items-center justify-between gap-4">
                  <span>💡 {result.error_details.recommendation}</span>
                  {result.error_details.recommendation.includes('pip install') && (
                    <button
                      onClick={() => {
                        const cmd = result.error_details.recommendation.match(/pip install \w+/)?.[0];
                        if (cmd) {
                          navigator.clipboard.writeText(cmd);
                          setCopiedCmd(true);
                          setTimeout(() => setCopiedCmd(false), 2000);
                        }
                      }}
                      className="px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/40 text-amber-200 font-bold flex items-center gap-1 shrink-0"
                    >
                      {copiedCmd ? <Check size={12} /> : <Copy size={12} />}
                      <span>{copiedCmd ? 'Copied' : 'Copy Pip Cmd'}</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {result.error_details.line_number && onJumpToLine && (
              <button
                onClick={() => onJumpToLine(result.error_details.line_number)}
                className="px-3 py-1.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-white font-bold flex items-center gap-1.5 border border-gray-600 transition-all"
              >
                <ArrowRight size={13} className="text-sky-400" />
                <span>Jump to Line {result.error_details.line_number}</span>
              </button>
            )}
            {onAskAI && (
              <button
                onClick={() => onAskAI(`Fix this runtime error in my ${language} code on line ${result.error_details?.line_number || 'unknown'}: ${result.error_details?.error_type} - ${result.error_details?.message}`)}
                className="brand-gradient text-white px-3.5 py-1.5 rounded-xl font-bold flex items-center gap-1.5 shadow-md shadow-orange-500/20 hover:opacity-90 transition-all"
              >
                <Sparkles size={13} />
                <span>Ask AI to Fix Bug</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Safety Guardrail Warnings */}
      {result?.security_profile && result.security_profile.findings?.length > 0 && mode !== 'audit' && (
        <div className="bg-amber-950/40 border-b border-amber-500/30 px-4 py-2 flex items-start gap-2.5 text-amber-300 text-xs">
          <ShieldAlert size={16} className="text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Sandbox Safety Warning ({result.security_profile.risk_level}): </span>
            <span>{result.security_profile.findings[0].message}</span>
            {result.security_profile.findings.length > 1 && (
              <span className="ml-2 underline text-amber-400 cursor-pointer" onClick={() => setMode('audit')}>
                (+{result.security_profile.findings.length - 1} more in AST Audit tab)
              </span>
            )}
          </div>
        </div>
      )}

      {/* Stdin Box (when Standard/Trace mode) */}
      {(showStdin || stdin) && mode !== 'test' && mode !== 'audit' && (
        <div className="px-4 py-2.5 bg-[#1f242d] border-b border-gray-800 transition-all">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-sky-400 flex items-center gap-1">
              <span>Standard Input (stdin):</span>
              <span className="text-gray-400 font-normal">Provide input for input() or cin &gt;&gt; calls</span>
            </span>
            {stdin && (
              <button onClick={() => setStdin('')} className="text-[10px] text-gray-400 hover:text-rose-400 underline">
                Clear Input
              </button>
            )}
          </div>
          <textarea
            value={stdin}
            onChange={(e) => setStdin(e.target.value)}
            placeholder="Type standard input here (one value per line)..."
            rows={2}
            className="w-full bg-[#0d1117] text-gray-200 text-xs p-2.5 rounded-lg border border-gray-700 focus:outline-none focus:border-sky-500 font-mono resize-y"
          />
        </div>
      )}

      {/* Unit Test Cases Configuration Box (when Mode == 'test') */}
      {mode === 'test' && (
        <div className="px-4 py-3 bg-[#161b22] border-b border-gray-800 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
              <TestTube size={14} />
              <span>Unit Test Benchmarking Suite (Automated Auto-Grading):</span>
            </span>
            <button
              onClick={addTestCase}
              className="px-2.5 py-1 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-bold border border-emerald-500/30 flex items-center gap-1"
            >
              <span>+ Add Test Case</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[140px] overflow-y-auto pr-1">
            {testCases.map((tc, idx) => (
              <div key={tc.id} className="p-2.5 rounded-xl bg-[#0d1117] border border-gray-800 flex flex-col gap-1.5 text-xs relative group">
                <div className="flex items-center justify-between text-[11px] font-bold text-gray-400">
                  <span>Test Case #{idx + 1}</span>
                  {testCases.length > 1 && (
                    <button onClick={() => removeTestCase(idx)} className="text-gray-500 hover:text-rose-400">
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500 w-12 shrink-0">Stdin:</span>
                  <input
                    type="text"
                    value={tc.stdin.replace(/\n/g, '\\n')}
                    onChange={(e) => updateTestCase(idx, 'stdin', e.target.value.replace(/\\n/g, '\n'))}
                    placeholder="e.g. 5\n"
                    className="flex-1 bg-[#161b22] px-2 py-1 rounded border border-gray-700 text-gray-200 focus:outline-none focus:border-sky-500 font-mono"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500 w-12 shrink-0">Expected:</span>
                  <input
                    type="text"
                    value={tc.expected_stdout}
                    onChange={(e) => updateTestCase(idx, 'expected_stdout', e.target.value)}
                    placeholder="e.g. 25"
                    className="flex-1 bg-[#161b22] px-2 py-1 rounded border border-gray-700 text-gray-200 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Console Output Terminal Window */}
      <div className="flex-1 p-4 overflow-y-auto min-h-[220px] max-h-[450px] space-y-3 bg-[#0d1117] text-xs leading-relaxed selection:bg-orange-500/30">
        {!result && !isRunning && (
          <div className="flex flex-col items-center justify-center h-48 text-gray-500 space-y-2">
            <Terminal size={32} className="text-gray-700 animate-pulse" />
            <p>Ready in <span className="text-sky-400 font-bold">{mode.toUpperCase()}</span> mode. Click "Execute" or speak <span className="text-[color:var(--accent-primary)] font-bold">"run this code"</span>.</p>
          </div>
        )}

        {isRunning && (
          <div className="flex items-center gap-3 text-amber-400 py-8 px-4 animate-pulse">
            <RefreshCw size={18} className="animate-spin" />
            <span>Executing in {mode.toUpperCase()} mode with sandbox isolation...</span>
          </div>
        )}

        {result && (
          <>
            {/* Compiler Output */}
            {result.compiler_output && (
              <div className="space-y-1">
                <div className="text-[11px] uppercase tracking-wider text-gray-500 font-bold">[Compiler Output]</div>
                <pre className={cn(
                  "p-3 rounded-xl overflow-x-auto whitespace-pre-wrap border",
                  result.status === 'compilation_error' ? "bg-rose-950/20 text-rose-300 border-rose-500/30" : "bg-gray-900 text-gray-300 border-gray-800"
                )}>
                  {result.compiler_output}
                </pre>
              </div>
            )}

            {/* Standard Output (stdout) */}
            {result.stdout && (
              <div className="space-y-1">
                <div className="text-[11px] uppercase tracking-wider text-emerald-500 font-bold">
                  {mode === 'audit' ? '[AST Security & Vulnerability Report]' : mode === 'test' ? '[Automated Benchmarking Suite Report]' : '[Standard Output - stdout]'}
                </div>
                <pre className="p-3 bg-[#161b22] text-emerald-300 rounded-xl overflow-x-auto whitespace-pre-wrap border border-gray-800 shadow-inner">
                  {result.stdout}
                </pre>
              </div>
            )}

            {/* Standard Error (stderr) */}
            {result.stderr && (
              <div className="space-y-1">
                <div className="text-[11px] uppercase tracking-wider text-rose-400 font-bold">[Standard Error / Exceptions - stderr]</div>
                <pre className="p-3 bg-rose-950/30 text-rose-300 rounded-xl overflow-x-auto whitespace-pre-wrap border border-rose-500/30 shadow-inner">
                  {result.stderr}
                </pre>
              </div>
            )}

            {!result.stdout && !result.stderr && !result.compiler_output && (
              <div className="text-gray-500 italic py-4">
                Program completed successfully with no output (stdout/stderr empty).
              </div>
            )}
          </>
        )}
      </div>

      {/* Console Footer */}
      <div className="px-4 py-2 bg-[#161b22] border-t border-[color:var(--border-color)] flex flex-wrap items-center justify-between text-[11px] text-gray-500 gap-2">
        <div className="flex items-center gap-3">
          <span>Sandbox: Local OS Process Isolation</span>
          <span>•</span>
          <span>Mode: <strong className="text-gray-300">{mode.toUpperCase()}</strong></span>
        </div>
        <div className="flex items-center gap-3">
          <span>Timeout Limit: 5.0s</span>
          {result?.compiler_version && <span>• Runtime: <strong className="text-gray-300">{result.compiler_version}</strong></span>}
        </div>
      </div>
    </div>
  );
}
export default CompilerPanel;
