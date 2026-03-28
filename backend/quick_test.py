import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from command_processor import CommandProcessor
cp = CommandProcessor()

inputs = [
    "Create a java class called StudentManager with CRUD operations",
    "Write a javascript async function to fetch weather data from API",
    "Build a typescript interface for user authentication with roles",
    "Make a python decorator for caching database queries",
    "Generate a c++ linked list with insert and delete methods",
    "Create an html form with email password and submit button",
    "Optimize the csharp LINQ query for filtering large datasets",
    "Refactor the css grid layout to use flexbox instead",
]

print("=" * 70)
print("  MULTI-LANGUAGE VOICE COMMAND TEST")
print("=" * 70)

for inp in inputs:
    r = cp.process_transcript(inp)
    corr = r.get("nlp_analysis", {}).get("corrected_text", "")
    code = r.get("generated_code", "")
    phrases = r.get("nlp_analysis", {}).get("noun_phrases", [])

    print(f"\n  Input:    {inp}")
    print(f"  Intent:   {r['intent']}  |  Language: {r['language']}")
    if corr:
        print(f"  Cleaned:  {corr}")
    if phrases:
        print(f"  Phrases:  {phrases}")
    if code:
        print(f"  Code:     {code[:80]}")
    print("-" * 70)

print("\nDone!")
