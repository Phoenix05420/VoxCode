import { useUser } from '../context/UserContext';

export function usePreferences() {
  const { preferences, updatePreferences } = useUser();
  return { preferences, updatePreferences };
}
