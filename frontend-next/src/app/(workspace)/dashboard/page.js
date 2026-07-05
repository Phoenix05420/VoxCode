'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, ArrowRight, Code2, Terminal, BookOpen, Layers, Clock, Zap, Plus } from 'lucide-react';
import { StatsCard } from '@/components/StatsCard';
import { VoiceInput } from '@/components/VoiceInput';
import { ProjectCard } from '@/components/ProjectCard';
import { Breadcrumb } from '@/components/Breadcrumb';
import { useUser } from '@/context/UserContext';
import { cn } from '@/lib/utils';

const DEFAULT_PROJECTS = [
  {
    id: 'proj_1',
    name: 'Authentication Service',
    description: 'JWT-based auth microservice with rate limiting and role verification.',
    language: 'python',
    code: 'from fastapi import FastAPI, Depends\\nfrom fastapi.security import OAuth2PasswordBearer\\n\\napp = FastAPI()\\n...',
    updatedAt: new Date(Date.now() - 3600000 * 4).toISOString()
  },
  {
    id: 'proj_2',
    name: 'Real-time Waveform Hook',
    description: 'Custom React hook for WebAudio RMS calculation and canvas rendering.',
    language: 'typescript',
    code: 'import { useEffect, useRef } from "react";\\n\\nexport function useWaveform(stream: MediaStream) {\\n...',
    updatedAt: new Date(Date.now() - 3600000 * 24).toISOString()
  },
  {
    id: 'proj_3',
    name: 'LRU Cache Engine',
    description: 'High-performance O(1) Least Recently Used cache implementation in Rust.',
    language: 'rust',
    code: 'use std::collections::HashMap;\\n\\npub struct LruCache<K, V> {\\n    map: HashMap<K, usize>,\\n...',
    updatedAt: new Date(Date.now() - 3600000 * 48).toISOString()
  }
];

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useUser();
  const [developerName, setDeveloperName] = useState('Developer');
  const [recentSnippets, setRecentSnippets] = useState([]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const name = localStorage.getItem('voxcode-developer-name') || 'Developer';
      setDeveloperName(name);

      try {
        const stored = JSON.parse(localStorage.getItem('voxcode-snippets') || '[]');
        setRecentSnippets(stored.length > 0 ? stored : DEFAULT_PROJECTS);
      } catch (e) {
        setRecentSnippets(DEFAULT_PROJECTS);
      }
    }
  }, []);

  const handleQuickCommand = (prompt, language = 'javascript') => {
    router.push(`/editor?prompt=${encodeURIComponent(prompt)}&language=${language}`);
  };

  const handleDeleteSnippet = (id) => {
    const updated = recentSnippets.filter(s => s.id !== id);
    setRecentSnippets(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('voxcode-snippets', JSON.stringify(updated));
    }
  };

  return (
    <div className="space-y-8 pb-12 animate-fadeIn">
      {/* Breadcrumb & Welcome Banner */}
      <div className="space-y-4">
        <Breadcrumb items={[{ label: 'Dashboard' }]} />
        
        <div className="surface-card p-8 bg-elevated border border-light rounded-2xl relative overflow-hidden shadow-sm">
          <div className="absolute right-0 top-0 -mt-12 -mr-12 w-64 h-64 rounded-full bg-accent-violet/10 blur-3xl pointer-events-none"></div>
          
          <div className="max-w-2xl relative z-10 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-violet-bg text-accent-violet font-semibold text-xs">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Voice-Controlled IDE Active</span>
            </div>
            
            <h1 className="text-3xl font-extrabold tracking-tight text-primary font-display">
              Welcome back, <span className="brand-gradient-text">{developerName}</span>
            </h1>
            
            <p className="text-secondary text-sm leading-relaxed">
              Your speech pipeline is primed and ready. Use voice commands to scaffold full architectures, refactor algorithms, or explain complex logic in seconds.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={() => router.push('/editor')}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-white font-semibold text-sm brand-gradient shadow-xs hover:opacity-95 active:scale-95 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>New Studio Session</span>
              </button>
              <button
                onClick={() => router.push('/commands')}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-secondary text-primary font-semibold text-sm border border-light hover:bg-tertiary transition-all"
              >
                <Terminal className="w-4 h-4 text-accent-violet" />
                <span>Explore Commands</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Saved Snippets"
          value={recentSnippets.length.toString()}
          icon={Code2}
          trend="+3 this week"
          color="purple"
        />
        <StatsCard
          title="Voice Shortcuts"
          value="45+"
          icon={Zap}
          trend="Active ASR"
          color="blue"
        />
        <StatsCard
          title="Supported Languages"
          value="12"
          icon={Layers}
          trend="Full AST support"
          color="green"
        />
        <StatsCard
          title="Execution Sandbox"
          value="Ready"
          icon={Terminal}
          trend="Sub-ms latency"
          color="orange"
        />
      </div>

      {/* Quick Prompt Widget */}
      <div className="space-y-3">
        <h2 className="text-base font-bold text-primary flex items-center gap-2 font-display">
          <Sparkles className="w-4 h-4 text-accent-violet" />
          Quick Voice Prompt
        </h2>
        <VoiceInput
          onGenerate={(prompt) => handleQuickCommand(prompt)}
          onTranscript={(prompt) => handleQuickCommand(prompt)}
        />
      </div>

      {/* Quick Starter Commands Grid */}
      <div className="space-y-3">
        <h2 className="text-base font-bold text-primary flex items-center gap-2 font-display">
          <Terminal className="w-4 h-4 text-accent-blue" />
          Starter Architecture Prompts
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              title: "Create REST API with JWT Auth",
              prompt: "Build a flask api with jwt auth and rate limiting",
              language: "python",
              badge: "Backend",
              color: "badge-violet"
            },
            {
              title: "Scaffold Doubly Linked List",
              prompt: "Create a linked list in rust with comprehensive test cases",
              language: "rust",
              badge: "Data Structure",
              color: "badge-emerald"
            },
            {
              title: "Concurrent QuickSort Algorithm",
              prompt: "Quick sort algorithm in go using goroutines and channels",
              language: "go",
              badge: "Algorithm",
              color: "badge-amber"
            },
            {
              title: "Responsive UserCard Component",
              prompt: "React component named UserCard with Tailwind CSS and Lucide icons",
              language: "typescript",
              badge: "Frontend",
              color: "badge-rose"
            }
          ].map((cmd, idx) => (
            <div
              key={idx}
              onClick={() => handleQuickCommand(cmd.prompt, cmd.language)}
              className="surface-card p-5 bg-elevated border border-light rounded-xl cursor-pointer hover:border-focus group transition-all"
            >
              <div className="flex items-center justify-between mb-2">
                <span className={cn("badge", cmd.color)}>{cmd.badge}</span>
                <span className="text-xs font-mono text-tertiary uppercase">{cmd.language}</span>
              </div>
              <h3 className="text-sm font-bold text-primary group-hover:text-accent-violet transition-colors flex items-center justify-between">
                <span>{cmd.title}</span>
                <ArrowRight className="w-4 h-4 text-tertiary group-hover:text-accent-violet group-hover:translate-x-1 transition-all" />
              </h3>
              <p className="text-xs text-secondary mt-1 font-mono line-clamp-1">"{cmd.prompt}"</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Studio Sessions */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-primary flex items-center gap-2 font-display">
            <Clock className="w-4 h-4 text-accent-emerald" />
            Recent Studio Sessions
          </h2>
          <button
            onClick={() => router.push('/history')}
            className="text-xs font-semibold text-accent-violet hover:underline flex items-center gap-1"
          >
            <span>View All History</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {recentSnippets.slice(0, 3).map((proj) => (
            <ProjectCard
              key={proj.id}
              project={proj}
              onOpen={() => {
                router.push(`/editor?code=${encodeURIComponent(proj.code)}&language=${proj.language}&title=${encodeURIComponent(proj.name)}`);
              }}
              onDelete={() => handleDeleteSnippet(proj.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
