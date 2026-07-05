/**
 * VoxCode Voice Shortcuts Dictionary
 *
 * Maps voice trigger phrases to structured AI prompt data.
 * Used by the shortcut store and voice recognition pipeline.
 */

/**
 * @type {Record<string, {prompt: string, language: string, category: string, description: string}>}
 */
export const codeShortcuts = {
  // ─── Data Structures (9) ───────────────────────────────────────────
  'create array': {
    prompt: 'Create an array with common operations (push, pop, filter, map, reduce)',
    language: 'javascript',
    category: 'data-structures',
    description: 'Array with common operations',
  },
  'create linked list': {
    prompt: 'Implement a singly linked list with insert, delete, search, and display methods',
    language: 'javascript',
    category: 'data-structures',
    description: 'Singly linked list implementation',
  },
  'create stack': {
    prompt: 'Implement a stack data structure with push, pop, peek, isEmpty, and size methods',
    language: 'javascript',
    category: 'data-structures',
    description: 'Stack data structure',
  },
  'create queue': {
    prompt: 'Implement a queue data structure with enqueue, dequeue, peek, isEmpty, and size methods',
    language: 'javascript',
    category: 'data-structures',
    description: 'Queue data structure',
  },
  'create hash map': {
    prompt: 'Implement a hash map with set, get, delete, has, and collision handling',
    language: 'javascript',
    category: 'data-structures',
    description: 'Hash map implementation',
  },
  'create binary tree': {
    prompt: 'Implement a binary search tree with insert, search, delete, and traversal methods',
    language: 'javascript',
    category: 'data-structures',
    description: 'Binary search tree',
  },
  'create graph': {
    prompt: 'Implement a graph data structure with addVertex, addEdge, BFS, and DFS methods',
    language: 'javascript',
    category: 'data-structures',
    description: 'Graph with BFS and DFS',
  },
  'create heap': {
    prompt: 'Implement a min-heap with insert, extractMin, and heapify operations',
    language: 'javascript',
    category: 'data-structures',
    description: 'Min-heap implementation',
  },
  'create trie': {
    prompt: 'Implement a trie (prefix tree) with insert, search, startsWith, and delete methods',
    language: 'javascript',
    category: 'data-structures',
    description: 'Trie / prefix tree',
  },

  // ─── Algorithms (7) ───────────────────────────────────────────────
  'sort array': {
    prompt: 'Implement quicksort algorithm with partition function and example usage',
    language: 'javascript',
    category: 'algorithms',
    description: 'Quicksort algorithm',
  },
  'binary search': {
    prompt: 'Implement binary search algorithm for a sorted array, return index or -1',
    language: 'javascript',
    category: 'algorithms',
    description: 'Binary search algorithm',
  },
  'merge sort': {
    prompt: 'Implement merge sort algorithm with merge helper function',
    language: 'javascript',
    category: 'algorithms',
    description: 'Merge sort algorithm',
  },
  'find shortest path': {
    prompt: "Implement Dijkstra's shortest path algorithm for a weighted graph",
    language: 'javascript',
    category: 'algorithms',
    description: "Dijkstra's algorithm",
  },
  'dynamic programming': {
    prompt: 'Implement a dynamic programming solution for the knapsack problem',
    language: 'javascript',
    category: 'algorithms',
    description: 'DP knapsack problem',
  },
  'fibonacci sequence': {
    prompt: 'Generate fibonacci sequence using iterative, recursive, and memoized approaches',
    language: 'javascript',
    category: 'algorithms',
    description: 'Fibonacci implementations',
  },
  'depth first search': {
    prompt: 'Implement depth-first search (DFS) for a graph with both recursive and iterative versions',
    language: 'javascript',
    category: 'algorithms',
    description: 'DFS traversal',
  },

  // ─── Web Frontend (7) ─────────────────────────────────────────────
  'create component': {
    prompt: 'Create a reusable React functional component with props, state, and event handling',
    language: 'javascript',
    category: 'web-frontend',
    description: 'React component scaffold',
  },
  'create form': {
    prompt: 'Create a React form with controlled inputs, validation, and submit handling',
    language: 'javascript',
    category: 'web-frontend',
    description: 'React form with validation',
  },
  'create modal': {
    prompt: 'Create an accessible modal dialog component with overlay, close button, and focus trap',
    language: 'javascript',
    category: 'web-frontend',
    description: 'Accessible modal component',
  },
  'create table': {
    prompt: 'Create a sortable, filterable data table component with pagination',
    language: 'javascript',
    category: 'web-frontend',
    description: 'Data table with sorting',
  },
  'create navbar': {
    prompt: 'Create a responsive navigation bar with logo, links, and mobile hamburger menu',
    language: 'javascript',
    category: 'web-frontend',
    description: 'Responsive navigation bar',
  },
  'create carousel': {
    prompt: 'Create an image carousel/slider component with prev/next controls and autoplay',
    language: 'javascript',
    category: 'web-frontend',
    description: 'Image carousel component',
  },
  'create dropdown': {
    prompt: 'Create a dropdown select component with search, keyboard navigation, and accessibility',
    language: 'javascript',
    category: 'web-frontend',
    description: 'Searchable dropdown select',
  },

  // ─── Backend & API (7) ────────────────────────────────────────────
  'create api route': {
    prompt: 'Create a Next.js App Router API route handler with GET, POST, PUT, DELETE methods',
    language: 'javascript',
    category: 'backend-api',
    description: 'Next.js API route handler',
  },
  'create middleware': {
    prompt: 'Create Express-style middleware with authentication, logging, and error handling',
    language: 'javascript',
    category: 'backend-api',
    description: 'API middleware chain',
  },
  'create database': {
    prompt: 'Create a database connection module with connection pooling, query helper, and migrations',
    language: 'javascript',
    category: 'backend-api',
    description: 'Database connection module',
  },
  'create authentication': {
    prompt: 'Implement JWT authentication with login, register, token refresh, and protected routes',
    language: 'javascript',
    category: 'backend-api',
    description: 'JWT authentication system',
  },
  'create websocket': {
    prompt: 'Create a WebSocket server with rooms, broadcast, and reconnection handling',
    language: 'javascript',
    category: 'backend-api',
    description: 'WebSocket server setup',
  },
  'create rest api': {
    prompt: 'Create a full REST API with CRUD endpoints, validation, pagination, and error handling',
    language: 'javascript',
    category: 'backend-api',
    description: 'Full REST API scaffold',
  },
  'create graphql': {
    prompt: 'Create a GraphQL schema with types, queries, mutations, and resolvers',
    language: 'javascript',
    category: 'backend-api',
    description: 'GraphQL schema and resolvers',
  },

  // ─── Utilities (10) ───────────────────────────────────────────────
  'create logger': {
    prompt: 'Create a structured logger with log levels (debug, info, warn, error), timestamps, and file output',
    language: 'javascript',
    category: 'utilities',
    description: 'Structured logging utility',
  },
  'create validator': {
    prompt: 'Create a schema validation library with type checking, required fields, and custom rules',
    language: 'javascript',
    category: 'utilities',
    description: 'Schema validation library',
  },
  'create debounce': {
    prompt: 'Implement debounce and throttle utility functions with cancel and flush support',
    language: 'javascript',
    category: 'utilities',
    description: 'Debounce & throttle utilities',
  },
  'create date formatter': {
    prompt: 'Create a date formatting utility with relative time, custom formats, and timezone support',
    language: 'javascript',
    category: 'utilities',
    description: 'Date formatting utility',
  },
  'create event emitter': {
    prompt: 'Implement an event emitter with on, off, once, and emit methods',
    language: 'javascript',
    category: 'utilities',
    description: 'Event emitter pattern',
  },
  'create fetch wrapper': {
    prompt: 'Create a fetch wrapper with interceptors, retries, timeout, and response caching',
    language: 'javascript',
    category: 'utilities',
    description: 'Enhanced fetch wrapper',
  },
  'create state machine': {
    prompt: 'Implement a finite state machine with transitions, guards, and event handling',
    language: 'javascript',
    category: 'utilities',
    description: 'Finite state machine',
  },
  'create unit test': {
    prompt: 'Write comprehensive unit tests with setup, teardown, mocks, and edge case coverage',
    language: 'javascript',
    category: 'utilities',
    description: 'Unit test suite scaffold',
  },
  'create cli tool': {
    prompt: 'Create a command-line tool with argument parsing, help text, and colored output',
    language: 'javascript',
    category: 'utilities',
    description: 'CLI tool scaffold',
  },
  'create regex helper': {
    prompt: 'Create regex utility functions for email, URL, phone, date, and password validation',
    language: 'javascript',
    category: 'utilities',
    description: 'Regex validation helpers',
  },
};

/**
 * Find a matching shortcut from a voice transcript.
 * Performs case-insensitive substring matching against all trigger keys.
 *
 * @param {string} transcript - Raw voice transcript text
 * @returns {{ key: string, shortcut: {prompt: string, language: string, category: string, description: string} } | null}
 */
export function getShortcut(transcript) {
  if (!transcript || typeof transcript !== 'string') return null;

  const lower = transcript.toLowerCase().trim();
  if (!lower) return null;

  for (const [key, shortcut] of Object.entries(codeShortcuts)) {
    if (lower.includes(key)) {
      return { key, shortcut };
    }
  }

  return null;
}
