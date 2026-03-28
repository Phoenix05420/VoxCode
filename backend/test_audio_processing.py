import os, sys
import numpy as np
import time

# Add current directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

try:
    import speech_service
    from speech_service import _is_speech, vad
    print("✅ speech_service imported successfully")
except Exception as e:
    print(f"❌ Failed to import speech_service: {e}")
    sys.exit(1)

def test_vad():
    print("\n--- Testing WebRTC VAD ---")
    
    # 1. Simulate Silence (zeros)
    # 480 samples at 16kHz is 30ms. Let's make a 300ms chunk (4800 samples)
    silence = np.zeros(4800, dtype=np.int16).tobytes()
    is_sp = _is_speech(silence)
    print(f"  Silence detected as speech: {is_sp} (Expected: False)")
    
    # 2. Simulate White Noise (Random)
    noise = np.random.randint(-1000, 1000, 4800, dtype=np.int16).tobytes()
    is_sp = _is_speech(noise)
    print(f"  Noise detected as speech: {is_sp} (Expected: False/Low probability with VAD level 3)")
    
    # 3. Simulate "Speech-like" signal (Square wave)
    # This is not real speech but should trigger something more than silence
    t = np.linspace(0, 0.3, 4800)
    speech_sim = (np.sin(2 * np.pi * 440 * t) * 10000).astype(np.int16).tobytes()
    is_sp = _is_speech(speech_sim)
    print(f"  Signal detected as speech: {is_sp} (VAD might be picky with sine waves, but should be True for real speech)")

def test_processing():
    print("\n--- Testing Librosa Processing ---")
    import librosa
    import noisereduce as nr
    
    # Create sample audio
    audio = np.random.uniform(-0.5, 0.5, 16000).astype(np.float32)
    
    try:
        # Normalize
        norm = librosa.util.normalize(audio)
        print(f"  Normalization: Max after = {np.max(np.abs(norm))}")
        
        # Pre-emphasis
        pre = librosa.effects.preemphasis(norm)
        print(f"  Pre-emphasis successful")
        
        # Noise reduce
        red = nr.reduce_noise(y=pre, sr=16000)
        print(f"  Noise reduction successful")
        
        print("✅ Librosa/NR processing pipeline is functional")
    except Exception as e:
        print(f"❌ Processing failed: {e}")

if __name__ == "__main__":
    test_vad()
    test_processing()
    print("\nVerification complete!")
