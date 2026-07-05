export const TEMPLATES = {
  javascript: {
    name: 'JavaScript',
    templates: [
      {
        id: 'js-hello',
        title: 'Hello World',
        code: 'console.log("Hello, World!");',
      },
      {
        id: 'js-arrow-func',
        title: 'Arrow Function',
        code: 'const add = (a, b) => a + b;\nconsole.log(add(2, 3));',
      },
      {
        id: 'js-async',
        title: 'Async/Await',
        code: 'async function fetchData() {\n  try {\n    const response = await fetch(url);\n    const data = await response.json();\n    return data;\n  } catch (error) {\n    console.error(error);\n  }\n}',
      },
    ],
  },
  typescript: {
    name: 'TypeScript',
    templates: [
      {
        id: 'ts-interface',
        title: 'Interface',
        code: 'interface User {\n  id: number;\n  name: string;\n  email: string;\n}',
      },
      {
        id: 'ts-generic',
        title: 'Generic Function',
        code: 'function identity<T>(arg: T): T {\n  return arg;\n}',
      },
    ],
  },
  python: {
    name: 'Python',
    templates: [
      {
        id: 'py-hello',
        title: 'Hello World',
        code: 'print("Hello, World!")',
      },
      {
        id: 'py-class',
        title: 'Class',
        code: 'class Person:\n    def __init__(self, name):\n        self.name = name\n    \n    def greet(self):\n        return f"Hello, {self.name}"',
      },
      {
        id: 'py-list-comp',
        title: 'List Comprehension',
        code: 'numbers = [1, 2, 3, 4, 5]\nsquares = [x**2 for x in numbers]\nprint(squares)',
      },
    ],
  },
  java: {
    name: 'Java',
    templates: [
      {
        id: 'java-hello',
        title: 'Hello World',
        code: 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}',
      },
    ],
  },
  go: {
    name: 'Go',
    templates: [
      {
        id: 'go-hello',
        title: 'Hello World',
        code: 'package main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Hello, World!")\n}',
      },
    ],
  },
  rust: {
    name: 'Rust',
    templates: [
      {
        id: 'rust-hello',
        title: 'Hello World',
        code: 'fn main() {\n    println!("Hello, World!");\n}',
      },
    ],
  },
  cpp: {
    name: 'C++',
    templates: [
      {
        id: 'cpp-hello',
        title: 'Hello World',
        code: '#include <iostream>\n\nint main() {\n    std::cout << "Hello, World!" << std::endl;\n    return 0;\n}',
      },
    ],
  },
  csharp: {
    name: 'C#',
    templates: [
      {
        id: 'cs-hello',
        title: 'Hello World',
        code: 'using System;\n\nclass Program {\n    static void Main() {\n        Console.WriteLine("Hello, World!");\n    }\n}',
      },
    ],
  },
  php: {
    name: 'PHP',
    templates: [
      {
        id: 'php-hello',
        title: 'Hello World',
        code: '<?php\necho "Hello, World!";\n?>',
      },
    ],
  },
  ruby: {
    name: 'Ruby',
    templates: [
      {
        id: 'ruby-hello',
        title: 'Hello World',
        code: 'puts "Hello, World!"',
      },
    ],
  },
  kotlin: {
    name: 'Kotlin',
    templates: [
      {
        id: 'kt-hello',
        title: 'Hello World',
        code: 'fun main() {\n    println("Hello, World!")\n}',
      },
    ],
  },
  swift: {
    name: 'Swift',
    templates: [
      {
        id: 'swift-hello',
        title: 'Hello World',
        code: 'import Foundation\n\nprint("Hello, World!")',
      },
    ],
  },
};
