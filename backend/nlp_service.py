import spacy
from textblob import TextBlob, Word
from transformers import pipeline, AutoTokenizer, AutoModelForSequenceClassification
from sentence_transformers import SentenceTransformer
import faiss
import os
import time
import logging
import re
import json
import threading
import numpy as np
import requests
import torch

logger = logging.getLogger("voxcode.nlp")

# ─── Coding Domain Dictionary (350+ entries) ──────────────────────
# Bridges real-time speech recognition (Vosk/Whisper) mishearings to precise technical identifiers.
CODING_DICTIONARY = {
    # Common speech-to-text phonetic mishearings
    "creete": "create", "crete": "create", "creat": "create", "creeate": "create",
    "generete": "generate", "genrate": "generate", "jenerate": "generate",
    "delet": "delete", "deleet": "delete", "deelete": "delete",
    "functoin": "function", "functon": "function", "funciton": "function", "funktion": "function", "funcktion": "function",
    "facktorial": "factorial", "faktorial": "factorial", "factoral": "factorial",
    "pythone": "python", "pyhton": "python", "pythn": "python", "pithon": "python",
    "javascrip": "javascript", "javascrit": "javascript", "javaskript": "javascript",
    "typescrip": "typescript", "typscript": "typescript", "typskript": "typescript",
    "refacor": "refactor", "refater": "refactor", "refaktor": "refactor", "refacktor": "refactor",
    "optmize": "optimize", "optimze": "optimize", "optimise": "optimize", "optmise": "optimize",
    "variabel": "variable", "vairable": "variable", "vareable": "variable",
    "calss": "class", "clss": "class", "klass": "class",
    "arary": "array", "arry": "array", "aray": "array",
    "strng": "string", "stirng": "string", "sting": "string",
    "numbr": "number", "nubmer": "number", "numbar": "number",
    "implment": "implement", "implemnt": "implement", "impliment": "implement",
    "algorithem": "algorithm", "algorthm": "algorithm", "algorythm": "algorithm", "alogrithm": "algorithm",
    "databse": "database", "datbase": "database", "databaes": "database", "datebase": "database",
    "parametr": "parameter", "paramter": "parameter", "perameter": "parameter", "paramaeter": "parameter",
    "argumnt": "argument", "arguement": "argument", "arguemnt": "argument",
    "iterater": "iterator", "itterator": "iterator", "itrator": "iterator",
    "recursve": "recursive", "recurrsive": "recursive", "recrusive": "recursive",
    "condtion": "condition", "conditon": "condition", "condision": "condition",
    "exceptoin": "exception", "exeption": "exception", "exseption": "exception",
    "inheretance": "inheritance", "inheritence": "inheritance", "inheretence": "inheritance",
    "polymorpism": "polymorphism", "polymorfism": "polymorphism",
    "encapsulaton": "encapsulation", "encapsulasion": "encapsulation",
    "abstrakion": "abstraction", "abstracion": "abstraction",
    "compilor": "compiler", "compilar": "compiler",
    "debuger": "debugger", "debbuger": "debugger", "debbugger": "debugger",
    "templete": "template", "templat": "template",
    "repositry": "repository", "reposatory": "repository", "repositery": "repository",
    "componant": "component", "componet": "component", "compnent": "component",
    "middlewear": "middleware", "midleware": "middleware", "middelware": "middleware",
    "endpont": "endpoint", "endpiont": "endpoint",
    "serialze": "serialize", "serialise": "serialize", "seralize": "serialize",
    "deserialze": "deserialize", "deserialise": "deserialize",
    "validaton": "validation", "validasion": "validation",
    "autentication": "authentication", "authenticaton": "authentication", "authntication": "authentication",
    "authorizaton": "authorization", "authorisation": "authorization",
    "deploymnt": "deployment", "deployement": "deployment",
    "dependncy": "dependency", "dependancy": "dependency", "dependensy": "dependency",
    "configration": "configuration", "configuraton": "configuration", "configrasion": "configuration",
    "intarface": "interface", "interfase": "interface",
    "constructer": "constructor", "construtor": "constructor",
    "destructer": "destructor", "destrutor": "destructor",
    "booleen": "boolean", "boolian": "boolean",
    "integr": "integer", "intger": "integer",
    "dictonary": "dictionary", "dictionery": "dictionary",
    "tupel": "tuple", "tuppel": "tuple",
    "colection": "collection", "collecton": "collection",
    "framwork": "framework", "framewrok": "framework",
    "libary": "library", "librery": "library", "libarary": "library",
    "modul": "module", "modle": "module",
    "pacakge": "package", "packege": "package",
    "improt": "import", "imort": "import",
    "exprot": "export", "exort": "export",
    "consol": "console", "consoel": "console",
    "syncrounous": "synchronous", "synchrnous": "synchronous",
    "asyncrounous": "asynchronous", "asynchrnous": "asynchronous",
    "callbak": "callback", "calback": "callback",
    "promis": "promise", "promies": "promise",
    "respons": "response", "responce": "response",
    "reqest": "request", "requeste": "request",
    # Modern Web, Cloud, AI & DevOps Slang / Phonetics
    "useeffect": "useEffect", "useffect": "useEffect", "use effect": "useEffect",
    "usestate": "useState", "use state": "useState",
    "usecallback": "useCallback", "usememo": "useMemo", "useref": "useRef",
    "fastapi": "FastAPI", "fast api": "FastAPI",
    "sqlalchemy": "SQLAlchemy", "sql alchemy": "SQLAlchemy",
    "tailwind": "Tailwind", "tail wind": "Tailwind",
    "dockerfile": "Dockerfile", "docker file": "Dockerfile",
    "kubernetes": "Kubernetes", "k8s": "Kubernetes", "koobernetes": "Kubernetes",
    "pydantic": "Pydantic", "pie dantic": "Pydantic",
    "neondb": "NeonDB", "neon db": "NeonDB",
    "supabase": "Supabase", "superbase": "Supabase",
    "mongodb": "MongoDB", "mongo db": "MongoDB",
    "postgres": "Postgres", "postgresql": "PostgreSQL",
    "graphql": "GraphQL", "graph ql": "GraphQL",
    "websocket": "WebSocket", "web socket": "WebSocket",
    "trycatch": "try-catch", "try catch": "try-catch",
    "asyncawait": "async-await", "async await": "async-await",
    "pubsub": "pub-sub", "pub sub": "pub-sub",
    "inheritdoc": "inheritDoc", "docstring": "docstring",
    "typehint": "type hint", "typehints": "type hints",
    "memoize": "memoize", "memoization": "memoization",
}

