import { Layout } from '../components/Layout';
import { StatsCard } from '../components/StatsCard';
import { VoiceInput } from '../components/VoiceInput';
import { ProjectCard } from '../components/ProjectCard';
import { Breadcrumb } from '../components/Breadcrumb';
import { Code2, Zap, BookOpen, Sparkles, ArrowRight, Activity, Terminal, Shield, Play } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const DEFAULT_PROJECTS = [
  {
    id: 1,
    name: 'JWT Authentication API',
    description: 'Secure token-based auth handler with refresh tokens and role-based access control.',
    language: 'TypeScript',
    code: 'async function authenticate(email: string, pass: string): Promise<AuthSession> {\n  const user = await db.users.findUnique({ where: { email } });\n  if (!user || !(await bcrypt.compare(pass, user.passwordHash))) {\n    throw new UnauthorizedError("Invalid credentials");\n  }\n  return generateTokenPair(user);\n}',
    updatedAt: new Date(Date.now() - 3600000),
  },
  {
    id: 2,
    name: 'Rust Memory-Safe Linked List',
    description: 'Doubly linked list with custom allocator and ownership trade-off explanations.',
    language: 'Rust',
    code: 'pub struct Node<T> {\n    val: T,\n    next: Option<Rc<RefCell<Node<T>>>>,\n    prev: Option<Weak<RefCell<Node<T>>>>,\n}\n\nimpl<T> LinkedList<T> {\n    pub fn new() -> Self {\n        LinkedList { head: None, tail: None }\n    }\n}',
    updatedAt: new Date(Date.now() - 7200000),
  },
  {
    id: 3,
    name: 'Python Audio Stream Processor',
    description: 'Real-time microphone capture bridging SoundDevice byte streams to Vosk & Whisper.',
    language: 'Python',
    code: 'def process_audio_stream(in_data, frame_count, time_info, status):\n    """Callback for sounddevice raw PCM audio stream."""\n    if rec.AcceptWaveform(in_data):\n        result = json.loads(rec.Result())\n        asyncio.create_task(broadcast_token(result["text"]))\n    return (in_data, sd.paContinue)',
    updatedAt: new Date(Date.now() - 86400000),
  },
];

