import { codeShortcuts } from './codeShortcuts';

const STORAGE_KEY = 'voxcode_shortcuts';

function defaultShortcuts() {
  return Object.entries(codeShortcuts).map(([key, prompt], idx) => ({
    id: `sc_${idx}`,
    key,
    keybinding: '',
    prompt,
    display: prompt.split(' ').slice(0, 5).join(' ') + '...',
    enabled: true,
  }));
}

function loadShortcuts() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return defaultShortcuts();
}

function saveShortcuts(shortcuts) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(shortcuts));
}

let shortcuts = loadShortcuts();
let listeners = [];

function notify() {
  listeners.forEach(fn => fn([...shortcuts]));
}

export const shortcutStore = {
  getAll() {
    return [...shortcuts];
  },

  getEnabled() {
    return shortcuts.filter(s => s.enabled);
  },

  getById(id) {
    return shortcuts.find(s => s.id === id);
  },

  add(entry) {
    const id = `sc_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    shortcuts.push({ id, enabled: true, ...entry });
    saveShortcuts(shortcuts);
    notify();
    return id;
  },

  update(id, changes) {
    const idx = shortcuts.findIndex(s => s.id === id);
    if (idx === -1) return;
    shortcuts[idx] = { ...shortcuts[idx], ...changes };
    saveShortcuts(shortcuts);
    notify();
  },

  remove(id) {
    shortcuts = shortcuts.filter(s => s.id !== id);
    saveShortcuts(shortcuts);
    notify();
  },

  toggle(id) {
    const s = shortcuts.find(x => x.id === id);
    if (s) {
      s.enabled = !s.enabled;
      saveShortcuts(shortcuts);
      notify();
    }
  },

  getByKeybinding(keybinding) {
    return shortcuts.find(s => s.enabled && s.keybinding === keybinding);
  },

  getByVoiceKey(key) {
    return shortcuts.find(s => s.enabled && s.key.toLowerCase() === key.toLowerCase());
  },

  matchVoice(text) {
    const lower = text.toLowerCase();
    for (const s of shortcuts) {
      if (s.enabled && lower.includes(s.key.toLowerCase())) return s;
    }
    return null;
  },

  subscribe(fn) {
    listeners.push(fn);
    return () => {
      listeners = listeners.filter(l => l !== fn);
    };
  },

  reset() {
    shortcuts = defaultShortcuts();
    saveShortcuts(shortcuts);
    notify();
  },
};