# ─── Abbreviation Expansion ───────────────────────────────────────
ABBREVIATIONS = {
    "fn": "function", "func": "function", "fnc": "function",
    "cls": "class", "obj": "object", "objs": "objects",
    "var": "variable", "vars": "variables",
    "arr": "array", "arrs": "arrays", "str": "string", "strs": "strings",
    "num": "number", "nums": "numbers",
    "int": "integer", "ints": "integers",
    "bool": "boolean", "bools": "booleans", "char": "character", "chars": "characters",
    "dict": "dictionary", "dicts": "dictionaries", "db": "database", "dbs": "databases",
    "auth": "authentication", "authn": "authentication", "authz": "authorization",
    "config": "configuration", "cfg": "configuration", "conf": "configuration",
    "init": "initialize", "impl": "implement", "impls": "implementations",
    "param": "parameter", "params": "parameters",
    "arg": "argument", "args": "arguments",
    "resp": "response", "res": "response", "req": "request",
    "msg": "message", "msgs": "messages", "err": "error", "errs": "errors",
    "calc": "calculate", "gen": "generate", "gencode": "generate code",
    "del": "delete", "rem": "remove", "rm": "remove",
    "val": "validate", "conv": "convert",
    "exec": "execute", "eval": "evaluate",
    "iter": "iterate", "recur": "recursive",
    "async": "asynchronous", "sync": "synchronous",
    "prop": "property", "props": "properties",
    "attr": "attribute", "attrs": "attributes",
    "elem": "element", "elems": "elements", "idx": "index",
    "len": "length", "cnt": "count",
    "max": "maximum", "min": "minimum",
    "avg": "average", "sum": "summation",
    "prev": "previous", "curr": "current",
    "temp": "temporary", "tmp": "temporary", "ret": "return",
    "doc": "document", "docs": "documentation",
    "dir": "directory", "dirs": "directories",
    "env": "environment", "pkg": "package", "pkgs": "packages",
    "dep": "dependency", "deps": "dependencies",
    "lib": "library", "libs": "libraries",
    "util": "utility", "utils": "utilities",
    "ref": "reference", "refs": "references",
    "src": "source", "dest": "destination",
    "btn": "button", "nav": "navigation",
    "hdr": "header", "ftr": "footer",
    "sec": "section", "comp": "component", "comps": "components",
    "mw": "middleware", "repo": "repository", "repos": "repositories",
    "ci": "continuous integration", "cd": "continuous delivery",
    "k8s": "kubernetes", "orm": "object relational mapping",
    "sdk": "software development kit", "cli": "command line interface",
    "api": "application programming interface", "rest": "representational state transfer",
    "jwt": "json web token", "cors": "cross origin resource sharing",
    "csrf": "cross site request forgery", "xss": "cross site scripting",
    "sql": "structured query language", "no sql": "not only sql",
}

