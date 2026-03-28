import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * useLocalMic - Advanced Microphone Hook
 * Handles real-time transcript polling with audio level monitoring.
 */
export const useLocalMic = () => {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [analysis, setAnalysis] = useState(null);
    const [audioLevel, setAudioLevel] = useState(0);
    const [error, setError] = useState(null);
    
    const pollInterval = useRef(null);

    const startRecording = async () => {
        try {
            setError(null);
            const res = await fetch('/api/mic/start', { method: 'POST' });
            if (res.ok) {
                setIsListening(true);
                setTranscript('');
                setAnalysis(null);
                startPolling();
            } else {
                const data = await res.json();
                throw new Error(data.error || 'Failed to start mic');
            }
        } catch (err) {
            console.error('Mic Start Error:', err);
            setError(err.message);
        }
    };

    const stopRecording = async () => {
        try {
            await fetch('/api/mic/stop', { method: 'POST' });
            setIsListening(false);
            stopPolling();
        } catch (err) {
            console.error('Mic Stop Error:', err);
        }
    };

    const startPolling = useCallback(() => {
        if (pollInterval.current) return;
        
        pollInterval.current = setInterval(async () => {
            try {
                const res = await fetch('/api/mic/transcript');
                if (res.ok) {
                    const data = await res.json();
                    
                    if (data.transcript) {
                        setTranscript(data.transcript);
                    }
                    if (data.analysis) {
                        setAnalysis(data.analysis);
                    }
                    if (data.audio_level !== undefined) {
                        // Normalize and smooth audio level (0 to 1 scale)
                        setAudioLevel(prev => (prev * 0.3) + (data.audio_level * 0.7));
                    }
                    
                    // Synchronize with manual mic state
                    if (data.is_running === false) {
                        setIsListening(false);
                        stopPolling();
                    }
                }
            } catch (err) {
                console.warn('Polling error:', err);
            }
        }, 300); // 300ms for responsive feedback
    }, []);

    const stopPolling = () => {
        if (pollInterval.current) {
            clearInterval(pollInterval.current);
            pollInterval.current = null;
        }
        setAudioLevel(0);
    };

    const clearTranscript = async () => {
        await fetch('/api/mic/clear', { method: 'POST' });
        setTranscript('');
        setAnalysis(null);
    };

    useEffect(() => {
        return () => stopPolling();
    }, []);

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
};
