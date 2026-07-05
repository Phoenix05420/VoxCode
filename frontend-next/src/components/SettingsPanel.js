'use client';

import { useState, useEffect } from 'react';
import { X, Keyboard, Mic, Plus, Trash2, RotateCcw, Check } from 'lucide-react';
import { shortcutStore } from '@/services/shortcutStore';
import { cn } from '@/lib/utils';

export function SettingsPanel({ onClose }) {
  const [items, setItems] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ voiceTrigger: '', keybinding: '', prompt: '' });
  const [adding, setAdding] = useState(false);
  const [newForm, setNewForm] = useState({ voiceTrigger: '', keybinding: '', prompt: '', category: 'custom' });

  useEffect(() => {
    const loadItems = () => setItems(shortcutStore.getAll());
    loadItems();
    const unsubscribe = shortcutStore.subscribe(loadItems);
    return () => unsubscribe();
  }, []);

  const handleToggle = (id) => {
    shortcutStore.toggle(id);
  };

  const handleDelete = (id) => {
    shortcutStore.remove(id);
  };

  const handleReset = () => {
    if (confirm('Reset all shortcuts to default settings?')) {
      shortcutStore.reset();
    }
  };

  const handleSaveEdit = (id) => {
    shortcutStore.update(id, editForm);
    setEditingId(null);
  };

  const handleAddNew = (e) => {
    e.preventDefault();
    if (!newForm.voiceTrigger || !newForm.prompt) return;
    shortcutStore.add({
      id: `custom_${Date.now()}`,
      ...newForm,
      enabled: true
    });
    setAdding(false);
    setNewForm({ voiceTrigger: '', keybinding: '', prompt: '', category: 'custom' });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
      <div className="surface-card bg-elevated border border-light w-full max-w-4xl max-h-[85vh] rounded-xl shadow-xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-secondary border-b border-light">
          <div className="flex items-center gap-2">
            <Keyboard className="w-5 h-5 text-accent-violet" />
            <h2 className="text-lg font-bold text-primary">Keybindings & Voice Shortcuts</h2>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-secondary hover:text-primary border border-light rounded-lg transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Defaults
            </button>
            <button
              onClick={() => setAdding(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white brand-gradient rounded-lg shadow-xs transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Shortcut
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-secondary hover:text-primary rounded-lg hover:bg-tertiary transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Add New Form */}
        {adding && (
          <form onSubmit={handleAddNew} className="p-4 bg-accent-violet-bg/30 border-b border-light grid grid-cols-1 md:grid-cols-3 gap-3 animate-fadeIn">
            <input
              type="text"
              placeholder="Voice Trigger (e.g., 'create test')"
              value={newForm.voiceTrigger}
              onChange={(e) => setNewForm({ ...newForm, voiceTrigger: e.target.value })}
              className="px-3 py-2 text-xs bg-elevated border border-light rounded-lg text-primary focus:outline-none focus:border-focus"
              required
            />
            <input
              type="text"
              placeholder="Keybinding (e.g., 'ctrl+shift+t')"
              value={newForm.keybinding}
              onChange={(e) => setNewForm({ ...newForm, keybinding: e.target.value })}
              className="px-3 py-2 text-xs font-mono bg-elevated border border-light rounded-lg text-primary focus:outline-none focus:border-focus"
            />
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="AI Prompt generated..."
                value={newForm.prompt}
                onChange={(e) => setNewForm({ ...newForm, prompt: e.target.value })}
                className="flex-1 px-3 py-2 text-xs bg-elevated border border-light rounded-lg text-primary focus:outline-none focus:border-focus"
                required
              />
              <button type="submit" className="px-3 py-2 bg-accent-violet text-white text-xs font-semibold rounded-lg">Save</button>
              <button type="button" onClick={() => setAdding(false)} className="px-3 py-2 bg-secondary text-secondary text-xs rounded-lg">Cancel</button>
            </div>
          </form>
        )}

        {/* Shortcuts List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className={cn(
                "p-4 rounded-lg border transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4",
                item.enabled !== false ? "bg-elevated border-light shadow-xs" : "bg-secondary border-subtle opacity-60"
              )}
            >
              {editingId === item.id ? (
                <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3 w-full">
                  <input
                    type="text"
                    value={editForm.voiceTrigger}
                    onChange={(e) => setEditForm({ ...editForm, voiceTrigger: e.target.value })}
                    className="px-3 py-1.5 text-xs bg-secondary border border-light rounded text-primary font-medium"
                  />
                  <input
                    type="text"
                    value={editForm.keybinding}
                    onChange={(e) => setEditForm({ ...editForm, keybinding: e.target.value })}
                    className="px-3 py-1.5 text-xs bg-secondary border border-light rounded text-primary font-mono"
                  />
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={editForm.prompt}
                      onChange={(e) => setEditForm({ ...editForm, prompt: e.target.value })}
                      className="flex-1 px-3 py-1.5 text-xs bg-secondary border border-light rounded text-primary"
                    />
                    <button onClick={() => handleSaveEdit(item.id)} className="p-1.5 bg-accent-emerald text-white rounded"><Check className="w-4 h-4" /></button>
                    <button onClick={() => setEditingId(null)} className="p-1.5 bg-secondary text-secondary rounded"><X className="w-4 h-4" /></button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1.5 text-sm font-bold text-primary">
                        <Mic className="w-4 h-4 text-accent-violet" />
                        "{item.voiceTrigger}"
                      </span>
                      {item.keybinding && (
                        <span className="px-2 py-0.5 bg-tertiary text-primary font-mono text-[11px] rounded border border-light">
                          {item.keybinding}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-secondary line-clamp-1">{item.prompt}</p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={item.enabled !== false}
                        onChange={() => handleToggle(item.id)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-tertiary peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-accent-violet"></div>
                    </label>

                    <button
                      onClick={() => {
                        setEditingId(item.id);
                        setEditForm({ voiceTrigger: item.voiceTrigger, keybinding: item.keybinding || '', prompt: item.prompt });
                      }}
                      className="px-2.5 py-1 text-xs font-medium text-secondary hover:text-primary border border-light rounded transition-all"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-1.5 text-secondary hover:text-accent-rose transition-all"
                      title="Delete Shortcut"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default SettingsPanel;