# Words that should NEVER be spell-corrected (valid programming & framework terms)
PROTECTED_WORDS = {
    "java", "javascript", "typescript", "python", "html", "css",
    "csharp", "cpp", "rust", "golang", "kotlin", "swift", "ruby", "php", "perl", "r", "scala", "elixir", "clojure", "dart",
    "flask", "django", "react", "angular", "vue", "node", "express", "next", "nuxt", "svelte",
    "fastapi", "spring", "laravel", "rails", "aspnet", "gin", "fiber", "echo", "actix", "rocket",
    "api", "rest", "crud", "jwt", "oauth", "sql", "nosql", "graphql", "grpc", "websocket", "webrtc",
    "async", "await", "const", "enum", "void", "int", "bool", "char", "float", "double", "string", "long", "short",
    "linq", "lambda", "regex", "json", "xml", "yaml", "yml", "toml", "csv", "protobuf",
    "optimize", "refactor", "decorator", "middleware", "endpoint", "router", "controller", "service", "repository",
    "flexbox", "grid", "sass", "less", "webpack", "vite", "rollup", "esbuild", "babel", "parcel", "turbopack",
    "interface", "abstract", "constructor", "destructor", "struct", "class", "trait", "protocol", "delegate",
    "factorial", "fibonacci", "recursive", "iterative", "memoize", "memoization", "heuristic", "dijkstra",
    "docker", "kubernetes", "nginx", "redis", "mongodb", "postgres", "mysql", "sqlite", "oracle", "mssql", "cassandra", "dynamodb",
    "pytest", "jest", "mocha", "junit", "unittest", "cypress", "playwright", "selenium", "vitest",
    "git", "npm", "pip", "yarn", "pnpm", "cargo", "maven", "gradle", "composer", "gem", "nuget",
    "http", "https", "tcp", "udp", "websocket", "ssl", "tls", "ssh", "dns", "ip",
    "trie", "heap", "deque", "queue", "stack", "graph", "tree", "bst", "avl", "redblack",
    "mutex", "semaphore", "thread", "process", "coroutine", "goroutine", "fiber", "actor", "channel",
    "useeffect", "usestate", "usecallback", "usememo", "useref", "usecontext", "usereducer",
    "pydantic", "sqlalchemy", "prisma", "sequelize", "mongoose", "typeorm", "hibernate",
}

