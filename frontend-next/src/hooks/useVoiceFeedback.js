'use client';

import { useCallback } from 'react';

/**
 * Hook for text-to-speech voice feedback.
 */
export function useVoiceFeedback() {
  const speak = useCallback((text) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return;
    }

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 0.8;

      const voices = window.speechSynthesis.getVoices();
      const englishVoice = voices.find(v => v.name.toLowerCase().includes('zira') || (v.lang.includes('en') && v.name.toLowerCase().includes('natural'))) || voices.find(v => v.lang.includes('en'));
      
      if (englishVoice) {
        utterance.voice = englishVoice;
      }

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.error('Speech synthesis error:', e);
    }
  }, []);

  return { speak };
}
