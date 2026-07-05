import queue
import threading
import os
import zipfile
import urllib.request
import sounddevice as sd
import numpy as np
import warnings
import json
import logging
import time
import noisereduce as nr
import webrtcvad
import librosa

warnings.filterwarnings('ignore')
logger = logging.getLogger("voxcode.speech")

# ─── Configuration ────────────────────────────────────────────────
VOSK_MODEL_URL = "https://alphacephei.com/vosk/models/vosk-model-small-en-us-0.15.zip"
VOSK_MODEL_DIR = "vosk-model-small"
SAMPLE_RATE = 16000
BLOCK_SIZE = 4800  # 300ms chunks
SILENCE_TIMEOUT = 1.8 # Seconds of silence before auto-stop

# ─── State ────────────────────────────────────────────────────────
q = queue.Queue()
_running = False
_thread = None
_latest_text = ""
_partial_text = ""
_accumulated_audio = []
_consecutive_silence = 0
_audio_level = 0.0
_state_lock = threading.Lock()

# Models
vosk_model = None
whisper_model = None
vad = webrtcvad.Vad(3) # Aggressiveness 3 (most aggressive)

def download_vosk_model():
    if not os.path.exists(VOSK_MODEL_DIR):
        logger.info("Downloading Vosk lightweight model...")
        zip_path = "vosk-model.zip"
        try:
            urllib.request.urlretrieve(VOSK_MODEL_URL, zip_path)
            logger.info("Extracting Vosk model...")
            with zipfile.ZipFile(zip_path, 'r') as zip_ref:
                zip_ref.extractall()
            # Move contents if needed (alphacephei models extract to a subfolder usually)
            possible_subfolder = "vosk-model-small-en-us-0.15"
            if os.path.exists(possible_subfolder):
                os.rename(possible_subfolder, VOSK_MODEL_DIR)
            os.remove(zip_path)
            logger.info("Vosk model ready.")
        except Exception as e:
            logger.error(f"Failed to download Vosk model: {e}")

def init_models():
    global vosk_model, whisper_model
    with _state_lock:
        try:
            import vosk
            if vosk_model is None:
                download_vosk_model()
                vosk.SetLogLevel(-1)
                vosk_model = vosk.Model(VOSK_MODEL_DIR)
            
            from faster_whisper import WhisperModel
            if whisper_model is None:
                # Use 'base' model for speed, 'int8' for CPU optimization
                # Enable hf_transfer for ultra-fast downloads if available
                os.environ["HF_HUB_ENABLE_HF_TRANSFER"] = "1"
                logger.info("Loading Faster-Whisper 'base' model (int8)...")
                whisper_model = WhisperModel("base", device="cpu", compute_type="int8")
            
            logger.info("All speech models loaded successfully.")
        except Exception as e:
            logger.error(f"Error initializing models: {e}")

def _audio_callback(indata, frames, time, status):
    global _running, _audio_level
    if _running:
        try:
            # Convert to bytes first - this is the safest way to handle cffi buffers
            data_bytes = bytes(indata)
            q.put(data_bytes)
            
            # Calculate RMS for audio level meter
            indata_np = np.frombuffer(data_bytes, dtype=np.int16)
            rms = np.sqrt(np.mean(indata_np.astype(np.float32)**2))
            _audio_level = float(rms)
        except Exception as e:
            # Prevent callback crashes from stopping the stream
            pass

def _is_speech(chunk_bytes):
    """Check if the chunk contains speech using WebRTC VAD (30ms frames)."""
    frame_size = int(SAMPLE_RATE * 30 / 1000) * 2 # 2 bytes per sample
    speech_frames = 0
    total_frames = 0
    
    for i in range(0, len(chunk_bytes) - frame_size + 1, frame_size):
        frame = chunk_bytes[i:i + frame_size]
        if vad.is_speech(frame, SAMPLE_RATE):
            speech_frames += 1
        total_frames += 1
    
    if total_frames == 0: return False
    return (speech_frames / total_frames) > 0.3

