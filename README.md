# VoxCode — Professional Voice-To-Code Assistant

VoxCode is a production-grade, advanced-level voice-controlled programming assistant. It enables developers to generate, optimize, and explain code using natural voice commands, bridging the gap between human thought and executable code with a high-performance, dual-engine speech pipeline.

## 🚀 Advanced Architecture

### 🧠 Backend (Python / Flask)
-   **API Server:** Hardened Flask REST API with structured logging, per-IP rate limiting, and DB connection pooling for high concurrency.
-   **Speech Pipeline:** Hybrid engine using **Vosk** (real-time partials) and **Whisper** (high-accuracy final transcription). Includes **WebRTC VAD** for voice activity detection and **Noisereduce** for adaptive environmental noise profiling.
-   **Command Processor:** Advanced intent detection using a hybrid of regex pattern matching and **Zero-Shot BART Transformers**. Supports multi-intent detection and contextual memory for follow-up commands (e.g., "convert that to rust").
-   **NLP Service:** Deep linguistic analysis with **spaCy**. Features a coding-specific dictionary (100+ entries) and abbreviation expansion (e.g., `fn` → `function`).
-   **Template Service:** Idiomatic code scaffolding for 12+ languages including Rust, Go, Swift, and Kotlin.

### 🎨 Frontend (Next.js 16 App Router)
-   **Framework:** **Next.js 16 (App Router)** with React 19, Server-Side Rendering (SSR), React `<Suspense>` boundaries, and dynamic code splitting.
-   **Theme System:** Custom **"Light & Tiny Dark"** aesthetic featuring crisp light canvas backgrounds (`#FAFBFC`) paired with refined, sleek dark charcoal/ink accents across sidebars, IDE consoles, and terminal panels.
-   **Dashboard & IDE:** Pro Studio with Monaco Editor, interactive 4-mode execution compiler (AST audit, RAM trace, Unit tests), and real-time audio waveform visualizer.
-   **Interactions:** Toast-based notification system, step-by-step code explanation mode, and 45+ domain-specific voice shortcuts.

## 🛠️ Stack
-   **Backend:** Python 3.11, Flask, PostgreSQL (NeonDB), Whisper, Vosk, spaCy, BART, NLTK.
-   **Frontend:** Next.js 16 (App Router), React 19, Tailwind CSS v4, Lucide icons, Monaco Editor, Framer Motion.
-   **DevOps:** Local LLM hosting (Llama-CPP), structured logging, health metrics.

## 📦 Installation

1.  **Dependencies:**
    ```powershell
    .\install_dependencies.bat
    ```
2.  **Configuration:**
    Copy `.env.example` to `.env` and set your `DATABASE_URL` and `JWT_SECRET`.
3.  **Start:**
    ```powershell
    .\start.bat
    ```

## 🎤 Core Voice Shortcuts
-   "Create a **linked list** in **rust**"
-   "**Quick sort** algorithm in **go**"
-   "Build a **flask api** with **jwt auth**"
-   "**React component** named **UserCard**"
-   "**Optimize** this code"
-   "**Explain** how this function works"
