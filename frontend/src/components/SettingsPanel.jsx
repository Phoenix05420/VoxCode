import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  X, Plus, Trash2, Save, Keyboard, Mic, FileText, Check, RotateCcw
} from 'lucide-react';
import { shortcutStore } from '../services/shortcutStore';

function normalizeKey(e) {
  const parts = [];
  if (e.ctrlKey || e.metaKey) parts.push('ctrl');
  if (e.altKey) parts.push('alt');
  if (e.shiftKey) parts.push('shift');
  const key = e.key === ' ' ? 'space' : e.key.toLowerCase();
  if (!['control', 'shift', 'alt', 'meta'].includes(key)) {
    parts.push(key);
  }
  return parts.join('+');
}

function KeybindingInput({ value, onChange, disabled }) {
  const [recording, setRecording] = useState(false);

  const handleKey = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    const combo = normalizeKey(e);
    if (combo) {
      onChange(combo);
      setRecording(false);
    }
  }, [onChange]);

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => setRecording(true)}
      onKeyDown={recording ? handleKey : undefined}
      className={`relative min-w-[120px] rounded-xl border px-3 py-2 text-xs font-mono font-bold text-center transition-all ${
        recording
          ? 'border-orange-500 bg-orange-500/10 text-orange-400 animate-pulse ring-2 ring-orange-500/30'
          : value
            ? 'border-[color:var(--border-color)] bg-[color:var(--bg-secondary)] text-[color:var(--text-primary)]'
            : 'border-dashed border-[color:var(--border-color)] text-[color:var(--text-secondary)] hover:border-orange-400/50'
      }`}
    >
      {recording ? 'Press keys...' : (value || 'Click to bind')}
      {recording && <span className="absolute -top-1 -right-1 flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span></span>}
    </button>
  );
}

