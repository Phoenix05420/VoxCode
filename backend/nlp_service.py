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

# ─── Coding Domain Dictionary (100+ entries) ──────────────────────
CODING_DICTIONARY = {
    # Common speech-to-text errors
    "creete": "create", "crete": "create", "creat": "create", "creeate": "create",
    "generete": "generate", "genrate": "generate", "jenerate": "generate",
    "delet": "delete", "deleet": "delete", "deelete": "delete",
    "functoin": "function", "functon": "function", "funciton": "function", "funktion": "function",
    "facktorial": "factorial", "faktorial": "factorial", "factoral": "factorial",
    "pythone": "python", "pyhton": "python", "pythn": "python", "pithon": "python",
    "javascrip": "javascript", "javascrit": "javascript", "javaskript": "javascript",
    "typescrip": "typescript", "typscript": "typescript",
    "refacor": "refactor", "refater": "refactor", "refaktor": "refactor",
    "optmize": "optimize", "optimze": "optimize", "optimise": "optimize",
    "variabel": "variable", "vairable": "variable", "vareable": "variable",
    "calss": "class", "clss": "class", "klass": "class",
    "arary": "array", "arry": "array", "aray": "array",
    "strng": "string", "stirng": "string", "sting": "string",
    "numbr": "number", "nubmer": "number", "numbar": "number",
    "implment": "implement", "implemnt": "implement", "impliment": "implement",
    # More domain terms
    "algorithem": "algorithm", "algorthm": "algorithm", "algorythm": "algorithm",
    "databse": "database", "datbase": "database", "databaes": "database",
    "parametr": "parameter", "paramter": "parameter", "perameter": "parameter",
    "argumnt": "argument", "arguement": "argument", "arguemnt": "argument",
    "iterater": "iterator", "itterator": "iterator",
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
    "middlewear": "middleware", "midleware": "middleware",
    "endpont": "endpoint", "endpiont": "endpoint",
    "serialze": "serialize", "serialise": "serialize", "seralize": "serialize",
    "validaton": "validation", "validasion": "validation",
    "autentication": "authentication", "authenticaton": "authentication",
    "authorizaton": "authorization", "authorisation": "authorization",
    "deploymnt": "deployment", "deployement": "deployment",
    "dependncy": "dependency", "dependancy": "dependency", "dependensy": "dependency",
    "configration": "configuration", "configuraton": "configuration",
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
}

# ─── Abbreviation Expansion ───────────────────────────────────────
ABBREVIATIONS = {
    "fn": "function", "func": "function",
    "cls": "class", "obj": "object",
    "var": "variable", "vars": "variables",
    "arr": "array", "str": "string",
    "num": "number", "nums": "numbers",
    "int": "integer", "ints": "integers",
    "bool": "boolean", "char": "character",
    "dict": "dictionary", "db": "database",
    "auth": "authentication", "config": "configuration",
    "init": "initialize", "impl": "implement",
    "param": "parameter", "params": "parameters",
    "arg": "argument", "args": "arguments",
    "resp": "response", "req": "request",
    "msg": "message", "err": "error",
    "calc": "calculate", "gen": "generate",
    "del": "delete", "rem": "remove",
    "val": "validate", "conv": "convert",
    "exec": "execute", "eval": "evaluate",
    "iter": "iterate", "recur": "recursive",
    "async": "asynchronous", "sync": "synchronous",
    "prop": "property", "props": "properties",
    "attr": "attribute", "attrs": "attributes",
    "elem": "element", "idx": "index",
    "len": "length", "cnt": "count",
    "max": "maximum", "min": "minimum",
    "avg": "average", "sum": "summation",
    "prev": "previous", "curr": "current",
    "temp": "temporary", "ret": "return",
    "doc": "document", "docs": "documents",
    "dir": "directory", "dirs": "directories",
    "env": "environment", "pkg": "package",
    "dep": "dependency", "deps": "dependencies",
    "lib": "library", "libs": "libraries",
    "util": "utility", "utils": "utilities",
    "ref": "reference", "refs": "references",
    "src": "source", "dest": "destination",
    "btn": "button", "nav": "navigation",
    "hdr": "header", "ftr": "footer",
    "sec": "section", "comp": "component",
}

