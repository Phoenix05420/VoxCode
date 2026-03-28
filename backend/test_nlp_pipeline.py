import os
import sys
import numpy as np

# Add the current directory to sys.path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    from nlp_service import NLPService
    from command_processor import CommandProcessor
    from template_service import TemplateService
    import noisereduce as nr
    print("✅ All modules imported successfully!\n")
except ImportError as e:
    print(f"❌ Import error: {e}")
    sys.exit(1)

PASS = 0
FAIL = 0

def report(name, passed):
    global PASS, FAIL
    if passed:
        PASS += 1
        print(f"  ✅ {name}")
    else:
        FAIL += 1
        print(f"  ❌ {name}")

# ──────────────────────────────────────────────────────────
# 1. NOISE REDUCTION TEST — overlapping frequencies + noise
# ──────────────────────────────────────────────────────────
def test_noise_reduction():
    print("━" * 60)
    print("TEST 1: Advanced Noise Reduction")
    print("━" * 60)
    rate = 16000
    duration = 3  # 3 seconds of audio
    t = np.linspace(0, duration, rate * duration)
    
    # Complex signal: two overlapping tones (speech-like)
    signal = 0.6 * np.sin(2 * np.pi * 300 * t) + 0.4 * np.sin(2 * np.pi * 1200 * t)
    
    # Add heavy Gaussian noise + impulse noise (mic clicks)
    gaussian_noise = np.random.normal(0, 0.8, len(t))
    impulse_noise = np.zeros(len(t))
    impulse_noise[np.random.randint(0, len(t), 50)] = np.random.choice([-3, 3], 50)
    
    noisy_signal = signal + gaussian_noise + impulse_noise
    
    try:
        reduced = nr.reduce_noise(y=noisy_signal, sr=rate)
        snr_before = np.mean(signal**2) / np.mean((noisy_signal - signal)**2)
        snr_after = np.mean(signal**2) / np.mean((reduced - signal)**2)
        print(f"  SNR before: {snr_before:.3f} → SNR after: {snr_after:.3f}")
        report("Noise reduction improved signal", snr_after > snr_before)
    except Exception as e:
        report(f"Noise reduction failed: {e}", False)

# ──────────────────────────────────────────────────────────
# 2. SPELL CORRECTION — complex misspelled voice commands
# ──────────────────────────────────────────────────────────
def test_spell_correction():
    print("\n" + "━" * 60)
    print("TEST 2: Spell Correction (Complex Inputs)")
    print("━" * 60)
    service = NLPService()
    
    cases = [
        {
            "input":    "Creete a pythone calss for handeling user authenticaton with JWT tokens",
            "expected": ["create", "python", "class"],
            "desc":     "Multi-typo class creation"
        },
        {
            "input":    "Optmize the javascrip functoin that sorts the arary of numbrs",
            "expected": ["optimize", "javascript", "function", "array", "number"],
            "desc":     "Heavy misspelling in optimization request"
        },
        {
            "input":    "Refacor the variabel names in the typescrip module to follow camelCase",
            "expected": ["refactor", "variable", "typescript"],
            "desc":     "Refactoring with domain typos"
        },
        {
            "input":    "Implment a binary search tree in pythone with insert delet and search methods",
            "expected": ["implement", "python", "delete"],
            "desc":     "Data structure implementation with typos"
        },
    ]
    
    for case in cases:
        result = service.analyze_text(case["input"])
        corrected = result["corrected_text"].lower()
        all_found = all(word in corrected for word in case["expected"])
        print(f"\n  Input:     {case['input']}")
        print(f"  Corrected: {result['corrected_text']}")
        report(f"{case['desc']} — keywords: {case['expected']}", all_found)

