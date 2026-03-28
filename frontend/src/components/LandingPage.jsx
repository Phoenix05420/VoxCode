import { motion } from 'motion/react';
import { Mic, Code2, Sparkles, Shield, Accessibility, Zap, ChevronRight, Github, Twitter, Linkedin } from 'lucide-react';

export const LandingPage = ({ onGetStarted }) => {
    return (
        <div className="min-h-screen bg-bg-light text-slate-900">
            {/* Navigation */}
            <nav className="fixed top-0 w-full z-50 glass border-b border-slate-200/50">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 vibrant-gradient rounded-xl flex items-center justify-center neon-glow">
                            <Mic className="text-white" size={24} />
                        </div>
                        <span className="text-2xl font-display font-bold tracking-tight text-slate-900">VoxCode</span>
                    </div>
                    <div className="flex items-center gap-8">
                        <a href="#features" className="text-sm font-medium text-slate-500 hover:text-primary transition-colors">Features</a>
                        <a href="#about" className="text-sm font-medium text-slate-500 hover:text-primary transition-colors">About</a>
                        <button
                            onClick={onGetStarted}
                            className="px-6 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-full text-sm font-semibold transition-all hover:scale-105 active:scale-95 shadow-lg shadow-primary/20"
                        >
                            Sign In
                        </button>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-40 pb-20 px-6 overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10">
                    <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px]" />
                    <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-[120px]" />
                </div>

                <div className="max-w-5xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest mb-6">
                            The Future of Coding is Voice
                        </span>
                        <h1 className="text-6xl md:text-8xl font-display font-bold leading-[0.9] tracking-tighter mb-8 text-slate-900">
                            Code at the <br />
                            <span className="text-primary">Speed of Thought.</span>
                        </h1>
                        <p className="text-xl text-slate-500 max-w-2xl mx-auto mb-12 leading-relaxed">
                            VoxCode converts your spoken commands into high-quality code instantly.
                            Break free from the keyboard and experience the most natural way to build software.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <button
                                onClick={onGetStarted}
                                className="w-full sm:w-auto px-10 py-4 vibrant-gradient text-white rounded-2xl font-bold text-lg transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 group shadow-xl shadow-primary/20"
                            >
                                Start Coding for Free
                                <ChevronRight className="group-hover:translate-x-1 transition-transform" />
                            </button>
                            <button className="w-full sm:w-auto px-10 py-4 glass hover:bg-white text-slate-900 rounded-2xl font-bold text-lg transition-all border-slate-200">
                                Watch Demo
                            </button>
                        </div>
                    </motion.div>

                    {/* Floating UI Preview */}
                    <motion.div
                        initial={{ opacity: 0, y: 100 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.8 }}
                        className="mt-24 relative"
                    >
                        <div className="bg-white rounded-3xl p-4 md:p-8 max-w-4xl mx-auto shadow-2xl border border-slate-100">
                            <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
                                <div className="flex gap-1.5">
                                    <div className="w-3 h-3 rounded-full bg-slate-200" />
                                    <div className="w-3 h-3 rounded-full bg-slate-200" />
                                    <div className="w-3 h-3 rounded-full bg-slate-200" />
                                </div>
                                <div className="ml-4 px-3 py-1 rounded-md bg-slate-50 text-[10px] font-mono text-slate-400">
                                    voxcode_assistant.py
                                </div>
                            </div>
                            <div className="text-left font-mono text-sm md:text-base space-y-2">
                                <p className="text-slate-400"># Voice command: "Create a function to calculate fibonacci"</p>
                                <p className="text-primary">def <span className="text-accent">fibonacci</span>(n):</p>
                                <p className="pl-4 text-slate-700">if n &lt;= 1:</p>
                                <p className="pl-8 text-slate-700">return n</p>
                                <p className="pl-4 text-slate-700">return fibonacci(n-1) + fibonacci(n-2)</p>
                                <div className="h-6 w-1 bg-primary animate-pulse inline-block align-middle" />
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Features Grid */}
            <section id="features" className="py-32 px-6 bg-slate-50">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-20">
                        <h2 className="text-4xl font-display font-bold mb-4 text-slate-900">Powerful Features</h2>
                        <p className="text-slate-500">Everything you need to build faster with your voice.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { icon: <Mic className="text-primary" />, title: "Advanced Speech Recognition", desc: "Powered by state-of-the-art NLP to understand complex coding intents." },
                            { icon: <Code2 className="text-blue-500" />, title: "Multi-Language Support", desc: "Generate Python, JavaScript, Java, C++, HTML, and CSS with ease." },
                            { icon: <Sparkles className="text-amber-500" />, title: "AI-Powered Optimization", desc: "Automatically suggests best practices and optimizes your code structure." },
                            { icon: <Accessibility className="text-purple-500" />, title: "Accessibility First", desc: "Designed for developers with disabilities to enable hands-free coding." },
                            { icon: <Shield className="text-rose-500" />, title: "Error Detection", desc: "Real-time syntax checking and voice-based suggestions for fixes." },
                            { icon: <Zap className="text-orange-500" />, title: "Instant Generation", desc: "Watch your code appear in real-time as you speak your instructions." }
                        ].map((feature, i) => (
                            <motion.div
                                key={i}
                                whileHover={{ y: -10 }}
                                className="p-8 rounded-3xl bg-white hover:shadow-xl transition-all border border-slate-100"
                            >
                                <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center mb-6">
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-bold mb-3 text-slate-900">{feature.title}</h3>
                                <p className="text-slate-500 leading-relaxed text-sm">{feature.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-20 px-6 border-t border-slate-200">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
                    <div className="flex items-center gap-2">
                        <Mic className="text-primary" size={24} />
                        <span className="text-xl font-display font-bold text-slate-900">VoxCode</span>
                    </div>
                    <div className="flex gap-8">
                        <a href="#" className="text-slate-400 hover:text-primary transition-colors"><Github size={20} /></a>
                        <a href="#" className="text-slate-400 hover:text-primary transition-colors"><Twitter size={20} /></a>
                        <a href="#" className="text-slate-400 hover:text-primary transition-colors"><Linkedin size={20} /></a>
                    </div>
                    <p className="text-slate-400 text-sm">© 2026 VoxCode AI. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};
