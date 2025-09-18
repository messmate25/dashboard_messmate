// In adminApi.js
import axios from 'axios';

const API_BASE_URL = 'https://messapp-dkfffueseegwexf9.centralindia-01.azurewebsites.net';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: `${API_BASE_URL}/api/admin`,
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
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth functions
export const adminLogin = (credentials) => 
  axios.post(`${API_BASE_URL}/api/auth/login`, credentials);

export const adminLogout = () => {
  localStorage.removeItem('adminToken');
  localStorage.removeItem('adminUser');
};
  
// API functions
export const getDashboardStats = () => api.get('/dashboard');
export const setWeeklyMenu = (data) => api.post('/weekly-menu', data);
export const addMenuItem = (data) => api.post('/menu-items', data);
export const getAllMenuItems = () => api.get('/menu-items');
export const updateMenuItem = (id, data) => api.put(`/menu-items/${id}`);
export const deleteMenuItem = (id) => api.delete(`/menu-items/${id}`);
export const rechargeGuest = (data) => api.post('/guest/recharge', data);
export const getUserById = (userId) => api.get(`/users/${userId}`);
export const getAllUsers = () => api.get('/users');
export const deleteUserById = (userId) => api.delete(`/users/${userId}`);

export default api;