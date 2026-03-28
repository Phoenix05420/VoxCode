import React, { useState, useEffect, useCallback, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { useAuth } from '../context/AuthContext';
import { useLocalMic } from '../hooks/useLocalMic';
import { useVoiceFeedback } from '../hooks/useVoiceFeedback';
import { codeService } from '../services/geminiService';
import { getShortcut } from '../services/codeShortcuts';
import { 
  Plus, Play, Save, History, Code, Sparkles, Mic, MicOff, Settings, 
  Copy, Check, Trash2, LogOut, Sun, Moon, Info, AlertTriangle, Cpu, Command
} from 'lucide-react';

// ─── Constants ───
const SUPPORTED_LANGUAGES = [
  'python', 'javascript', 'typescript', 'java', 'cpp', 'csharp', 
  'rust', 'go', 'kotlin', 'swift', 'html', 'css', 'sql'
];

// ─── Sub-Components ───

const Waveform = ({ level, active }) => {
  const bars = Array.from({ length: 8 });
  return (
    <div className="flex items-end gap-1 h-6">
      {bars.map((_, i) => (
        <div 
          key={i} 
          className={`w-1 bg-indigo-500 rounded-full transition-all duration-150 ${active ? 'waveform-bar' : ''}`}
          style={{ 
            height: active ? `${Math.max(15, level * (100 + Math.random() * 50))}%` : '20%',
            animationDelay: `${i * 0.1}s` 
          }}
        />
      ))}
    </div>
  );
};

const Toast = ({ message, type = 'info', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = {
    info: 'bg-indigo-600',
    success: 'bg-emerald-600',
    error: 'bg-rose-600',
    warning: 'bg-amber-600'
  }[type];

  return (
    <div className={`fixed bottom-6 right-6 ${bgColor} text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-right-full z-50`}>
      {type === 'success' && <Check size={18} />}
      {type === 'error' && <AlertTriangle size={18} />}
      {type === 'info' && <Info size={18} />}
      <span className="font-medium">{message}</span>
      <button onClick={onClose} className="ml-2 hover:opacity-70">×</button>
    </div>
  );
};

// ─── Main Component ───

const Dashboard = () => {
  const { user, logout } = useAuth();
  const { isListening, transcript, analysis, audioLevel, startRecording, stopRecording, clearTranscript } = useLocalMic();
  const { speak } = useVoiceFeedback();
  
  // UI State
  const [activeTab, setActiveTab] = useState('editor');
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');
  const [toasts, setToasts] = useState([]);
  
  // Editor State
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('python');
  const [isGenerating, setIsGenerating] = useState(false);
  const [explanation, setExplanation] = useState('');
  
  // History State
  const [snippets, setSnippets] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingSnippets, setIsLoadingSnippets] = useState(false);
  const [copying, setCopying] = useState(false);

  const abortController = useRef(null);

  // ─── Effects ───

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  useEffect(() => {
    if (activeTab === 'history') {
      fetchSnippets();
    }
  }, [activeTab]);

  // Handle Voice Control Side-Effects
  useEffect(() => {
    if (transcript && !isListening) {
      handleCommand(transcript);
    }
  }, [isListening]);

  // Handle Keyboard Shortcut (Shift+Enter to toggle Microphone)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.shiftKey && e.key === 'Enter') {
        e.preventDefault();
        if (isListening) {
          stopRecording();
        } else {
          startRecording();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isListening, startRecording, stopRecording]);

  // ─── Helpers ───

  const addToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const fetchSnippets = async () => {
    setIsLoadingSnippets(true);
    try {
      const response = await fetch('/api/snippets', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('voxcode_token')}` }
      });
      if (response.ok) {
        const data = await response.json();
        setSnippets(data);
      }
    } catch (err) {
      addToast('Failed to load snippets', 'error');
    } finally {
      setIsLoadingSnippets(false);
    }
  };

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (!query.trim()) {
      fetchSnippets();
      return;
    }
    
    setIsLoadingSnippets(true);
    try {
      const response = await fetch('/api/snippets/search', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('voxcode_token')}` 
        },
        body: JSON.stringify({ query })
      });
      if (response.ok) {
        const data = await response.json();
        setSnippets(data);
      }
    } catch (err) {
      addToast('Search failed', 'error');
    } finally {
      setIsLoadingSnippets(false);
    }
  };

  const handleCommand = async (text) => {
    const shortcutPrompt = getShortcut(text);
    if (shortcutPrompt) {
      addToast(`Applying shortcut: ${text.split(' ')[0]}...`, 'info');
      await handleGenerate(shortcutPrompt);
    }
  };

  const handleGenerate = async (promptOverride = null) => {
    const finalPrompt = promptOverride || transcript;
    if (!finalPrompt) return;

    if (abortController.current) abortController.current.abort();
    abortController.current = new AbortController();

    setIsGenerating(true);
    setExplanation('');
    setCode('');
    setActiveTab('editor');

    try {
      await codeService.generate(
        finalPrompt, 
        language, 
        (chunk) => setCode(prev => prev + chunk),
        abortController.current.signal
      );
      speak(`I've generated the ${language} code for you.`);
      addToast('Code generated successfully', 'success');
    } catch (err) {
      if (err.name !== 'AbortError') {
        addToast(err.message || 'Generation failed', 'error');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleOptimize = async () => {
    if (!code) return;
    
    setIsGenerating(true);
    const originalCode = code;
    setCode('');
    
    try {
      await codeService.optimize(
        originalCode,
        language,
        (chunk) => setCode(prev => prev + chunk)
      );
      addToast('Optimization complete', 'success');
    } catch (err) {
      addToast('Optimization failed', 'error');
      setCode(originalCode);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExplain = async () => {
    if (!code) return;
    setIsGenerating(true);
    setExplanation('');
    
    try {
      await codeService.explain(
        code,
        language,
        (chunk) => setExplanation(prev => prev + chunk)
      );
      addToast('Explanation ready', 'info');
    } catch (err) {
      addToast('Failed to explain code', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!code) return;
    try {
      const title = transcript.slice(0, 30) || `${language}_snippet_${Date.now()}`;
      const res = await fetch('/api/snippets', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ title, code, language })
      });
      if (res.ok) {
        addToast('Snippet saved to cloud', 'success');
      }
    } catch (err) {
      addToast('Failed to save snippet', 'error');
    }
  };

  const handleDeleteSnippet = async (id) => {
    try {
      const res = await fetch(`/api/snippets/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        setSnippets(prev => prev.filter(s => s.id !== id));
        addToast('Snippet deleted', 'info');
      }
    } catch (err) {
      addToast('Delete failed', 'error');
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
    setCopying(true);
    addToast('Copied to clipboard', 'success');
    setTimeout(() => setCopying(false), 2000);
  };

  // ─── Render ───

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      
      {/* Toast Container */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
        {toasts.map(toast => (
          <Toast key={toast.id} {...toast} onClose={() => removeToast(toast.id)} />
        ))}
      </div>

      {/* Top Navigation */}
      <nav className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <Code className="text-white" size={20} />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400">
              VoxCode <span className="text-xs font-normal text-slate-400 ml-1">Pro</span>
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-600 dark:text-slate-400"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <div className="h-6 w-px bg-slate-200 dark:bg-slate-800" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-white text-xs font-bold uppercase">
                {user?.username?.[0] || 'U'}
              </div>
              <button onClick={logout} className="p-2 text-slate-400 hover:text-rose-500 transition-colors">
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Voice Control & Settings */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Voice Interface Card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <Mic size={18} className="text-indigo-500" />
                Voice Assistant
              </h2>
              <Waveform level={audioLevel} active={isListening} />
            </div>

            <div className="aspect-video relative rounded-xl bg-slate-50 dark:bg-slate-950 border-2 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center p-6 text-center group transition-all hover:border-indigo-400/50">
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 italic min-h-[3rem]">
                {isListening ? (transcript || 'Listening for code...') : (transcript || 'Press the mic and describe what to build...')}
              </p>
              
              <button
                onClick={isListening ? stopRecording : startRecording}
                className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg ${
                  isListening 
                    ? 'bg-rose-500 hover:bg-rose-600 scale-110' 
                    : 'bg-indigo-600 hover:bg-indigo-700'
                }`}
              >
                {isListening ? <MicOff className="text-white" size={28} /> : <Mic className="text-white" size={28} />}
                {isListening && <div className="absolute inset-0 rounded-full bg-rose-500 animate-ping opacity-20" />}
              </button>
            </div>

            <div className="mt-6 flex gap-2">
              <button 
                onClick={() => handleGenerate()}
                disabled={!transcript || isGenerating || isListening}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 font-medium transition-all"
              >
                <Sparkles size={18} />
                Generate
              </button>
              <button 
                onClick={clearTranscript}
                className="p-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
              >
                <Trash2 size={20} />
              </button>
            </div>
          </div>

          {/* Quick Shortcuts Card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
            <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
              <Command size={16} className="text-indigo-500" />
              Pro Shortcuts
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {['Array List', 'Quick Sort', 'JWT Auth', 'React Comp'].map(item => (
                <button 
                  key={item}
                  onClick={() => handleGenerate(item)}
                  className="px-3 py-2 bg-slate-50 dark:bg-slate-950 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center gap-1.5 transition-all"
                >
                  <Plus size={12} /> {item}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Editor & Output */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col h-full min-h-[700px]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex gap-1 overflow-x-auto no-scrollbar">
                {['editor', 'history', 'explanation'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 text-sm font-medium rounded-lg capitalize transition-all whitespace-nowrap ${
                      activeTab === tab 
                        ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' 
                        : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-3">
                <select 
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs rounded-lg px-2 py-1.5 outline-none focus:ring-2 ring-indigo-500/20 text-slate-700 dark:text-slate-300"
                >
                  {SUPPORTED_LANGUAGES.map(lang => <option key={lang} value={lang}>{lang}</option>)}
                </select>
                <div className="flex items-center gap-1">
                  <button onClick={copyToClipboard} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 transition-all" title="Copy">
                    {copying ? <Check size={18} className="text-emerald-500" /> : <Copy size={18} />}
                  </button>
                  <button onClick={handleSave} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 transition-all" title="Save to Cloud">
                    <Save size={18} />
                  </button>
                </div>
              </div>
            </div>

            <div className="flex-1 relative overflow-hidden bg-slate-900 min-h-[500px]">
              
              {activeTab === 'editor' && (
                <div className="h-full">
                  {isGenerating && !code ? (
                    <div className="absolute inset-0 z-10 bg-black/40 backdrop-blur-[2px] flex flex-col items-center justify-center">
                      <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
                      <p className="text-white font-medium">Brewing your code...</p>
                    </div>
                  ) : null}
                  
                  <Editor
                    height="100%"
                    defaultLanguage={language}
                    language={language}
                    value={code}
                    theme={isDarkMode ? 'vs-dark' : 'light'}
                    onChange={(value) => setCode(value)}
                    options={{
                      minimap: { enabled: false },
                      fontSize: 14,
                      scrollBeyondLastLine: false,
                      automaticLayout: true,
                      fontFamily: "'Fira Code', 'Cascadia Code', monospace",
                      fontLigatures: true,
                      padding: { top: 20 }
                    }}
                  />
                </div>
              )}

              {activeTab === 'explanation' && (
                <div className="p-8 prose dark:prose-invert max-w-none prose-sm">
                  {explanation ? (
                    <div className="text-slate-600 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                      {explanation}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400 py-12">
                      <Info size={48} className="mb-4 opacity-20" />
                      <p>Click "Explain" to get a walkthrough of the active code</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'history' && (
                <div className="flex flex-col h-full">
                  {/* Search Bar */}
                  <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
                    <div className="relative">
                      <Command className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input 
                        type="text"
                        placeholder="Search snippets by meaning (e.g. 'sorting' or 'auth')..."
                        value={searchQuery}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm outline-none focus:ring-2 ring-indigo-500/20 transition-all"
                      />
                    </div>
                  </div>

                  <div className="flex-1 overflow-auto divide-y divide-slate-100 dark:divide-slate-800">
                    {isLoadingSnippets ? (
                       <div className="p-12 flex justify-center"><div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>
                    ) : snippets.length > 0 ? (
                      snippets.map(s => (
                        <div key={s.id} className="p-6 hover:bg-slate-50 dark:hover:bg-slate-950 group transition-all">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-slate-800 dark:text-slate-200 truncate pr-4">{s.title}</h4>
                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                              <button 
                                onClick={() => { setCode(s.code); setLanguage(s.language); setActiveTab('editor'); }}
                                className="text-xs font-bold bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-3 py-1 rounded-lg"
                              >
                                Load
                              </button>
                              <button onClick={() => handleDeleteSnippet(s.id)} className="p-1.5 text-slate-400 hover:text-rose-500"><Trash2 size={16} /></button>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 text-[10px] text-slate-400 font-mono uppercase tracking-widest font-bold">
                            <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">{s.language}</span>
                            <span>{new Date(s.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-20 text-center text-slate-400 italic">No snippets found in history</div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="bg-slate-50 dark:bg-slate-950/50 px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-4">
              <button 
                onClick={handleOptimize}
                disabled={!code || isGenerating}
                className="bg-white dark:bg-slate-900 px-4 py-2 rounded-xl text-sm font-semibold border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all flex items-center gap-2 shadow-sm disabled:opacity-50"
              >
                <Sparkles size={16} /> Optimize
              </button>
              <button 
                onClick={handleExplain}
                disabled={!code || isGenerating}
                className="bg-white dark:bg-slate-900 px-4 py-2 rounded-xl text-sm font-semibold border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all flex items-center gap-2 shadow-sm disabled:opacity-50"
              >
                <Info size={16} /> Explain
              </button>
            </div>
          </div>

          {analysis && transcript && (
            <div className="bg-indigo-600/5 dark:bg-indigo-400/5 border border-indigo-200 dark:border-indigo-800/30 rounded-2xl p-4 flex flex-wrap gap-4 items-center">
               <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
                 <Sparkles size={14} /> Analysis
               </div>
               <div className="flex gap-2">
                 {analysis.nlp_analysis?.concepts?.data_structures?.slice(0, 3).map(c => (
                   <span key={c} className="text-[10px] bg-white dark:bg-slate-900 text-slate-500 border border-slate-200 dark:border-slate-800 px-2 py-0.5 rounded-full uppercase font-bold">{c}</span>
                 ))}
                 {analysis.nlp_analysis?.dependencies?.slice(0, 2).map(d => (
                   <span key={d} className="text-[10px] bg-indigo-500 text-white px-2 py-0.5 rounded-full uppercase font-bold">{d}</span>
                 ))}
               </div>
               <div className="ml-auto text-xs font-bold text-slate-400 uppercase tracking-wider">
                 Intent: <span className="text-slate-700 dark:text-slate-200">{analysis.intent}</span>
               </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
