// client/src/api.js
import axios from 'axios';

// This automatically selects the right URL:
// 1. If we have a cloud URL in .env, use it.
// 2. Otherwise, default to localhost for development.
const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000'

const api = axios.create({
  baseURL: `${BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default api;