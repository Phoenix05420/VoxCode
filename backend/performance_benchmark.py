import time
import numpy as np
from command_processor import CommandProcessor

def benchmark_command_processor():
    cp = CommandProcessor()
    test_inputs = [
        "Create a simple python function to add two numbers",
        "Refactor this javascript code to be more efficient",
        "Explain how this react component works",
        "Delete the last snippet"
    ] * 25  # 100 iterations
    
    start_time = time.time()
    for inp in test_inputs:
        cp.process_transcript(inp)
    end_time = time.time()
    
    avg_time = (end_time - start_time) / len(test_inputs)
    print(f"CommandProcessor (100 iterations):")
    print(f"  Total time: {end_time - start_time:.4f}s")
    print(f"  Avg time per transcript: {avg_time * 1000:.4f}ms")

def benchmark_numpy_audio_concatenation():
    # Simulate 30 seconds of audio at 16kHz, 16-bit (2 bytes per sample)
    # divided into 4000-sample chunks (250ms per chunk)
    chunks = [np.random.randint(-32768, 32767, 4000, dtype=np.int16) for _ in range(120)]
    
    start_time = time.time()
    # Logic from speech_service.py
    full_audio = np.concatenate(chunks)
    float_audio = full_audio.astype(np.float32) / 32768.0
    end_time = time.time()
    
    print(f"\nNumPy Audio Processing (30s audio):")
    print(f"  Total time: {(end_time - start_time) * 1000:.4f}ms")

if __name__ == "__main__":
    benchmark_command_processor()
    benchmark_numpy_audio_concatenation()
