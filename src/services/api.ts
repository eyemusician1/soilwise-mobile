import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// Safely pull the URL from the .env file
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

api.interceptors.request.use(async (config) => {
  try {
    const token = await SecureStore.getItemAsync('jwt_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (error) {
    console.error('Error accessing secure store', error);
  }
  return config;
});

export default api;