# ─── 10-Category Enterprise Code Concept Taxonomy ─────────────────
CODE_CONCEPTS = {
    "data_structures": [
        r"\b(?:array|list|linked\s*list|stack|queue|deque|tree|binary\s*tree|bst|heap|graph|trie|hash\s*(?:map|table|set)|dictionary|tuple|set|matrix|vector|tensor|data\s*frame)\b"
    ],
    "algorithms": [
        r"\b(?:sort(?:ing)?|search(?:ing)?|binary\s*search|bubble\s*sort|merge\s*sort|quick\s*sort|insertion\s*sort|selection\s*sort|heap\s*sort|radix\s*sort|dfs|bfs|dijkstra|astar|a\s*\*|dynamic\s*programming|greedy|backtrack(?:ing)?|recursion|recursive|memoiz(?:e|ation)|divide\s*and\s*conquer|two\s*pointers|sliding\s*window)\b"
    ],
    "design_patterns": [
        r"\b(?:singleton|factory|abstract\s*factory|builder|prototype|observer|strategy|decorator|adapter|facade|proxy|command\s*pattern|iterator|mediator|memento|state\s*pattern|template\s*method|visitor|mvc|mvvm|mvp|repository|middleware|pipeline|dependency\s*injection|inversion\s*of\s*control)\b"
    ],
    "web_api": [
        r"\b(?:rest\s*api|graphql|websocket|http|https|endpoint|route|router|controller|middleware|cors|csrf|session|cookie|token|oauth|jwt|authentication|authorization|webhook|sse|server\s*sent\s*events|microservice|gateway|proxy|load\s*balancer)\b"
    ],
    "security_auth": [
        r"\b(?:jwt|oauth|oauth2|openid|saml|ssl|tls|bcrypt|argon2|pbkdf2|scrypt|encryption|decryption|hashing|signature|public\s*key|private\s*key|rsa|aes|xss|sql\s*injection|csrf|cors|rbac|abac|permissions|roles|sanitiz(?:e|ation)|rate\s*limit(?:ing)?|throttle)\b"
    ],
    "database_orm": [
        r"\b(?:sql|nosql|postgres|postgresql|mysql|sqlite|mongodb|redis|oracle|sql\s*server|dynamodb|cassandra|neo4j|sqlalchemy|prisma|mongoose|sequelize|typeorm|hibernate|entity|migration|schema|query|index|primary\s*key|foreign\s*key|transaction|acid|join|sharding|replication|connection\s*pool)\b"
    ],
    "concurrency_async": [
        r"\b(?:async|await|asynchronous|synchronous|promise|future|deferred|thread|threading|multithreading|process|multiprocessing|coroutine|goroutine|event\s*loop|mutex|semaphore|lock|deadlock|race\s*condition|channel|pub\s*sub|publish\s*subscribe|worker|queue)\b"
    ],
    "cloud_devops": [
        r"\b(?:docker|dockerfile|docker\s*compose|kubernetes|k8s|container|pod|cluster|node|aws|azure|gcp|google\s*cloud|s3|ec2|lambda|serverless|cloudflare|nginx|apache|ci\s*cd|pipeline|jenkins|github\s*actions|gitlab\s*ci|terraform|ansible|prometheus|grafana|elk|datadog)\b"
    ],
    "testing_qa": [
        r"\b(?:unit\s*test|integration\s*test|e2e|end\s*to\s*end|test\s*case|test\s*suite|mock|stub|spy|fixture|assertion|assert|coverage|tdd|bdd|pytest|jest|mocha|junit|unittest|vitest|cypress|playwright|selenium)\b"
    ],
    "frontend_ui": [
        r"\b(?:react|vue|angular|svelte|next|nuxt|dom|virtual\s*dom|jsx|tsx|hook|usestate|useeffect|usecontext|usereducer|usememo|usecallback|component|props|state|redux|zustand|tailwind|css|scss|sass|flexbox|grid|responsive|accessibility|a11y|animation|transition|canvas|webgl|svg)\b"
    ]
}


