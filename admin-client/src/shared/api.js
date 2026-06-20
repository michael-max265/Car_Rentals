import axios from 'axios';
import { getToken } from './auth';

// In Vite dev mode, the proxy in vite.config.js forwards /api → backend.
// In production, set VITE_API_URL to the real backend URL.
const BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

// Attach JWT token to every request if present
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
