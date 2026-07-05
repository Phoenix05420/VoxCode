'use client';

import { useUser } from '@/context/UserContext';

/**
 * Thin wrapper extracting preferences from UserContext.
 */
export function usePreferences() {
  const { preferences, updatePreferences } = useUser();
  return { preferences, updatePreferences };
}
