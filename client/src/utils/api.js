import axios from 'axios';

// Create axios instance with base URL
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false // We'll handle credentials via headers instead
});

// Helper function to get auth config
const getAuthConfig = () => {
  const userId = localStorage.getItem('userId');
  const userRole = localStorage.getItem('userRole');
  
  return {
    headers: {
      'x-user-id': userId || 'demo-user-id',
      'x-demo-role': userRole || 'demo-role'
    }
  };
};

export { api, getAuthConfig };

// Example usage in components:
// import { api } from '../utils/api';
// 
// // For GET requests
// const response = await api.get('/endpoint', getAuthConfig());
// 
// // For POST requests
// const response = await api.post('/endpoint', data, getAuthConfig());
