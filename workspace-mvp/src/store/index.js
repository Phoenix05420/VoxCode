import { create } from 'zustand';

// UI Store
export const useUIStore = create((set) => ({
  darkMode: true,
  sidebarOpen: true,
  selectedProject: null,
  
  toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSelectedProject: (project) => set({ selectedProject: project }),
}));

// User Store
export const useUserStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  token: null,
  
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setToken: (token) => set({ token }),
  logout: () => set({ user: null, isAuthenticated: false, token: null }),
}));

// Projects Store
export const useProjectsStore = create((set) => ({
  projects: [],
  currentProject: null,
  loading: false,
  error: null,
  
  setProjects: (projects) => set({ projects }),
  setCurrentProject: (project) => set({ currentProject: project }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  
  addProject: (project) => set((state) => ({
    projects: [...state.projects, project],
  })),
}));

// Code Snippets Store
export const useSnippetsStore = create((set) => ({
  snippets: [],
  currentSnippet: null,
  
  setSnippets: (snippets) => set({ snippets }),
  setCurrentSnippet: (snippet) => set({ currentSnippet: snippet }),
  
  addSnippet: (snippet) => set((state) => ({
    snippets: [...state.snippets, snippet],
  })),
}));