# ──────────────────────────────────────────────────────────
# 3. INTENT + ENTITY DETECTION — full pipeline
# ──────────────────────────────────────────────────────────
def test_intent_detection():
    print("\n" + "━" * 60)
    print("TEST 3: Intent + Entity + Template Pipeline")
    print("━" * 60)
    cp = CommandProcessor()
    
    cases = [
        {
            "input":    "Create a python class called UserProfile with name email and age",
            "intent":   "CREATE",
            "language": "python",
            "desc":     "Class creation intent"
        },
        {
            "input":    "Optimize the javascript function that fetches data from the API",
            "intent":   "OPTIMIZE",
            "language": "javascript",
            "desc":     "Optimization intent"
        },
        {
            "input":    "Explain how the typescript authentication middleware works",
            "intent":   "EXPLAIN",
            "language": "typescript",
            "desc":     "Explanation intent"
        },
        {
            "input":    "Delete the old CSS styles from the header component",
            "intent":   "DELETE",
            "language": "css",
            "desc":     "Deletion intent"
        },
        {
            "input":    "Build a REST API in python with Flask that handles user registration and login",
            "intent":   "CREATE",
            "language": "python",
            "desc":     "Complex multi-step creation"
        },
        {
            "input":    "Make a recursive javascript function to flatten nested arrays",
            "intent":   "CREATE",
            "language": "javascript",
            "desc":     "Recursive algorithm request"
        },
        {
            "input":    "Fix the c++ memory leak in the linked list destructor",
            "intent":   "OPTIMIZE",
            "language": "cpp",
            "desc":     "C++ fix intent (maps to OPTIMIZE)"
        },
    ]
    
    for case in cases:
        result = cp.process_transcript(case["input"])
        intent_ok = result["intent"] == case["intent"]
        lang_ok = result["language"] == case["language"]
        has_nlp = "nlp_analysis" in result and result["nlp_analysis"]
        has_code = "generated_code" in result
        
        print(f"\n  Input:    \"{case['input']}\"")
        print(f"  Intent:   {result['intent']} (expected {case['intent']})")
        print(f"  Language: {result['language']} (expected {case['language']})")
        if result.get("generated_code"):
            print(f"  Code:     {result['generated_code'][:80]}...")
        report(f"{case['desc']} — intent={intent_ok}, lang={lang_ok}, nlp={has_nlp}", intent_ok and lang_ok and has_nlp)

# ──────────────────────────────────────────────────────────
# 4. TEMPLATE ENGINE — code generation
# ──────────────────────────────────────────────────────────
def test_template_engine():
    print("\n" + "━" * 60)
    print("TEST 4: Template Engine Code Generation")
    print("━" * 60)
    ts = TemplateService()
    
    # Python function
    code = ts.get_code("python", "function", name="binary_search", params="arr, target", docstring="Performs binary search on sorted array")
    report("Python function template", "def binary_search" in code and "arr, target" in code)
    print(f"  Generated:\n{code}\n")
    
    # Python class
    code = ts.get_code("python", "class", name="DatabaseConnection", params="host, port, db_name", init_body="self.host = host")
    report("Python class template", "class DatabaseConnection" in code and "host, port, db_name" in code)
    print(f"  Generated:\n{code}\n")
    
    # JavaScript function
    code = ts.get_code("javascript", "function", name="fetchUserData", params="userId, token")
    report("JavaScript function template", "fetchUserData" in code and "userId, token" in code)
    print(f"  Generated:\n{code}\n")
    
    # Unknown language fallback
    code = ts.get_code("rust", "function", name="test", params="")
    report("Unknown language returns fallback", "No templates" in code)

# ──────────────────────────────────────────────────────────
# 5. END-TO-END — messy voice transcript → structured output
# ──────────────────────────────────────────────────────────
def test_end_to_end():
    print("\n" + "━" * 60)
    print("TEST 5: End-to-End Voice-to-Code Simulation")
    print("━" * 60)
    cp = CommandProcessor()
    
    # Simulate a messy voice transcription with filler words and typos
    voice_inputs = [
        "um create a pythone functoin called validate email that takes a strng parameter",
        "okay so I need you to build me a javascrip calss for shopping cart with add remove and total",
        "hey can you refacor this python code to use list comprehension instead of for loops",
    ]
    
    for voice in voice_inputs:
        result = cp.process_transcript(voice)
        print(f"\n  🎙️  Voice: \"{voice}\"")
        print(f"  🧠  Intent:   {result['intent']}")
        print(f"  💻  Language: {result['language']}")
        if result.get("nlp_analysis", {}).get("corrected_text"):
            print(f"  ✏️  Cleaned:  {result['nlp_analysis']['corrected_text']}")
        if result.get("nlp_analysis", {}).get("noun_phrases"):
            print(f"  📦  Phrases:  {result['nlp_analysis']['noun_phrases']}")
        if result.get("generated_code"):
            print(f"  📝  Code:     {result['generated_code'][:100]}")
        
        has_output = result["intent"] != "UNKNOWN" and result["language"] != "text"
        report(f"E2E processed: intent={result['intent']}, lang={result['language']}", has_output)

# ──────────────────────────────────────────────────────────
# RUN ALL
# ──────────────────────────────────────────────────────────
if __name__ == "__main__":
    test_noise_reduction()
    test_spell_correction()
    test_intent_detection()
    test_template_engine()
    test_end_to_end()
    
    print("\n" + "═" * 60)
    print(f"  RESULTS:  {PASS} passed  /  {FAIL} failed  /  {PASS + FAIL} total")
    print("═" * 60)
    if FAIL == 0:
        print("  🎉 ALL TESTS PASSED!")
    else:
        print(f"  ⚠️  {FAIL} test(s) need attention.")

