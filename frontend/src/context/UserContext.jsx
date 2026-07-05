import { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [preferences, setPreferences] = useState(() => {
    const saved = localStorage.getItem('voxcode-preferences');
    return saved ? JSON.parse(saved) : {
      autoSave: true,
      notifications: true,
      synthesize: true,
      defaultLanguage: 'javascript',
    };
  });

  useEffect(() => {
    localStorage.setItem('voxcode-preferences', JSON.stringify(preferences));
  }, [preferences]);

  const updatePreferences = (newPrefs) => {
    setPreferences(prev => ({ ...prev, ...newPrefs }));
  };

  return (
    <UserContext.Provider value={{ user, setUser, preferences, updatePreferences }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within UserProvider');
  }
  return context;
}
