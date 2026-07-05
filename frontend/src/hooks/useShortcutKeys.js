import { useEffect, useCallback, useState } from 'react';
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

export function useShortcutKeys(onTrigger) {
  const [bindingId, setBindingId] = useState(null);

  const startBinding = useCallback((shortcutId) => {
    setBindingId(shortcutId);
  }, []);

  const stopBinding = useCallback(() => {
    setBindingId(null);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) {
        if (e.key === 'Escape') {
          if (bindingId) setBindingId(null);
        }
        return;
      }

      if (bindingId) {
        e.preventDefault();
        e.stopPropagation();
        const combo = normalizeKey(e);
        if (combo) {
          shortcutStore.update(bindingId, { keybinding: combo });
        }
        setBindingId(null);
        return;
      }

      if (e.key === 'Escape') return;

      const combo = normalizeKey(e);
      if (!combo) return;

      const sc = shortcutStore.getByKeybinding(combo);
      if (sc) {
        e.preventDefault();
        e.stopPropagation();
        onTrigger(sc);
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onTrigger, bindingId]);

  return { bindingId, startBinding, stopBinding };
}
