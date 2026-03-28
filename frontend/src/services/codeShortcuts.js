/**
 * VoxCode Voice Shortcuts
 * Maps short voice triggers to complex AI prompts and templates.
 * Total: 45+ shortcuts across Data Structures, Algorithms, Web, and Backend.
 */

export const codeShortcuts = {
    // ─── Data Structures ───────────────────
    "array list": "Create a robust ArrayList implementation with dynamic resizing, common operations (add, remove, get), and error handling.",
    "linked list": "Implement a doubly linked list with head and tail pointers, including push, pop, shift, and unshift methods.",
    "stack": "Create a generic Stack data structure using an underlying array, supporting push, pop, peek, and isEmpty.",
    "queue": "Implement a Queue data structure with enqueue, dequeue, and front operations, handling empty states safely.",
    "hash map": "Develop a simple Hash Map (or Dictionary) with a custom hash function, collision handling via chaining, and basic CRUD methods.",
    "binary tree": "Create a Binary Search Tree (BST) class with recursive methods for insert, find, and the three DFS traversals (in-order, pre-order, post-order).",
    "heap": "Implement a Max-Heap data structure with insert and extractMax methods, including heapifyUp and heapifyDown logic.",
    "graph": "Create an Adjacency List based Graph implementation with support for adding vertices/edges and BFS/DFS traversal methods.",
    "trie": "Build a Trie (Prefix Tree) for efficient string storage and search, supporting insert, search, and startsWith operations.",

    // ─── Algorithms ────────────────────────
    "quick sort": "Implement the Quick Sort algorithm using recursion and the Hoare partition scheme, with O(n log n) average performance.",
    "merge sort": "Create a stable Merge Sort implementation that splits the array and merges sorted halves recursively.",
    "binary search": "Write a highly optimized binary search function that handles edge cases and returns the index of a target element.",
    "fibonacci": "Generate a Fibonacci sequence function using dynamic programming (memoization) for optimal time complexity.",
    "dijkstra": "Implement Dijkstra's shortest path algorithm for a weighted graph using a priority queue.",
    "breadth search": "Write a pure Breadth-First Search (BFS) implementation for a graph or tree structure.",
    "depth search": "Write a pure Depth-First Search (DFS) implementation using both recursive and iterative (stack) approaches.",

    // ─── Web Frontend ──────────────────────
    "react component": "Generate a modern React functional component with Tailwind CSS styling, internal state management (useState), and a side effect (useEffect).",
    "fetch hook": "Create a custom React hook (useFetch) that handles data fetching, loading states, error handling, and request aborting.",
    "form validation": "Implement a client-side form validation script with regex for email/password and real-time error message display.",
    "dark mode": "Write a JavaScript utility to handle theme switching between light and dark mode, storing the preference in localStorage.",
    "modal window": "Create an accessible Modal component with a background overlay, close triggers, and focus trapping.",
    "scroll animation": "Implement a basic Intersection Observer script to trigger animations when elements enter the viewport.",
    "debounce": "Write a debounce utility function to limit the execution rate of frequent events like resizing or typing.",

    // ─── Backend & API ─────────────────────
    "flask api": "Build a professional Flask REST API boilerplate with routes for CRUD, JSON request validation, and proper error handling.",
    "express server": "Set up an Express.js server with body-parsing middleware, CORS support, environment variable loading, and a sample route.",
    "jwt auth": "Implement JWT (JSON Web Token) authentication logic, including token generation, verification middleware, and password hashing.",
    "database connect": "Write a database connection utility for PostgreSQL using a connection pool and error retry logic.",
    "middleware": "Create a custom logging and authentication middleware for a web framework (Express or Flask).",
    "web scraper": "Generate a Python script using BeautifulSoup and Requests to scrape data from a website and save it to a JSON file.",
    "rest client": "Implement a reusable REST client class with methods for GET, POST, PUT, DELETE using the fetch API or requests.",

    // ─── Utilities ─────────────────────────
    "unit test": "Write a comprehensive unit test suite using Jest or Pytest for a mathematical utility function, covering edge cases.",
    "logger": "Create a production-grade logging utility with support for different log levels (INFO, WARN, ERROR) and file rotation.",
    "regex email": "Write a robust regular expression for validating complex email addresses and explain its parts.",
    "file upload": "Implement a file upload handler that validates file size/type and saves it to a specific server directory.",
    "config loader": "Create a utility to load and parse configuration from .env or .yaml files with default fallbacks.",
    "env parse": "Write a script to parse environment variables and convert them to the correct data types (int, bool, string).",
    "error boundary": "Create a React Error Boundary component to catch child component errors and display a fallback UI.",
    "singleton": "Implement the Singleton design pattern in a thread-safe manner for a global app state or service.",
    "factory": "Implement the Factory design pattern to create different types of user objects based on an input type.",
    "observer": "Implement the Observer pattern with a Subject and multiple Observers reacting to state changes.",
};

export const getShortcut = (transcript) => {
    const text = transcript.toLowerCase();
    for (const [key, prompt] of Object.entries(codeShortcuts)) {
        if (text.includes(key)) {
            return prompt;
        }
    }
    return null;
};