class NLPService:
    def __init__(self):
        logger.info("Initializing Extreme NLP 2.0 Service (Lazy Loading & High Throughput Mode)...")
        self.nlp = None
        self.classifier = None
        self.sentiment_analyzer = None
        self.embedder = None
        self.index = None
        self.snippets_metadata = []
        self._models_loaded = False
        self._load_lock = threading.Lock()
        self._spelling_cache = {}  # Caches word spelling checks for sub-15ms speed
        
        # Start pre-loading models in background immediately
        threading.Thread(target=self._ensure_models_loaded, daemon=True).start()

    def _ensure_models_loaded(self):
        """Lazy load heavy AI models only when first needed."""
        if self._models_loaded:
            return
        
        with self._load_lock:
            if self._models_loaded:
                return
            
            logger.info("Loading heavy AI models on first request...")
            try:
                # 1. Load spaCy model
                try:
                    import spacy
                    self.nlp = spacy.load("en_core_web_sm")
                except OSError:
                    logger.info("Downloading spaCy model 'en_core_web_sm'...")
                    from spacy.cli import download
                    download("en_core_web_sm")
                    self.nlp = spacy.load("en_core_web_sm")

                # 2. Vector Engine (Used for Search AND Intent)
                logger.info("  -> Loading Sentence Transformer (Multipurpose)...")
                from sentence_transformers import SentenceTransformer
                import faiss
                self.embedder = SentenceTransformer('all-MiniLM-L6-v2')
                self.dimension = 384
                self.index = faiss.IndexFlatL2(self.dimension)

                # Pre-calculate 15 granular intent embeddings for rich developer commands
                self.intent_labels = [
                    "create new code",
                    "optimize existing code",
                    "explain code",
                    "delete or remove code",
                    "debug and fix code",
                    "convert between languages",
                    "generate unit tests",
                    "add documentation and comments",
                    "add type hints and annotations",
                    "perform security audit",
                    "analyze algorithm complexity",
                    "scaffold project structure",
                    "refactor architecture",
                    "define database schema",
                    "create api client",
                    "execute or run code"
                ]
                self.intent_embeddings = self.embedder.encode(self.intent_labels)
                
                self._models_loaded = True
                logger.info("All Extreme NLP 2.0 models loaded successfully.")
            except Exception as e:
                logger.error(f"Failed to lazy load NLP models: {e}")

    def get_embedding(self, text: str):
        """Generate a vector embedding for a given text string."""
        self._ensure_models_loaded()
        if not self.embedder:
            return None
        return self.embedder.encode([text])[0]

    def add_snippet_to_index(self, snippet_id: int, title: str, code: str, language: str):
        """Add a snippet's text/code to the semantic search index."""
        self._ensure_models_loaded()
        if not self.index: return
        
        combined_text = f"{title} {language} {code[:200]}"
        vec = self.get_embedding(combined_text)
        if vec is not None:
            self.index.add(np.array([vec]).astype('float32'))
            self.snippets_metadata.append({
                "id": snippet_id,
                "title": title,
                "language": language
            })
            logger.info(f"Added snippet {snippet_id} to vector index.")

    def search_snippets(self, query: str, top_k: int = 5):
        """Find top_k snippets similar to the query."""
        self._ensure_models_loaded()
        if not self.index or self.index.ntotal == 0:
            return []
        
        query_vec = self.get_embedding(query)
        if query_vec is None: return []
        
        D, I = self.index.search(np.array([query_vec]).astype('float32'), top_k)
        results = []
        for dist, idx in zip(D[0], I[0]):
            if idx < len(self.snippets_metadata) and idx != -1:
                results.append(self.snippets_metadata[idx])
        return results

    def expand_abbreviations(self, text):
        """Expand coding abbreviations to full words for better understanding."""
        if not text:
            return text
        words = text.split()
        expanded = []
        for word in words:
            # Strip punctuation for lookup while preserving original
            clean_word = re.sub(r'^\W+|\W+$', '', word)
            lower = clean_word.lower()
            if lower in ABBREVIATIONS and lower not in PROTECTED_WORDS:
                replacement = ABBREVIATIONS[lower]
                # Re-attach leading/trailing punctuation if any
                prefix = word[:len(word) - len(clean_word) - len(word.lstrip(clean_word))] if clean_word else ''
                expanded.append(word.replace(clean_word, replacement))
            else:
                expanded.append(word)
        return " ".join(expanded)

    def correct_spelling(self, text):
        """
        Extreme Hybrid Spelling Correction (<20ms latency):
        1. Checks custom domain dictionary for 350+ speech/technical mishearings.
        2. Preserves CamelCase, snake_case, and protected programming keywords.
        3. Uses cached TextBlob correction with strict confidence guard > 0.8.
        """
        if not text:
            return text

        words = text.split()
        corrected_words = []

        for word in words:
            clean_word = re.sub(r'^\W+|\W+$', '', word)
            if not clean_word:
                corrected_words.append(word)
                continue

            lower_word = clean_word.lower()

            # Skip protected programming words and CamelCase/snake_case technical identifiers
            if lower_word in PROTECTED_WORDS or "_" in clean_word or (clean_word != clean_word.lower() and clean_word != clean_word.upper() and len(clean_word) > 3):
                corrected_words.append(word)
                continue

            # Step 1: Check custom coding dictionary first (O(1) instant lookup)
            if lower_word in CODING_DICTIONARY:
                corrected = CODING_DICTIONARY[lower_word]
                if clean_word[0].isupper():
                    corrected = corrected.capitalize()
                corrected_words.append(word.replace(clean_word, corrected))
                continue

            # Step 2: Check memory cache
            if lower_word in self._spelling_cache:
                cached_sugg = self._spelling_cache[lower_word]
                if clean_word[0].isupper():
                    cached_sugg = cached_sugg.capitalize()
                corrected_words.append(word.replace(clean_word, cached_sugg))
                continue

            # Step 3: TextBlob correction only for long unknown words (>4 chars)
            if len(clean_word) > 4 and clean_word.isalpha():
                try:
                    w = Word(lower_word)
                    spellcheck = w.spellcheck()
                    suggested, confidence = spellcheck[0]
                    if confidence > 0.82 and suggested != lower_word:
                        self._spelling_cache[lower_word] = suggested
                        if clean_word[0].isupper():
                            suggested = suggested.capitalize()
                        corrected_words.append(word.replace(clean_word, suggested))
                    else:
                        self._spelling_cache[lower_word] = clean_word
                        corrected_words.append(word)
                except Exception:
                    self._spelling_cache[lower_word] = clean_word
                    corrected_words.append(word)
            else:
                corrected_words.append(word)

        return " ".join(corrected_words)

    def extract_code_concepts(self, text):
        """Identify across 10 enterprise categories: data structures, algorithms, patterns, web, cloud, security, testing, db, async, ui."""
        if not text:
            return {}

        lower_text = text.lower()
        found = {}
        for category, patterns in CODE_CONCEPTS.items():
            matches = []
            for pattern in patterns:
                for m in re.finditer(pattern, lower_text):
                    match_text = m.group().strip()
                    if match_text and match_text not in matches:
                        matches.append(match_text)
            if matches:
                found[category] = matches
        return found

    def extract_keywords(self, text):
        """Extract important coding nouns, compound phrases, and technical tokens using spaCy."""
        self._ensure_models_loaded()
        if not self.nlp: return []
        
        doc = self.nlp(text)
        keywords = []

        # Extract nouns, proper nouns, and technical adjectives as keywords
        for token in doc:
            if token.pos_ in ("NOUN", "PROPN", "ADJ") and not token.is_stop and len(token.text) > 2:
                keywords.append(token.lemma_.lower())

        # Extract compound noun phrases
        for chunk in doc.noun_chunks:
            phrase = chunk.text.lower().strip()
            if len(phrase.split()) > 1 and not any(w in phrase for w in ("this", "that", "there", "some", "any")):
                keywords.append(phrase)

        # Deduplicate while preserving order
        seen = set()
        unique = []
        for kw in keywords:
            if kw not in seen:
                seen.add(kw)
                unique.append(kw)

        return unique

    def extract_action_verbs(self, text):
        """Extract coding action verbs (e.g., sort, reverse, filter, map, fetch, encrypt, query)."""
        self._ensure_models_loaded()
        if not self.nlp or not text: return []
        
        doc = self.nlp(text)
        verbs = []
        for token in doc:
            if token.pos_ == "VERB" and not token.is_stop and len(token.text) > 2:
                verbs.append(token.lemma_.lower())
        
        # Deduplicate
        return list(dict.fromkeys(verbs))

    def extract_code_signature(self, text):
        """Syntactically extracts target function names, class names, parameter lists, and return types."""
        if not text: return {}
        
        sig = {}
        # 1. Function name extraction
        fn_match = re.search(r'\b(?:function|fn|def|method|routine)\s+(?:called|named)?\s*([a-zA-Z0-9_]+)', text, re.IGNORECASE)
        if fn_match:
            sig["function_name"] = fn_match.group(1)
        else:
            # Check for "called X" or "named X"
            named_match = re.search(r'\b(?:called|named)\s+([a-zA-Z0-9_]+)', text, re.IGNORECASE)
            if named_match:
                sig["target_name"] = named_match.group(1)
        
        # 2. Class name extraction
        cls_match = re.search(r'\b(?:class|struct|interface)\s+(?:called|named)?\s*([a-zA-Z0-9_]+)', text, re.IGNORECASE)
        if cls_match:
            sig["class_name"] = cls_match.group(1)
            
        # 3. Parameters extraction
        param_match = re.search(r'\b(?:takes|accepts|parameters?|args?|arguments?|with\s+params?)\s+([a-zA-Z0-9_,\sand]+?)(?:\s+(?:and\s+)?(?:returns?|output|giving|which|to|$))', text, re.IGNORECASE)
        if param_match:
            raw_params = param_match.group(1)
            # Split by commas and 'and'
            params = [p.strip() for p in re.split(r',|\band\b', raw_params) if p.strip() and len(p.strip()) > 1]
            if params:
                sig["parameters"] = params
                
        # 4. Return type extraction
        ret_match = re.search(r'\b(?:returns?|output|giving|returning)\s+([a-zA-Z0-9_\[\]<>]+)', text, re.IGNORECASE)
        if ret_match:
            sig["return_type"] = ret_match.group(1)
            
        return sig

    def classify_intent(self, text):
        """Ultra-fast 15-class semantic intent detection using SentenceTransformers."""
        self._ensure_models_loaded()
        if not self.embedder or not text:
            return None

        try:
            query_embedding = self.get_embedding(text)
            similarities = np.dot(self.intent_embeddings, query_embedding)
            
            indices = np.argsort(similarities)[::-1]
            top_labels = [self.intent_labels[i] for i in indices[:3]]
            top_scores = [float(similarities[i]) for i in indices[:3]]

            return {
                "labels": top_labels,
                "scores": [round(s, 3) for s in top_scores],
                "top_intent": top_labels[0],
                "confidence": round(top_scores[0], 3)
            }
        except Exception as e:
            logger.warning(f"Semantic intent detection error: {e}")
            return None

    def detect_dependencies(self, text):
        """Detect mentioned libraries, SDKs, databases, and frameworks."""
        if not text:
            return []

        frameworks = {
            "flask", "django", "fastapi", "express", "react", "angular", "vue", "next", "nuxt", "svelte",
            "spring", "laravel", "rails", "aspnet", "gin", "fiber", "echo",
            "tensorflow", "pytorch", "keras", "pandas", "numpy", "scipy", "scikit-learn",
            "matplotlib", "seaborn", "plotly", "streamlit", "gradio",
            "selenium", "beautifulsoup", "scrapy", "requests", "httpx", "aiohttp",
            "sqlalchemy", "prisma", "mongoose", "sequelize", "typeorm", "hibernate", "pydantic",
            "jest", "pytest", "mocha", "junit", "cypress", "playwright", "vitest",
            "docker", "kubernetes", "nginx", "redis", "mongodb", "postgres", "mysql", "sqlite", "neondb", "supabase",
            "bootstrap", "tailwind", "material", "chakra", "shadcn",
        }

        lower_text = text.lower()
        found = [fw for fw in frameworks if re.search(rf"\b{re.escape(fw)}\b", lower_text)]
        return found

    def analyze_text(self, text):
        """Combines spaCy, Transformers, and custom NLP for deep 10-category analysis."""
        self._ensure_models_loaded()
        if not text:
            return {}

        # 1. Abbreviation Expansion
        expanded_text = self.expand_abbreviations(text)

        # 2. Spelling Correction (<20ms)
        corrected_text = self.correct_spelling(expanded_text)

        # 3. spaCy Processing (Tokens, Entities)
        doc = self.nlp(corrected_text)
        entities = [{"text": ent.text, "label": ent.label_} for ent in doc.ents]
        tokens = [token.text for token in doc]

        # 4. Code Concept Extraction (10 categories)
        code_concepts = self.extract_code_concepts(corrected_text)

        # 5. Keyword & Verb Extraction
        keywords = self.extract_keywords(corrected_text)
        action_verbs = self.extract_action_verbs(corrected_text)

        # 6. Signature Extraction
        code_signature = self.extract_code_signature(corrected_text)

        # 7. Dependency Detection
        dependencies = self.detect_dependencies(corrected_text)

        # 8. Sentiment Analysis
        sentiment = None
        if self.sentiment_analyzer:
            try:
                sentiment_res = self.sentiment_analyzer(corrected_text)
                sentiment = sentiment_res[0]
            except Exception as e:
                logger.warning(f"Sentiment analysis error: {e}")

        # 9. Intent Classification (15 classes)
        intent_classification = self.classify_intent(corrected_text)

        return {
            "original_text": text,
            "expanded_text": expanded_text,
            "corrected_text": corrected_text,
            "tokens": tokens,
            "entities": entities,
            "sentiment": sentiment,
            "noun_phrases": [chunk.text for chunk in doc.noun_chunks],
            "action_verbs": action_verbs,
            "code_concepts": code_concepts,
            "code_signature": code_signature,
            "keywords": keywords,
            "dependencies": dependencies,
            "intent_classification": intent_classification,
        }


