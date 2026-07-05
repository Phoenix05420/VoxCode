'use client';

import { useEffect, useCallback, useState } from 'react';
import { shortcutStore } from '@/services/shortcutStore';

/**
 * Hook for listening to global keyboard shortcuts.
 */
export function useShortcutKeys(onTrigger) {
  const [bindingId, setBindingId] = useState(null);

  const startBinding = useCallback((id) => {
    setBindingId(id);
  }, []);

  const stopBinding = useCallback(() => {
    setBindingId(null);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore when typing in input, textarea, or contentEditable
      const target = e.target;
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;
      
      if (isInput && e.key !== 'Escape') {
        return;
      }

      // If in binding mode, record keybinding
      if (bindingId) {
        e.preventDefault();
        if (e.key === 'Escape') {
          stopBinding();
          return;
        }
        
        const parts = [];
        if (e.ctrlKey || e.metaKey) parts.push('ctrl');
        if (e.altKey) parts.push('alt');
        if (e.shiftKey) parts.push('shift');
        
        const key = e.key.toLowerCase();
        if (!['control', 'alt', 'shift', 'meta'].includes(key)) {
          parts.push(key);
          const combo = parts.join('+');
          shortcutStore.update(bindingId, { keybinding: combo });
          stopBinding();
        }
        return;
      }

      // Normal shortcut matching
      if (onTrigger) {
        const parts = [];
        if (e.ctrlKey || e.metaKey) parts.push('ctrl');
        if (e.altKey) parts.push('alt');
        if (e.shiftKey) parts.push('shift');
        
        const key = e.key.toLowerCase();
        if (!['control', 'alt', 'shift', 'meta'].includes(key)) {
          parts.push(key);
          const combo = parts.join('+');
          const matched = shortcutStore.getByKeybinding(combo);
          if (matched && matched.enabled !== false) {
            e.preventDefault();
            onTrigger(matched);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [bindingId, onTrigger, stopBinding]);

  return { bindingId, startBinding, stopBinding };
}
