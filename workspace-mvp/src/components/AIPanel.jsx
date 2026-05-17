import React from 'react';

export default function AIPanel() {
  return (
    <aside className="ai-panel">
      <h3>AI Assistant</h3>
      <div className="ai-actions">
        <button>Explain Code</button>
        <button>Fix Errors</button>
        <button>Generate</button>
      </div>
      <div className="ai-chat">Chat placeholder</div>
    </aside>
  );
}
