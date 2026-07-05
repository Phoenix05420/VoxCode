import { motion } from 'motion/react';
import {
    Mic,
    Code2,
    Sparkles,
    Shield,
    Accessibility,
    Zap,
    ChevronRight,
    Github,
    Twitter,
    Linkedin,
    AudioWaveform,
    Workflow,
    BrainCircuit,
} from 'lucide-react';

const features = [
    { icon: Mic, title: 'Voice-First Input', desc: 'Speak naturally, keep flow, and trigger generation without mode switches.' },
    { icon: Code2, title: 'Multi-Language Output', desc: 'Jump across backend, frontend, and scripting tasks from one control surface.' },
    { icon: Sparkles, title: 'Instant Refinement', desc: 'Optimize, explain, and iterate without leaving the editor context.' },
    { icon: Accessibility, title: 'Hands-Free Friendly', desc: 'Designed for lower-friction coding sessions and reduced repetitive interaction.' },
    { icon: Shield, title: 'Private Local Sessions', desc: 'Self-contained workspace identity keeps your personal history and voice snippets stored securely on your local machine.' },
    { icon: Zap, title: 'Fast Feedback Loop', desc: 'See transcript, intent hints, and generated code in one continuous workspace.' },
];

const stats = [
    { label: 'Prompt to code', value: '<10s' },
    { label: 'Shortcut starts', value: '40+' },
    { label: 'Voice control', value: 'Live' },
];

