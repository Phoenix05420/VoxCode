# VoxCode Extreme Fine-Tuning Guide (Cloud GPU) 🚀🧠

Since local hardware (CPU-only) is a bottleneck for Large Language Model training, we use **Google Colab** or **Kaggle** to refine our AI.

### 📋 Prerequisites
1. Open [Google Colab](https://colab.research.google.com/).
2. Change runtime type to **GPU** (Edit -> Notebook Settings -> T4 GPU).

### 🛠️ Step 1: Install VoxCode Trainer Dependencies
```python
!pip install -q transformers peft trl bitsandbytes datasets accelerate
```

### 🛠️ Step 2: Paste the Extreme Trainer Code
Copied from `backend/fine_tune.py`:

```python
import os
import torch
import json
from datasets import Dataset
from transformers import AutoModelForCausalLM, AutoTokenizer, BitsAndBytesConfig, TrainingArguments
from peft import LoraConfig, get_peft_model
from trl import SFTTrainer

# 1. SETUP
MODEL_NAME = "Qwen/Qwen1.5-1.8B-Chat"
DATASET_PATH = "python_training_data.json" # Upload your dataset to Colab 
OUTPUT_DIR = "./voxcode_extreme_adapter"

# 2. DATA LOADING (Paste your 120 samples JSON here if not uploading)
# For the demo, we assume the file is uploaded.

def train():
    bnb_config = BitsAndBytesConfig(
        load_in_4bit=True,
        bnb_4bit_quant_type="nf4",
        bnb_4bit_compute_dtype=torch.float16,
        bnb_4bit_use_double_quant=True,
    )

    model = AutoModelForCausalLM.from_pretrained(MODEL_NAME, quantization_config=bnb_config, device_map="auto")
    tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
    tokenizer.pad_token = tokenizer.eos_token

    # Load Dataset
    with open(DATASET_PATH, 'r') as f:
        samples = json.load(f)["samples"]
    
    dataset = Dataset.from_list(samples).map(lambda x: {"text": f"### Instruction:\n{x['instruction']}\n\n### Response:\n{x['output']}"})

    # LoRA Config
    peft_config = LoraConfig(r=64, lora_alpha=16, target_modules=["q_proj", "v_proj"], task_type="CAUSAL_LM")
    model = get_peft_model(model, peft_config)

    # Training
    args = TrainingArguments(
        output_dir=OUTPUT_DIR,
        num_train_epochs=5,
        per_device_train_batch_size=4,
        gradient_accumulation_steps=4,
        learning_rate=2e-4,
        fp16=True,
        logging_steps=10
    )

    trainer = SFTTrainer(model=model, train_dataset=dataset, peft_config=peft_config, dataset_text_field="text", tokenizer=tokenizer, args=args)
    trainer.train()
    trainer.model.save_pretrained(OUTPUT_DIR)
    print("✅ Training Complete!")

train()
```

### 🛰️ Step 3: Deploy to VoxCode
Once training finishes:
1. Download the `voxcode_extreme_adapter` folder.
2. Place it in the `backend/` directory of your project.
3. The system will automatically detect the adapter and apply it to the base model.
