import { Layout } from '../components/Layout';
import { Breadcrumb } from '../components/Breadcrumb';
import { HistoryItem } from '../components/HistoryItem';
import { LanguageFilter } from '../components/LanguageFilter';
import { Search, History as HistoryIcon, Download, Sparkles, Trash2, Plus } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LANGUAGES } from '../utils/constants';

const DEFAULT_HISTORY = [
  {
    id: 1,
    title: 'User Login Authentication Handler',
    code: 'async function login(email, password) {\n  const user = await db.users.findOne({ email });\n  if (!user) throw new Error("User not found");\n  const isValid = await bcrypt.compare(password, user.password);\n  return isValid ? user : null;\n}',
    language: 'javascript',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 2,
    title: 'Flask REST API Endpoint',
    code: '@app.route("/api/users", methods=["GET"])\ndef get_users():\n    users = User.query.all()\n    return jsonify([user.to_dict() for user in users])',
    language: 'python',
    createdAt: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: 3,
    title: 'React Custom Counter Hook',
    code: 'export function useCounter(initial = 0) {\n  const [count, setCount] = useState(initial);\n  return {\n    count,\n    increment: () => setCount(c => c + 1),\n    decrement: () => setCount(c => c - 1),\n  };\n}',
    language: 'typescript',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
];

export default function History() {
  const navigate = useNavigate();
  const [items, setItems] = useState(() => {
    const saved = localStorage.getItem('voxcode-snippets');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.warn('Could not parse snippets from localStorage', e);
      }
    }
    return DEFAULT_HISTORY;
  });

  const [search, setSearch] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [toast, setToast] = useState(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const filtered = items.filter(item => {
    const matchesSearch = (item.title || '').toLowerCase().includes(search.toLowerCase()) ||
                          (item.code || '').toLowerCase().includes(search.toLowerCase());
    const matchesLanguage = !selectedLanguage || item.language?.toLowerCase() === selectedLanguage.toLowerCase();
    return matchesSearch && matchesLanguage;
  });

  const handleDelete = (id) => {
    const updated = items.filter(item => item.id !== id);
    setItems(updated);
    localStorage.setItem('voxcode-snippets', JSON.stringify(updated));
    showToast('Snippet deleted.');
  };

  const handleClearAll = () => {
    if (confirm('Are you sure you want to clear your entire snippet history?')) {
      setItems([]);
      localStorage.removeItem('voxcode-snippets');
      showToast('History cleared.');
    }
  };

  const handleViewInStudio = (item) => {
    navigate('/editor', {
      state: {
        code: item.code,
        language: item.language?.toLowerCase() || 'javascript',
        title: item.title,
      },
    });
  };

  const handleExportBackup = () => {
    const element = document.createElement('a');
    const file = new Blob([JSON.stringify(items, null, 2)], { type: 'application/json' });
    element.href = URL.createObjectURL(file);
    element.download = `voxcode_history_backup_${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    showToast('Exported backup JSON.');
  };

  return (
    <Layout title="Snippet History">
      <div className="max-w-6xl mx-auto space-y-8 pb-12">
        {/* Breadcrumb */}
        <Breadcrumb items={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'History' }]} />

        {/* Header & Stats Banner */}
        <div className="editorial-card rounded-[2.5rem] p-8 border border-[color:var(--border-color)] bg-[color:var(--bg-secondary)] shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="grain-overlay absolute inset-0 -z-10 opacity-50" />
          <div className="flex items-center gap-4">
            <div className="brand-gradient flex h-14 w-14 items-center justify-center rounded-3xl text-white shadow-lg shadow-orange-500/20 shrink-0">
              <HistoryIcon size={28} />
            </div>
            <div>
              <h2 className="display-title text-3xl font-extrabold text-[color:var(--text-primary)]">Your Code History</h2>
              <p className="text-sm text-[color:var(--text-secondary)] mt-1">Review, search, export, and reopen your saved voice-to-code snippets.</p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              onClick={() => navigate('/editor')}
              className="brand-gradient text-white px-5 py-3 rounded-2xl text-xs font-bold shadow-lg shadow-orange-500/20 hover:opacity-95 transition-all flex items-center gap-2 transform hover:-translate-y-0.5 shrink-0"
            >
              <Plus size={16} />
              <span>New Snippet</span>
            </button>
            <button
              onClick={handleExportBackup}
              disabled={items.length === 0}
              className="px-4 py-3 rounded-2xl bg-[color:var(--bg-tertiary)] hover:bg-[color:var(--bg-tertiary)]/80 text-[color:var(--text-primary)] text-xs font-bold border border-[color:var(--border-color)] transition-all shadow-sm flex items-center gap-2 disabled:opacity-40 shrink-0"
              title="Export all snippets as JSON backup"
            >
              <Download size={15} />
              <span className="hidden sm:inline">Backup JSON</span>
            </button>
            {items.length > 0 && (
              <button
                onClick={handleClearAll}
                className="p-3 rounded-2xl bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white transition-all shadow-sm shrink-0"
                title="Clear All History"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Search & Language Filters */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-[color:var(--bg-secondary)] p-4 rounded-3xl border border-[color:var(--border-color)] shadow-md">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-3.5 w-4 h-4 text-[color:var(--text-secondary)]" />
            <input
              type="text"
              placeholder="Search across snippet titles or code contents..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 rounded-2xl bg-[color:var(--bg-tertiary)]/50 border border-[color:var(--border-color)] text-sm font-medium text-[color:var(--text-primary)] placeholder-[color:var(--text-secondary)]/60 focus:outline-none focus:ring-2 focus:ring-[color:var(--accent-primary)]/50 transition-all"
            />
          </div>
          <div className="w-full sm:w-auto flex justify-end">
            <LanguageFilter
              languages={LANGUAGES}
              selected={selectedLanguage}
              onChange={setSelectedLanguage}
            />
          </div>
        </div>

        {/* Items List */}
        <div className="space-y-4">
          {filtered.length > 0 ? (
            filtered.map((item) => (
              <HistoryItem
                key={item.id || item.createdAt}
                item={item}
                onDelete={handleDelete}
                onCopy={() => showToast('Copied code to clipboard!')}
                onView={handleViewInStudio}
              />
            ))
          ) : (
            <div className="editorial-card rounded-[2.5rem] p-16 text-center border border-[color:var(--border-color)] bg-[color:var(--bg-secondary)] shadow-lg flex flex-col items-center justify-center gap-4">
              <div className="w-16 h-16 rounded-3xl bg-[color:var(--bg-tertiary)] flex items-center justify-center text-[color:var(--accent-primary)] shadow-inner">
                <Sparkles size={32} />
              </div>
              <div>
                <h3 className="display-title font-bold text-xl text-[color:var(--text-primary)]">No snippets found</h3>
                <p className="text-sm text-[color:var(--text-secondary)] mt-1 max-w-md">
                  {search || selectedLanguage
                    ? 'No saved snippets match your current search or filter criteria.'
                    : 'Your history is empty. Generate code in the Voice Studio and click "Save" to build your personal library!'}
                </p>
              </div>
              <button
                onClick={() => navigate('/editor')}
                className="mt-2 brand-gradient text-white px-6 py-3 rounded-2xl text-xs font-bold shadow-lg shadow-orange-500/20 hover:opacity-95 transition-all"
              >
                Go to Voice Studio
              </button>
            </div>
          )}
        </div>

        {/* Toast Notification */}
        {toast && (
          <div className="fixed bottom-8 right-8 z-50 animate-in slide-in-from-bottom-5 duration-300">
            <div className="brand-gradient px-6 py-3.5 rounded-2xl shadow-2xl flex items-center gap-2.5 text-white font-bold text-sm">
              <Sparkles size={16} />
              <span>{toast}</span>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
