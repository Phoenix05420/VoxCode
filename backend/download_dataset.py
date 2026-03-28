import json
from datasets import load_dataset
import os

def download_java_dataset():
    print("🛰️ Connecting to Hugging Face...")
    try:
        # Load a high-quality Java instruction dataset
        dataset = load_dataset("amztheory/alpaca-code-java", split="train")
        
        # Take the first 100 high-quality samples
        samples = []
        for i in range(min(100, len(dataset))):
            item = dataset[i]
            samples.append({
                "id": i + 121, # Continue from Python IDs
                "category": "Java Professional",
                "level": "intermediate",
                "instruction": item["instruction"],
                "input": item.get("input", ""),
                "output": item["output"]
            })
        
        output_data = {
            "dataset_info": {
                "name": "Java Professional - LLM Fine-Tuning Dataset",
                "format": "instruction + output pairs",
                "total_samples": len(samples),
                "scope": "Java Backend & Core"
            },
            "samples": samples
        }
        
        # Save to backend/data/
        save_path = os.path.join("backend", "data", "java_training_data.json")
        os.makedirs(os.path.dirname(save_path), exist_ok=True)
        
        with open(save_path, 'w', encoding='utf-8') as f:
            json.dump(output_data, f, indent=2)
            
        print(f"✅ Successfully saved {len(samples)} Java samples to {save_path}")
        
    except Exception as e:
        print(f"❌ Error downloading dataset: {e}")

if __name__ == "__main__":
    download_java_dataset()
