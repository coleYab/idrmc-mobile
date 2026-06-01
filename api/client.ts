import { AxiosHeaders, create } from 'axios';
import { getAuthToken } from './auth';

const baseURL = process.env.EXPO_PUBLIC_API_URL || 'https://idrmcbkd.onrender.com';

export const apiClient = create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(async (config) => {
  const accessToken = await getAuthToken();

  if (accessToken) {
    config.headers = AxiosHeaders.from(config.headers);
    config.headers.set('Authorization', `Bearer ${accessToken}`);
  }

  return config;
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
