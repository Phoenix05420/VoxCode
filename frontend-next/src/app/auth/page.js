'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Mic,
  Code2,
  ArrowLeft,
  ArrowRight,
  User,
  Shield,
  Sparkles,
  Zap,
  Globe,
  Terminal,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const ROLES = [
  { id: 'developer', label: 'Developer', desc: 'Full-stack coding & generation', icon: Code2 },
  { id: 'lead', label: 'Team Lead', desc: 'Code review & optimization', icon: Shield },
  { id: 'explorer', label: 'Explorer', desc: 'Learning & experimentation', icon: Sparkles },
];

const FEATURES = [
  { icon: Mic, title: 'Voice-First', desc: 'Speak naturally to generate code', color: 'var(--accent-violet)' },
  { icon: Zap, title: 'Instant Output', desc: 'Real-time AI code streaming', color: 'var(--accent-amber)' },
  { icon: Globe, title: '12+ Languages', desc: 'Python, Rust, Go, TypeScript & more', color: 'var(--accent-blue)' },
  { icon: Terminal, title: 'Live Compiler', desc: 'Execute code in the browser', color: 'var(--accent-emerald)' },
];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  }),
};

export default function AuthPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [role, setRole] = useState('developer');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('voxcode-developer-name');
      if (stored) setName(stored);
    }
  }, []);

  const handleLaunch = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('voxcode-developer-name', name.trim() || 'Developer');
      localStorage.setItem('voxcode-workspace-role', role);
    }
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex">
      {/* ─── Left: Form Panel ─── */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          {/* Back link */}
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors mb-8"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>

          {/* Brand */}
          <div className="flex items-center gap-3 mb-8">
            <div className="h-10 w-10 rounded-xl brand-gradient flex items-center justify-center shadow-md">
              <Mic className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1
                className="text-2xl font-bold tracking-tight brand-gradient-text"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                VoxCode
              </h1>
              <p className="text-xs text-[var(--text-tertiary)] font-medium">
                Profile Setup
              </p>
            </div>
          </div>

          {/* Name input */}
          <div className="space-y-6">
            <div>
              <label
                htmlFor="dev-name"
                className="block text-sm font-semibold text-[var(--text-primary)] mb-2"
              >
                Developer Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-tertiary)]" />
                <input
                  id="dev-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  className={cn(
                    'w-full rounded-[var(--radius-md)] border border-[var(--border-light)]',
                    'bg-[var(--bg-elevated)] py-3 pl-10 pr-4',
                    'text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)]',
                    'outline-none transition-all duration-200',
                    'focus:border-[var(--border-focus)] focus:shadow-[var(--shadow-glow)]'
                  )}
                />
              </div>
            </div>

            {/* Role selection */}
            <div>
              <label className="block text-sm font-semibold text-[var(--text-primary)] mb-3">
                Workspace Role
              </label>
              <div className="space-y-2">
                {ROLES.map((r) => {
                  const Icon = r.icon;
                  const selected = role === r.id;
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setRole(r.id)}
                      className={cn(
                        'w-full flex items-center gap-3 rounded-[var(--radius-md)] border p-3.5 text-left transition-all duration-200',
                        selected
                          ? 'border-[var(--accent-violet)] bg-[var(--accent-violet-bg)] shadow-[var(--shadow-glow)]'
                          : 'border-[var(--border-light)] bg-[var(--bg-elevated)] hover:border-[var(--border-dark)]'
                      )}
                    >
                      <div
                        className={cn(
                          'h-9 w-9 rounded-lg flex items-center justify-center shrink-0',
                          selected
                            ? 'brand-gradient text-white'
                            : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)]'
                        )}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[var(--text-primary)]">
                          {r.label}
                        </p>
                        <p className="text-xs text-[var(--text-secondary)]">
                          {r.desc}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Launch button */}
            <button
              type="button"
              onClick={handleLaunch}
              className={cn(
                'w-full inline-flex items-center justify-center gap-2',
                'rounded-[var(--radius-md)] px-6 py-3.5',
                'text-base font-semibold text-white brand-gradient',
                'shadow-lg hover:shadow-[var(--shadow-glow)]',
                'transition-all duration-300 hover:scale-[1.02]'
              )}
            >
              Launch Workspace
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      </div>

      {/* ─── Right: Feature Panel ─── */}
      <div className="hidden lg:flex flex-1 items-center justify-center dark-accent-card rounded-none relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent-violet)]/10 to-transparent pointer-events-none" />

        <motion.div
          variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
          initial="hidden"
          animate="visible"
          className="relative z-10 max-w-sm space-y-5 p-8"
        >
          <motion.h2
            variants={fadeUp}
            custom={0}
            className="text-2xl font-bold tracking-tight text-white"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Everything you need to{' '}
            <span className="brand-gradient-text">code faster</span>
          </motion.h2>

          {FEATURES.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={f.title}
                variants={fadeUp}
                custom={i + 1}
                className="flex items-start gap-3 rounded-[var(--radius-md)] bg-white/[0.04] p-4"
              >
                <div
                  className="h-9 w-9 rounded-lg shrink-0 flex items-center justify-center"
                  style={{ background: `${f.color}20`, color: f.color }}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{f.title}</p>
                  <p className="text-xs text-[var(--text-on-dark-muted)] mt-0.5">
                    {f.desc}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}
