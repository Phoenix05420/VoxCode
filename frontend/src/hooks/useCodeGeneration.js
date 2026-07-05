import { useState, useCallback } from 'react';

export function useCodeGeneration() {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const generateCode = useCallback(async (prompt, language) => {
    setIsLoading(true);
    setError(null);
    try {
      // API call would go here
      console.log('Generating code for:', prompt, language);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    code,
    setCode,
    isLoading,
    error,
    generateCode,
  };
}
