import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { Layout } from '../components/Layout';
import { Breadcrumb } from '../components/Breadcrumb';
import { LanguageFilter } from '../components/LanguageFilter';
import { CompilerPanel } from '../components/CompilerPanel';
import { useLocalMic } from '../hooks/useLocalMic';
import { useVoiceFeedback } from '../hooks/useVoiceFeedback';
import { codeService } from '../services/geminiService';
import { shortcutStore } from '../services/shortcutStore';
import { useShortcutKeys } from '../hooks/useShortcutKeys';
import { 
  Play, Save, Download, Copy, Check, Sparkles, Mic, Square, 
  Activity, Zap, BrainCircuit, Terminal, RefreshCw, AlertCircle, Volume2
} from 'lucide-react';
import { cn } from '../utils/cn';
import { LANGUAGES } from '../utils/constants';

// Waveform visualizer for real-time audio RMS monitoring
const WaveformBar = ({ level, active }) => {
  const bars = Array.from({ length: 16 });
  return (
    <div className="flex items-end gap-1 h-8 px-3 py-1 bg-[color:var(--bg-tertiary)]/50 rounded-xl border border-[color:var(--border-color)]">
      {bars.map((_, i) => (
        <div 
          key={i} 
          className={cn(
            "w-1 rounded-full transition-all duration-150",
            active ? "bg-gradient-to-t from-orange-500 to-amber-400" : "bg-[color:var(--text-secondary)]/30"
          )}
          style={{ 
            height: active ? `${Math.max(15, Math.min(100, level * (80 + Math.random() * 60)))}%` : '20%',
            animationDelay: `${i * 0.05}s` 
          }}
        />
      ))}
    </div>
  );
};

