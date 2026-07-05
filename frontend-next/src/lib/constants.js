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
  'swift'
];

export const CATEGORIES = [
  'cli',
  'web',
  'api',
  'data',
  'games',
  'systems',
  'mobile',
  'utilities'
];

export const VOICE_COMMANDS = [
  { category: 'create', command: 'Create a linked list in rust', description: 'Scaffolds a complete Doubly/Singly Linked List implementation in Rust with tests.' },
  { category: 'create', command: 'Quick sort algorithm in go', description: 'Generates an idiomatic, concurrent QuickSort implementation in Go using goroutines.' },
  { category: 'create', command: 'Build a flask api with jwt auth', description: 'Creates a hardened Flask REST API with JWT authentication and rate limiting.' },
  { category: 'create', command: 'React component named UserCard', description: 'Scaffolds a modern, responsive React component using Tailwind CSS and Lucide icons.' },
  { category: 'optimize', command: 'Optimize this code', description: 'Analyzes the active code editor content for O(N) complexity bottlenecks and refactors it.' },
  { category: 'optimize', command: 'Make this function async', description: 'Refactors synchronous blocking code into clean async/await promises or coroutines.' },
  { category: 'explain', command: 'Explain how this function works', description: 'Provides a step-by-step editorial breakdown of the logic, variables, and edge cases.' },
  { category: 'explain', command: 'Audit for security vulnerabilities', description: 'Scans code for SQL injections, buffer overflows, memory leaks, and XSS vulnerabilities.' },
  { category: 'convert', command: 'Convert that to rust', description: 'Translates the active snippet from its current programming language into idiomatic Rust.' },
  { category: 'convert', command: 'Rewrite in typescript', description: 'Adds strict static typing and interfaces to JavaScript code snippets.' },
  { category: 'create', command: 'Write unit tests for this', description: 'Scaffolds comprehensive unit test suites (Jest, PyTest, JUnit, Go test) with edge cases.' },
  { category: 'create', command: 'Setup SQL database models', description: 'Generates SQLAlchemy or Prisma ORM schemas with proper foreign keys and indexes.' },
  { category: 'optimize', command: 'Reduce memory footprint', description: 'Refactors algorithms to use in-place mutation, generators, or streaming structures.' },
  { category: 'explain', command: 'Generate time complexity report', description: 'Calculates Big-O time and space complexity with detailed mathematical proof.' },
  { category: 'convert', command: 'Convert to functional style', description: 'Refactors imperative loops and state mutations into pure functions and map/reduce/filter.' }
];