def _listen_loop():
    global _latest_text, _partial_text, _running, _accumulated_audio, _consecutive_silence
    
    import vosk
    recognizer = vosk.KaldiRecognizer(vosk_model, SAMPLE_RATE)
    
    try:
        with sd.RawInputStream(samplerate=SAMPLE_RATE, blocksize=BLOCK_SIZE, 
                               dtype='int16', channels=1, callback=_audio_callback):
            logger.info("Listening started...")
            while _running:
                try:
                    chunk = q.get(timeout=1.0)
                except queue.Empty:
                    continue

                if chunk is None: break
                
                # Audio Processing
                if _is_speech(chunk):
                    with _state_lock:
                        _consecutive_silence = 0
                    
                    if recognizer.AcceptWaveform(chunk):
                        res = json.loads(recognizer.Result())
                        text = res.get("text", "")
                        if text:
                            with _state_lock: _partial_text = text
                    else:
                        res = json.loads(recognizer.PartialResult())
                        text = res.get("partial", "")
                        if text:
                            with _state_lock: _partial_text = text

                    # Accumulate for Whisper Transcription
                    audio_data = np.frombuffer(chunk, dtype=np.int16)
                    _accumulated_audio.append(audio_data)
                else:
                    # Keep running during silence for manual control modality
                    with _state_lock:
                        _consecutive_silence += 1

    except Exception as e:
        logger.error(f"SoundDevice error: {e}")
        with _state_lock: _running = False

    # Final Transcription Phase
    if _accumulated_audio:
        _process_final_audio()

def _process_final_audio():
    global _latest_text, _partial_text, _accumulated_audio

    if whisper_model is None:
        logger.warning("Whisper model unavailable - keeping Vosk transcript only.")
        with _state_lock:
            if _partial_text:
                _latest_text = (_latest_text + " " + _partial_text).strip()
            _partial_text = ""
            _accumulated_audio = []
        return
    
    logger.info("Processing enhanced audio with Whisper pipeline...")
    full_audio = np.concatenate(_accumulated_audio)
    float_audio = full_audio.astype(np.float32) / 32768.0
    
    # ─── Advanced Post-Processing ───
    try:
        # 1. Librosa Normalization
        float_audio = librosa.util.normalize(float_audio)
        # 2. Pre-emphasis
        float_audio = librosa.effects.preemphasis(float_audio)
        # 3. Dynamic Noise Reduction
        # Profile first 0.3s for noise if it was silent, otherwise use defaults
        profile_len = int(SAMPLE_RATE * 0.3)
        if len(float_audio) > profile_len:
            noise_profile = float_audio[:profile_len]
            float_audio = nr.reduce_noise(y=float_audio, sr=SAMPLE_RATE, 
                                          prop_decrease=0.8, y_noise=noise_profile)
        else:
            float_audio = nr.reduce_noise(y=float_audio, sr=SAMPLE_RATE)
            
    except Exception as e:
        logger.warning(f"Audio enhancement failed: {e}")

    try:
        # Faster-Whisper transcription returns a generator of segments
        segments, info = whisper_model.transcribe(float_audio, beam_size=5)
        final_text = " ".join([s.text for s in segments]).strip()
        
        with _state_lock:
            if final_text:
                _latest_text = (_latest_text + " " + final_text).strip()
            _partial_text = ""
            _accumulated_audio = []
        logger.info(f"Faster-Whisper result ({info.language_probability:.2f}): {final_text}")
    except Exception as e:
        logger.error(f"Faster-Whisper error: {e}")

def start_listening():
    global _running, _thread, _latest_text, _partial_text, _accumulated_audio
    
    if vosk_model is None or whisper_model is None:
        init_models()
        
    with _state_lock:
        if _running: return True
        
        while not q.empty(): q.get()
        _latest_text = ""
        _partial_text = ""
        _accumulated_audio = []
        _running = True
        
    _thread = threading.Thread(target=_listen_loop, daemon=True)
    _thread.start()
    return True

def stop_listening():
    global _running, _audio_level
    with _state_lock:
        _running = False
        _audio_level = 0.0
    q.put(None)

def get_transcript():
    with _state_lock:
        res = (_latest_text + " " + _partial_text).strip()
        return res

def is_running():
    with _state_lock:
        return _running

def get_audio_level():
    """Returns the current RMS audio level (0.0 to 1.0ish)."""
    return _audio_level

def clear_transcript():
    with _state_lock:
        global _latest_text, _partial_text, _accumulated_audio, _audio_level
        _latest_text = ""
        _partial_text = ""
        _accumulated_audio = []
        _audio_level = 0.0

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    init_models()
    print("Speak now...")
    start_listening()
    try:
        while _running:
            time.sleep(0.5)
            print(f"Transcript: {get_transcript()} | Level: {get_audio_level():.4f}")
    except KeyboardInterrupt:
        stop_listening()

# Export singleton instance
speech_service = None # Placeholder for dynamic init if needed, but per current structure:
# Actually, speech_service is better as a module-level set of functions here.
# But api_server expects an object. I'll wrap it or just export the module as 'speech_service'.
class SpeechServiceWrapper:
    def init_models(self): return init_models()
    def start_listening(self): return start_listening()
    def stop_listening(self): return stop_listening()
    def get_transcript(self): return get_transcript()
    def get_audio_level(self): return get_audio_level()
    def is_running(self): return is_running()
    def clear_transcript(self): return clear_transcript()

speech_service = SpeechServiceWrapper()
