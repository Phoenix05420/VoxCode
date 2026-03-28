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

        # Intents and their regex patterns (as high-confidence anchors)
        self.intent_patterns = {
            "CREATE": [
                r"\b(?:create|generate|make|build|write|construct|new|add)\b",
                r"\b(?:start|setup|initialize)\b",
            ],
            "OPTIMIZE": [
                r"\b(?:optimize|refactor|improve|cleanup|fix|polish|tune)\b",
                r"\b(?:better|faster|cleaner|shorter)\b",
            ],
            "EXPLAIN": [
                r"\b(?:explain|describe|what does|how does|purpose|meaning)\b",
                r"\b(?:walkthrough|clarify|detail)\b",
            ],
            "DELETE": [
                r"\b(?:delete|remove|clear|wipe|trash|destroy|drop)\b",
                r"\b(?:get rid of|undo last)\b",
            ],
            "DEBUG": [
                r"\b(?:debug|fix bug|finding bugs|error in|crash|broken)\b",
                r"\b(?:solve|troubleshoot)\b",
            ],
            "CONVERT": [
                r"\b(?:convert|translate|transform|change to|port to)\b",
                r"\b(?:migrate|recode)\b",
            ],
            "TEST": [
                r"\b(?:test|unit test|integration test|mock|stub)\b",
                r"\b(?:verify|assert)\b",
            ]
        }
        
        # Languages and their regex patterns
        self.language_patterns = {
            "python": r"\bpython\b",
            "javascript": r"\b(?:javascript|js|node)\b",
            "typescript": r"\b(?:typescript|ts)\b",
            "html": r"\bhtml\s*5?\b",
            "css": r"\bcss\s*3?\b",
            "java": r"\bjava(?!script)\b",
            "cpp": r"(?:cpp|c\s*\+\s*\+|cplusplus|c plus plus)",
            "csharp": r"\b(?:csharp|c\s*#|c\s*sharp)\b",
            "rust": r"\brust\b",
            "go": r"\b(?:go|golang)\b",
            "kotlin": r"\bkotlin\b",
            "swift": r"\bswift\b",
        }
        
        # Initialize advanced NLP and Template services
        try:
            self.nlp_service = NLPService()
        except Exception as e:
            logger.error(f"Error initializing NLPService: {e}")
            self.nlp_service = None
            
        self.template_service = TemplateService()
        
        # Contextual Memory (Simple last-intent/lang tracking)
        self.history = []
        self.max_history = 5

    def _update_history(self, entry):
        self.history.append(entry)
        if len(self.history) > self.max_history:
            self.history.pop(0)

    def _get_context(self):
        if not self.history:
            return {"intent": "UNKNOWN", "language": "text"}
        return self.history[-1]

    def process_transcript(self, transcript: str, language: str = None):
        """
        Analyzes a transcript to identify intent, language, and content 
        using a hybrid Regex + Transformer approach with contextual memory.
        """
        if not transcript or not transcript.strip():
            return {"intent": "UNKNOWN", "language": "text", "confidence": 0.0}

        # 1. Advanced NLP Analysis
        nlp_data = {}
        if self.nlp_service:
            try:
                nlp_data = self.nlp_service.analyze_text(transcript)
                # Use corrected text for pattern matching
                text = nlp_data.get("corrected_text", transcript).lower()
            except Exception as e:
                logger.error(f"NLP analysis error: {e}")
                text = transcript.lower()
        else:
            text = transcript.lower()

        # 2. Identify Intent (Hybrid)
        intent_scores = {}
        
        # Method A: Regex Pattern Matching
        for intent, patterns in self.intent_patterns.items():
            score = 0
            for pattern in patterns:
                if re.search(pattern, text):
                    score += 0.4 # Cumulative regex boost
            if score > 0:
                intent_scores[intent] = min(score, 0.8) # Cap regex confidence

        # Method B: Transformer-based classification
        if nlp_data.get("intent_classification"):
            ic = nlp_data["intent_classification"]
            # Map BART labels back to our internal intents
            map_to_internal = {
                "create new code": "CREATE",
                "optimize existing code": "OPTIMIZE",
                "explain code": "EXPLAIN",
                "delete or remove code": "DELETE",
                "convert between languages": "CONVERT",
                "debug and fix code": "DEBUG",
                "generate tests": "TEST"
            }
            top_bart_intent = map_to_internal.get(ic["top_intent"])
            if top_bart_intent:
                # Weighted average with regex
                regex_score = intent_scores.get(top_bart_intent, 0)
                bart_score = ic["confidence"]
                intent_scores[top_bart_intent] = (regex_score * 0.4) + (bart_score * 0.6)

        # Pick winner
        if intent_scores:
            identified_intent = max(intent_scores, key=intent_scores.get)
            confidence = round(intent_scores[identified_intent], 3)
        else:
            # Contextual Fallback
            context = self._get_context()
            if context["intent"] != "UNKNOWN":
                identified_intent = context["intent"]
                confidence = 0.3 # Low confidence context-carryover
            else:
                identified_intent = "CREATE" # Default
                confidence = 0.1

        # 3. Identify Language (Prioritize explicit language from frontend)
        identified_language = language or "text"
        if identified_language == "text":
            for lang, pattern in self.language_patterns.items():
                if re.search(pattern, text):
                    identified_language = lang
                    break
        
        # Contextual language fallback
        if identified_language == "text":
            context = self._get_context()
            if context["language"] != "text":
                identified_language = context["language"]

        # 4. Content Generation Logic
        generated_code = ""
        t_type = None
        
        # A. Template-based generation (Fast & Local)
        if identified_intent == "CREATE" and confidence > 0.4:
            # Extract name
            name = "result"
            name_match = re.search(r'(?:called|named|named as)\s+([\w_]+)', text)
            if name_match:
                name = name_match.group(1)
            elif nlp_data.get("entities"):
                # Use first appropriate entity as name
                for ent in nlp_data["entities"]:
                    if ent["label"] in ["PRODUCT", "ORG", "PERSON", "WORK_OF_ART"]:
                        name = ent["text"].replace(" ", "_").lower()
                        break

            # Resolve template type
            t_type = "function"
            if "class" in text: t_type = "class"
            elif "interface" in text: t_type = "interface"
            elif "test" in text: t_type = "test"
            elif "api" in text or "rest" in text: t_type = "api"
            elif "component" in text: t_type = "component"
            elif "async" in text: t_type = "async"
            elif "jwt" in text or "auth" in text: t_type = "jwt_enterprise"
            elif "inplace" in text or "advanced sort" in text: t_type = "quick_sort_inplace"
            elif "binary" in text or "search" in text: t_type = "binary_search"
            elif "sieve" in text or "prime" in text: t_type = "sieve_eratosthenes"
            elif "linked" in text: t_type = "linked_list"
            elif "quick" in text or "sort" in text: t_type = "quick_sort"
            elif "stack" in text: t_type = "stack"
            elif "list" in text or "array" in text: t_type = "array_list"
            elif "react" in text or "comp" in text: t_type = "react_comp"
            elif "repo" in text: t_type = "jpa_repo"
            elif "crud" in text: t_type = "spring_crud" if lang == "java" else "api"
            elif "db" in text or "database" in text: t_type = "sqlalchemy_models" if lang == "python" else "struct"
            elif "redux" in text: t_type = "redux_toolkit"
            elif "context" in text: t_type = "react_context"
            elif "test" in text or "mock" in text: t_type = "junit_advanced" if lang == "java" else "test"
            elif "enum" in text: t_type = "enum"

            generated_code = self.template_service.get_code(
                identified_language,
                t_type,
                name=name,
                params="data",
                docstring=transcript
            )

        # B. Complex Intent / LLM Fallback (Slow & Smart)
        # In a real scenario, this would trigger an async call to api_server.py's AI logic
        # For this processor, we'll return metadata for the caller to handle streaming
        
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
                "concepts": nlp_data.get("code_concepts", {}),
                "dependencies": nlp_data.get("dependencies", []),
                "is_complex": confidence < 0.6 or "and" in text or identified_intent in ["OPTIMIZE", "CONVERT", "DEBUG"]
            }
        }

        # Update History
        self._update_history({"intent": identified_intent, "language": identified_language})
        
        return result

if __name__ == "__main__":
    # Test cases
    logging.basicConfig(level=logging.INFO)
    cp = CommandProcessor()
    
    test_inputs = [
        "Create a python function called calculate_primes",
        "Now convert that to typescript",
        "Debug the memory leak in this C++ class",
        "Explain how the flask middleware handles headers",
        "Optimize the bubble sort algorithm in Go",
        "Write unit tests for the user authentication module"
    ]
    
    for inp in test_inputs:
        print(f"\n🎙️  Input:    {inp}")
        res = cp.process_transcript(inp)
        print(f"🧠  Intent:   {res['intent']} ({res['confidence']})")
        print(f"💻  Language: {res['language']}")
        if res['generated_code']:
            print(f"📝  Template: [Generated]")
        print(f"🔍  Complex:  {res['nlp_analysis']['is_complex']}")
        print(f"📦  Concepts: {res['nlp_analysis']['concepts']}")
        print(f"🔍  Keywords: {res['nlp_analysis']['keywords']}")

# Export singleton instance
command_processor = CommandProcessor()