# Words that should NEVER be spell-corrected (valid programming terms)
PROTECTED_WORDS = {
    "java", "javascript", "typescript", "python", "html", "css",
    "csharp", "cpp", "rust", "golang", "kotlin", "swift", "ruby",
    "flask", "django", "react", "angular", "vue", "node", "express",
    "fastapi", "spring", "laravel", "rails",
    "api", "rest", "crud", "jwt", "oauth", "sql", "nosql", "graphql",
    "async", "await", "const", "enum", "void", "int", "bool", "char",
    "linq", "lambda", "regex", "json", "xml", "yaml", "toml", "csv",
    "optimize", "refactor", "decorator", "middleware", "endpoint",
    "flexbox", "grid", "sass", "webpack", "vite", "rollup", "esbuild",
    "interface", "abstract", "constructor", "destructor", "struct",
    "factorial", "fibonacci", "recursive", "iterative", "memoize",
    "docker", "kubernetes", "nginx", "redis", "mongodb", "postgres",
    "pytest", "jest", "mocha", "junit", "unittest",
    "git", "npm", "pip", "yarn", "pnpm", "cargo", "maven", "gradle",
    "http", "https", "tcp", "udp", "websocket", "grpc",
    "trie", "heap", "deque", "queue", "stack", "graph", "tree",
    "mutex", "semaphore", "thread", "process", "coroutine",
}

# ─── Code Concept Patterns ────────────────────────────────────────
CODE_CONCEPTS = {
    "data_structures": [
        r"\b(?:array|list|linked\s*list|stack|queue|deque|tree|binary\s*tree|bst|heap|graph|trie|hash\s*(?:map|table|set)|dictionary|tuple|set|matrix)\b"
    ],
    "algorithms": [
        r"\b(?:sort(?:ing)?|search(?:ing)?|binary\s*search|bubble\s*sort|merge\s*sort|quick\s*sort|insertion\s*sort|selection\s*sort|heap\s*sort|dfs|bfs|dijkstra|dynamic\s*programming|greedy|backtrack(?:ing)?|recursion|recursive|memoiz(?:e|ation))\b"
    ],
    "patterns": [
        r"\b(?:singleton|factory|observer|strategy|decorator|adapter|facade|proxy|mvc|mvvm|repository|middleware|pipeline|builder|prototype|command\s*pattern)\b"
    ],
    "web": [
        r"\b(?:rest\s*api|graphql|websocket|http|endpoint|route|middleware|cors|csrf|session|cookie|token|oauth|jwt|authentication|authorization)\b"
    ],
    "testing": [
        r"\b(?:unit\s*test|integration\s*test|e2e|end.to.end|test\s*case|mock|stub|spy|fixture|assertion|coverage|pytest|jest|mocha|junit)\b"
    ],
}


