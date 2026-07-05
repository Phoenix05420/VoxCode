# ─── VoxCode Local AI Model Server ─────────────────────────
# Serves Qwen3-1.7B via llama-cpp-python as an OpenAI-compatible API
# Usage: python model_server.py

import os
from llama_cpp.server.app import create_app, Settings

# Detect LoRA adapter (if user has run fine-tuning in Colab/Kaggle)
# ERROR NOTICE: The current 'voxcode_extreme_adapter' is for Qwen1.5-1.8B.
# It is NOT compatible with Qwen2.5-7B or Qwen3-1.7B and will cause "Access Violation".
# To use a LoRA, ensure the base model architecture matches exactly.
LORA_PATH = None 
# if not os.path.exists(os.path.join(os.path.dirname(os.path.dirname(__file__)), "voxcode_extreme_adapter")):
#     LORA_PATH = None
# else:
#     print(f"[*] FOUND EXTREME ADAPTER: Loading {LORA_PATH}")

settings = Settings(
    model="X:/AI model/opus-v1.2-7b-gguf/opus-v1.2-7b.q4_k_s.gguf",
    lora_path=LORA_PATH,
    n_ctx=4096,
    n_threads=4,  # Matching physical cores for Ryzen 5 7520U
    verbose=False,
    host="0.0.0.0",
    port=8000,
)

app = create_app(settings=settings)

if __name__ == "__main__":
    import uvicorn
    print("\n+==========================================+")
    print("|   VoxCode - Qwen-1.7B EXTREME PRO+       |")
    print("|   Mode: " + ("Fine-Tuned [Brain]" if LORA_PATH else "Base Gold [Disc]"))
    print("|   OpenAI-compatible API on port 8000     |")
    print("+==========================================+\n")
    uvicorn.run(app, host="0.0.0.0", port=8000)
