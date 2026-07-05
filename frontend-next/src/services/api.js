/**
 * VoxCode API Client
 * Singleton HTTP client for communicating with the backend API.
 */

class APIClient {
  constructor() {
    this.baseURL =
      typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_API_URL
        ? process.env.NEXT_PUBLIC_API_URL
        : '/api';
  }

  /**
   * Generic request method with JSON headers and error handling.
   * @param {string} endpoint - API endpoint path (e.g. '/generate')
   * @param {object} options - Fetch options override
   * @returns {Promise<any>} Parsed JSON response
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;

    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Remove Content-Type for FormData (browser sets it with boundary)
    if (options.body instanceof FormData) {
      delete config.headers['Content-Type'];
    }

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        let errorMessage = `API Error: ${response.status} ${response.statusText}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch {
          // Response body wasn't JSON, use default message
        }
        throw new Error(errorMessage);
      }

      // Handle 204 No Content
      if (response.status === 204) {
        return null;
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }

      return await response.text();
    } catch (error) {
      if (error.name === 'AbortError') {
        throw error;
      }
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw new Error(
          'Network error: Unable to reach the server. Please check your connection.',
        );
      }
      throw error;
    }
  }

  /**
   * Generate code from a natural-language prompt.
   * @param {string} prompt - The user prompt
   * @param {string} language - Target programming language
   * @returns {Promise<{code: string, language: string}>}
   */
  async generateCode(prompt, language) {
    return this.request('/generate', {
      method: 'POST',
      body: JSON.stringify({ prompt, language }),
    });
  }

  /**
   * Transcribe audio data to text.
   * @param {Blob|ArrayBuffer} audioData - Raw audio payload
   * @returns {Promise<{transcript: string}>}
   */
  async transcribeAudio(audioData) {
    const formData = new FormData();
    formData.append(
      'audio',
      audioData instanceof Blob ? audioData : new Blob([audioData]),
    );

    return this.request('/transcribe', {
      method: 'POST',
      body: formData,
    });
  }

  /**
   * Retrieve saved code snippets with optional filters.
   * @param {object} [filters] - Query params (language, category, search, etc.)
   * @returns {Promise<Array>}
   */
  async getSnippets(filters = {}) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }
    });
    const query = params.toString();
    return this.request(`/snippets${query ? `?${query}` : ''}`);
  }

  /**
   * Save a new code snippet.
   * @param {object} snippet - Snippet payload
   * @returns {Promise<object>}
   */
  async saveSnippet(snippet) {
    return this.request('/snippets', {
      method: 'POST',
      body: JSON.stringify(snippet),
    });
  }

  /**
   * Update an existing snippet by ID.
   * @param {string} id - Snippet ID
   * @param {object} snippet - Updated snippet fields
   * @returns {Promise<object>}
   */
  async updateSnippet(id, snippet) {
    return this.request(`/snippets/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(snippet),
    });
  }

  /**
   * Delete a snippet by ID.
   * @param {string} id - Snippet ID
   * @returns {Promise<null>}
   */
  async deleteSnippet(id) {
    return this.request(`/snippets/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  }

  /**
   * Get available code templates.
   * @returns {Promise<Array>}
   */
  async getTemplates() {
    return this.request('/templates');
  }

  /**
   * Get aggregated user statistics.
   * @returns {Promise<object>}
   */
  async getUserStats() {
    return this.request('/stats');
  }

  /**
   * Get recent user activity.
   * @param {number} [limit=20] - Max number of activity items
   * @returns {Promise<Array>}
   */
  async getRecentActivity(limit = 20) {
    return this.request(`/activity?limit=${encodeURIComponent(limit)}`);
  }
}

/** Singleton API client instance */
export const apiClient = new APIClient();

export default apiClient;