export default function SettingsPanel({ onClose }) {
  const [items, setItems] = useState(() => shortcutStore.getAll());
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ key: '', keybinding: '', prompt: '' });
  const [adding, setAdding] = useState(false);
  const [newForm, setNewForm] = useState({ key: '', keybinding: '', prompt: '' });
  const panelRef = useRef(null);

  useEffect(() => {
    const unsub = shortcutStore.subscribe(setItems);
    return unsub;
  }, []);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  useEffect(() => {
    if (editingId) {
      const s = shortcutStore.getById(editingId);
      if (s) setEditForm({ key: s.key, keybinding: s.keybinding, prompt: s.prompt });
    }
  }, [editingId]);

  const startEdit = (s) => {
    setEditingId(s.id);
    setEditForm({ key: s.key, keybinding: s.keybinding, prompt: s.prompt });
    setAdding(false);
  };

  const saveEdit = () => {
    if (!editForm.key.trim() || !editForm.prompt.trim()) return;
    shortcutStore.update(editingId, {
      key: editForm.key.trim().toLowerCase(),
      keybinding: editForm.keybinding,
      prompt: editForm.prompt.trim(),
      display: editForm.prompt.split(' ').slice(0, 5).join(' ') + '...',
    });
    setEditingId(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const startAdd = () => {
    setAdding(true);
    setNewForm({ key: '', keybinding: '', prompt: '' });
    setEditingId(null);
  };

  const saveAdd = () => {
    if (!newForm.key.trim() || !newForm.prompt.trim()) return;
    shortcutStore.add({
      key: newForm.key.trim().toLowerCase(),
      keybinding: newForm.keybinding,
      prompt: newForm.prompt.trim(),
      display: newForm.prompt.split(' ').slice(0, 5).join(' ') + '...',
    });
    setNewForm({ key: '', keybinding: '', prompt: '' });
    setAdding(false);
  };

  const cancelAdd = () => {
    setAdding(false);
  };

  const handleReset = () => {
    if (window.confirm('Reset all shortcuts to defaults? This cannot be undone.')) {
      shortcutStore.reset();
      setEditingId(null);
      setAdding(false);
    }
  };

  const handleToggle = (id) => {
    shortcutStore.toggle(id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div
        ref={panelRef}
        className="editorial-card mx-4 max-h-[85vh] w-full max-w-3xl overflow-hidden rounded-[2rem] shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[color:var(--border-color)] px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="brand-gradient flex h-10 w-10 items-center justify-center rounded-xl text-white">
              <Keyboard size={18} />
            </div>
            <div>
              <h2 className="display-title text-xl font-bold">Shortcut Settings</h2>
              <p className="text-xs text-[color:var(--text-secondary)]">
                {items.filter(s => s.enabled).length} of {items.length} shortcuts enabled
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              title="Reset to defaults"
              className="editorial-panel rounded-xl p-2.5 text-[color:var(--text-secondary)] hover:text-rose-500"
            >
              <RotateCcw size={16} />
            </button>
            <button
              onClick={onClose}
              className="editorial-panel rounded-xl p-2.5 text-[color:var(--text-secondary)] hover:text-[color:var(--accent-primary)]"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-6" style={{ maxHeight: 'calc(85vh - 140px)' }}>
          {items.length === 0 && !adding && (
            <div className="py-12 text-center text-sm text-[color:var(--text-secondary)]">
              No shortcuts configured. Click "Add Shortcut" to create one.
            </div>
          )}

          <div className="space-y-3">
            {items.map((s) => (
              <div
                key={s.id}
                className={`rounded-2xl border p-4 transition-all ${
                  !s.enabled ? 'opacity-50 border-dashed border-[color:var(--border-color)]' : 'border-[color:var(--border-color)] bg-[color:var(--bg-secondary)]/30'
                } ${editingId === s.id ? 'ring-2 ring-orange-500/20' : ''}`}
              >
                {editingId === s.id ? (
                  /* Editing row */
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                      <div>
                        <label className="eyebrow mb-1.5 block text-[10px] text-[color:var(--accent-primary)]">
                          <Mic size={12} className="inline mr-1" />Voice trigger
                        </label>
                        <input
                          type="text"
                          value={editForm.key}
                          onChange={(e) => setEditForm(f => ({ ...f, key: e.target.value }))}
                          className="w-full rounded-xl border border-[color:var(--border-color)] bg-[color:var(--bg-primary)] px-3 py-2.5 text-sm font-medium outline-none focus:border-orange-400"
                          placeholder="e.g. array list"
                        />
                      </div>
                      <div>
                        <label className="eyebrow mb-1.5 block text-[10px] text-[color:var(--accent-primary)]">
                          <Keyboard size={12} className="inline mr-1" />Keyboard shortcut
                        </label>
                        <KeybindingInput
                          value={editForm.keybinding}
                          onChange={(v) => setEditForm(f => ({ ...f, keybinding: v }))}
                        />
                      </div>
                      <div className="flex items-end gap-2">
                        <button
                          onClick={saveEdit}
                          disabled={!editForm.key.trim() || !editForm.prompt.trim()}
                          className="brand-gradient flex-1 rounded-xl px-4 py-2.5 text-xs font-bold text-white disabled:opacity-40"
                        >
                          <Save size={14} className="inline mr-1" />Save
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="editorial-panel rounded-xl px-4 py-2.5 text-xs font-bold text-[color:var(--text-secondary)]"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="eyebrow mb-1.5 block text-[10px] text-[color:var(--accent-primary)]">
                        <FileText size={12} className="inline mr-1" />Prompt text
                      </label>
                      <textarea
                        value={editForm.prompt}
                        onChange={(e) => setEditForm(f => ({ ...f, prompt: e.target.value }))}
                        rows={2}
                        className="w-full resize-none rounded-xl border border-[color:var(--border-color)] bg-[color:var(--bg-primary)] px-3 py-2.5 text-sm font-medium outline-none focus:border-orange-400"
                        placeholder="What to generate when triggered..."
                      />
                    </div>
                  </div>
                ) : (
                  /* Display row */
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => handleToggle(s.id)}
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border text-xs font-bold transition-all ${
                        s.enabled
                          ? 'border-emerald-500 bg-emerald-500/10 text-emerald-500'
                          : 'border-[color:var(--border-color)] text-[color:var(--text-secondary)]'
                      }`}
                    >
                      {s.enabled && <Check size={14} />}
                    </button>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-orange-500/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-orange-400">
                          {s.key}
                        </span>
                        {s.keybinding && (
                          <span className="rounded-full bg-indigo-500/10 px-2.5 py-0.5 text-[10px] font-mono font-bold text-indigo-400">
                            {s.keybinding}
                          </span>
                        )}
                        {!s.keybinding && (
                          <span className="text-[10px] italic text-[color:var(--text-secondary)]">
                            no key binding
                          </span>
                        )}
                      </div>
                      <p className="mt-1 truncate text-sm text-[color:var(--text-secondary)]">
                        {s.prompt}
                      </p>
                    </div>

                    <div className="flex shrink-0 items-center gap-1">
                      <button
                        onClick={() => startEdit(s)}
                        className="editorial-panel rounded-xl p-2 text-[color:var(--text-secondary)] hover:text-orange-400"
                        title="Edit"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
                      </button>
                      <button
                        onClick={() => shortcutStore.remove(s.id)}
                        className="editorial-panel rounded-xl p-2 text-[color:var(--text-secondary)] hover:text-rose-500"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Add new shortcut form */}
          {adding && (
            <div className="mt-4 rounded-2xl border border-dashed border-orange-400/30 bg-orange-500/5 p-4">
              <div className="space-y-3">
                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                  <div>
                    <label className="eyebrow mb-1.5 block text-[10px] text-[color:var(--accent-primary)]">
                      <Mic size={12} className="inline mr-1" />Voice trigger
                    </label>
                    <input
                      type="text"
                      value={newForm.key}
                      onChange={(e) => setNewForm(f => ({ ...f, key: e.target.value }))}
                      className="w-full rounded-xl border border-[color:var(--border-color)] bg-[color:var(--bg-primary)] px-3 py-2.5 text-sm font-medium outline-none focus:border-orange-400"
                      placeholder="e.g. quick sort"
                    />
                  </div>
                  <div>
                    <label className="eyebrow mb-1.5 block text-[10px] text-[color:var(--accent-primary)]">
                      <Keyboard size={12} className="inline mr-1" />Keyboard shortcut
                    </label>
                    <KeybindingInput
                      value={newForm.keybinding}
                      onChange={(v) => setNewForm(f => ({ ...f, keybinding: v }))}
                    />
                  </div>
                  <div className="flex items-end gap-2">
                    <button
                      onClick={saveAdd}
                      disabled={!newForm.key.trim() || !newForm.prompt.trim()}
                      className="brand-gradient flex-1 rounded-xl px-4 py-2.5 text-xs font-bold text-white disabled:opacity-40"
                    >
                      <Plus size={14} className="inline mr-1" />Add
                    </button>
                    <button
                      onClick={cancelAdd}
                      className="editorial-panel rounded-xl px-4 py-2.5 text-xs font-bold text-[color:var(--text-secondary)]"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
                <div>
                  <label className="eyebrow mb-1.5 block text-[10px] text-[color:var(--accent-primary)]">
                    <FileText size={12} className="inline mr-1" />Prompt text
                  </label>
                  <textarea
                    value={newForm.prompt}
                    onChange={(e) => setNewForm(f => ({ ...f, prompt: e.target.value }))}
                    rows={2}
                    className="w-full resize-none rounded-xl border border-[color:var(--border-color)] bg-[color:var(--bg-primary)] px-3 py-2.5 text-sm font-medium outline-none focus:border-orange-400"
                    placeholder="What to generate when triggered..."
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-[color:var(--border-color)] px-6 py-4">
          <button
            onClick={startAdd}
            className="editorial-panel flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold text-[color:var(--accent-primary)] hover:bg-orange-500/10"
          >
            <Plus size={14} /> Add Shortcut
          </button>
          <button
            onClick={onClose}
            className="brand-gradient rounded-xl px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-orange-500/20"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
