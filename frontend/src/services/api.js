const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

class APIClient {
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json();
  }

  // Code generation
  async generateCode(prompt, language) {
    return this.request('/generate', {
      method: 'POST',
      body: JSON.stringify({ prompt, language }),
    });
  }

  // Voice transcription
  async transcribeAudio(audioData) {
    return this.request('/transcribe', {
      method: 'POST',
      body: JSON.stringify({ audio: audioData }),
    });
  }

  // Get snippets
  async getSnippets(filters = {}) {
    const params = new URLSearchParams(filters);
    return this.request(`/snippets?${params}`);
  }

  // Save snippet
  async saveSnippet(snippet) {
    return this.request('/snippets', {
      method: 'POST',
      body: JSON.stringify(snippet),
    });
  }

  // Update snippet
  async updateSnippet(id, snippet) {
    return this.request(`/snippets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(snippet),
    });
  }

  // Delete snippet
  async deleteSnippet(id) {
    return this.request(`/snippets/${id}`, {
      method: 'DELETE',
    });
  }

  // Get templates
  async getTemplates() {
    return this.request('/templates');
  }

  // Get user stats
  async getUserStats() {
    return this.request('/stats');
  }

  // Get recent activity
  async getRecentActivity(limit = 10) {
    return this.request(`/activity?limit=${limit}`);
  }
}

export const api = new APIClient();