class NLPService:
    def __init__(self):
        logger.info("Initializing NLP Service (Lazy Loading Mode)...")
        self.nlp = None
        self.classifier = None
        self.sentiment_analyzer = None
        self.embedder = None
        self.index = None
        self.snippets_metadata = []
        self._models_loaded = False
        self._load_lock = threading.Lock()
        
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

                # Pre-calculate intent embeddings
                self.intent_labels = [
                    "create new code", "optimize existing code", "explain code",
                    "delete or remove code", "convert between languages",
                    "debug and fix code", "generate tests"
                ]
                self.intent_embeddings = self.embedder.encode(self.intent_labels)
                
                self._models_loaded = True
                logger.info("All optimized NLP models loaded successfully.")
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
            lower = word.lower()
            if lower in ABBREVIATIONS and lower not in PROTECTED_WORDS:
                expanded.append(ABBREVIATIONS[lower])
            else:
                expanded.append(word)
        return " ".join(expanded)

    def correct_spelling(self, text):
        """
        Hybrid spelling correction:
        1. First check custom coding dictionary for domain-specific typos.
        2. Then use TextBlob per-word correction with confidence threshold.
        """
        if not text:
            return text

        words = text.split()
        corrected_words = []

        for word in words:
            lower_word = word.lower()

            # Skip protected programming words
            if lower_word in PROTECTED_WORDS:
                corrected_words.append(word)
                continue

            # Step 1: Check custom coding dictionary first
            if lower_word in CODING_DICTIONARY:
                corrected = CODING_DICTIONARY[lower_word]
                if word[0].isupper():
                    corrected = corrected.capitalize()
                corrected_words.append(corrected)
                continue

            # Step 2: Use TextBlob per-word correction with confidence
            try:
                w = Word(lower_word)
                spellcheck = w.spellcheck()
                suggested, confidence = spellcheck[0]
                if confidence > 0.7 and suggested != lower_word:
                    if word[0].isupper():
                        suggested = suggested.capitalize()
                    corrected_words.append(suggested)
                else:
                    corrected_words.append(word)
            except Exception:
                corrected_words.append(word)

        return " ".join(corrected_words)

    def extract_code_concepts(self, text):
        """Identify data structures, algorithms, patterns, and web concepts."""
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
        """Extract the most important coding keywords using spaCy."""
        self._ensure_models_loaded()
        if not self.nlp: return []
        
        doc = self.nlp(text)
        keywords = []

        # Extract nouns and proper nouns as keywords
        for token in doc:
            if token.pos_ in ("NOUN", "PROPN") and not token.is_stop and len(token.text) > 2:
                keywords.append(token.lemma_.lower())

        # Extract compound phrases
        for chunk in doc.noun_chunks:
            phrase = chunk.text.lower().strip()
            if len(phrase.split()) > 1:
                keywords.append(phrase)

        # Deduplicate while preserving order
        seen = set()
        unique = []
        for kw in keywords:
            if kw not in seen:
                seen.add(kw)
                unique.append(kw)

        return unique

    def classify_intent(self, text):
        """Ultra-fast intent detection using semantic similarity (SentenceTransformers)."""
        self._ensure_models_loaded()
        if not self.embedder or not text:
            return None

        try:
            # Calculate similarity between query and pre-baked intents
            query_embedding = self.get_embedding(text)
            # Dot product for similarity (embeddings are normalized by default in sentence_transformers)
            similarities = np.dot(self.intent_embeddings, query_embedding)
            
            # Sort by score
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
        """Detect mentioned libraries and frameworks."""
        if not text:
            return []

        frameworks = {
            "flask", "django", "fastapi", "express", "react", "angular", "vue",
            "next", "nuxt", "svelte", "spring", "laravel", "rails",
            "tensorflow", "pytorch", "keras", "pandas", "numpy", "scipy",
            "matplotlib", "seaborn", "plotly", "streamlit", "gradio",
            "selenium", "beautifulsoup", "scrapy", "requests",
            "sqlalchemy", "prisma", "mongoose", "sequelize",
            "jest", "pytest", "mocha", "junit", "cypress",
            "docker", "kubernetes", "nginx", "redis", "mongodb",
            "bootstrap", "tailwind", "material", "chakra",
        }

        lower_text = text.lower()
        found = [fw for fw in frameworks if fw in lower_text]
        return found

    def analyze_text(self, text):
        """Combines spaCy, Transformers, and custom NLP for deep analysis."""
        self._ensure_models_loaded()
        if not text:
            return {}

        # 1. Abbreviation Expansion
        expanded_text = self.expand_abbreviations(text)

        # 2. Spelling Correction
        corrected_text = self.correct_spelling(expanded_text)

        # 3. spaCy Processing (Tokens, Entities)
        doc = self.nlp(corrected_text)
        entities = [{"text": ent.text, "label": ent.label_} for ent in doc.ents]
        tokens = [token.text for token in doc]

        # 4. Code Concept Extraction
        code_concepts = self.extract_code_concepts(corrected_text)

        # 5. Keyword Extraction
        keywords = self.extract_keywords(corrected_text)

        # 6. Dependency Detection
        dependencies = self.detect_dependencies(corrected_text)

        # 7. Sentiment Analysis
        sentiment = None
        if self.sentiment_analyzer:
            try:
                sentiment_res = self.sentiment_analyzer(corrected_text)
                sentiment = sentiment_res[0]
            except Exception as e:
                logger.warning(f"Sentiment analysis error: {e}")

        # 8. Intent Classification (zero-shot)
        intent_classification = self.classify_intent(corrected_text)

        return {
            "original_text": text,
            "expanded_text": expanded_text,
            "corrected_text": corrected_text,
            "tokens": tokens,
            "entities": entities,
            "sentiment": sentiment,
            "noun_phrases": [chunk.text for chunk in doc.noun_chunks],
            "code_concepts": code_concepts,
            "keywords": keywords,
            "dependencies": dependencies,
            "intent_classification": intent_classification,
        }


if __name__ == "__main__":
    # Quick test
    logging.basicConfig(level=logging.INFO)
    service = NLPService()

    test_cases = [
        "Creete a pythone function to calculate the facktorial of a number",
        "Build a flask rest api with jwt autentication and crud endpoints",
        "Implment a binary search tree with insert delet and search methods",
        "fn to calc fibonacci using recursve memoize",
    ]

    for test_text in test_cases:
        print(f"\n{'━' * 60}")
        print(f"Input:      {test_text}")
        results = service.analyze_text(test_text)
        print(f"Expanded:   {results['expanded_text']}")
        print(f"Corrected:  {results['corrected_text']}")
        print(f"Keywords:   {results['keywords']}")
        print(f"Concepts:   {results['code_concepts']}")
        print(f"Deps:       {results['dependencies']}")
        if results.get('intent_classification'):
            ic = results['intent_classification']
            print(f"Intent:     {ic['top_intent']} ({ic['confidence']})")

# Export singleton instance
nlp_service = NLPService()
