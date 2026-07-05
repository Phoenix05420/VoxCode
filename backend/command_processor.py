import re
import logging
import requests
from nlp_service import NLPService
from template_service import TemplateService

logger = logging.getLogger("voxcode.command")

class CommandProcessor:
    def __init__(self):
        # Configuration for LLM Model Server
        self.model_url = "http://localhost:8000/v1/chat/completions"
        self.model_name = "qwen2.5-coder:7b" # Default, can be overridden

        # 14 Enterprise Coding Intents with rich regex anchors
        self.intent_patterns = {
            "CREATE": [
                r"\b(?:create|generate|make|build|write|construct|new|add|scaffold|initialize|setup|implement|define)\b",
            ],
            "OPTIMIZE": [
                r"\b(?:optimize|refactor|improve|cleanup|fix|polish|tune|better|faster|cleaner|shorter|streamline|performance|accelerate)\b",
            ],
            "EXPLAIN": [
                r"\b(?:explain|describe|what does|how does|purpose|meaning|walkthrough|clarify|detail|summarize|overview|breakdown)\b",
            ],
            "DELETE": [
                r"\b(?:delete|remove|clear|wipe|trash|destroy|drop|get rid of|strip|purge)\b",
            ],
            "DEBUG": [
                r"\b(?:debug|fix bug|finding bugs|error in|crash|broken|solve|troubleshoot|null pointer|exception|stack trace|segfault)\b",
            ],
            "CONVERT": [
                r"\b(?:convert|translate|transform|change to|port to|migrate|recode|rewrite in)\b",
            ],
            "TEST": [
                r"\b(?:test|unit test|integration test|e2e|mock|stub|spy|fixture|assert|verify|coverage|tdd|bdd)\b",
            ],
            "DOCUMENT": [
                r"\b(?:document|docstring|comment|add comments|add docstrings|javadoc|jsdoc|annotate|readme)\b",
            ],
            "TYPE_HINT": [
                r"\b(?:type hint|typecheck|typescript types|static typing|add types|return type|type annotation)\b",
            ],
            "SECURITY": [
                r"\b(?:security|audit|vulnerability|xss|sql injection|sanitize|harden|encrypt|protect|csrf|cors|jwt auth)\b",
            ],
            "COMPLEXITY": [
                r"\b(?:time complexity|space complexity|big o|big-o|algorithmic complexity|efficiency|memory usage|cpu cycles)\b",
            ],
            "DATABASE": [
                r"\b(?:database schema|table|migration|orm|model|relationship|foreign key|index|query|sqlalchemy|prisma)\b",
            ],
            "DEVOPS": [
                r"\b(?:docker|kubernetes|ci/cd|pipeline|container|deploy|nginx|aws|cloud|serverless|dockerfile|docker compose)\b",
            ],
            "API": [
                r"\b(?:api client|rest endpoint|graphql query|webhook|fetch|axios|request|response|router|controller)\b",
            ],
            "RUN": [
                r"\b(?:run|compile|execute|launch|start|evaluate)\s+(?:code|script|program|file|project|app|this)?\b",
                r"\b(?:run this|compile this|execute this|test this|run program|compile code)\b",
            ]
        }
        
        # Languages and their regex patterns
        self.language_patterns = {
            "python": r"\bpython\b",
            "javascript": r"\b(?:javascript|js|node)\b",
            "typescript": r"\b(?:typescript|ts)\b",
            "html": r"\bhtml\s*5?\b",
            "css": r"\bcss\s*3?\b",
            "sql": r"\bsql\b",
            "java": r"\bjava(?!script)\b",
            "cpp": r"(?:cpp|c\s*\+\s*\+|cplusplus|c plus plus)",
            "csharp": r"\b(?:csharp|c\s*#|c\s*sharp)\b",
            "rust": r"\brust\b",
            "go": r"\b(?:go|golang)\b",
            "kotlin": r"\bkotlin\b",
            "swift": r"\bswift\b",
            "php": r"\bphp\b",
            "ruby": r"\bruby\b",
            "sql": r"\b(?:sql|postgres|mysql|sqlite)\b",
        }
        
        # Initialize advanced NLP and Template services
        try:
            self.nlp_service = NLPService()
        except Exception as e:
            logger.error(f"Error initializing NLPService: {e}")
            self.nlp_service = None
            
        self.template_service = TemplateService()
        
        # Contextual Memory (Tracks last 5 turns including entities, language, and intents)
        self.history = []
        self.max_history = 5

    def _update_history(self, entry):
        self.history.append(entry)
        if len(self.history) > self.max_history:
            self.history.pop(0)

    def _get_context(self):
        if not self.history:
            return {"intent": "UNKNOWN", "language": "text", "entity": None}
        return self.history[-1]

    def _resolve_coreferences(self, text: str, context: dict) -> str:
        """
        Pronoun & Coreference Resolution:
        Replaces 'it', 'this', 'that function', 'the code' with the actual target entity from previous turns.
        """
        if not context.get("entity") or context["entity"] == "result":
            return text
        
        target = context["entity"]
        # Replace common pronouns if present
        resolved = re.sub(r'\b(?:it|this|that|the code|the function|the class|the loop|the endpoint)\b', f"{target} ({context.get('language', '')})", text, flags=re.IGNORECASE)
        return resolved

    def _resolve_template_type(self, text: str, language: str):
        """Map prompt text to the strongest local template match."""
        if "class" in text:
            return "class"
        if "interface" in text:
            return "interface"
        if "crud" in text:
            return "spring_crud" if language == "java" else "api"
        if "db" in text or "database" in text or "schema" in text:
            return "sqlalchemy_models" if language == "python" else "struct"
        if "test" in text or "mock" in text or "unit test" in text:
            return "junit_advanced" if language == "java" else "test"
        if "api" in text or "rest" in text or "endpoint" in text:
            return "api"
        if "component" in text:
            return "component"
        if "async" in text or "await" in text:
            return "async"
        if "jwt" in text or "auth" in text or "security" in text:
            return "jwt_enterprise"
        if "inplace" in text or "advanced sort" in text:
            return "quick_sort_inplace"
        if "binary" in text or "search" in text:
            return "binary_search"
        if "sieve" in text or "prime" in text:
            return "sieve_eratosthenes"
        if "linked" in text:
            return "linked_list"
        if "quick" in text or "sort" in text:
            return "quick_sort"
        if "stack" in text:
            return "stack"
        if "list" in text or "array" in text:
            return "array_list"
        if "react" in text or "comp" in text:
            return "react_comp"
        if "repo" in text:
            return "jpa_repo"
        if "redux" in text:
            return "redux_toolkit"
        if "context" in text:
            return "react_context"
        if "enum" in text:
            return "enum"
        return "function"

    def process_transcript(self, transcript: str, language: str = None):
        """
        Analyzes a transcript to identify intent, language, entities, and code signature
        using an Extreme Hybrid Regex + Transformer approach with pronoun coreference memory.
        """
        if not transcript or not transcript.strip():
            return {"intent": "UNKNOWN", "language": "text", "confidence": 0.0}

        # 0. Context & Coreference Resolution
        context = self._get_context()
        resolved_transcript = self._resolve_coreferences(transcript, context)

        # 1. Advanced NLP Analysis
        nlp_data = {}
        if self.nlp_service:
            try:
                nlp_data = self.nlp_service.analyze_text(resolved_transcript)
                # Use corrected text for pattern matching
                text = nlp_data.get("corrected_text", resolved_transcript).lower()
            except Exception as e:
                logger.error(f"NLP analysis error: {e}")
                text = resolved_transcript.lower()
        else:
            text = resolved_transcript.lower()

        # 2. Identify Intent (Extreme Hybrid with Negation Guards)
        intent_scores = {}
        
        # Method A: Regex Pattern Matching with Negation Check
        has_negation = bool(re.search(r"\b(?:don\'t|do not|without|never|avoid|skip|no)\b", text))
        
        for intent, patterns in self.intent_patterns.items():
            score = 0
            for pattern in patterns:
                if re.search(pattern, text):
                    # If negation exists and this is DELETE or OPTIMIZE, suppress score
                    if has_negation and intent in ["DELETE", "OPTIMIZE"]:
                        score = 0
                    else:
                        score += 0.45  # Cumulative regex boost
            if score > 0:
                intent_scores[intent] = min(score, 0.85)  # Cap regex confidence

        # Method B: Transformer-based 15-class semantic classification
        if nlp_data.get("intent_classification"):
            ic = nlp_data["intent_classification"]
            # Map semantic labels back to our internal 14 enterprise intents
            map_to_internal = {
                "create new code": "CREATE",
                "optimize existing code": "OPTIMIZE",
                "explain code": "EXPLAIN",
                "delete or remove code": "DELETE",
                "debug and fix code": "DEBUG",
                "convert between languages": "CONVERT",
                "generate unit tests": "TEST",
                "add documentation and comments": "DOCUMENT",
                "add type hints and annotations": "TYPE_HINT",
                "perform security audit": "SECURITY",
                "analyze algorithm complexity": "COMPLEXITY",
                "scaffold project structure": "DEVOPS",
                "refactor architecture": "OPTIMIZE",
                "define database schema": "DATABASE",
                "create api client": "API",
                "execute or run code": "RUN",
            }
            top_semantic_intent = map_to_internal.get(ic["top_intent"])
            if top_semantic_intent:
                # Weighted average: 40% Regex + 60% Semantic Transformer
                regex_score = intent_scores.get(top_semantic_intent, 0)
                semantic_score = ic["confidence"]
                intent_scores[top_semantic_intent] = (regex_score * 0.4) + (semantic_score * 0.6)

        # Pick winner
        if intent_scores:
            identified_intent = max(intent_scores, key=intent_scores.get)
            confidence = round(intent_scores[identified_intent], 3)
        else:
            # Contextual Fallback
            if context["intent"] != "UNKNOWN":
                identified_intent = context["intent"]
                confidence = 0.35  # Moderate confidence context-carryover
            else:
                identified_intent = "CREATE"  # Default
                confidence = 0.15

        # 3. Identify Language (Prioritize explicit language from frontend)
        identified_language = language or "text"
        if identified_language == "text":
            for lang, pattern in self.language_patterns.items():
                if re.search(pattern, text):
                    identified_language = lang
                    break
        
        # Contextual language fallback
        if identified_language == "text":
            if context["language"] != "text":
                identified_language = context["language"]

        # 4. Extract Entity Name from Code Signature or NLP
        name = "result"
        sig = nlp_data.get("code_signature", {})
        if sig.get("function_name"):
            name = sig["function_name"]
        elif sig.get("class_name"):
            name = sig["class_name"]
        elif sig.get("target_name"):
            name = sig["target_name"]
        elif nlp_data.get("entities"):
            for ent in nlp_data["entities"]:
                if ent["label"] in ["PRODUCT", "ORG", "PERSON", "WORK_OF_ART", "GPE"]:
                    name = ent["text"].replace(" ", "_").lower()
                    break
        elif nlp_data.get("keywords"):
            # Use first technical keyword as name
            for kw in nlp_data["keywords"]:
                if len(kw) > 3 and kw not in ["code", "function", "class", "file", "method", "project"]:
                    name = kw.replace(" ", "_").lower()
                    break

        # 5. Content Generation Logic
        generated_code = ""
        t_type = None
        
        # A. Template-based generation (Fast & Local)
        if identified_intent == "CREATE" and confidence >= 0.4:
            t_type = self._resolve_template_type(text, identified_language)
            params = ", ".join(sig.get("parameters", ["data"])) if sig.get("parameters") else "data"

            generated_code = self.template_service.get_code(
                identified_language,
                t_type,
                name=name,
                params=params,
                docstring=transcript
            )

        # B. Complex Intent / LLM Fallback (Slow & Smart)
        result = {
            "intent": identified_intent,
            "language": identified_language,
            "template_type": t_type,
            "confidence": confidence,
            "original_prompt": transcript,
            "cleaned_prompt": nlp_data.get("corrected_text", transcript),
            "generated_code": generated_code,
            "nlp_analysis": {
                "keywords": nlp_data.get("keywords", []),
                "action_verbs": nlp_data.get("action_verbs", []),
                "code_signature": sig,
                "concepts": nlp_data.get("code_concepts", {}),
                "dependencies": nlp_data.get("dependencies", []),
                "is_complex": confidence < 0.6 or "and" in text or identified_intent in ["OPTIMIZE", "CONVERT", "DEBUG", "REFACTOR", "SECURITY"]
            }
        }

        # Update Context History
        self._update_history({
            "intent": identified_intent,
            "language": identified_language,
            "entity": name
        })
        
        return result

