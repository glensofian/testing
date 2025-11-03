const API_ENDPOINT = 'https://story-api.dicoding.dev/v1';

class StoryApi {

  static async getAllStories(token) {
    const response = await fetch(`${API_ENDPOINT}/stories`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const responseJson = await response.json();

    if (responseJson.error) {
      throw new Error(responseJson.message);
    }

    return responseJson.listStory;
  }

  static async register(data) {
    const response = await fetch(`${API_ENDPOINT}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    const responseJson = await response.json();
    if (responseJson.error) {
      throw new Error(responseJson.message);
    }
    return responseJson;
  }

  static async login(data) {
    const response = await fetch(`${API_ENDPOINT}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    const responseJson = await response.json();
    if (responseJson.error) {
      throw new Error(responseJson.message);
    }

    return responseJson.loginResult;
  }

  static async addNewStory(formData) {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('User not authenticated');
    }

    const response = await fetch(`${API_ENDPOINT}/stories`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    const responseJson = await response.json();
    if (responseJson.error) {
      throw new Error(responseJson.message);
    }
    return responseJson;
  }

  static async subscribePush({ endpoint, keys, p256dh, auth, token }) {
    const res = await fetch(`${API_ENDPOINT}/notifications/subscribe`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ endpoint, keys, p256dh, auth }),
    });

    const responseJson = await res.json();
    if (responseJson.error) {
      throw new Error(responseJson.message);
    }
    return responseJson;
  }

  static async unsubscribePush({ endpoint, token }) {
    const res = await fetch(`${API_ENDPOINT}/notifications/subscribe`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ endpoint }),
    });

    const responseJson = await res.json();
    if (responseJson.error) {
      throw new Error(responseJson.message);
    }
    return responseJson;
  }

  static setAuthToken(token) {
    localStorage.setItem('authToken', token);
  }

  static getAuthToken() {
    return localStorage.getItem('authToken');
  }

  static removeAuthToken() {
    localStorage.removeItem('authToken');
  }
}

export default StoryApi;
