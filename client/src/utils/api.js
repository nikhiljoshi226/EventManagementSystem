import axios from 'axios';

// Create axios instance with base URL
const api = axios.create({
  baseURL: 'http://127.0.0.1:5000/api', // Update with your backend API URL
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include auth token
// api.interceptors.request.use(
//   (config) => {
//     const user = JSON.parse(localStorage.getItem('user'));
    
//     // For demo purposes, we'll use the demo headers if available
//     if (user) {
//       config.headers['x-user-id'] = user.id || 'demo-user-id';
//       config.headers['x-demo-role'] = user.role || 'demo-role';
//     }
    
//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );

// Add a response interceptor to handle errors
// api.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     // Handle 401 Unauthorized errors
//     if (error.response?.status === 401) {
//       // Redirect to login or handle unauthorized access
//       localStorage.removeItem('user');
//       window.location.href = '/login';
//     }
//     return Promise.reject(error);
//   }
// );

// Helper function to get auth config
const getAuthConfig = () => {
  const user = JSON.parse(localStorage.getItem('user')) || {};
  return {
    headers: {
      'x-user-id': user.id || 'demo-user-id',
      'x-demo-role': user.role || 'demo-role',
      'Content-Type': 'application/json',
    },
  };
};

export { api, getAuthConfig };

// Example usage in components:
// import { api, getAuthConfig } from '../utils/api';
// 
// // For GET requests
// const response = await api.get('/endpoint', getAuthConfig());
// 
// // For POST requests
// const response = await api.post('/endpoint', data, getAuthConfig());
