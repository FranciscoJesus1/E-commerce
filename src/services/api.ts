const API_BASE_URL = 'http://localhost:3001/api';

class ApiService {
  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // Player Data
  async getPlayerData() {
    return this.request('/player-data');
  }

  async savePlayerData(data: any) {
    return this.request('/player-data', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Duo Partner
  async getDuoPartner() {
    return this.request('/duo-partner');
  }

  async saveDuoPartner(data: any) {
    return this.request('/duo-partner', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Team Members
  async getTeamMembers() {
    return this.request('/team-members');
  }

  async saveTeamMembers(data: any[]) {
    return this.request('/team-members', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Gallery Images
  async getGalleryImages() {
    return this.request('/gallery-images');
  }

  async saveGalleryImages(data: any[]) {
    return this.request('/gallery-images', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Highlight Videos
  async getHighlightVideos() {
    return this.request('/highlight-videos');
  }

  async saveHighlightVideos(data: any[]) {
    return this.request('/highlight-videos', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Events
  async getEvents() {
    return this.request('/events');
  }

  async saveEvents(data: any[]) {
    return this.request('/events', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Background Music
  async getBackgroundMusic() {
    return this.request('/background-music');
  }

  async saveBackgroundMusic(data: any) {
    return this.request('/background-music', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Settings
  async getSettings() {
    return this.request('/settings');
  }

  async saveSettings(data: any) {
    return this.request('/settings', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Health check
  async healthCheck() {
    return this.request('/health');
  }
}

export const apiService = new ApiService();
export default apiService;