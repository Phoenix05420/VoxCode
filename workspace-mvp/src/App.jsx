import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import TopBar from './components/TopBar';
import Sidebar from './components/Sidebar';
import AIPanel from './components/AIPanel';
import CodeEditor from './components/Editor';
import { useUIStore } from './store';

function WorkspaceLayout() {
  return (
    <div className="workspace">
      <TopBar />
      <div className="main">
        <Sidebar />
        <div className="editor-area">
          <CodeEditor />
        </div>
        <AIPanel />
      </div>
    </div>
  );
}

export default function App() {
  const { darkMode } = useUIStore();
  
  // Apply dark mode class to document
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);
  
  return (
    <div className={darkMode ? 'dark' : ''}>
      <Router>
        <Routes>
          <Route path="/" element={<WorkspaceLayout />} />
          {/* TODO: Add more routes for login, settings, etc */}
        </Routes>
      </Router>
    </div>
  );
}
