import React from 'react';
import { useUIStore } from '../store';

export default function TopBar() {
  const { darkMode, toggleDarkMode } = useUIStore();
  
  return (
    <header className="topbar shadow-lg">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold text-accent-blue">VoxCode</h1>
        <span className="text-sm text-dark-400">AI-Powered Voice Programming</span>
      </div>
      
      <div className="flex items-center gap-4">
        <button
          onClick={toggleDarkMode}
          className="p-2 hover:bg-dark-700 rounded transition-colors"
          title={darkMode ? 'Light mode' : 'Dark mode'}
        >
          {darkMode ? '🌙' : '☀️'}
        </button>
        <button className="p-2 hover:bg-dark-700 rounded transition-colors" title="Settings">
          ⚙️
        </button>
      </div>
    </header>
  );
}
