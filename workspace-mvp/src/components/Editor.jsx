import React from 'react';
import MonacoEditor from '@monaco-editor/react';

export default function Editor() {
  const defaultCode = `// Welcome to Workspace MVP\nfunction hello() { console.log('Hello, world!'); }`;
  return (
    <div className="editor-wrapper" style={{ height: '100%' }}>
      <MonacoEditor height="100%" defaultLanguage="javascript" defaultValue={defaultCode} />
    </div>
  );
}
