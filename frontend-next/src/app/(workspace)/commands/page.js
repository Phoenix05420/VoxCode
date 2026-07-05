'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Terminal, Mic, Sparkles, ArrowRight, Zap, HelpCircle } from 'lucide-react';
import { Breadcrumb } from '@/components/Breadcrumb';
import { CommandPalette } from '@/components/CommandPalette';
import { VOICE_COMMANDS } from '@/lib/constants';
import { cn } from '@/lib/utils';

export default function CommandsPage() {
  const router = useRouter();
  const [selectedCat, setSelectedCat] = useState('all');

  const categories = [
    { id: 'all', label: 'All Commands', color: 'badge-violet' },
    { id: 'create', label: 'Create & Scaffold', color: 'badge-emerald' },
    { id: 'optimize', label: 'Optimize & Refactor', color: 'badge-amber' },
    { id: 'explain', label: 'Explain & Audit', color: 'badge-blue' },
    { id: 'convert', label: 'Convert Language', color: 'badge-rose' }
  ];

  const filteredCommands = selectedCat === 'all'
    ? VOICE_COMMANDS
    : VOICE_COMMANDS.filter(c => c.category === selectedCat);

  const handleSelectCommand = (cmd) => {
    router.push(`/editor?prompt=${encodeURIComponent(cmd.command)}`);
  };

  return (
    <div className="space-y-8 pb-12 animate-fadeIn">
      {/* Header */}
      <div className="space-y-1">
        <Breadcrumb items={[{ label: 'Commands' }]} />
        <h1 className="text-2xl font-bold text-primary font-display flex items-center gap-2">
          <Terminal className="w-6 h-6 text-accent-violet" />
          <span>Voice Command Reference</span>
        </h1>
        <p className="text-xs text-secondary">Explore 45+ domain-specific voice shortcuts powered by Vosk real-time ASR and Whisper transcription.</p>
      </div>

      {/* How It Works Guide */}
      <div className="surface-card p-6 bg-elevated border border-light rounded-2xl shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-primary font-bold font-display">
          <Zap className="w-4 h-4 text-accent-amber" />
          <span>How Speech-to-Code Pipeline Works</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
          {[
            { step: "01", title: "Instantaneous Draft (Vosk)", desc: "As you speak, our offline Vosk engine streams real-time partial text to keep latency under 50ms." },
            { step: "02", title: "Deep Context Alignment (Whisper)", desc: "When you pause, Whisper Turbo neural network refines punctuation and programming syntax." },
            { step: "03", title: "Intent & Scaffolding (BART/LLM)", desc: "Zero-shot BART classifiers map spoken phrases to exact architectural templates or LLM prompts." }
          ].map((s, idx) => (
            <div key={idx} className="p-4 bg-secondary rounded-xl border border-light relative">
              <span className="text-xs font-mono font-bold text-accent-violet">{s.step}</span>
              <h3 className="text-sm font-bold text-primary mt-1">{s.title}</h3>
              <p className="text-xs text-secondary mt-1 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Category Filters */}
      <div className="flex flex-wrap items-center gap-2">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCat(cat.id)}
            className={cn(
              "px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all",
              selectedCat === cat.id
                ? "brand-gradient text-white shadow-xs"
                : "bg-elevated text-secondary border border-light hover:text-primary hover:bg-secondary"
            )}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Command Palette List */}
      <div className="bg-elevated rounded-2xl border border-light p-4 shadow-sm">
        <CommandPalette
          commands={filteredCommands}
          onSelect={handleSelectCommand}
        />
      </div>
    </div>
  );
}
