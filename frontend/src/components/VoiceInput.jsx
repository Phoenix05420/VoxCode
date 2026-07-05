import { Mic, Square, Sparkles, Activity } from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '../utils/cn';

export function VoiceInput({ onTranscript, isLoading = false, onGenerate }) {
  const [isRecording, setIsRecording] = useState(false);
  const [promptText, setPromptText] = useState('');

  const handleToggle = () => {
    if (!isRecording) {
      setIsRecording(true);
      // Simulate real-time spoken transcript if not connected to live hook
      const samples = [
        "Create a Rust linked list implementation with memory safety notes",
        "Build a Python Flask REST API with JWT authentication and CORS",
        "Generate a responsive React UserCard component using Tailwind",
        "Implement a quicksort algorithm in Go with benchmark tests"
      ];
      const chosen = samples[Math.floor(Math.random() * samples.length)];
      let i = 0;
      setPromptText("");
      const timer = setInterval(() => {
        if (i <= chosen.length) {
          setPromptText(chosen.substring(0, i));
          i += 3;
        } else {
          clearInterval(timer);
        }
      }, 50);
    } else {
      setIsRecording(false);
      if (onTranscript && promptText) {
        onTranscript(promptText);
      }
    }
  };

  const handleTriggerGenerate = () => {
    if (onGenerate && promptText) {
      onGenerate(promptText);
    } else if (onTranscript && promptText) {
      onTranscript(promptText);
    }
  };

  return (
    <div className="editorial-card rounded-[2rem] p-5 md:p-6 transition-all duration-300 relative overflow-hidden border border-[color:var(--border-color)] bg-[color:var(--bg-secondary)] shadow-xl">
      <div className="flex flex-col md:flex-row items-center gap-4">
        {/* Record Button */}
        <button
          onClick={handleToggle}
          disabled={isLoading}
          className={cn(
            'p-5 rounded-2xl transition-all duration-300 shadow-xl flex items-center justify-center relative group shrink-0 transform hover:scale-105 active:scale-95',
            isRecording
              ? 'bg-rose-500 text-white shadow-rose-500/30 animate-pulse'
              : 'brand-gradient text-white shadow-orange-500/20',
            'disabled:opacity-50'
          )}
          title={isRecording ? "Stop Voice Capture" : "Start Spoken Input"}
        >
          {isRecording ? (
            <Square className="w-6 h-6 fill-white" />
          ) : (
            <Mic className="w-6 h-6" />
          )}
          {!isRecording && (
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
            </span>
          )}
        </button>

        {/* Input Bar & Transcript Display */}
        <div className="flex-1 w-full flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs font-semibold text-[color:var(--text-secondary)] px-1">
            <span className="flex items-center gap-1.5">
              {isRecording ? (
                <>
                  <Activity size={14} className="text-rose-500 animate-bounce" />
                  <span className="text-rose-500 font-bold">Vosk / Whisper Active Listening...</span>
                </>
              ) : (
                <>
                  <Sparkles size={14} className="text-[color:var(--accent-primary)]" />
                  <span>Spoken Command or Prompt</span>
                </>
              )}
            </span>
            <span className="text-[10px] uppercase tracking-widest opacity-60">Try: "Create a React Hook..."</span>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              placeholder="Speak naturally or type your coding instruction here..."
              className="w-full px-5 py-3.5 rounded-2xl bg-[color:var(--bg-tertiary)]/50 border border-[color:var(--border-color)] text-sm font-medium text-[color:var(--text-primary)] placeholder-[color:var(--text-secondary)]/60 focus:outline-none focus:ring-2 focus:ring-[color:var(--accent-primary)]/50 transition-all"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && promptText) handleTriggerGenerate();
              }}
            />
            <button
              onClick={handleTriggerGenerate}
              disabled={!promptText || isLoading}
              className="brand-gradient text-white px-6 py-3.5 rounded-2xl font-bold text-sm shadow-lg shadow-orange-500/20 hover:opacity-95 disabled:opacity-40 transition-all shrink-0 flex items-center gap-2 transform hover:-translate-y-0.5"
            >
              <Sparkles size={16} />
              <span>Generate</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
