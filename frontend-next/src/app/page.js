'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Mic,
  Code2,
  Zap,
  Globe,
  Terminal,
  Keyboard,
  Sparkles,
  ArrowRight,
  Cpu,
  Wand2,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

/* ─── Animation Variants ─── */
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  }),
};

const stagger = {
  visible: { transition: { staggerChildren: 0.08 } },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

/* ─── Waveform Visualizer ─── */
function WaveformHero() {
  return (
    <div className="flex items-end justify-center gap-[5px] h-16">
      {[0, 0.15, 0.3, 0.15, 0.45].map((delay, i) => (
        <motion.div
          key={i}
          className="w-[4px] rounded-full bg-gradient-to-t from-[var(--accent-violet)] to-[var(--accent-blue)]"
          animate={{
            height: ['20%', '100%', '40%', '85%', '20%'],
          }}
          transition={{
            duration: 1.4,
            repeat: Infinity,
            delay,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

/* ─── Mock Code Display ─── */
function MockCodeBlock() {
  return (
    <div className="dark-accent-card overflow-hidden">
      {/* macOS title bar */}
      <div className="flex items-center gap-2 border-b border-white/8 px-4 py-3">
        <span className="h-3 w-3 rounded-full bg-[#FF5F57]" />
        <span className="h-3 w-3 rounded-full bg-[#FEBC2E]" />
        <span className="h-3 w-3 rounded-full bg-[#28C840]" />
        <span className="ml-3 text-xs text-[var(--text-on-dark-muted)] font-medium tracking-wide">
          voice_output.py
        </span>
      </div>
      <div className="p-5 font-mono text-sm leading-relaxed" style={{ fontFamily: 'var(--font-mono)' }}>
        <div><span className="text-[#C678DD]">def</span> <span className="text-[#61AFEF]">fibonacci</span><span className="text-[#ABB2BF]">(</span><span className="text-[#E5C07B]">n</span><span className="text-[#ABB2BF]">):</span></div>
        <div className="ml-4"><span className="text-[#7F848E]"># AI-generated from voice command</span></div>
        <div className="ml-4"><span className="text-[#C678DD]">if</span> <span className="text-[#E5C07B]">n</span> <span className="text-[#ABB2BF]">&lt;=</span> <span className="text-[#D19A66]">1</span><span className="text-[#ABB2BF]">:</span></div>
        <div className="ml-8"><span className="text-[#C678DD]">return</span> <span className="text-[#E5C07B]">n</span></div>
        <div className="ml-4"><span className="text-[#C678DD]">return</span> <span className="text-[#61AFEF]">fibonacci</span><span className="text-[#ABB2BF]">(</span><span className="text-[#E5C07B]">n</span><span className="text-[#ABB2BF]">-</span><span className="text-[#D19A66]">1</span><span className="text-[#ABB2BF]">) +</span> <span className="text-[#61AFEF]">fibonacci</span><span className="text-[#ABB2BF]">(</span><span className="text-[#E5C07B]">n</span><span className="text-[#ABB2BF]">-</span><span className="text-[#D19A66]">2</span><span className="text-[#ABB2BF]">)</span></div>
      </div>
    </div>
  );
}

/* ─── Stats Data ─── */
const STATS = [
  { value: '45+', label: 'Voice Commands' },
  { value: '12', label: 'Languages' },
  { value: 'Real-time', label: 'ASR Engine' },
];

/* ─── Workflow Steps ─── */
const STEPS = [
  {
    step: '01',
    title: 'Speak',
    desc: 'Describe what you want to build using natural voice commands.',
    icon: Mic,
    color: 'var(--accent-violet)',
  },
  {
    step: '02',
    title: 'Process',
    desc: 'AI interprets your intent and selects optimal code patterns.',
    icon: Cpu,
    color: 'var(--accent-blue)',
  },
  {
    step: '03',
    title: 'Generate',
    desc: 'Production-ready code streams into your editor instantly.',
    icon: Code2,
    color: 'var(--accent-emerald)',
  },
];

/* ─── Feature Cards Data ─── */
const FEATURES = [
  {
    icon: Mic,
    title: 'Voice Recognition',
    desc: 'Vosk + Whisper dual-engine ASR with real-time transcription and noise reduction.',
    color: 'var(--accent-violet)',
  },
  {
    icon: Sparkles,
    title: 'Smart Templates',
    desc: 'Pre-built templates for common patterns — APIs, algorithms, data structures, and more.',
    color: 'var(--accent-amber)',
  },
  {
    icon: Globe,
    title: 'Multi-Language',
    desc: 'Generate code in Python, Rust, TypeScript, Go, Java, C++, and 6 more languages.',
    color: 'var(--accent-blue)',
  },
  {
    icon: Terminal,
    title: 'Live Compiler',
    desc: 'Execute generated code in a sandboxed environment and view output in real-time.',
    color: 'var(--accent-emerald)',
  },
  {
    icon: Wand2,
    title: 'AI Optimization',
    desc: 'Refactor, optimize, and explain code with one click using advanced LLMs.',
    color: 'var(--accent-rose)',
  },
  {
    icon: Keyboard,
    title: 'Keyboard Shortcuts',
    desc: 'Power-user shortcuts for every action — fully customizable in Settings.',
    color: 'var(--accent-violet)',
  },
];

/* ══════════════════════════════════════════════════════════════
   Landing Page
   ══════════════════════════════════════════════════════════════ */
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      {/* ─── Fixed Navbar ─── */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className={cn(
          'fixed top-0 inset-x-0 z-50 h-16',
          'flex items-center justify-between px-6 md:px-10',
          'bg-white/80 backdrop-blur-xl border-b border-[var(--border-subtle)]',
          'dark:bg-[#0F1117]/80'
        )}
      >
        <Link href="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg brand-gradient flex items-center justify-center">
            <Mic className="h-4 w-4 text-white" />
          </div>
          <span
            className="text-lg font-bold tracking-tight brand-gradient-text"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            VoxCode
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href="/commands"
            className="hidden sm:inline-flex text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors px-3 py-1.5"
          >
            Commands
          </Link>
          <Link
            href="/templates"
            className="hidden sm:inline-flex text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors px-3 py-1.5"
          >
            Templates
          </Link>
          <Link
            href="/dashboard"
            className={cn(
              'inline-flex items-center gap-2 rounded-full px-5 py-2',
              'text-sm font-semibold text-white brand-gradient',
              'shadow-[var(--shadow-md)] hover:shadow-[var(--shadow-glow)]',
              'transition-all duration-300 hover:scale-[1.03]'
            )}
          >
            Enter Workspace
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </motion.nav>

      {/* ─── Hero Section ─── */}
      <section className="relative pt-32 pb-20 md:pt-44 md:pb-32 overflow-hidden grain-overlay">
        {/* Background decorations */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-1/4 w-96 h-96 rounded-full bg-[var(--accent-violet)] opacity-[0.04] blur-[100px]" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full bg-[var(--accent-blue)] opacity-[0.05] blur-[80px]" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-6">
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="visible"
            className="text-center max-w-3xl mx-auto"
          >
            {/* Badge */}
            <motion.div variants={fadeUp} custom={0} className="mb-6 inline-flex items-center gap-2 rounded-full bg-[var(--accent-violet-bg)] px-4 py-1.5">
              <span className="h-2 w-2 rounded-full bg-[var(--accent-violet)] animate-pulse-dot" />
              <span className="text-xs font-semibold text-[var(--accent-violet)] tracking-wide">
                Voice-First Development
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={fadeUp}
              custom={1}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.08]"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              <span className="brand-gradient-text">Voice-Powered</span>
              <br />
              Code Generation
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              variants={fadeUp}
              custom={2}
              className="mt-6 text-lg md:text-xl text-[var(--text-secondary)] max-w-2xl mx-auto leading-relaxed"
            >
              Speak naturally, generate production-ready code instantly. VoxCode combines
              real-time speech recognition with advanced AI to transform your voice into
              clean, optimized code across 12+ languages.
            </motion.p>

            {/* Waveform */}
            <motion.div variants={fadeUp} custom={3} className="mt-8 flex justify-center">
              <div className="glass-card px-8 py-4 flex items-center gap-4">
                <div className="h-10 w-10 rounded-full brand-gradient flex items-center justify-center animate-pulse-dot">
                  <Mic className="h-5 w-5 text-white" />
                </div>
                <WaveformHero />
                <span className="text-sm font-medium text-[var(--text-secondary)]">
                  &ldquo;Create a fibonacci function&rdquo;
                </span>
              </div>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div variants={fadeUp} custom={4} className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/dashboard"
                className={cn(
                  'inline-flex items-center gap-2 rounded-full px-8 py-3.5',
                  'text-base font-semibold text-white brand-gradient',
                  'shadow-lg hover:shadow-[var(--shadow-glow)]',
                  'transition-all duration-300 hover:scale-[1.03]'
                )}
              >
                <Zap className="h-5 w-5" />
                Launch Studio
              </Link>
              <Link
                href="/commands"
                className={cn(
                  'inline-flex items-center gap-2 rounded-full px-8 py-3.5',
                  'text-base font-semibold',
                  'border border-[var(--border-light)] bg-[var(--bg-elevated)]',
                  'text-[var(--text-primary)]',
                  'hover:border-[var(--accent-violet)] hover:shadow-[var(--shadow-glow)]',
                  'transition-all duration-300'
                )}
              >
                Explore Commands
                <ChevronRight className="h-4 w-4" />
              </Link>
            </motion.div>
          </motion.div>

          {/* Mock Code Block */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="mt-16 max-w-2xl mx-auto"
          >
            <MockCodeBlock />
          </motion.div>
        </div>
      </section>

      {/* ─── Stats Section ─── */}
      <section className="py-16 border-y border-[var(--border-light)] bg-[var(--bg-secondary)]">
        <div className="max-w-4xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-3 gap-8">
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="text-center"
            >
              <div
                className="text-3xl md:text-4xl font-extrabold brand-gradient-text"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {stat.value}
              </div>
              <div className="mt-1 text-sm font-medium text-[var(--text-secondary)]">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── Workflow Section ─── */}
      <section className="py-20 md:py-28">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2
              className="text-3xl md:text-4xl font-bold tracking-tight"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              How It Works
            </h2>
            <p className="mt-3 text-[var(--text-secondary)] max-w-lg mx-auto">
              Three simple steps from voice to code. No typing required.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connector line */}
            <div className="hidden md:block absolute top-16 left-[16.67%] right-[16.67%] h-px bg-gradient-to-r from-[var(--accent-violet)] via-[var(--accent-blue)] to-[var(--accent-emerald)] opacity-20" />

            {STEPS.map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.step}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15, duration: 0.5 }}
                  className="text-center relative"
                >
                  <div
                    className="mx-auto mb-5 h-14 w-14 rounded-2xl flex items-center justify-center shadow-lg"
                    style={{ background: step.color }}
                  >
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-xs font-bold tracking-widest uppercase text-[var(--text-tertiary)]">
                    Step {step.step}
                  </span>
                  <h3 className="mt-2 text-xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm text-[var(--text-secondary)] leading-relaxed max-w-xs mx-auto">
                    {step.desc}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── Features Section ─── */}
      <section className="py-20 md:py-28 bg-[var(--bg-secondary)]">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2
              className="text-3xl md:text-4xl font-bold tracking-tight"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Built for{' '}
              <span className="brand-gradient-text">Developers</span>
            </h2>
            <p className="mt-3 text-[var(--text-secondary)] max-w-lg mx-auto">
              Every feature designed to accelerate your development workflow.
            </p>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {FEATURES.map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div
                  key={f.title}
                  variants={scaleIn}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  className="surface-card p-6 cursor-default group"
                >
                  <div
                    className="mb-4 h-11 w-11 rounded-xl flex items-center justify-center transition-transform duration-200 group-hover:scale-110"
                    style={{ background: `${f.color}14`, color: f.color }}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3
                    className="text-base font-semibold tracking-tight"
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    {f.title}
                  </h3>
                  <p className="mt-2 text-sm text-[var(--text-secondary)] leading-relaxed">
                    {f.desc}
                  </p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ─── CTA Banner ─── */}
      <section className="py-20 md:py-28">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="dark-accent-card p-10 md:p-16 text-center relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent-violet)]/10 to-[var(--accent-blue)]/5 pointer-events-none" />
            <div className="relative z-10">
              <h2
                className="text-3xl md:text-4xl font-bold tracking-tight text-white"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Ready to Code with Your Voice?
              </h2>
              <p className="mt-4 text-[var(--text-on-dark-muted)] max-w-lg mx-auto">
                Join the voice-first development revolution. No account needed —
                launch the studio and start building.
              </p>
              <Link
                href="/dashboard"
                className={cn(
                  'inline-flex items-center gap-2 mt-8 rounded-full px-8 py-3.5',
                  'text-base font-semibold text-white brand-gradient',
                  'shadow-lg hover:shadow-[var(--shadow-glow)]',
                  'transition-all duration-300 hover:scale-[1.03]'
                )}
              >
                <Zap className="h-5 w-5" />
                Launch Studio
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="py-8 border-t border-[var(--border-light)]">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-md brand-gradient flex items-center justify-center">
              <Mic className="h-3 w-3 text-white" />
            </div>
            <span className="text-sm font-semibold brand-gradient-text" style={{ fontFamily: 'var(--font-display)' }}>
              VoxCode
            </span>
          </div>
          <p className="text-xs text-[var(--text-tertiary)]">
            &copy; {new Date().getFullYear()} VoxCode. Voice-first code generation.
          </p>
        </div>
      </footer>
    </div>
  );
}
