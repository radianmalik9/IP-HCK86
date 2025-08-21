import axios from 'axios';
import { store } from '../stores/store';
import { logout } from '../stores/authSlice';
import { networkError, showError, logoutSuccess } from '../utils/notifications';

// Create axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const { response, message } = error;
    
    // Handle network errors
    if (!response) {
      networkError();
      return Promise.reject(error);
    }
    
    const { status, data } = response;
    
    // Handle authentication errors
    if (status === 401) {
      store.dispatch(logout());
      showError('Session Expired', 'Please login again to continue.');
      window.location.href = '/login';
      return Promise.reject(error);
    }
    
    // Handle other HTTP errors silently for manual handling in components
    // Components can use handleApiError utility for consistent error display
    
    return Promise.reject(error);
  }
);

export default api;
