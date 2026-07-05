import { Layout } from '../components/Layout';
import { Breadcrumb } from '../components/Breadcrumb';
import { TemplateCard } from '../components/TemplateCard';
import { Search, BookOpen, Sparkles, Filter, Code2, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../utils/cn';

const CATEGORIES = [
  { id: 'all', label: 'All Templates' },
  { id: 'python', label: 'Python & AI' },
  { id: 'rust', label: 'Rust & Systems' },
  { id: 'typescript', label: 'TypeScript & Web' },
  { id: 'go', label: 'Go & Cloud' },
  { id: 'sql', label: 'Database & SQL' },
];

const TEMPLATES = [
  {
    id: 1,
    title: 'Flask REST API with JWT Auth',
    category: 'python',
    language: 'python',
    description: 'Complete boilerplate for secure token authentication, CORS setup, and SQLite error handling.',
    code: 'from flask import Flask, request, jsonify\nimport jwt, datetime, functools\n\napp = Flask(__name__)\napp.config["SECRET_KEY"] = "super-secret-key"\n\ndef token_required(f):\n    @functools.wraps(f)\n    def decorated(*args, **kwargs):\n        token = request.headers.get("Authorization")\n        if not token:\n            return jsonify({"message": "Token is missing!"}), 401\n        try:\n            data = jwt.decode(token.split(" ")[1], app.config["SECRET_KEY"], algorithms=["HS256"])\n        except:\n            return jsonify({"message": "Token is invalid!"}), 401\n        return f(data, *args, **kwargs)\n    return decorated',
  },
  {
    id: 2,
    title: 'Rust Memory-Safe Linked List',
    category: 'rust',
    language: 'rust',
    description: 'Idiomatic doubly linked list using Rc and RefCell to demonstrate interior mutability.',
    code: 'use std::rc::Rc;\nuse std::cell::RefCell;\n\ntype NodePtr<T> = Option<Rc<RefCell<Node<T>>>>;\n\npub struct Node<T> {\n    pub elem: T,\n    pub next: NodePtr<T>,\n    pub prev: NodePtr<T>,\n}\n\npub struct LinkedList<T> {\n    head: NodePtr<T>,\n    tail: NodePtr<T>,\n}\n\nimpl<T> LinkedList<T> {\n    pub fn new() -> Self {\n        LinkedList { head: None, tail: None }\n    }\n}',
  },
  {
    id: 3,
    title: 'React Custom Auth & User Hook',
    category: 'typescript',
    language: 'typescript',
    description: 'TypeScript React hook for managing user sessions, login state, and JWT refresh tokens.',
    code: 'import { useState, useEffect, useCallback } from "react";\n\ninterface User { id: string; email: string; role: string; }\n\nexport function useAuthSession() {\n  const [user, setUser] = useState<User | null>(null);\n  const [loading, setLoading] = useState(true);\n\n  const login = useCallback(async (token: string) => {\n    localStorage.setItem("auth_token", token);\n    // Fetch profile\n    setLoading(false);\n  }, []);\n\n  return { user, loading, login };\n}',
  },
  {
    id: 4,
    title: 'Go High-Performance Goroutine Pool',
    category: 'go',
    language: 'go',
    description: 'Concurrency worker pool utilizing buffered channels and sync.WaitGroup for scalable tasks.',
    code: 'package main\n\nimport (\n\t"fmt"\n\t"sync"\n\t"time"\n)\n\nfunc worker(id int, jobs <-chan int, results chan<- int, wg *sync.WaitGroup) {\n\tdefer wg.Done()\n\tfor j := range jobs {\n\t\tfmt.Printf("worker %d started job %d\\n", id, j)\n\t\ttime.Sleep(time.Millisecond * 500)\n\t\tresults <- j * 2\n\t}\n}',
  },
  {
    id: 5,
    title: 'SQL Recursive CTE Hierarchy Query',
    category: 'sql',
    language: 'sql',
    description: 'PostgreSQL recursive common table expression for querying nested org charts or comments.',
    code: 'WITH RECURSIVE org_chart AS (\n    SELECT employee_id, name, manager_id, 1 AS level\n    FROM employees\n    WHERE manager_id IS NULL\n    \n    UNION ALL\n    \n    SELECT e.employee_id, e.name, e.manager_id, o.level + 1\n    FROM employees e\n    INNER JOIN org_chart o ON o.employee_id = e.manager_id\n)\nSELECT * FROM org_chart ORDER BY level, name;',
  },
  {
    id: 6,
    title: 'Python Audio Stream WAV Recorder',
    category: 'python',
    language: 'python',
    description: 'Capture raw sounddevice microphone buffers and save as standardized 16kHz mono WAV files.',
    code: 'import sounddevice as sd\nimport soundfile as sf\nimport numpy as np\n\nfs = 16000\nseconds = 5\nprint("Recording voice...")\nmyrecording = sd.rec(int(seconds * fs), samplerate=fs, channels=1, dtype=np.int16)\nsd.wait()\nsf.write("output_voice.wav", myrecording, fs)\nprint("Saved output_voice.wav")',
  },
];

export default function TemplateGallery() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const filtered = TEMPLATES.filter(tpl => {
    const matchesCategory = activeCategory === 'all' || tpl.category === activeCategory;
    const matchesSearch = tpl.title.toLowerCase().includes(search.toLowerCase()) ||
                          tpl.description.toLowerCase().includes(search.toLowerCase()) ||
                          tpl.code.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleUseTemplate = (template) => {
    navigate('/editor', {
      state: {
        code: template.code,
        language: template.language || 'javascript',
        title: template.title,
      },
    });
  };

  return (
    <Layout title="Template Library">
      <div className="max-w-7xl mx-auto space-y-8 pb-12">
        {/* Breadcrumb */}
        <Breadcrumb items={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Template Gallery' }]} />

        {/* Header Banner */}
        <div className="editorial-card rounded-[2.5rem] p-8 md:p-10 border border-[color:var(--border-color)] bg-[color:var(--bg-secondary)] shadow-xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="grain-overlay absolute inset-0 -z-10 opacity-50" />
          <div className="flex items-center gap-4">
            <div className="brand-gradient flex h-14 w-14 items-center justify-center rounded-3xl text-white shadow-lg shadow-orange-500/20 shrink-0">
              <BookOpen size={28} />
            </div>
            <div>
              <h2 className="display-title text-3xl font-extrabold text-[color:var(--text-primary)]">Curated Starter Templates</h2>
              <p className="text-sm text-[color:var(--text-secondary)] mt-1">Jumpstart your voice-guided coding sessions with production-ready boilerplate code.</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/editor')}
              className="brand-gradient text-white px-6 py-3.5 rounded-2xl text-xs font-bold shadow-lg shadow-orange-500/20 hover:opacity-95 transition-all flex items-center gap-2 transform hover:-translate-y-0.5"
            >
              <Sparkles size={16} />
              <span>Open Empty Studio</span>
            </button>
          </div>
        </div>

        {/* Search & Category Tabs */}
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Category Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto scrollbar-none">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={cn(
                    "px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap border",
                    activeCategory === cat.id
                      ? "brand-gradient text-white border-transparent shadow-md shadow-orange-500/20 scale-105"
                      : "bg-[color:var(--bg-secondary)] text-[color:var(--text-secondary)] border-[color:var(--border-color)] hover:bg-[color:var(--bg-tertiary)] hover:text-[color:var(--text-primary)]"
                  )}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Search Bar */}
            <div className="relative w-full md:w-72 shrink-0">
              <Search className="absolute left-4 top-3.5 w-4 h-4 text-[color:var(--text-secondary)]" />
              <input
                type="text"
                placeholder="Search templates..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 rounded-2xl bg-[color:var(--bg-secondary)] border border-[color:var(--border-color)] text-sm font-medium text-[color:var(--text-primary)] placeholder-[color:var(--text-secondary)]/60 focus:outline-none focus:ring-2 focus:ring-[color:var(--accent-primary)]/50 transition-all shadow-sm"
              />
            </div>
          </div>
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.length > 0 ? (
            filtered.map((tpl) => (
              <TemplateCard
                key={tpl.id}
                template={tpl}
                language={tpl.language}
                onUse={() => handleUseTemplate(tpl)}
              />
            ))
          ) : (
            <div className="col-span-full editorial-card rounded-[2.5rem] p-16 text-center border border-[color:var(--border-color)] bg-[color:var(--bg-secondary)] shadow-lg flex flex-col items-center justify-center gap-4">
              <div className="w-16 h-16 rounded-3xl bg-[color:var(--bg-tertiary)] flex items-center justify-center text-[color:var(--accent-primary)] shadow-inner">
                <Filter size={32} />
              </div>
              <div>
                <h3 className="display-title font-bold text-xl text-[color:var(--text-primary)]">No templates match criteria</h3>
                <p className="text-sm text-[color:var(--text-secondary)] mt-1 max-w-md">
                  Try switching category tabs or clearing your keyword search "{search}".
                </p>
              </div>
              <button
                onClick={() => { setActiveCategory('all'); setSearch(''); }}
                className="mt-2 px-6 py-2.5 rounded-2xl bg-[color:var(--bg-tertiary)] hover:bg-[color:var(--accent-primary)] hover:text-white text-xs font-bold text-[color:var(--text-primary)] border border-[color:var(--border-color)] transition-all shadow-sm"
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
