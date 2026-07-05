'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Clock, Search, Trash2, Download, Code2, ArrowRight, Share2 } from 'lucide-react';
import { Breadcrumb } from '@/components/Breadcrumb';
import { HistoryItem } from '@/components/HistoryItem';
import { LanguageFilter } from '@/components/LanguageFilter';
import { cn } from '@/lib/utils';
import { LANGUAGES } from '@/lib/constants';

const DEFAULT_HISTORY = [
  {
    id: 'snip_1',
    title: 'Express JWT Authentication Middleware',
    code: 'const jwt = require("jsonwebtoken");\\n\\nfunction authenticateToken(req, res, next) {\\n  const authHeader = req.headers["authorization"];\\n  const token = authHeader && authHeader.split(" ")[1];\\n  if (!token) return res.sendStatus(401);\\n\\n  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {\\n    if (err) return res.sendStatus(403);\\n    req.user = user;\\n    next();\\n  });\\n}',
    language: 'javascript',
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString()
  },
  {
    id: 'snip_2',
    title: 'Concurrent QuickSort in Go',
    code: 'package main\\n\\nimport "sync"\\n\\nfunc quicksort(arr []int, wg *sync.WaitGroup) {\\n  defer wg.Done()\\n  if len(arr) < 2 { return }\\n  left, right := 0, len(arr)-1\\n  pivot := arr[len(arr)/2]\\n  arr[left], arr[len(arr)/2] = arr[len(arr)/2], arr[left]\\n  for i := range arr {\\n    if arr[i] < pivot {\\n      left++\\n      arr[left], arr[i] = arr[i], arr[left]\\n    }\\n  }\\n}',
    language: 'go',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString()
  },
  {
    id: 'snip_3',
    title: 'Idiomatic Doubly Linked List in Rust',
    code: 'use std::cell::RefCell;\\nuse std::rc::{Rc, Weak};\\n\\npub struct Node<T> {\\n    pub elem: T,\\n    pub next: Option<Rc<RefCell<Node<T>>>>,\\n    pub prev: Option<Weak<RefCell<Node<T>>>>,\\n}',
    language: 'rust',
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString()
  }
];

export default function HistoryPage() {
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = JSON.parse(localStorage.getItem('voxcode-snippets') || '[]');
        setItems(stored.length > 0 ? stored : DEFAULT_HISTORY);
      } catch (e) {
        setItems(DEFAULT_HISTORY);
      }
    }
  }, []);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const handleDelete = (id) => {
    const updated = items.filter(item => item.id !== id);
    setItems(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('voxcode-snippets', JSON.stringify(updated));
    }
    showToast('Snippet deleted from history');
  };

  const handleClearAll = () => {
    if (confirm('Are you sure you want to clear all saved code snippets?')) {
      setItems([]);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('voxcode-snippets');
      }
      showToast('All snippets cleared');
    }
  };

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(items, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `voxcode_history_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Exported history as JSON');
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase()) ||
                          item.code.toLowerCase().includes(search.toLowerCase());
    const matchesLang = !selectedLanguage || item.language === selectedLanguage;
    return matchesSearch && matchesLang;
  });

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      {toast && (
        <div className="toast toast-success">{toast}</div>
      )}

      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <Breadcrumb items={[{ label: 'History' }]} />
          <h1 className="text-2xl font-bold text-primary font-display">Snippet Vault & History</h1>
          <p className="text-xs text-secondary">Review, export, or reload previously generated architecture sessions.</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportJSON}
            disabled={items.length === 0}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-secondary hover:bg-tertiary text-primary rounded-lg border border-light transition-all shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>
          
          <button
            onClick={handleClearAll}
            disabled={items.length === 0}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-accent-rose/10 hover:bg-accent-rose/20 text-accent-rose rounded-lg border border-accent-rose/30 transition-all shadow-xs"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear All</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-elevated p-3 rounded-xl border border-light shadow-xs">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-tertiary absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search snippets by keyword or syntax..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-secondary border border-light rounded-lg text-primary placeholder-secondary focus:outline-none focus:border-focus"
          />
        </div>

        <div className="w-full sm:w-auto">
          <LanguageFilter
            languages={LANGUAGES}
            selected={selectedLanguage}
            onChange={setSelectedLanguage}
          />
        </div>
      </div>

      {/* Snippets Grid */}
      {filteredItems.length === 0 ? (
        <div className="surface-card p-12 text-center rounded-2xl border border-light space-y-3">
          <Code2 className="w-10 h-10 text-tertiary mx-auto opacity-40" />
          <h3 className="text-base font-bold text-primary">No matching snippets found</h3>
          <p className="text-xs text-secondary max-w-md mx-auto">
            {search || selectedLanguage ? "Try adjusting your search query or language filter." : "You haven't saved any code snippets yet. Head to the Studio and click Save on your next session!"}
          </p>
          <button
            onClick={() => router.push('/editor')}
            className="inline-flex items-center gap-2 px-4 py-2 brand-gradient text-white text-xs font-semibold rounded-lg shadow-xs mt-2"
          >
            <span>Launch Studio</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => (
            <HistoryItem
              key={item.id}
              item={item}
              onDelete={() => handleDelete(item.id)}
              onCopy={() => showToast('Code copied to clipboard')}
              onView={() => {
                router.push(`/editor?code=${encodeURIComponent(item.code)}&language=${item.language}&title=${encodeURIComponent(item.title)}`);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