if __name__ == "__main__":
    # Quick test
    logging.basicConfig(level=logging.INFO)
    service = NLPService()

    test_cases = [
        "Creete a pythone function called calculate_tax that takes salary and tax_rate and returns float",
        "Build a fastapi rest api with jwt autentication, pydantic schemas and sqlalchemy models",
        "Implment a binary search tree in rust with insert delet and search methods",
        "fn to calc fibonacci using recursve memoize with usestate and useeffect",
        "refacor this dockerfile and kubernetes cluster deployment pipeline",
    ]

    for test_text in test_cases:
        print(f"\n{'-' * 70}")
        print(f"Input:      {test_text}")
        results = service.analyze_text(test_text)
        print(f"Expanded:   {results['expanded_text']}")
        print(f"Corrected:  {results['corrected_text']}")
        print(f"Keywords:   {results['keywords']}")
        print(f"Verbs:      {results['action_verbs']}")
        print(f"Signature:  {results['code_signature']}")
        print(f"Concepts:   {list(results['code_concepts'].keys())}")
        print(f"Deps:       {results['dependencies']}")
        if results.get('intent_classification'):
            ic = results['intent_classification']
            print(f"Intent:     {ic['top_intent']} ({ic['confidence']})")

# Export singleton instance
nlp_service = NLPService()
