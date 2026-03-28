# ─── VoxCode Extreme CPU Trainer ────────────────────────────
# Mode: CPU Only (Local CMD)
# Note: Training on CPU is 20x-50x slower than GPU. 
# This script is optimized for local stability over speed.
# ────────────────────────────────────────────────────────────

import os
import torch
import json
from datasets import Dataset
from transformers import (
    AutoModelForCausalLM,
    AutoTokenizer,
    TrainingArguments,
    Trainer,
    DataCollatorForLanguageModeling
)
from peft import LoraConfig, get_peft_model, TaskType

# 1. CONFIGURATION
MODEL_NAME = "Qwen/Qwen2.5-Coder-7B-Instruct" # Upgraded 7B Base
DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "voxcode_extreme_cpu_adapter")

def load_merged_dataset():
    """Discover and merge all .json files in DATA_DIR."""
    import glob
    all_samples = []
    json_files = glob.glob(os.path.join(DATA_DIR, "*.json"))
    
    print(f"📂 Found {len(json_files)} datasets. Merging...")
    for f_path in json_files:
        try:
            with open(f_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
                samples = data.get("samples", [])
                all_samples.extend(samples)
                print(f"  + Loaded {len(samples)} samples from {os.path.basename(f_path)}")
        except Exception as e:
            print(f"  - Error loading {f_path}: {e}")
            
    return all_samples

def train_cpu():
    print(f"🧬 Starting Unified Local CPU Fine-Tuning for {MODEL_NAME}...")
    
    # Force CPU
    device = "cpu"
    print(f"💻 Device: {device.upper()}")

    # 2. LOAD MODEL & TOKENIZER (NO QUANTIZATION - BITSANDBYTES IS CUDA ONLY)
    print("⏳ Loading model (this may take a few minutes on CPU)...")
    tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME, trust_remote_code=True)
    tokenizer.pad_token = tokenizer.eos_token

    model = AutoModelForCausalLM.from_pretrained(
        MODEL_NAME,
        device_map={"": device},
        trust_remote_code=True,
        torch_dtype=torch.float32 # Use FP32 for CPU stability
    )

    # 3. LORA CONFIG (Saves RAM/Memory)
    peft_config = LoraConfig(
        task_type=TaskType.CAUSAL_LM,
        inference_mode=False,
        r=8, # Reduced rank for CPU efficiency
        lora_alpha=32,
        lora_dropout=0.1,
        target_modules=["q_proj", "v_proj"]
    )
    model = get_peft_model(model, peft_config)
    model.print_trainable_parameters()

    # 4. DATASET PREPARATION
    samples = load_merged_dataset()
    if not samples:
        print("❌ Error: No training samples found in " + DATA_DIR)
        return

    def format_prompt(sample):
        # Handle both Alpaca and custom formats
        instr = sample.get("instruction", "")
        # If the sample has an 'input' field (like in Alpaca), include it
        inp = sample.get("input", "")
        if inp:
            instr = f"{instr}\nInput: {inp}"
            
        out = sample.get("output", "")
        return {
            "text": f"### Instruction:\n{instr}\n\n### Response:\n{out}<|endoftext|>"
        }

    dataset = Dataset.from_list(samples).map(format_prompt)

    # Tokenize dataset
    def tokenize_func(examples):
        return tokenizer(examples["text"], truncation=True, max_length=512, padding="max_length")

    tokenized_dataset = dataset.map(tokenize_func, batched=True, remove_columns=["text", "id", "category", "level", "instruction", "output"])

    # 5. TRAINING ARGUMENTS (CPU OPTIMIZED)
    training_args = TrainingArguments(
        output_dir=OUTPUT_DIR,
        overwrite_output_dir=True,
        num_train_epochs=1, # Start with 1 to see progress
        per_device_train_batch_size=1, # Minimal RAM usage
        gradient_accumulation_steps=8, # Simulate larger batch
        learning_rate=1e-4,
        logging_steps=1,
        save_steps=10,
        fp16=False, # CPU doesn't support FP16 well
        no_cuda=True, # Explicitly disable CUDA
        use_cpu=True
    )

    # 6. INITIALIZE TRAINER
    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=tokenized_dataset,
        data_collator=DataCollatorForLanguageModeling(tokenizer, mlm=False),
    )

    # 7. EXECUTE
    print("🚀 Training started. Press Ctrl+C to stop anytime.")
    print("📊 Current progress will be saved in the output directory.")
    trainer.train()
    
    model.save_pretrained("./voxcode_extreme_adapter")
    print(f"✅ CPU Training Complete! Adapter saved.")

if __name__ == "__main__":
    train_cpu()
