import React, { useState } from 'react';

export default function AIPanel() {
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Welcome to VoxCode! Tell me what code you need...' }
  ]);
  const [input, setInput] = useState('');
  
  const handleSend = () => {
    if (input.trim()) {
      setMessages([...messages, { role: 'user', text: input }]);
      setInput('');
    }
  };
  
  return (
    <aside className="ai-panel flex flex-col">
      <h3 className="text-lg font-bold text-accent-purple mb-4">🤖 AI Assistant</h3>
      
      <div className="mb-4 space-x-2">
        <button className="btn-secondary text-xs">💬 Explain</button>
        <button className="btn-secondary text-xs">🐛 Fix</button>
        <button className="btn-secondary text-xs">✨ Generate</button>
      </div>
      
      <div className="flex-1 overflow-auto mb-4 space-y-3">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`p-2 rounded ${
              msg.role === 'user'
                ? 'bg-accent-blue text-white ml-4'
                : 'bg-dark-700 text-dark-100 mr-4'
            }`}
          >
            {msg.text}
          </div>
        ))}
      </div>
      
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask AI something..."
          className="flex-1 bg-dark-700 text-dark-50 px-3 py-2 rounded border border-dark-600 focus:outline-none focus:border-accent-blue"
        />
        <button
          onClick={handleSend}
          className="btn-primary px-3 py-2"
        >
          Send
        </button>
      </div>
    </aside>
  );
}
