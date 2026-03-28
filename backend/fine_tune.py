# ─── VoxCode Extreme Trainer ──────────────────────────────
# Architecture: QLoRA (4-bit quantized Low-Rank Adaptation)
# Target: Qwen-1.7B-GGUF (Wait: LoRA requires HF model, not GGUF)
# Note: For local training, we use the Hugging Face version of Qwen-1.5B/1.8B.

import os
import torch
from datasets import load_dataset
from transformers import (
    AutoModelForCausalLM,
    AutoTokenizer,
    BitsAndBytesConfig,
    TrainingArguments,
    pipeline,
    logging,
)
from peft import LoraConfig, get_peft_model

# 1. CONFIGURATION
MODEL_NAME = "Qwen/Qwen1.5-1.8B-Chat" # HF version for training
DATASET_PATH = "backend/data/python_training_data.json" # User's custom dataset
OUTPUT_DIR = "./fine_tuned_voxcode"

def train():
    print(f"🚀 Starting Extreme Fine-Tuning for {MODEL_NAME}...")
    print(f"📊 Dataset: {DATASET_PATH}")

    # Check for GPU
    if not torch.cuda.is_available():
        print("❌ Error: CUDA-compatible GPU not found.")
        print("💡 TIP: For 'Extreme' training, upload this folder to Google Colab or Kaggle and run with a T4/A100 GPU.")
        return

    # 2. LOAD MODEL & TOKENIZER
    bnb_config = BitsAndBytesConfig(
        load_in_4bit=True,
        bnb_4bit_quant_type="nf4",
        bnb_4bit_compute_dtype=torch.float16,
        bnb_4bit_use_double_quant=True,
    )

    model = AutoModelForCausalLM.from_pretrained(
        MODEL_NAME,
        quantization_config=bnb_config,
        device_map="auto",
        trust_remote_code=True
    )
    tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME, trust_remote_code=True)
    tokenizer.pad_token = tokenizer.eos_token

    # 3. DATASET PREPARATION
    import json
    if not os.path.exists(DATASET_PATH):
        print(f"⚠️ Dataset '{DATASET_PATH}' not found. Using fallback.")
        dataset = load_dataset("Sahil2801/CodeAlpaca-20k", split="train[:500]")
    else:
        # Custom loading for nested 'samples' JSON
        with open(DATASET_PATH, 'r') as f:
            raw_data = json.load(f)
            samples = raw_data.get("samples", [])
        
        from datasets import Dataset
        dataset = Dataset.from_list(samples)

    def format_prompt(sample):
        return {
            "text": f"### Instruction:\n{sample['instruction']}\n\n### Response:\n{sample['output']}"
        }

    dataset = dataset.map(format_prompt)

    # 4. LORA CONFIG
    from peft import LoraConfig, get_peft_model
    peft_config = LoraConfig(
        lora_alpha=16,
        lora_dropout=0.1,
        r=64,
        bias="none",
        task_type="CAUSAL_LM",
        target_modules=["q_proj", "v_proj"]
    )
    model = get_peft_model(model, peft_config)

    # 5. TRAINING ARGUMENTS
    training_arguments = TrainingArguments(
        output_dir=OUTPUT_DIR,
        num_train_epochs=5, # Extreme focus
        per_device_train_batch_size=4,
        gradient_accumulation_steps=4,
        optim="paged_adamw_32bit",
        save_steps=50,
        logging_steps=10,
        learning_rate=2e-4,
        weight_decay=0.01,
        fp16=True,
        max_grad_norm=0.3,
        warmup_ratio=0.03,
        lr_scheduler_type="cosine",
    )

    # 6. INITIALIZE TRAINER
    from trl import SFTTrainer
    trainer = SFTTrainer(
        model=model,
        train_dataset=dataset,
        peft_config=peft_config,
        dataset_text_field="text",
        max_seq_length=1024,
        tokenizer=tokenizer,
        args=training_arguments,
    )

    # 7. EXECUTE
    print("💎 Training started. Accessing Extreme Potential...")
    trainer.train()
    
    trainer.model.save_pretrained("./voxcode_extreme_adapter")
    print(f"✅ Training Complete! Adapter saved to {OUTPUT_DIR}")

if __name__ == "__main__":
    train()
