/**
 * VoxCode Gemini Service
 * Handles streaming AI generation, optimization, and explanation.
 * Includes automatic retry logic and request cancellation.
 */

const API_BASE = '/api';

const buildHeaders = (token, includeJson = true) => {
    const headers = {};
    if (includeJson) {
        headers['Content-Type'] = 'application/json';
    }
    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }
    return headers;
};

/**
 * Common fetch wrapper with retry and error handling
 */
const fetchWithRetry = async (url, options, retries = 3, backoff = 1000) => {
    try {
        const response = await fetch(url, options);
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }
        return response;
    } catch (error) {
        if (retries > 0 && error.name !== 'AbortError') {
            await new Promise(resolve => setTimeout(resolve, backoff));
            return fetchWithRetry(url, options, retries - 1, backoff * 2);
        }
        throw error;
    }
};

export const codeService = {
    /**
     * Stream AI results from a reader
     */
    async *streamResponse(response, onContent) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
            const { value, done } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop(); // Keep partial line in buffer

            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    try {
                        const data = JSON.parse(line.slice(6));
                        if (data.content) {
                            onContent(data.content);
                            yield data.content;
                        }
                    } catch (e) {
                        console.warn('Error parsing stream line:', e);
                    }
                }
            }
        }
    },

    /**
     * Generate new code from a prompt
     */
    async generate(prompt, language, onContent, signal, token) {
        const response = await fetchWithRetry(`${API_BASE}/generate`, {
            method: 'POST',
            headers: buildHeaders(token),
            body: JSON.stringify({ prompt, language }),
            signal
        });
        
        let fullContent = '';
        for await (const chunk of this.streamResponse(response, onContent)) {
            fullContent += chunk;
        }
        return fullContent;
    },

    /**
     * Optimize existing code
     */
    async optimize(code, language, onContent, signal, token) {
        const response = await fetchWithRetry(`${API_BASE}/optimize`, {
            method: 'POST',
            headers: buildHeaders(token),
            body: JSON.stringify({ code, language }),
            signal
        });

        let fullContent = '';
        for await (const chunk of this.streamResponse(response, onContent)) {
            fullContent += chunk;
        }
        return fullContent;
    },

    /**
     * Explain code step-by-step
     */
    async explain(code, language, onContent, signal, token) {
        const response = await fetchWithRetry(`${API_BASE}/explain`, {
            method: 'POST',
            headers: buildHeaders(token),
            body: JSON.stringify({ code, language }),
            signal
        });

        let fullContent = '';
        for await (const chunk of this.streamResponse(response, onContent)) {
            fullContent += chunk;
        }
        return fullContent;
    },

    /**
     * Check system health
     */
    async checkHealth() {
        const res = await fetch(`${API_BASE}/health`);
        return await res.json();
    }
};