export default function CodeEditor() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Real Voice & AI Engine Hooks
  const { isListening, transcript, analysis, audioLevel, error: micError, startRecording, stopRecording, clearTranscript } = useLocalMic();
  const { speak } = useVoiceFeedback();

  // Studio State
  const [code, setCode] = useState('// Welcome to VoxCode Pro Studio\n// Speak an instruction or type a prompt below to generate code.\n\nfunction initializeStudio() {\n  console.log("Voice-first coding engine ready.");\n}');
  const [language, setLanguage] = useState('javascript');
  const [title, setTitle] = useState('Untitled Snippet');
  const [promptText, setPromptText] = useState('');
  
  // AI Execution State
  const [isGenerating, setIsGenerating] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isExplaining, setIsExplaining] = useState(false);
  const [explanation, setExplanation] = useState('');
  const [isCompiling, setIsCompiling] = useState(false);
  const [compilerResult, setCompilerResult] = useState(null);
  const [activeTab, setActiveTab] = useState('editor'); // 'editor' | 'explanation' | 'compiler'
  const [toast, setToast] = useState(null);
  const [copied, setCopied] = useState(false);

  const abortController = useRef(null);
  const editorRef = useRef(null);

  // Initialize from navigation state (when opening a project or template)
  useEffect(() => {
    if (location.state) {
      if (location.state.code) setCode(location.state.code);
      if (location.state.language) setLanguage(location.state.language);
      if (location.state.title) setTitle(location.state.title);
      if (location.state.prompt) {
        setPromptText(location.state.prompt);
        // Automatically trigger generation after short delay if prompt was passed
        setTimeout(() => handleGenerateCode(location.state.prompt, location.state.language || language), 500);
      }
    }
  }, [location.state]);

  // Sync spoken transcript into prompt input
  useEffect(() => {
    if (transcript) {
      setPromptText(transcript);
    }
  }, [transcript]);

  // Handle spoken RUN intent
  useEffect(() => {
    if (analysis && analysis.intent === 'RUN') {
      handleRunCode();
    }
  }, [analysis]);

  const showToastMessage = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  // ─── AI Engine Handlers ───

  const handleGenerateCode = async (targetPrompt = promptText, targetLang = language) => {
    if (!targetPrompt) {
      showToastMessage('Please enter or speak a prompt first!', 'warning');
      return;
    }

    if (abortController.current) abortController.current.abort();
    abortController.current = new AbortController();

    setIsGenerating(true);
    setActiveTab('editor');
    showToastMessage('Generating code with Qwen / Llama-3...', 'info');

    try {
      let resultText = '';
      await codeService.generate(
        targetPrompt,
        targetLang,
        (chunk) => {
          resultText += chunk;
          setCode(resultText);
        },
        abortController.current.signal
      );
      showToastMessage('Code generated successfully!');
      if (localStorage.getItem('voxcode-preferences')?.includes('"synthesize":true')) {
        speak('Code generation complete.');
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Generation Error:', err);
        // Fallback demo generation if backend server is offline
        const fallbackCode = `// [Offline Mode] Generated for prompt: "${targetPrompt}"\n// Language: ${targetLang}\n\n// Implement solution below:\nfunction executeSolution() {\n  console.log("Executing solution for ${targetPrompt}");\n  return true;\n}`;
        setCode(fallbackCode);
        showToastMessage('Generated in Offline Dev Mode (Flask API unreachable)', 'info');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleOptimizeCode = async () => {
    if (!code) return;

    if (abortController.current) abortController.current.abort();
    abortController.current = new AbortController();

    setIsOptimizing(true);
    setActiveTab('editor');
    showToastMessage('Optimizing code structure and performance...', 'info');

    try {
      let optimizedText = '';
      await codeService.optimize(
        code,
        language,
        (chunk) => {
          optimizedText += chunk;
          setCode(optimizedText);
        },
        abortController.current.signal
      );
      showToastMessage('Code optimized successfully!');
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Optimization Error:', err);
        showToastMessage('Optimization unavailable in offline mode', 'warning');
      }
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleExplainCode = async () => {
    if (!code) return;

    if (abortController.current) abortController.current.abort();
    abortController.current = new AbortController();

    setIsExplaining(true);
    setActiveTab('explanation');
    setExplanation('Analyzing code structure and algorithms...');
    showToastMessage('Generating detailed AI explanation...', 'info');

    try {
      let explainText = '';
      await codeService.explain(
        code,
        language,
        (chunk) => {
          explainText += chunk;
          setExplanation(explainText);
        },
        abortController.current.signal
      );
      showToastMessage('Explanation ready!');
      speak('Explanation generated. You can review the breakdown in the explanation panel.');
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Explanation Error:', err);
        const fallbackExplanation = `### Algorithm & Code Breakdown\n\n1. **Overview**: This ${language} snippet implements an automated solution for your workflow.\n2. **Complexity**: Time complexity is approximately O(N) depending on input scaling.\n3. **Memory Safety**: Variables are scoped cleanly within function boundaries.\n4. **Recommendation**: Consider adding unit tests to verify edge cases.`;
        setExplanation(fallbackExplanation);
        showToastMessage('Generated offline explanation', 'info');
      }
    } finally {
      setIsExplaining(false);
    }
  };

  const handleRunCode = async (customStdin = '', customMode = 'standard', customTestCases = null) => {
    if (!code) return;
    setIsCompiling(true);
    setActiveTab('compiler');
    showToastMessage(`Executing in ${customMode.toUpperCase()} mode...`, 'info');

    try {
      const res = await fetch('http://localhost:3001/api/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: code,
          language: language,
          stdin: typeof customStdin === 'string' ? customStdin : '',
          timeout: 5,
          mode: customMode,
          test_cases: customTestCases
        })
      });
      const data = await res.json();
      setCompilerResult(data);
      if (data.status === 'success') {
        showToastMessage('Execution succeeded!');
        if (localStorage.getItem('voxcode-preferences')?.includes('"synthesize":true')) {
          speak('Execution completed successfully.');
        }
      } else {
        showToastMessage(`Execution ${data.status.replace('_', ' ')}`, 'warning');
      }
    } catch (err) {
      console.error('Compiler execution error:', err);
      setCompilerResult({
        status: 'error',
        stdout: '',
        stderr: 'Could not connect to VoxCode Compiler Engine (http://localhost:3001/api/execute). Ensure backend server is running.',
        exit_code: -1,
        execution_time_ms: 0
      });
      showToastMessage('Compiler API unreachable', 'error');
    } finally {
      setIsCompiling(false);
    }
  };

  const handleJumpToLine = (lineNum) => {
    setActiveTab('editor');
    setTimeout(() => {
      if (editorRef.current) {
        editorRef.current.revealLineInCenter(lineNum);
        editorRef.current.setPosition({ lineNumber: lineNum, column: 1 });
        editorRef.current.focus();
        showToastMessage(`Jumped to Line ${lineNum}`, 'info');
      }
    }, 100);
  };

  const handleAskAI = (bugPrompt) => {
    setPromptText(bugPrompt);
    handleGenerateCode(bugPrompt, language);
  };

  // ─── Snippet & File Actions ───

  const handleSaveSnippet = () => {
    const newSnippet = {
      id: Date.now(),
      title: title || 'Saved Studio Snippet',
      code,
      language,
      createdAt: new Date().toISOString(),
    };

    try {
      const existing = JSON.parse(localStorage.getItem('voxcode-snippets') || '[]');
      localStorage.setItem('voxcode-snippets', JSON.stringify([newSnippet, ...existing]));
      showToastMessage('Snippet saved to your History!');
    } catch (e) {
      showToastMessage('Failed to save snippet locally', 'error');
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    showToastMessage('Code copied to clipboard!');
  };

  const handleDownloadCode = () => {
    const extMap = { javascript: 'js', typescript: 'ts', python: 'py', rust: 'rs', go: 'go', java: 'java', cpp: 'cpp', csharp: 'cs', swift: 'swift', html: 'html', css: 'css', sql: 'sql' };
    const ext = extMap[language] || 'txt';
    const element = document.createElement('a');
    const file = new Blob([code], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${title.toLowerCase().replace(/\s+/g, '_')}.${ext}`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    showToastMessage(`Downloaded as .${ext}`);
  };

  // Register keyboard shortcuts
  useShortcutKeys({
    onGenerate: () => handleGenerateCode(),
    onOptimize: () => handleOptimizeCode(),
    onExplain: () => handleExplainCode(),
    onSave: () => handleSaveSnippet(),
  });

  return (
    <Layout title="Voice Studio">
      <div className="max-w-7xl mx-auto space-y-6 pb-12">
        {/* Breadcrumb & Title Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <Breadcrumb items={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Voice Studio' }]} />
            <div className="flex items-center gap-3 mt-1">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Snippet Title..."
                className="display-title font-extrabold text-2xl md:text-3xl bg-transparent text-[color:var(--text-primary)] focus:outline-none focus:border-b-2 focus:border-[color:var(--accent-primary)] transition-all"
              />
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[color:var(--bg-tertiary)] text-[color:var(--accent-primary)] border border-[color:var(--border-color)]">
                Pro Studio
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <LanguageFilter
              languages={LANGUAGES}
              selected={language}
              onChange={setLanguage}
              label="Target"
            />
          </div>
        </div>

        {/* Spoken Capture & Prompt Control Surface */}
        <div className="editorial-card rounded-[2.5rem] p-6 border border-[color:var(--border-color)] bg-[color:var(--bg-secondary)] shadow-xl relative overflow-hidden">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            {/* Left: Microphone Recording & Audio RMS Waveform */}
            <div className="flex items-center gap-4 w-full lg:w-auto">
              <button
                onClick={isListening ? stopRecording : startRecording}
                className={cn(
                  "p-5 rounded-3xl font-bold transition-all duration-300 shadow-xl flex items-center justify-center gap-2.5 shrink-0 transform hover:scale-105 active:scale-95 text-white",
                  isListening
                    ? "bg-rose-500 shadow-rose-500/30 animate-pulse"
                    : "brand-gradient shadow-orange-500/20"
                )}
                title={isListening ? "Stop Voice Capture" : "Start Spoken Input"}
              >
                {isListening ? <Square size={22} className="fill-white" /> : <Mic size={22} />}
                <span className="text-sm font-bold">{isListening ? "Listening..." : "Speak Instruction"}</span>
              </button>

              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[color:var(--text-secondary)]">Audio RMS Level</span>
                  {isListening && <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />}
                </div>
                <WaveformBar level={audioLevel} active={isListening} />
              </div>
            </div>

            {/* Right: Text Prompt Bar & Action Buttons */}
            <div className="flex-1 w-full flex flex-col sm:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <input
                  type="text"
                  value={promptText}
                  onChange={(e) => setPromptText(e.target.value)}
                  placeholder="Speak naturally or type: 'Create a Rust linked list' or 'Refactor this loop'..."
                  className="w-full px-5 py-4 rounded-2xl bg-[color:var(--bg-tertiary)]/60 border border-[color:var(--border-color)] text-sm font-medium text-[color:var(--text-primary)] placeholder-[color:var(--text-secondary)]/60 focus:outline-none focus:ring-2 focus:ring-[color:var(--accent-primary)]/50 transition-all"
                  onKeyDown={(e) => e.key === 'Enter' && handleGenerateCode()}
                />
                {transcript && (
                  <span className="absolute right-3 top-3.5 text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-orange-500/20 text-[color:var(--accent-primary)]">
                    Spoken Transcript
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => handleGenerateCode()}
                  disabled={isGenerating || !promptText}
                  className="w-full sm:w-auto brand-gradient text-white px-7 py-4 rounded-2xl font-bold text-sm shadow-lg shadow-orange-500/20 hover:opacity-95 disabled:opacity-40 transition-all flex items-center justify-center gap-2 transform hover:-translate-y-0.5"
                >
                  {isGenerating ? <RefreshCw size={18} className="animate-spin" /> : <Sparkles size={18} />}
                  <span>Generate Code</span>
                </button>
              </div>
            </div>
          </div>

          {/* Spoken Intent Detection Hint Badge */}
          {analysis && (
            <div className="mt-4 pt-3 border-t border-[color:var(--border-color)]/60 flex items-center justify-between text-xs font-semibold text-[color:var(--text-secondary)]">
              <div className="flex items-center gap-2">
                <BrainCircuit size={15} className="text-[color:var(--accent-primary)]" />
                <span>Detected Intent: <strong className="text-[color:var(--text-primary)]">{analysis.intent || 'Code Generation'}</strong></span>
              </div>
              <span>Confidence: <strong className="text-emerald-500">{(analysis.confidence * 100 || 95).toFixed(0)}%</strong></span>
            </div>
          )}
        </div>

        {/* Studio Workspace Tabs & Action Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[color:var(--bg-secondary)] p-3 rounded-3xl border border-[color:var(--border-color)] shadow-md">
          {/* Tabs */}
          <div className="flex items-center gap-2 p-1 bg-[color:var(--bg-tertiary)]/60 rounded-2xl border border-[color:var(--border-color)]">
            <button
              onClick={() => setActiveTab('editor')}
              className={cn(
                "px-5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2",
                activeTab === 'editor'
                  ? "bg-[color:var(--bg-secondary)] text-[color:var(--accent-primary)] shadow-sm scale-105"
                  : "text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)]"
              )}
            >
              <Terminal size={14} />
              <span>Code Editor</span>
            </button>
            <button
              onClick={() => { setActiveTab('explanation'); if (!explanation && code) handleExplainCode(); }}
              className={cn(
                "px-5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2",
                activeTab === 'explanation'
                  ? "bg-[color:var(--bg-secondary)] text-[color:var(--accent-primary)] shadow-sm scale-105"
                  : "text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)]"
              )}
            >
              <BrainCircuit size={14} />
              <span>AI Explanation</span>
            </button>
            <button
              onClick={() => setActiveTab('compiler')}
              className={cn(
                "px-5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2",
                activeTab === 'compiler'
                  ? "bg-[color:var(--bg-secondary)] text-[color:var(--accent-primary)] shadow-sm scale-105"
                  : "text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)]"
              )}
            >
              <Terminal size={14} className="text-emerald-400" />
              <span>Console / Compiler</span>
            </button>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => handleRunCode()}
              disabled={isCompiling || !code}
              className="brand-gradient text-white px-5 py-2 rounded-xl font-bold text-xs shadow-md shadow-orange-500/20 hover:opacity-95 transition-all flex items-center gap-1.5 disabled:opacity-50 transform hover:-translate-y-0.5"
              title="Compile & Execute Code in Studio Sandbox"
            >
              {isCompiling ? <RefreshCw size={14} className="animate-spin" /> : <Play size={14} className="fill-white" />}
              <span>{isCompiling ? 'Running...' : 'Compile & Run'}</span>
            </button>
            <div className="h-6 w-px bg-[color:var(--border-color)] mx-1" />
            <button
              onClick={handleOptimizeCode}
              disabled={isOptimizing || !code}
              className="px-4 py-2 rounded-xl bg-[color:var(--bg-tertiary)] hover:bg-[color:var(--accent-primary)] hover:text-white text-[color:var(--text-primary)] text-xs font-bold border border-[color:var(--border-color)] transition-all shadow-sm flex items-center gap-1.5 disabled:opacity-40"
              title="Optimize Code Structure & Performance"
            >
              <Zap size={14} className="text-amber-500 group-hover:text-white" />
              <span>{isOptimizing ? 'Optimizing...' : 'Optimize'}</span>
            </button>
            <button
              onClick={handleExplainCode}
              disabled={isExplaining || !code}
              className="px-4 py-2 rounded-xl bg-[color:var(--bg-tertiary)] hover:bg-[color:var(--accent-primary)] hover:text-white text-[color:var(--text-primary)] text-xs font-bold border border-[color:var(--border-color)] transition-all shadow-sm flex items-center gap-1.5 disabled:opacity-40"
              title="Generate Deep AI Breakdown"
            >
              <BrainCircuit size={14} className="text-sky-500 group-hover:text-white" />
              <span>{isExplaining ? 'Explaining...' : 'Explain'}</span>
            </button>
            <div className="h-6 w-px bg-[color:var(--border-color)] mx-1" />
            <button
              onClick={handleSaveSnippet}
              className="px-4 py-2 rounded-xl bg-[color:var(--bg-tertiary)] hover:bg-emerald-500 hover:text-white text-[color:var(--text-primary)] text-xs font-bold border border-[color:var(--border-color)] transition-all shadow-sm flex items-center gap-1.5"
              title="Save Snippet to History"
            >
              <Save size={14} />
              <span>Save</span>
            </button>
            <button
              onClick={handleCopyCode}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-bold border border-[color:var(--border-color)] transition-all shadow-sm flex items-center gap-1.5",
                copied ? "bg-emerald-500 text-white" : "bg-[color:var(--bg-tertiary)] hover:bg-sky-500 hover:text-white text-[color:var(--text-primary)]"
              )}
              title="Copy Code to Clipboard"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
            <button
              onClick={handleDownloadCode}
              className="p-2 rounded-xl bg-[color:var(--bg-tertiary)] hover:bg-[color:var(--bg-secondary)] text-[color:var(--text-primary)] border border-[color:var(--border-color)] transition-all shadow-sm"
              title="Download File"
            >
              <Download size={15} />
            </button>
          </div>
        </div>

        {/* Studio Main Workspace (Monaco Editor or Explanation View) */}
        <div className="editorial-card rounded-[2.5rem] border border-[color:var(--border-color)] overflow-hidden bg-[color:var(--code-bg)] shadow-2xl min-h-[520px] flex flex-col relative">
          {/* macOS window header */}
          <div className="flex items-center justify-between px-6 py-3.5 bg-slate-900/90 border-b border-slate-800 text-slate-300">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500" />
              <span className="w-3 h-3 rounded-full bg-amber-500" />
              <span className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className="ml-3 font-mono text-xs text-slate-400 font-bold">
                {title.toLowerCase().replace(/\s+/g, '_')}.{language === 'javascript' ? 'js' : language === 'typescript' ? 'ts' : language === 'python' ? 'py' : language === 'rust' ? 'rs' : 'txt'}
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                UTF-8
              </span>
              <span>•</span>
              <span className="uppercase">{language}</span>
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 'editor' ? (
            <div className="flex-1 relative">
              <Editor
                height="520px"
                language={language}
                value={code}
                onChange={(val) => setCode(val || '')}
                onMount={(editor) => { editorRef.current = editor; }}
                theme="vs-dark"
                options={{
                  minimap: { enabled: true },
                  fontSize: 14,
                  lineNumbers: 'on',
                  roundedSelection: true,
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  padding: { top: 16, bottom: 16 },
                  fontFamily: "'JetBrains Mono', 'Consolas', monospace",
                  smoothScrolling: true,
                  cursorBlinking: 'smooth',
                  wordWrap: 'on',
                }}
              />
            </div>
          ) : activeTab === 'compiler' ? (
            <div className="flex-1 p-4 bg-[#0d1117] overflow-y-auto">
              <CompilerPanel
                code={code}
                language={language}
                onRun={(stdinVal, modeVal, testCasesVal) => handleRunCode(stdinVal, modeVal, testCasesVal)}
                isRunning={isCompiling}
                result={compilerResult}
                onClear={() => setCompilerResult(null)}
                onJumpToLine={(lineNum) => handleJumpToLine(lineNum)}
                onAskAI={(bugPrompt) => handleAskAI(bugPrompt)}
              />
            </div>
          ) : (
            <div className="flex-1 p-8 overflow-y-auto bg-slate-950 text-slate-200 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl brand-gradient text-white shadow-lg">
                    <BrainCircuit size={24} />
                  </div>
                  <div>
                    <h3 className="display-title text-2xl font-bold text-white">AI Code Breakdown & Algorithm Analysis</h3>
                    <p className="text-xs text-slate-400">Deep linguistic and structural analysis powered by Qwen / Llama-3 & SpaCy.</p>
                  </div>
                </div>
                <button
                  onClick={() => speak(explanation)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-orange-500 hover:text-white text-slate-300 text-xs font-bold transition-all flex items-center gap-2 shadow-sm"
                  title="Speak Explanation Aloud"
                >
                  <Volume2 size={15} />
                  <span>Read Aloud</span>
                </button>
              </div>

              <div className="prose prose-invert max-w-none text-sm leading-8 space-y-4 font-sans text-slate-300">
                {explanation ? (
                  explanation.split('\n').map((line, idx) => (
                    <p key={idx} className={line.startsWith('#') || line.startsWith('**') ? "font-bold text-orange-400 text-base" : ""}>
                      {line}
                    </p>
                  ))
                ) : (
                  <div className="text-center py-16 text-slate-500">
                    <BrainCircuit size={40} className="mx-auto mb-3 opacity-30 animate-pulse" />
                    <p className="text-base font-semibold">No explanation generated yet.</p>
                    <p className="text-xs mt-1">Click the "Explain" button above to generate a breakdown of your current code!</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Toast Notification */}
        {toast && (
          <div className="fixed bottom-8 right-8 z-50 animate-in slide-in-from-bottom-5 duration-300">
            <div className={cn(
              "px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 text-white font-bold text-sm border border-white/10",
              toast.type === 'error' ? "bg-rose-600" : toast.type === 'warning' ? "bg-amber-600" : toast.type === 'info' ? "bg-sky-600" : "brand-gradient"
            )}>
              <Sparkles size={18} />
              <span>{toast.msg}</span>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
