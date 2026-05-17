import React from 'react';
import TopBar from './components/TopBar';
import Sidebar from './components/Sidebar';
import AIPanel from './components/AIPanel';
import CodeEditor from './components/Editor';

export default function App() {
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