if __name__ == "__main__":
    # Test cases
    logging.basicConfig(level=logging.INFO)
    cp = CommandProcessor()
    
    test_inputs = [
        "Create a python function called calculate_primes that takes max_num and returns list",
        "Now convert that to typescript with type hints",
        "Debug the memory leak in this C++ class and perform a security audit",
        "Explain how the flask middleware handles headers",
        "Optimize the bubble sort algorithm in Go",
        "Write unit tests for the user authentication module with pytest and mock"
    ]
    
    for inp in test_inputs:
        print(f"\n[Input]     {inp}")
        res = cp.process_transcript(inp)
        print(f"[Intent]    {res['intent']} ({res['confidence']})")
        print(f"[Language]  {res['language']}")
        print(f"[Signature] {res['nlp_analysis']['code_signature']}")
        print(f"[Verbs]     {res['nlp_analysis']['action_verbs']}")
        if res['generated_code']:
            print(f"[Template]  [Generated fast-path scaffolding]")
        print(f"[Complex]   {res['nlp_analysis']['is_complex']}")
        print(f"[Concepts]  {list(res['nlp_analysis']['concepts'].keys())}")
        print(f"[Keywords]  {res['nlp_analysis']['keywords']}")

# Export singleton instance
command_processor = CommandProcessor()
