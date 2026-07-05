export const TEMPLATES = {
  javascript: {
    name: 'JavaScript',
    templates: [
      {
        id: 'js-express-jwt',
        title: 'Express JWT Auth Server',
        code: `const express = require('express');
const jwt = require('jsonwebtoken');
const app = express();
app.use(express.json());

const SECRET_KEY = process.env.JWT_SECRET || 'super-secret-key';

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  if (username === 'admin' && password === 'password') {
    const token = jwt.sign({ user: username, role: 'admin' }, SECRET_KEY, { expiresIn: '1h' });
    return res.json({ token });
  }
  res.status(401).json({ error: 'Invalid credentials' });
});

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);
  
  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

app.get('/api/protected', authenticateToken, (req, res) => {
  res.json({ message: 'Welcome to protected route!', user: req.user });
});

app.listen(3000, () => console.log('Server running on port 3000'));`
      },
      {
        id: 'js-debounce',
        title: 'Advanced Debounce & Throttle',
        code: `function debounce(func, wait, immediate = false) {
  let timeout;
  return function executedFunction(...args) {
    const context = this;
    const later = function() {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
}

function throttle(func, limit) {
  let inThrottle;
  return function(...args) {
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Usage Example:
const onResize = debounce(() => console.log('Resized!'), 300);
window.addEventListener('resize', onResize);`
      },
      {
        id: 'js-lru-cache',
        title: 'LRU Cache Implementation',
        code: `class LRUCache {
  constructor(capacity) {
    this.capacity = capacity;
    this.cache = new Map();
  }

  get(key) {
    if (!this.cache.has(key)) return -1;
    const val = this.cache.get(key);
    this.cache.delete(key);
    this.cache.set(key, val);
    return val;
  }

  put(key, value) {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.capacity) {
      // Delete oldest item (first item in Map)
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }
    this.cache.set(key, value);
  }
}

const lru = new LRUCache(2);
lru.put(1, 10);
lru.put(2, 20);
console.log(lru.get(1)); // 10
lru.put(3, 30); // evicts key 2
console.log(lru.get(2)); // -1`
      }
    ]
  },
  typescript: {
    name: 'TypeScript',
    templates: [
      {
        id: 'ts-result-monad',
        title: 'Type-Safe Result Monad',
        code: `type Success<T> = { success: true; value: T; error?: never };
type Failure<E> = { success: false; value?: never; error: E };
type Result<T, E = Error> = Success<T> | Failure<E>;

function ok<T>(value: T): Success<T> {
  return { success: true, value };
}

function err<E>(error: E): Failure<E> {
  return { success: false, error };
}

async function fetchUserData(userId: string): Promise<Result<{ name: string; age: number }, string>> {
  try {
    if (!userId) return err("User ID cannot be empty");
    // Simulated DB call
    return ok({ name: "Alice", age: 28 });
  } catch (e: any) {
    return err(e.message || "Unknown error occurred");
  }
}

// Usage:
async function main() {
  const res = await fetchUserData("usr_123");
  if (res.success) {
    console.log("User:", res.value.name);
  } else {
    console.error("Error:", res.error);
  }
}`
      },
      {
        id: 'ts-event-emitter',
        title: 'Strictly Typed Event Emitter',
        code: `type EventMap = Record<string, any>;
type EventKey<T extends EventMap> = string & keyof T;
type EventReceiver<T> = (params: T) => void;

class TypedEventEmitter<T extends EventMap> {
  private listeners: { [K in keyof T]?: Array<EventReceiver<T[K]>> } = {};

  on<K extends EventKey<T>>(eventName: K, fn: EventReceiver<T[K]>): void {
    if (!this.listeners[eventName]) {
      this.listeners[eventName] = [];
    }
    this.listeners[eventName]!.push(fn);
  }

  off<K extends EventKey<T>>(eventName: K, fn: EventReceiver<T[K]>): void {
    const handlers = this.listeners[eventName];
    if (!handlers) return;
    this.listeners[eventName] = handlers.filter(listener => listener !== fn);
  }

  emit<K extends EventKey<T>>(eventName: K, params: T[K]): void {
    const handlers = this.listeners[eventName];
    if (!handlers) return;
    handlers.forEach(listener => listener(params));
  }
}`
      }
    ]
  },
  python: {
    name: 'Python',
    templates: [
      {
        id: 'py-fastapi-crud',
        title: 'FastAPI Async CRUD with Pydantic v2',
        code: `from fastapi import FastAPI, HTTPException, status
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid

app = FastAPI(title="VoxCode API", version="2.0")

class ItemBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = None
    price: float = Field(..., gt=0)

class Item(ItemBase):
    id: str
    in_stock: bool = True

db: dict[str, Item] = {}

@app.post("/items", response_model=Item, status_code=status.HTTP_201_CREATED)
async def create_item(item_in: ItemBase):
    item_id = str(uuid.uuid4())
    item = Item(id=item_id, **item_in.model_dump())
    db[item_id] = item
    return item

@app.get("/items", response_model=List[Item])
async def list_items():
    return list(db.values())

@app.get("/items/{item_id}", response_model=Item)
async def get_item(item_id: str):
    if item_id not in db:
        raise HTTPException(status_code=404, detail="Item not found")
    return db[item_id]`
      },
      {
        id: 'py-dataclasses-retry',
        title: 'Robust Exponential Backoff Decorator',
        code: `import time
import logging
from functools import wraps
from typing import Callable, Any

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("RetryDecorator")

def retry(max_retries: int = 3, delay: float = 1.0, backoff: float = 2.0, exceptions: tuple = (Exception,)):
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        def wrapper(*args, **kwargs) -> Any:
            current_delay = delay
            for attempt in range(1, max_retries + 1):
                try:
                    return func(*args, **kwargs)
                except exceptions as e:
                    if attempt == max_retries:
                        logger.error(f"Function {func.__name__} failed after {max_retries} retries.")
                        raise
                    logger.warning(f"Attempt {attempt} failed with {e}. Retrying in {current_delay}s...")
                    time.sleep(current_delay)
                    current_delay *= backoff
        return wrapper
    return decorator

@retry(max_retries=3, delay=0.5, backoff=2.0)
def unstable_network_call():
    import random
    if random.random() < 0.7:
        raise ConnectionError("Temporary network glitch")
    return "Success!"`
      },
      {
        id: 'py-asyncio-producer',
        title: 'Asyncio Producer-Consumer Queue',
        code: `import asyncio
import random

async def producer(queue: asyncio.Queue, n: int):
    for i in range(1, n + 1):
        item = f"item_{i}"
        await asyncio.sleep(random.uniform(0.1, 0.3))
        await queue.put(item)
        print(f"[Producer] Produced {item}")
    # Signal consumers to stop
    await queue.put(None)

async def consumer(name: str, queue: asyncio.Queue):
    while True:
        item = await queue.get()
        if item is None:
            # Put None back for other consumers
            await queue.put(None)
            queue.task_done()
            break
        print(f"[Consumer-{name}] Processing {item}...")
        await asyncio.sleep(random.uniform(0.2, 0.5))
        queue.task_done()
        print(f"[Consumer-{name}] Finished {item}")

async def main():
    queue = asyncio.Queue(maxsize=5)
    prod = asyncio.create_task(producer(queue, 10))
    cons = [asyncio.create_task(consumer(f"Worker-{i}", queue)) for i in range(1, 3)]
    
    await asyncio.gather(prod, *cons)
    print("All tasks completed.")

if __name__ == "__main__":
    asyncio.run(main())`
      }
    ]
  },
  rust: {
    name: 'Rust',
    templates: [
      {
        id: 'rs-linked-list',
        title: 'Idiomatic Doubly Linked List in Rust',
        code: `use std::cell::RefCell;
use std::rc::{Rc, Weak};

pub struct Node<T> {
    pub elem: T,
    pub next: Option<Rc<RefCell<Node<T>>>>,
    pub prev: Option<Weak<RefCell<Node<T>>>>,
}

pub struct DoublyLinkedList<T> {
    head: Option<Rc<RefCell<Node<T>>>>,
    tail: Option<Weak<RefCell<Node<T>>>>,
}

impl<T> DoublyLinkedList<T> {
    pub fn new() -> Self {
        DoublyLinkedList { head: None, tail: None }
    }

    pub fn push_front(&mut self, elem: T) {
        let new_head = Rc::new(RefCell::new(Node {
            elem,
            next: self.head.clone(),
            prev: None,
        }));

        match self.head.take() {
            Some(old_head) => old_head.borrow_mut().prev = Some(Rc::downgrade(&new_head)),
            None => self.tail = Some(Rc::downgrade(&new_head)),
        }

        self.head = Some(new_head);
    }
}`
      }
    ]
  },
  go: {
    name: 'Go',
    templates: [
      {
        id: 'go-worker-pool',
        title: 'Concurrent Worker Pool with Channels',
        code: `package main

import (
	"fmt"
	"sync"
	"time"
)

type Job struct {
	ID       int
	Data     string
}

type Result struct {
	JobID    int
	Output   string
	Duration time.Duration
}

func worker(id int, jobs <-chan Job, results chan<- Result, wg *sync.WaitGroup) {
	defer wg.Done()
	for job := range jobs {
		start := time.Now()
		time.Sleep(time.Duration(100) * time.Millisecond) // Simulate work
		results <- Result{
			JobID:    job.ID,
			Output:   fmt.Sprintf("Processed %s by worker %d", job.Data, id),
			Duration: time.Since(start),
		}
	}
}

func main() {
	const numJobs = 10
	const numWorkers = 3

	jobs := make(chan Job, numJobs)
	results := make(chan Result, numJobs)
	var wg sync.WaitGroup

	for w := 1; w <= numWorkers; w++ {
		wg.Add(1)
		go worker(w, jobs, results, &wg)
	}

	for j := 1; j <= numJobs; j++ {
		jobs <- Job{ID: j, Data: fmt.Sprintf("Task-%d", j)}
	}
	close(jobs)

	wg.Wait()
	close(results)

	for res := range results {
		fmt.Printf("Job %d completed in %v: %s\\n", res.JobID, res.Duration, res.Output)
	}
}`
      }
    ]
  },
  java: {
    name: 'Java',
    templates: [
      {
        id: 'java-stream-api',
        title: 'Modern Java Stream API & Optional Patterns',
        code: `import java.util.*;
import java.util.stream.*;

public class StreamDemo {
    record Employee(String name, String department, double salary) {}

    public static void main(String[] args) {
        List<Employee> employees = List.of(
            new Employee("Alice", "Engineering", 120000),
            new Employee("Bob", "Marketing", 85000),
            new Employee("Charlie", "Engineering", 135000),
            new Employee("Diana", "HR", 95000)
        );

        // Group by department and calculate average salary
        Map<String, Double> avgSalaryByDept = employees.stream()
            .collect(Collectors.groupingBy(
                Employee::department,
                Collectors.averagingDouble(Employee::salary)
            ));

        avgSalaryByDept.forEach((dept, avg) -> 
            System.out.printf("Department: %s | Avg Salary: $%,.2f%n", dept, avg)
        );

        // Find top earner in Engineering safely using Optional
        employees.stream()
            .filter(e -> "Engineering".equals(e.department()))
            .max(Comparator.comparingDouble(Employee::salary))
            .ifPresent(top -> System.out.println("Top Engineer: " + top.name()));
    }
}`
      }
    ]
  },
  cpp: {
    name: 'C++',
    templates: [
      {
        id: 'cpp-smart-pointers',
        title: 'Modern C++20 Resource Management & Smart Pointers',
        code: `#include <iostream>
#include <memory>
#include <vector>
#include <string>

class Resource {
public:
    Resource(std::string name) : name_(std::move(name)) {
        std::cout << "Resource acquired: " << name_ << "\\n";
    }
    ~Resource() {
        std::cout << "Resource destroyed: " << name_ << "\\n";
    }
    void use() const {
        std::cout << "Using resource: " << name_ << "\\n";
    }
private:
    std::string name_;
};

int main() {
    // Unique pointer for exclusive ownership
    auto uniqueRes = std::make_unique<Resource>("PrimaryDBConnection");
    uniqueRes->use();

    // Shared pointers for shared ownership across threads/containers
    auto sharedRes1 = std::make_shared<Resource>("CacheService");
    {
        auto sharedRes2 = sharedRes1; // Reference count increased to 2
        std::cout << "Ref count: " << sharedRes1.use_count() << "\\n";
    } // sharedRes2 out of scope, ref count drops to 1
    
    std::cout << "Ref count after scope: " << sharedRes1.use_count() << "\\n";
    return 0;
}`
      }
    ]
  },
  csharp: {
    name: 'C#',
    templates: [
      {
        id: 'cs-async-linq',
        title: 'C# 11 Async LINQ & Record Types',
        code: `using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace VoxCodeDemo;

public record User(int Id, String Name, String Role);

public class UserService {
    private readonly List<User> _users = new() {
        new User(1, "Alice", "Admin"),
        new User(2, "Bob", "Developer"),
        new User(3, "Charlie", "Developer")
    };

    public async Task<List<User>> GetUsersByRoleAsync(string role) {
        await Task.Delay(100); // Simulate async DB IO
        return _users.Where(u => u.Role.Equals(role, StringComparison.OrdinalIgnoreCase)).ToList();
    }
}

class Program {
    static async Task Main() {
        var service = new UserService();
        var devs = await service.GetUsersByRoleAsync("Developer");
        
        foreach (var dev in devs) {
            Console.WriteLine($"Found Developer: {dev.Name} (ID: {dev.Id})");
        }
    }
}`
      }
    ]
  },
  sql: {
    name: 'SQL',
    templates: [
      {
        id: 'sql-window-functions',
        title: 'Advanced SQL Window Functions & CTEs',
        code: `WITH MonthlySales AS (
    SELECT 
        DATE_TRUNC('month', order_date) AS sales_month,
        department_id,
        SUM(total_amount) AS monthly_revenue
    FROM orders
    WHERE order_date >= NOW() - INTERVAL '12 months'
    GROUP BY 1, 2
),
RankedDepartments AS (
    SELECT 
        sales_month,
        department_id,
        monthly_revenue,
        LAG(monthly_revenue) OVER (PARTITION BY department_id ORDER BY sales_month) AS prev_month_revenue,
        RANK() OVER (PARTITION BY sales_month ORDER BY monthly_revenue DESC) AS dept_rank
    FROM MonthlySales
)
SELECT 
    sales_month,
    department_id,
    monthly_revenue,
    ROUND(((monthly_revenue - prev_month_revenue) / NULLIF(prev_month_revenue, 0)) * 100, 2) AS MoM_growth_pct,
    dept_rank
FROM RankedDepartments
WHERE dept_rank <= 3
ORDER BY sales_month DESC, dept_rank ASC;`
      }
    ]
  }
};