export const LandingPage = ({ onGetStarted }) => {
    return (
        <div className="editorial-shell min-h-screen text-[color:var(--text-primary)]">
            <nav className="fixed top-0 z-50 w-full px-4 pt-4 md:px-8">
                <div className="glass mx-auto flex h-18 max-w-7xl items-center justify-between rounded-full px-5 md:px-7">
                    <div className="flex items-center gap-3">
                        <div className="brand-gradient flex h-11 w-11 items-center justify-center rounded-2xl shadow-lg shadow-orange-500/20">
                            <Mic className="text-white" size={22} />
                        </div>
                        <div>
                            <div className="display-title text-2xl font-bold">VoxCode</div>
                            <div className="eyebrow text-[color:var(--text-secondary)]">Voice Studio</div>
                        </div>
                    </div>
                    <div className="hidden items-center gap-8 md:flex">
                        <a href="#features" className="text-sm font-semibold text-[color:var(--text-secondary)] hover:text-[color:var(--accent-primary)]">Features</a>
                        <a href="#workflow" className="text-sm font-semibold text-[color:var(--text-secondary)] hover:text-[color:var(--accent-primary)]">Workflow</a>
                        <button
                            onClick={onGetStarted}
                            className="brand-gradient rounded-full px-6 py-3 text-sm font-bold text-white shadow-lg shadow-orange-500/20 hover:-translate-y-0.5"
                        >
                            Sign In
                        </button>
                    </div>
                </div>
            </nav>

            <section className="relative overflow-hidden px-6 pb-24 pt-34 md:px-10 md:pt-40">
                <div className="grain-overlay absolute inset-0 -z-10 overflow-hidden">
                    <div className="floaty absolute left-[8%] top-28 h-28 w-28 rounded-full bg-orange-300/30 blur-3xl" />
                    <div className="floaty absolute right-[10%] top-20 h-44 w-44 rounded-full bg-sky-300/20 blur-3xl" />
                    <div className="absolute bottom-18 left-1/2 h-60 w-60 -translate-x-1/2 rounded-full bg-amber-200/25 blur-3xl" />
                </div>

                <div className="mx-auto grid max-w-7xl gap-14 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
                    <div>
                        <motion.div
                            initial={{ opacity: 0, y: 18 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.55 }}
                        >
                            <div className="eyebrow mb-5 text-[color:var(--accent-primary)]">Voice-to-code workspace</div>
                            <h1 className="display-title max-w-4xl text-6xl leading-[0.92] md:text-8xl">
                                Build code in a
                                <span className="block text-[color:var(--accent-primary)]">continuous spoken workflow.</span>
                            </h1>
                            <p className="mt-8 max-w-2xl text-lg leading-8 text-[color:var(--text-secondary)] md:text-xl">
                                VoxCode turns a start-stop coding session into a live studio. Speak an idea, inspect the transcript,
                                generate the first draft, then optimize and explain without breaking focus.
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 24 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1, duration: 0.55 }}
                            className="mt-10 flex flex-col gap-4 sm:flex-row"
                        >
                            <button
                                onClick={onGetStarted}
                                className="brand-gradient flex items-center justify-center gap-2 rounded-3xl px-9 py-4 text-lg font-bold text-white shadow-2xl shadow-orange-500/20 hover:-translate-y-0.5"
                            >
                                Enter Workspace
                                <ChevronRight size={20} />
                            </button>
                            <a
                                href="#workflow"
                                className="editorial-panel flex items-center justify-center gap-2 rounded-3xl px-9 py-4 text-lg font-semibold text-[color:var(--accent-deep)] hover:-translate-y-0.5"
                            >
                                <Workflow size={18} />
                                See the flow
                            </a>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 28 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.18, duration: 0.55 }}
                            className="mt-12 grid gap-4 sm:grid-cols-3"
                        >
                            {stats.map((stat) => (
                                <div key={stat.label} className="editorial-panel rounded-3xl px-5 py-5">
                                    <div className="display-title text-3xl font-bold text-[color:var(--accent-deep)] dark:text-[color:var(--accent-secondary)]">
                                        {stat.value}
                                    </div>
                                    <div className="mt-2 text-sm font-semibold text-[color:var(--text-secondary)]">{stat.label}</div>
                                </div>
                            ))}
                        </motion.div>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 60 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.25, duration: 0.8 }}
                        className="relative"
                    >
                        <div className="editorial-card muted-grid relative overflow-hidden rounded-[2rem] p-5">
                            <div className="mb-5 flex items-center justify-between border-b border-[color:var(--border-color)] pb-4">
                                <div className="flex items-center gap-2">
                                    <span className="h-3 w-3 rounded-full bg-rose-400" />
                                    <span className="h-3 w-3 rounded-full bg-amber-300" />
                                    <span className="h-3 w-3 rounded-full bg-emerald-400" />
                                </div>
                                <div className="rounded-full bg-[color:var(--bg-tertiary)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-[color:var(--text-secondary)]">
                                    Live command session
                                </div>
                            </div>

                            <div className="grid gap-4 lg:grid-cols-[0.42fr_0.58fr]">
                                <div className="editorial-panel rounded-[1.6rem] p-5">
                                    <div className="mb-4 flex items-center gap-3">
                                        <div className="brand-gradient flex h-11 w-11 items-center justify-center rounded-2xl text-white">
                                            <AudioWaveform size={20} />
                                        </div>
                                        <div>
                                            <div className="eyebrow text-[color:var(--accent-primary)]">Voice capture</div>
                                            <div className="text-sm text-[color:var(--text-secondary)]">Listening with transcript hints</div>
                                        </div>
                                    </div>

                                    <div className="rounded-[1.25rem] bg-[color:var(--bg-tertiary)] p-4">
                                        <div className="mb-3 flex items-end gap-1">
                                            {Array.from({ length: 14 }).map((_, index) => (
                                                <span
                                                    key={index}
                                                    className="waveform-bar rounded-full bg-[color:var(--accent-primary)]"
                                                    style={{
                                                        width: 6,
                                                        height: `${18 + ((index % 5) + 1) * 9}px`,
                                                        animationDelay: `${index * 0.08}s`,
                                                    }}
                                                />
                                            ))}
                                        </div>
                                        <p className="text-sm italic text-[color:var(--text-secondary)]">
                                            “Create a Rust linked list and explain the memory trade-offs.”
                                        </p>
                                    </div>

                                    <div className="mt-4 space-y-3">
                                        <div className="editorial-panel rounded-2xl px-4 py-3">
                                            <div className="eyebrow text-[color:var(--accent-primary)]">Intent</div>
                                            <div className="mt-2 text-sm font-semibold">Create + Explain</div>
                                        </div>
                                        <div className="editorial-panel rounded-2xl px-4 py-3">
                                            <div className="eyebrow text-[color:var(--accent-primary)]">Language</div>
                                            <div className="mt-2 text-sm font-semibold">Rust</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="rounded-[1.6rem] bg-[color:var(--code-bg)] p-5 text-slate-100 shadow-2xl shadow-slate-900/30">
                                    <div className="mb-5 flex items-center justify-between">
                                        <div>
                                            <div className="eyebrow text-orange-300">Generated draft</div>
                                            <div className="mt-1 text-sm text-slate-400">Editor, optimize, explain</div>
                                        </div>
                                        <BrainCircuit className="text-orange-300" size={22} />
                                    </div>
                                    <div className="space-y-2 font-mono text-sm leading-7">
                                        <div className="text-slate-500">{"// VoxCode generated from voice prompt"}</div>
                                        <div><span className="text-sky-300">struct</span> <span className="text-orange-300">Node</span> {'{'} ... {'}'}</div>
                                        <div><span className="text-sky-300">impl</span> <span className="text-orange-300">LinkedList</span> {'{'}</div>
                                        <div className="pl-5 text-slate-300">pub fn append(&mut self, value: i32) {'{'}</div>
                                        <div className="pl-10 text-slate-500">{"// inserts at tail"}</div>
                                        <div className="pl-5 text-slate-300">{'}'}</div>
                                        <div>{'}'}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            <section id="workflow" className="px-6 py-8 md:px-10">
                <div className="editorial-card mx-auto grid max-w-7xl gap-8 rounded-[2.4rem] px-7 py-8 md:grid-cols-3 md:px-10">
                    {[
                        ['1', 'Speak the intent', 'Describe the build target, refactor, or explanation in one natural sentence.'],
                        ['2', 'Refine in place', 'Review transcript hints, swap language, and trigger shortcuts without leaving the surface.'],
                        ['3', 'Ship or save', 'Copy code, store snippets, and keep a personal history behind authenticated access.'],
                    ].map(([step, title, desc]) => (
                        <div key={step} className="editorial-panel rounded-[1.8rem] p-6">
                            <div className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[color:var(--accent-deep)] text-lg font-bold text-white">
                                {step}
                            </div>
                            <h3 className="display-title text-3xl font-bold">{title}</h3>
                            <p className="mt-4 text-sm leading-7 text-[color:var(--text-secondary)]">{desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            <section id="features" className="px-6 py-24 md:px-10">
                <div className="mx-auto max-w-7xl">
                    <div className="mb-14 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                        <div>
                            <div className="eyebrow text-[color:var(--accent-primary)]">Why it feels different</div>
                            <h2 className="display-title mt-4 text-5xl font-bold md:text-6xl">A studio, not a settings page.</h2>
                        </div>
                        <p className="max-w-xl text-base leading-8 text-[color:var(--text-secondary)]">
                            The interaction model centers on momentum: one command pipeline, one editor surface,
                            one place to inspect code, history, and explanation.
                        </p>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                        {features.map(({ icon: Icon, title, desc }, index) => (
                            <motion.div
                                key={title}
                                initial={{ opacity: 0, y: 18 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, amount: 0.3 }}
                                transition={{ delay: index * 0.04, duration: 0.45 }}
                                className="editorial-card rounded-[2rem] p-7"
                            >
                                <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-3xl bg-[color:var(--bg-tertiary)] text-[color:var(--accent-primary)]">
                                    <Icon size={24} />
                                </div>
                                <h3 className="display-title text-3xl font-bold">{title}</h3>
                                <p className="mt-4 text-sm leading-7 text-[color:var(--text-secondary)]">{desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            <footer className="border-t border-[color:var(--border-color)] px-6 py-16 md:px-10">
                <div className="mx-auto flex max-w-7xl flex-col gap-8 md:flex-row md:items-center md:justify-between">
                    <div>
                        <div className="display-title text-3xl font-bold">VoxCode</div>
                        <div className="mt-2 text-sm text-[color:var(--text-secondary)]">Voice-guided code generation for focused building sessions.</div>
                    </div>
                    <div className="flex items-center gap-6">
                        <a href="#" className="text-[color:var(--text-secondary)] hover:text-[color:var(--accent-primary)]"><Github size={20} /></a>
                        <a href="#" className="text-[color:var(--text-secondary)] hover:text-[color:var(--accent-primary)]"><Twitter size={20} /></a>
                        <a href="#" className="text-[color:var(--text-secondary)] hover:text-[color:var(--accent-primary)]"><Linkedin size={20} /></a>
                    </div>
                </div>
            </footer>
        </div>
    );
};
