import { useState } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, Mic, ShieldCheck, Sparkles, Zap, ArrowRight, Laptop, Terminal, User } from 'lucide-react';

const authNotes = [
    { icon: ShieldCheck, label: 'Private offline workspace sessions' },
    { icon: Laptop, label: 'Zero third-party cloud dependency' },
    { icon: Sparkles, label: 'Personal local snippet library' },
    { icon: Mic, label: 'Voice-first Vosk & Whisper access' },
];

export const AuthPage = ({ onBack, onSuccess, onLocalLaunch }) => {
    const [developerName, setDeveloperName] = useState(() => {
        return localStorage.getItem('voxcode-developer-name') || 'Local Pro Developer';
    });
    const [workspaceRole, setWorkspaceRole] = useState('Full-Stack Voice Engineer');

    const handleLaunch = () => {
        if (developerName.trim()) {
            localStorage.setItem('voxcode-developer-name', developerName.trim());
        }
        if (onLocalLaunch) {
            onLocalLaunch();
        } else if (onSuccess) {
            onSuccess();
        }
    };

    return (
        <div className="editorial-shell min-h-screen px-6 py-10 md:px-10">
            <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-7xl gap-8 lg:grid-cols-[0.9fr_1.1fr]">
                <div className="editorial-card grain-overlay relative overflow-hidden rounded-[2.5rem] p-8 text-[color:var(--text-primary)] md:p-10 flex flex-col justify-between">
                    <div>
                        <div className="mb-8 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="brand-gradient flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-lg shadow-orange-500/20">
                                    <Mic size={24} />
                                </div>
                                <div>
                                    <div className="display-title text-3xl font-bold">VoxCode</div>
                                    <div className="eyebrow text-[color:var(--text-secondary)]">Studio Access</div>
                                </div>
                            </div>
                            {onBack ? (
                                <button
                                    onClick={onBack}
                                    className="editorial-panel inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-[color:var(--text-secondary)] hover:text-[color:var(--accent-primary)] transition-all"
                                >
                                    <ChevronLeft size={16} />
                                    Back
                                </button>
                            ) : null}
                        </div>

                        <motion.div
                            initial={{ opacity: 0, y: 18 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.45 }}
                        >
                            <div className="eyebrow text-[color:var(--accent-primary)]">Self-Contained Studio</div>
                            <h1 className="display-title mt-5 text-4xl font-bold leading-[0.96] md:text-5xl">
                                Enter your voice-controlled development workspace.
                            </h1>
                            <p className="mt-6 max-w-xl text-base leading-8 text-[color:var(--text-secondary)]">
                                VoxCode operates entirely on your machine. Customize your local developer profile below and launch directly into your speech-driven code generation environment.
                            </p>
                        </motion.div>
                    </div>

                    <div className="mt-10 grid gap-4">
                        {authNotes.map(({ icon: Icon, label }) => (
                            <div key={label} className="editorial-panel flex items-center gap-4 rounded-[1.6rem] px-5 py-4 transition-all hover:translate-x-1">
                                <div className="brand-gradient flex h-11 w-11 items-center justify-center rounded-2xl text-white shadow-md">
                                    <Icon size={18} />
                                </div>
                                <div className="text-sm font-semibold">{label}</div>
                            </div>
                        ))}
                    </div>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.08, duration: 0.5 }}
                    className="editorial-card rounded-[2.5rem] p-8 md:p-10 flex flex-col justify-between"
                >
                    <div>
                        <div className="mb-8">
                            <div className="eyebrow text-[color:var(--accent-primary)]">Workspace Profile</div>
                            <h2 className="display-title mt-4 text-3xl font-bold">
                                Configure your studio identity.
                            </h2>
                            <p className="mt-3 text-sm leading-7 text-[color:var(--text-secondary)]">
                                No third-party accounts or cloud API keys required. Your snippets and preferences are saved locally.
                            </p>
                        </div>

                        {/* Developer Profile Setup Card */}
                        <div className="space-y-6 mb-8 rounded-[2rem] bg-[color:var(--bg-secondary)] p-6 md:p-8 border border-[color:var(--border-color)]">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-[color:var(--text-secondary)] mb-2 flex items-center gap-1.5">
                                    <User size={14} className="text-[color:var(--accent-primary)]" />
                                    <span>Developer Name / Handle</span>
                                </label>
                                <input
                                    type="text"
                                    value={developerName}
                                    onChange={(e) => setDeveloperName(e.target.value)}
                                    placeholder="e.g. Alex Pro Developer"
                                    className="w-full px-5 py-4 rounded-2xl bg-[color:var(--bg-tertiary)] border border-[color:var(--border-color)] text-base font-bold text-[color:var(--text-primary)] placeholder-[color:var(--text-secondary)]/60 focus:outline-none focus:ring-2 focus:ring-[color:var(--accent-primary)]/50 transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-[color:var(--text-secondary)] mb-2 flex items-center gap-1.5">
                                    <Terminal size={14} className="text-[color:var(--accent-primary)]" />
                                    <span>Primary Role / Specialization</span>
                                </label>
                                <select
                                    value={workspaceRole}
                                    onChange={(e) => setWorkspaceRole(e.target.value)}
                                    className="w-full px-5 py-4 rounded-2xl bg-[color:var(--bg-tertiary)] border border-[color:var(--border-color)] text-sm font-bold text-[color:var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[color:var(--accent-primary)]/50 transition-all cursor-pointer"
                                >
                                    <option value="Full-Stack Voice Engineer">Full-Stack Voice Engineer</option>
                                    <option value="Systems & Rust Architect">Systems & Rust Architect</option>
                                    <option value="AI & Python Backend Specialist">AI & Python Backend Specialist</option>
                                    <option value="Frontend UI/UX Developer">Frontend UI/UX Developer</option>
                                </select>
                            </div>

                            <div className="pt-2">
                                <button
                                    onClick={handleLaunch}
                                    className="w-full brand-gradient py-5 rounded-2xl font-bold text-white shadow-xl shadow-orange-500/20 hover:opacity-95 hover:shadow-orange-500/30 flex items-center justify-center gap-3 text-base transition-all transform hover:-translate-y-0.5"
                                >
                                    <Laptop size={20} />
                                    <span>Launch Voice Studio Workspace</span>
                                    <ArrowRight size={18} />
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl bg-[color:var(--bg-tertiary)]/50 p-4 border border-[color:var(--border-color)] text-center">
                        <p className="text-xs text-[color:var(--text-secondary)] flex items-center justify-center gap-2">
                            <Zap size={14} className="text-orange-500 animate-pulse" />
                            <span>Offline Vosk speech engine and local LLM server ready on port 3001.</span>
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};
