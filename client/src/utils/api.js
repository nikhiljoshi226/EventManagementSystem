import axios from 'axios';

// Use the same base URL as in the main api.js for consistency
const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Create axios instance with base URL
const api = axios.create({
  baseURL: `${BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false // We'll handle credentials via headers instead
});

// // Helper function to get auth config
// const getAuthConfig = () => {
//   const user = JSON.parse(localStorage.getItem('user')) || {};
//   return {
//     headers: {
//       'x-user-id': user.id || 'demo-user-id',
//       'x-demo-role': user.role || 'demo-role',
//       'Content-Type': 'application/json',
//     },
//   };
// };

export { api };

// Example usage in components:
// import { api } from '../utils/api';
// 
// // For GET requests
// const response = await api.get('/endpoint', getAuthConfig());
// 
// // For POST requests
// const response = await api.post('/endpoint', data, getAuthConfig());
