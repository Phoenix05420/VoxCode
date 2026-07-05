import { useState, useCallback } from 'react';

export function useVoiceInput() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState(null);

  const startRecording = useCallback(async () => {
    setIsRecording(true);
    setError(null);
    // Implementation for voice recording would go here
  }, []);

  const stopRecording = useCallback(() => {
    setIsRecording(false);
  }, []);

  return {
    isRecording,
    transcript,
    setTranscript,
    error,
    setError,
    startRecording,
    stopRecording,
  };
}
