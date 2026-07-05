'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Hook for managing local microphone speech-to-text via local backend polling.
 */
export function useLocalMic() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [audioLevel, setAudioLevel] = useState(0);
  const [error, setError] = useState(null);
  const pollIntervalRef = useRef(null);

  const startRecording = useCallback(async () => {
    try {
      setError(null);
      const res = await fetch('/api/mic/start', { method: 'POST' });
      if (!res.ok) throw new Error('Failed to start microphone service');
      setIsListening(true);
    } catch (err) {
      console.error('Error starting mic:', err);
      setError(err.message || 'Microphone error');
      setIsListening(false);
    }
  }, []);

  const stopRecording = useCallback(async () => {
    try {
      await fetch('/api/mic/stop', { method: 'POST' });
    } catch (err) {
      console.error('Error stopping mic:', err);
    } finally {
      setIsListening(false);
      setAudioLevel(0);
    }
  }, []);

  const clearTranscript = useCallback(async () => {
    try {
      await fetch('/api/mic/clear', { method: 'POST' });
      setTranscript('');
      setAnalysis(null);
    } catch (err) {
      console.error('Error clearing transcript:', err);
    }
  }, []);

  useEffect(() => {
    if (isListening) {
      pollIntervalRef.current = setInterval(async () => {
        try {
          const res = await fetch('/api/mic/transcript');
          if (res.ok) {
            const data = await res.json();
            if (data.transcript !== undefined) setTranscript(data.transcript);
            if (data.analysis !== undefined) setAnalysis(data.analysis);
            if (data.audio_level !== undefined) {
              setAudioLevel(prev => prev * 0.3 + data.audio_level * 0.7);
            }
            if (data.is_running === false) {
              setIsListening(false);
              setAudioLevel(0);
            }
          }
        } catch (err) {
          // Silent catch for polling
        }
      }, 300);
    } else {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    }

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [isListening]);

  return {
    isListening,
    transcript,
    analysis,
    audioLevel,
    error,
    startRecording,
    stopRecording,
    clearTranscript
  };
}
