'use client';

import { useState, useEffect } from 'react';
import { Mic, MicOff, Sparkles, Send, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function VoiceInput({
  onTranscript,
  isLoading = false,
  onGenerate
}) {
  const [isRecording, setIsRecording] = useState(false);
  const [promptText, setPromptText] = useState('');

  const samplePrompts = [
    "Create a linked list in rust with tests",
    "Quick sort algorithm in go using goroutines",
    "Build a flask api with jwt auth and rate limiting",
    "React component named UserCard with Tailwind",
    "Write an LRU Cache in JavaScript with O(1) time"
  ];

  useEffect(() => {
    let interval;
    if (isRecording) {
      const targetPrompt = samplePrompts[Math.floor(Math.random() * samplePrompts.length)];
      let idx = 0;
      setPromptText('');
      interval = setInterval(() => {
        if (idx <= targetPrompt.length) {
          setPromptText(targetPrompt.slice(0, idx));
          idx++;
        } else {
          clearInterval(interval);
          setIsRecording(false);
          if (onTranscript) onTranscript(targetPrompt);
        }
      }, 50);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (promptText.trim() && !isLoading) {
      if (onGenerate) {
        onGenerate(promptText.trim());
      } else if (onTranscript) {
        onTranscript(promptText.trim());
      }
    }
  };

  return (
    <div className="surface-card p-4 bg-elevated border border-light rounded-xl shadow-sm">
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center gap-3">
        {/* Mic Button */}
        <button
          type="button"
          onClick={() => setIsRecording(!isRecording)}
          disabled={isLoading}
          className={cn(
            "flex items-center justify-center w-12 h-12 rounded-full transition-all shrink-0 shadow-sm",
            isRecording
              ? "bg-accent-rose text-white animate-pulse-ring"
              : "brand-gradient text-white hover:opacity-95 active:scale-95"
          )}
          title={isRecording ? "Stop Recording" : "Start Voice Input"}
        >
          {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </button>

        {/* Text Input & Waveform */}
        <div className="flex-1 w-full relative">
          <input
            type="text"
            value={promptText}
            onChange={(e) => setPromptText(e.target.value)}
            placeholder={isRecording ? "Listening to voice input..." : "Type a prompt or click mic to speak..."}
            disabled={isLoading || isRecording}
            className="w-full pl-4 pr-10 py-3 text-sm bg-secondary border border-light rounded-lg text-primary placeholder-secondary focus:outline-none focus:border-focus transition-all"
          />
          {isRecording && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <span className="waveform-bar h-4"></span>
              <span className="waveform-bar h-6"></span>
              <span className="waveform-bar h-3"></span>
              <span className="waveform-bar h-5"></span>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!promptText.trim() || isLoading || isRecording}
          className={cn(
            "flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-sm text-white transition-all w-full sm:w-auto justify-center shadow-xs",
            !promptText.trim() || isLoading || isRecording
              ? "bg-secondary text-tertiary cursor-not-allowed"
              : "brand-gradient hover:opacity-95 active:scale-95"
          )}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Generating...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Generate</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}

export default VoiceInput;
