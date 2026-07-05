/**
 * VoxCode Shortcut Store
 *
 * Module-level singleton pub-sub store for managing shortcuts.
 * Persists to localStorage; SSR-safe.
 */

import { codeShortcuts } from './codeShortcuts';

const STORAGE_KEY = 'voxcode_shortcuts';

// ─── Internal State ──────────────────────────────────────────────────
let shortcuts = [];
let listeners = [];

/**
 * Generate a stable ID from a shortcut key.
 * @param {string} key
 * @returns {string}
 */
function toId(key) {
  return key.replace(/\s+/g, '-').toLowerCase();
}

/**
 * Build default shortcut entries from the codeShortcuts dictionary.
 * @returns {Array<object>}
 */
function buildDefaults() {
  return Object.entries(codeShortcuts).map(([key, data]) => ({
    id: toId(key),
    voiceKey: key,
    prompt: data.prompt,
    language: data.language,
    category: data.category,
    description: data.description,
    enabled: true,
    keybinding: null,
  }));
}

/**
 * Load shortcuts from localStorage or fall back to defaults.
 */
function load() {
  if (typeof window === 'undefined') {
    shortcuts = buildDefaults();
    return;
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        shortcuts = parsed;
        return;
      }
    }
  } catch {
    // Corrupted data — reset to defaults
  }

  shortcuts = buildDefaults();
  save();
}

/**
 * Persist current shortcuts to localStorage.
 */
function save() {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(shortcuts));
  } catch {
    // Storage full or unavailable
  }
}

/**
 * Notify all listeners of a state change.
 */
function notify() {
  const snapshot = [...shortcuts];
  for (const fn of listeners) {
    try {
      fn(snapshot);
    } catch {
      // Listener threw — ignore
    }
  }
}

// ─── Initialize ──────────────────────────────────────────────────────
load();

// ─── Public API ──────────────────────────────────────────────────────

export const shortcutStore = {
  /**
   * Get all shortcuts.
   * @returns {Array<object>}
   */
  getAll() {
    return [...shortcuts];
  },

  /**
   * Get only enabled shortcuts.
   * @returns {Array<object>}
   */
  getEnabled() {
    return shortcuts.filter((s) => s.enabled);
  },

  /**
   * Find a shortcut by ID.
   * @param {string} id
   * @returns {object|undefined}
   */
  getById(id) {
    return shortcuts.find((s) => s.id === id);
  },

  /**
   * Add a new shortcut entry.
   * @param {object} entry - Must have at least { voiceKey, prompt }
   * @returns {object} The created entry
   */
  add(entry) {
    const newEntry = {
      id: entry.id || toId(entry.voiceKey || 'custom-' + Date.now()),
      voiceKey: entry.voiceKey || '',
      prompt: entry.prompt || '',
      language: entry.language || 'javascript',
      category: entry.category || 'utilities',
      description: entry.description || '',
      enabled: entry.enabled !== false,
      keybinding: entry.keybinding || null,
    };
    shortcuts = [...shortcuts, newEntry];
    save();
    notify();
    return newEntry;
  },

  /**
   * Update an existing shortcut.
   * @param {string} id - Shortcut ID
   * @param {object} changes - Fields to merge
   * @returns {object|null} Updated entry or null if not found
   */
  update(id, changes) {
    const index = shortcuts.findIndex((s) => s.id === id);
    if (index === -1) return null;

    shortcuts = shortcuts.map((s) =>
      s.id === id ? { ...s, ...changes, id } : s,
    );
    save();
    notify();
    return shortcuts.find((s) => s.id === id);
  },

  /**
   * Remove a shortcut by ID.
   * @param {string} id
   * @returns {boolean} Whether the shortcut was found and removed
   */
  remove(id) {
    const len = shortcuts.length;
    shortcuts = shortcuts.filter((s) => s.id !== id);
    if (shortcuts.length === len) return false;
    save();
    notify();
    return true;
  },

  /**
   * Toggle a shortcut enabled state.
   * @param {string} id
   * @returns {boolean|null} New enabled state, or null if not found
   */
  toggle(id) {
    const entry = shortcuts.find((s) => s.id === id);
    if (!entry) return null;

    shortcuts = shortcuts.map((s) =>
      s.id === id ? { ...s, enabled: !s.enabled } : s,
    );
    save();
    notify();
    return !entry.enabled;
  },

  /**
   * Find a shortcut by its keyboard binding combo string.
   * @param {string} combo - e.g. 'Ctrl+Shift+G'
   * @returns {object|undefined}
   */
  getByKeybinding(combo) {
    if (!combo) return undefined;
    const lower = combo.toLowerCase();
    return shortcuts.find(
      (s) => s.enabled && s.keybinding && s.keybinding.toLowerCase() === lower,
    );
  },

  /**
   * Find a shortcut by its voice key.
   * @param {string} key - Voice trigger phrase
   * @returns {object|undefined}
   */
  getByVoiceKey(key) {
    if (!key) return undefined;
    const lower = key.toLowerCase();
    return shortcuts.find(
      (s) => s.enabled && s.voiceKey && s.voiceKey.toLowerCase() === lower,
    );
  },

  /**
   * Match a voice transcript against all enabled shortcuts.
   * Performs case-insensitive substring matching.
   * @param {string} text - Voice transcript
   * @returns {object|null} First matching shortcut, or null
   */
  matchVoice(text) {
    if (!text || typeof text !== 'string') return null;
    const lower = text.toLowerCase().trim();
    if (!lower) return null;

    return (
      shortcuts.find(
        (s) => s.enabled && s.voiceKey && lower.includes(s.voiceKey.toLowerCase()),
      ) || null
    );
  },

  /**
   * Reset all shortcuts to defaults.
   */
  reset() {
    shortcuts = buildDefaults();
    save();
    notify();
  },

  /**
   * Subscribe to store changes.
   * @param {function} fn - Listener callback, receives shortcuts array
   * @returns {function} Unsubscribe function
   */
  subscribe(fn) {
    if (typeof fn !== 'function') return () => {};
    listeners = [...listeners, fn];
    return () => {
      listeners = listeners.filter((l) => l !== fn);
    };
  },
};

export default shortcutStore;