const QUICK_COMMANDS = [
  { title: "Rust Linked List", prompt: "Create a doubly linked list in Rust with Rc and RefCell", lang: "Rust", icon: Terminal },
  { title: "Flask REST API", prompt: "Build a Python Flask REST API with JWT authentication and CORS", lang: "Python", icon: Code2 },
  { title: "React UserCard", prompt: "Create a responsive React UserCard component with Tailwind CSS", lang: "TypeScript", icon: Sparkles },
  { title: "Go Quicksort", prompt: "Implement an optimized quicksort algorithm in Go with benchmark tests", lang: "Go", icon: Zap },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState(() => {
    const saved = localStorage.getItem('voxcode-snippets');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed.slice(0, 6);
      } catch (e) {
        console.warn('Could not parse snippets from localStorage', e);
      }
    }
    return DEFAULT_PROJECTS;
  });

  const [stats, setStats] = useState([
    { title: 'Saved Snippets', value: String(projects.length), icon: Code2, color: 'purple', trend: 15 },
    { title: 'Voice Shortcuts', value: '45+', icon: Zap, color: 'orange', trend: 12 },
    { title: 'Supported Languages', value: '15', icon: BookOpen, color: 'blue' },
  ]);

  const handleProjectOpen = (project) => {
    navigate('/editor', {
      state: {
        code: project.code,
        language: project.language?.toLowerCase() || 'javascript',
        title: project.name || project.title,
      },
    });
  };

  const handleQuickPrompt = (promptText, lang = 'python') => {
    navigate('/editor', {
      state: {
        prompt: promptText,
        language: lang.toLowerCase(),
      },
    });
  };

  return (
    <Layout title="Workspace Dashboard">
      <div className="max-w-7xl mx-auto space-y-10 pb-12">
        {/* Breadcrumb */}
        <Breadcrumb items={[{ label: 'Dashboard' }]} />

        {/* Welcome Banner */}
        <div className="editorial-card rounded-[2.5rem] p-8 md:p-10 relative overflow-hidden border border-[color:var(--border-color)] bg-[color:var(--bg-secondary)] shadow-2xl">
          <div className="grain-overlay absolute inset-0 -z-10 opacity-60" />
          <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-gradient-to-br from-orange-500/20 to-amber-500/10 blur-3xl pointer-events-none" />
          <div className="absolute right-[20%] -bottom-20 w-60 h-60 rounded-full bg-gradient-to-br from-sky-500/15 to-indigo-500/10 blur-3xl pointer-events-none" />

          <div className="max-w-3xl relative z-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[color:var(--bg-tertiary)] border border-[color:var(--border-color)] text-xs font-bold text-[color:var(--accent-primary)] mb-4 shadow-sm">
              <Activity size={14} className="animate-pulse" />
              <span>VOICE-FIRST DEVELOPMENT STUDIO</span>
            </div>
            <h2 className="display-title text-4xl md:text-6xl font-extrabold tracking-tight text-[color:var(--text-primary)] leading-[1.05]">
              Speak your code into existence.
            </h2>
            <p className="text-base md:text-lg text-[color:var(--text-secondary)] mt-4 leading-relaxed">
              VoxCode bridges human thought and executable code. Speak a natural instruction, inspect real-time partial transcripts from your offline Vosk engine, and let Qwen / Llama-3 generate the idiomatic code draft.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <button
                onClick={() => navigate('/editor')}
                className="brand-gradient text-white px-8 py-4 rounded-2xl font-bold text-base shadow-xl shadow-orange-500/20 hover:opacity-95 transition-all flex items-center gap-2.5 transform hover:-translate-y-0.5"
              >
                <Play size={18} className="fill-white" />
                <span>Launch Voice Studio</span>
              </button>
              <button
                onClick={() => navigate('/commands')}
                className="px-7 py-4 rounded-2xl bg-[color:var(--bg-tertiary)] hover:bg-[color:var(--bg-tertiary)]/80 text-[color:var(--text-primary)] font-bold text-base border border-[color:var(--border-color)] transition-all shadow-sm flex items-center gap-2"
              >
                <Zap size={18} className="text-[color:var(--accent-primary)]" />
                <span>View 40+ Voice Shortcuts</span>
              </button>
            </div>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat, i) => (
            <StatsCard
              key={i}
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
              color={stat.color}
              trend={stat.trend}
            />
          ))}
        </div>

        {/* Live Spoken Command Widget */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="display-title text-2xl font-bold text-[color:var(--text-primary)]">Quick Generate & Speak</h3>
              <p className="text-xs text-[color:var(--text-secondary)] mt-0.5">Speak naturally into the microphone or type an instruction to jump straight into the editor.</p>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 hidden sm:block">
              ● Vosk Offline ASR Ready
            </span>
          </div>
          <VoiceInput
            onTranscript={(text) => handleQuickPrompt(text)}
            onGenerate={(text) => handleQuickPrompt(text)}
          />
        </div>

        {/* Quick Voice Command Cards */}
        <div>
          <h3 className="display-title text-xl font-bold text-[color:var(--text-primary)] mb-4">Popular Spoken Instructions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {QUICK_COMMANDS.map((cmd, idx) => {
              const Icon = cmd.icon;
              return (
                <button
                  key={idx}
                  onClick={() => handleQuickPrompt(cmd.prompt, cmd.lang)}
                  className="editorial-card p-5 rounded-[1.8rem] border border-[color:var(--border-color)] bg-[color:var(--bg-secondary)] hover:bg-[color:var(--bg-tertiary)]/60 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-xl group flex flex-col justify-between h-full"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-2.5 rounded-xl brand-gradient text-white shadow-sm group-hover:scale-110 transition-transform">
                        <Icon size={16} />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[color:var(--bg-tertiary)] text-[color:var(--accent-primary)] border border-[color:var(--border-color)]">
                        {cmd.lang}
                      </span>
                    </div>
                    <h4 className="font-bold text-sm text-[color:var(--text-primary)] group-hover:text-[color:var(--accent-primary)] transition-colors">
                      {cmd.title}
                    </h4>
                    <p className="text-xs text-[color:var(--text-secondary)] mt-1 leading-relaxed line-clamp-2">
                      "{cmd.prompt}"
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-[color:var(--border-color)]/60 flex items-center justify-between text-xs font-bold text-[color:var(--accent-primary)]">
                    <span>Generate in Studio</span>
                    <ArrowRight size={14} className="transform transition-transform group-hover:translate-x-1" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Recent Projects / Saved Snippets Grid */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="display-title text-2xl font-bold text-[color:var(--text-primary)]">Recent Code Sessions</h3>
              <p className="text-xs text-[color:var(--text-secondary)] mt-0.5">Resume your previous voice-to-code generations and saved snippets.</p>
            </div>
            <button
              onClick={() => navigate('/history')}
              className="text-xs font-bold text-[color:var(--accent-primary)] hover:underline flex items-center gap-1 group"
            >
              <span>View all {projects.length} sessions</span>
              <ArrowRight size={14} className="transform transition-transform group-hover:translate-x-1" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <ProjectCard
                key={project.id || project.createdAt}
                project={project}
                onOpen={handleProjectOpen}
              />
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
