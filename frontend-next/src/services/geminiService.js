/**
 * VoxCode AI Code Service
 * Streaming SSE client for code generation, optimization, and explanation
 * powered by Gemini (or any compatible backend).
 */

const RETRY_DELAYS = [1000, 2000, 4000]; // Exponential backoff: 1s → 2s → 4s

/**
 * Build request headers with optional Bearer token.
 * @param {string} [token] - Optional auth token
 * @returns {Record<string, string>}
 */
function buildHeaders(token) {
  const headers = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

/**
 * Fetch with automatic retry and exponential backoff.
 * Respects AbortSignal for cancellation.
 * @param {string} url - Request URL
 * @param {RequestInit} options - Fetch options
 * @param {AbortSignal} [signal] - Optional abort signal
 * @returns {Promise<Response>}
 */
async function fetchWithRetry(url, options, signal) {
  let lastError;

  for (let attempt = 0; attempt <= RETRY_DELAYS.length; attempt++) {
    try {
      // Abort early if already cancelled
      if (signal?.aborted) {
        throw new DOMException('Request aborted', 'AbortError');
      }

      const response = await fetch(url, { ...options, signal });

      if (response.ok) {
        return response;
      }

      // Don't retry 4xx client errors (except 429 rate limit)
      if (response.status >= 400 && response.status < 500 && response.status !== 429) {
        let errorMessage = `Server error: ${response.status}`;
        try {
          const data = await response.json();
          errorMessage = data.error || data.message || errorMessage;
        } catch {
          // not JSON
        }
        throw new Error(errorMessage);
      }

      lastError = new Error(`Server error: ${response.status}`);
    } catch (error) {
      if (error.name === 'AbortError') {
        throw error;
      }
      lastError = error;
    }

    // Wait before retrying (unless this was the last attempt)
    if (attempt < RETRY_DELAYS.length) {
      const delay = RETRY_DELAYS[attempt];
      await new Promise((resolve, reject) => {
        const timer = setTimeout(resolve, delay);
        if (signal) {
          const onAbort = () => {
            clearTimeout(timer);
            reject(new DOMException('Request aborted', 'AbortError'));
          };
          if (signal.aborted) {
            clearTimeout(timer);
            reject(new DOMException('Request aborted', 'AbortError'));
            return;
          }
          signal.addEventListener('abort', onAbort, { once: true });
        }
      });
    }
  }

  throw lastError || new Error('Request failed after retries');
}

/**
 * Async generator that reads an SSE ReadableStream and yields
 * parsed `data: ` payloads line by line.
 * @param {ReadableStream} body - Response body stream
 * @yields {string} Parsed data content from each SSE event
 */
async function* streamResponse(body) {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        // Process any remaining buffer
        if (buffer.trim()) {
          const lines = buffer.split('\n');
          for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith('data: ')) {
              const payload = trimmed.slice(6);
              if (payload === '[DONE]') return;
              try {
                const parsed = JSON.parse(payload);
                if (parsed.content) yield parsed.content;
                if (parsed.text) yield parsed.text;
                if (parsed.error) throw new Error(parsed.error);
              } catch (e) {
                if (e instanceof SyntaxError) {
                  // Raw text payload (not JSON)
                  yield payload;
                } else {
                  throw e;
                }
              }
            }
          }
        }
        return;
      }

      buffer += decoder.decode(value, { stream: true });

      // Process complete lines
      const lines = buffer.split('\n');
      // Keep the last (possibly incomplete) line in the buffer
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith(':')) continue; // skip empty/comments

        if (trimmed.startsWith('data: ')) {
          const payload = trimmed.slice(6);
          if (payload === '[DONE]') return;

          try {
            const parsed = JSON.parse(payload);
            if (parsed.content) yield parsed.content;
            else if (parsed.text) yield parsed.text;
            else if (parsed.error) throw new Error(parsed.error);
          } catch (e) {
            if (e instanceof SyntaxError) {
              // Raw text payload
              yield payload;
            } else {
              throw e;
            }
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

/**
 * Internal streaming request handler.
 * Sends POST, streams SSE response, and invokes onContent for each chunk.
 * @param {string} endpoint - API endpoint path
 * @param {object} body - Request payload
 * @param {function} onContent - Callback invoked with each content chunk
 * @param {AbortSignal} [signal] - Optional abort signal
 * @param {string} [token] - Optional auth token
 * @returns {Promise<string>} Full concatenated response text
 */
async function streamRequest(endpoint, body, onContent, signal, token) {
  const response = await fetchWithRetry(
    endpoint,
    {
      method: 'POST',
      headers: buildHeaders(token),
      body: JSON.stringify(body),
    },
    signal,
  );

  if (!response.body) {
    // Fallback for non-streaming responses
    const data = await response.json();
    const text = data.content || data.text || data.code || '';
    if (onContent) onContent(text);
    return text;
  }

  let fullText = '';
  for await (const chunk of streamResponse(response.body)) {
    fullText += chunk;
    if (onContent) onContent(chunk);
  }

  return fullText;
}

/**
 * VoxCode AI code service.
 * Provides streaming generate, optimize, and explain operations.
 */
export const codeService = {
  /**
   * Generate code from a prompt using streaming SSE.
   * @param {string} prompt - Natural-language prompt
   * @param {string} language - Target language
   * @param {function} onContent - Chunk callback
   * @param {AbortSignal} [signal] - Abort signal
   * @param {string} [token] - Auth token
   * @returns {Promise<string>}
   */
  generate(prompt, language, onContent, signal, token) {
    return streamRequest(
      '/api/generate',
      { prompt, language },
      onContent,
      signal,
      token,
    );
  },

  /**
   * Optimize existing code using streaming SSE.
   * @param {string} code - Source code to optimize
   * @param {string} language - Source language
   * @param {function} onContent - Chunk callback
   * @param {AbortSignal} [signal] - Abort signal
   * @param {string} [token] - Auth token
   * @returns {Promise<string>}
   */
  optimize(code, language, onContent, signal, token) {
    return streamRequest(
      '/api/optimize',
      { code, language },
      onContent,
      signal,
      token,
    );
  },

  /**
   * Explain code using streaming SSE.
   * @param {string} code - Source code to explain
   * @param {string} language - Source language
   * @param {function} onContent - Chunk callback
   * @param {AbortSignal} [signal] - Abort signal
   * @param {string} [token] - Auth token
   * @returns {Promise<string>}
   */
  explain(code, language, onContent, signal, token) {
    return streamRequest(
      '/api/explain',
      { code, language },
      onContent,
      signal,
      token,
    );
  },

  /**
   * Check backend health status.
   * @returns {Promise<{status: string}>}
   */
  async checkHealth() {
    try {
      const response = await fetch('/api/health');
      if (!response.ok) {
        return { status: 'unhealthy', error: `HTTP ${response.status}` };
      }
      return await response.json();
    } catch (error) {
      return { status: 'unreachable', error: error.message };
    }
  },
};
