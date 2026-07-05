export const LANGUAGES = [
  'javascript',
  'typescript',
  'python',
  'java',
  'cpp',
  'csharp',
  'go',
  'rust',
  'php',
  'ruby',
  'kotlin',
  'swift',
];

export const CATEGORIES = [
  'cli',
  'web',
  'api',
  'data',
  'games',
  'systems',
  'mobile',
  'utilities',
];

export const VOICE_COMMANDS = [
  // Create
  { category: 'create', command: 'create function', description: 'Generate a new function' },
  { category: 'create', command: 'create component', description: 'Generate a React component' },
  { category: 'create', command: 'create class', description: 'Generate a class' },
  { category: 'create', command: 'create api', description: 'Generate API endpoint' },
  { category: 'create', command: 'create test', description: 'Generate test file' },
  
  // Optimize
  { category: 'optimize', command: 'optimize code', description: 'Optimize current code' },
  { category: 'optimize', command: 'add types', description: 'Add type annotations' },
  { category: 'optimize', command: 'format code', description: 'Format code' },
  { category: 'optimize', command: 'remove comments', description: 'Remove comments' },
  
  // Explain
  { category: 'explain', command: 'explain code', description: 'Explain selected code' },
  { category: 'explain', command: 'add comments', description: 'Add explanatory comments' },
  { category: 'explain', command: 'explain algorithm', description: 'Explain algorithm' },
  
  // Convert
  { category: 'convert', command: 'convert to typescript', description: 'Convert to TypeScript' },
  { category: 'convert', command: 'convert to python', description: 'Convert to Python' },
  { category: 'convert', command: 'convert to java', description: 'Convert to Java' },
];
