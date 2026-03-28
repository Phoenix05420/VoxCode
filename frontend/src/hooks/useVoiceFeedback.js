import { useCallback } from 'react';

/**
 * Hook for managing AI voice feedback using Web Speech API
 */
export const useVoiceFeedback = () => {
    const speak = useCallback((text) => {
        if (!('speechSynthesis' in window)) {
            console.warn('Speech synthesis not supported');
            return;
        }

        // Cancel any ongoing speech
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        
        // Find a professional sounding voice if possible
        const voices = window.speechSynthesis.getVoices();
        const preferredVoice = voices.find(v => v.lang.startsWith('en') && v.name.includes('Google')) || voices[0];
        
        if (preferredVoice) utterance.voice = preferredVoice;
        
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        utterance.volume = 0.8;

        window.speechSynthesis.speak(utterance);
    }, []);

    return { speak };
};
