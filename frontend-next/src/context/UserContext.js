'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const UserContext = createContext(undefined);

const DEFAULT_PREFERENCES = {
  autoSave: true,
  notifications: true,
  synthesize: true,
  defaultLanguage: 'javascript',
};

/**
 * Safely read a JSON value from localStorage.
 */
function readStorage(key, fallback) {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw !== null ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

/**
 * Safely write a JSON value to localStorage.
 */
function writeStorage(key, value) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage full or unavailable — silently fail
  }
}

/**
 * UserProvider — manages user identity and preferences.
 * Preferences are persisted to localStorage under 'voxcode-preferences'.
 */
export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [preferences, setPreferencesState] = useState(() =>
    readStorage('voxcode-preferences', DEFAULT_PREFERENCES)
  );

  // Persist preferences to localStorage on change
  useEffect(() => {
    writeStorage('voxcode-preferences', preferences);
  }, [preferences]);

  const setPreferences = useCallback((updater) => {
    setPreferencesState((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater };
      return next;
    });
  }, []);

  const updatePreference = useCallback((key, value) => {
    setPreferencesState((prev) => ({ ...prev, [key]: value }));
  }, []);

  const resetPreferences = useCallback(() => {
    setPreferencesState(DEFAULT_PREFERENCES);
  }, []);

  const value = {
    user,
    setUser,
    preferences,
    setPreferences,
    updatePreference,
    resetPreferences,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

/**
 * useUser hook — access user state and preferences.
 */
export function useUser() {
  const ctx = useContext(UserContext);
  if (ctx === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return ctx;
}
