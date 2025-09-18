// In adminApi.js - Updated with authentication handling
import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: 'https://messapp-dkfffueseegwexf9.centralindia-01.azurewebsites.net/api/admin',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login or show authentication modal
      localStorage.removeItem('adminToken');
      window.location.href = '/login'; // Adjust based on your routing
    }
    return Promise.reject(error);
  }
);

// API functions
export const getDashboardStats = () => api.get('/dashboard');
export const setWeeklyMenu = (data) => api.post('/weekly-menu', data);
export const addMenuItem = (data) => api.post('/menu-items', data);
export const rechargeGuest = (data) => api.post('/guest/recharge', data);
export const getUserById = (userId) => api.get(`/users/${userId}`);
export const deleteUserById = (userId) => api.delete(`/users/${userId}`);

export default api;