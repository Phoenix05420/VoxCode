import { Layout } from '../components/Layout';
import { Breadcrumb } from '../components/Breadcrumb';
import { CommandPalette } from '../components/CommandPalette';
import { Zap, Mic, Terminal, Sparkles, ArrowRight, ShieldCheck, HelpCircle } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../utils/cn';

const CATEGORIES = [
  { id: 'all', label: 'All Shortcuts' },
  { id: 'Generation', label: 'Code Generation' },
  { id: 'Refactoring', label: 'Refactoring & Fixes' },
  { id: 'Explanation', label: 'AI Explanation' },
  { id: 'Navigation', label: 'Workspace Navigation' },
];

const COMMANDS = [
  { command: 'Create a Rust linked list', description: 'Generates an idiomatic doubly linked list in Rust with Rc and RefCell.', category: 'Generation' },
  { command: 'Build a Flask REST API', description: 'Scaffolds a Python Flask server with JWT authentication and CORS.', category: 'Generation' },
  { command: 'Generate a React UserCard', description: 'Creates a responsive Tailwind CSS card component with props.', category: 'Generation' },
  { command: 'Implement quicksort in Go', description: 'Writes an optimized quicksort algorithm with benchmark tests.', category: 'Generation' },
  { command: 'Optimize this function', description: 'Analyzes active code in the editor for time/space complexity improvements.', category: 'Refactoring' },
  { command: 'Add error handling', description: 'Wraps active code in try/catch or Result/Option type guards.', category: 'Refactoring' },
  { command: 'Explain this code', description: 'Triggers deep linguistic breakdown and algorithm analysis in the studio.', category: 'Explanation' },
  { command: 'Summarize memory trade-offs', description: 'Explains heap vs stack allocations and pointer references.', category: 'Explanation' },
  { command: 'Go to dashboard', description: 'Navigates immediately back to the main workspace overview.', category: 'Navigation' },
  { command: 'Open history', description: 'Opens your personal library of saved snippets and drafts.', category: 'Navigation' },
  { command: 'Clear editor', description: 'Resets the active Monaco editor canvas to start a fresh draft.', category: 'Refactoring' },
  { command: 'Save snippet', description: 'Stores the active studio code directly into your local snippet history.', category: 'Navigation' },
];

export default function VoiceShortcuts() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('all');

  const filteredCommands = COMMANDS.filter(cmd =>
    activeCategory === 'all' || cmd.category === activeCategory
  );

  const handleSelectCommand = (cmdText) => {
    navigate('/editor', {
      state: {
        prompt: cmdText,
      },
    });
  };

  return (
    <Layout title="Voice Shortcuts">
      <div className="max-w-7xl mx-auto space-y-8 pb-12">
        {/* Breadcrumb */}
        <Breadcrumb items={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Voice Commands' }]} />

        {/* Header Banner */}
        <div className="editorial-card rounded-[2.5rem] p-8 md:p-10 border border-[color:var(--border-color)] bg-[color:var(--bg-secondary)] shadow-xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="grain-overlay absolute inset-0 -z-10 opacity-50" />
          <div className="flex items-center gap-4">
            <div className="brand-gradient flex h-14 w-14 items-center justify-center rounded-3xl text-white shadow-lg shadow-orange-500/20 shrink-0">
              <Zap size={28} />
            </div>
            <div>
              <h2 className="display-title text-3xl font-extrabold text-[color:var(--text-primary)]">Spoken Command Directory</h2>
              <p className="text-sm text-[color:var(--text-secondary)] mt-1">Master the 40+ natural language shortcuts recognized by your offline Vosk & Whisper speech pipeline.</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/editor')}
              className="brand-gradient text-white px-6 py-3.5 rounded-2xl text-xs font-bold shadow-lg shadow-orange-500/20 hover:opacity-95 transition-all flex items-center gap-2 transform hover:-translate-y-0.5"
            >
              <Mic size={16} />
              <span>Test in Voice Studio</span>
            </button>
          </div>
        </div>

        {/* How It Works Guide Box */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="editorial-card p-6 rounded-[2rem] border border-[color:var(--border-color)] bg-[color:var(--bg-secondary)] flex items-start gap-4 shadow-sm">
            <div className="p-3 rounded-2xl bg-orange-500/10 text-[color:var(--accent-primary)] font-bold shrink-0">
              01
            </div>
            <div>
              <h4 className="font-bold text-sm text-[color:var(--text-primary)]">Natural Speech</h4>
              <p className="text-xs text-[color:var(--text-secondary)] mt-1 leading-relaxed">Speak without rigid syntax. Say "Create a Rust linked list" or "Refactor this function".</p>
            </div>
          </div>
          <div className="editorial-card p-6 rounded-[2rem] border border-[color:var(--border-color)] bg-[color:var(--bg-secondary)] flex items-start gap-4 shadow-sm">
            <div className="p-3 rounded-2xl bg-sky-500/10 text-sky-500 font-bold shrink-0">
              02
            </div>
            <div>
              <h4 className="font-bold text-sm text-[color:var(--text-primary)]">Real-Time Intent</h4>
              <p className="text-xs text-[color:var(--text-secondary)] mt-1 leading-relaxed">Vosk streams partial transcripts while SpaCy detects your core intent and target language.</p>
            </div>
          </div>
          <div className="editorial-card p-6 rounded-[2rem] border border-[color:var(--border-color)] bg-[color:var(--bg-secondary)] flex items-start gap-4 shadow-sm">
            <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-500 font-bold shrink-0">
              03
            </div>
            <div>
              <h4 className="font-bold text-sm text-[color:var(--text-primary)]">Instant Execution</h4>
              <p className="text-xs text-[color:var(--text-secondary)] mt-1 leading-relaxed">Qwen / Llama-3 generates code, optimizes algorithms, or reads aloud explanations.</p>
            </div>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={cn(
                "px-5 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap border",
                activeCategory === cat.id
                  ? "brand-gradient text-white border-transparent shadow-md shadow-orange-500/20 scale-105"
                  : "bg-[color:var(--bg-secondary)] text-[color:var(--text-secondary)] border-[color:var(--border-color)] hover:bg-[color:var(--bg-tertiary)] hover:text-[color:var(--text-primary)]"
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Interactive Command Palette */}
        <CommandPalette
          commands={filteredCommands}
          onSelect={handleSelectCommand}
        />
      </div>
    </Layout>
  );
}
