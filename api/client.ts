import axios from 'axios';

const baseURL = process.env.EXPO_PUBLIC_API_URL || 'https://idrmcbkd.onrender.com';

export const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Basic response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // E.g. Handle specific status codes, refresh tokens, etc.
    if (error.response?.status === 401) {
      console.warn('Unauthorized access - typically triggers token refresh or logout');
    }
    
    return Promise.reject(error);
  }
);
