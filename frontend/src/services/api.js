import axios from 'axios';

// Vite uses import.meta.env, not process.env
const API_URL = import.meta.env.VITE_API_URL;

if (!API_URL) {
  throw new Error('VITE_API_URL environment variable is not set');
}

const api = axios.create({
  baseURL: API_URL, // ✅ Use versioned API endpoints
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Enable sending cookies with requests
});

// Remove manual token setting since we're using httpOnly cookies
// Add token to requests - REMOVED: tokens are in httpOnly cookies

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only auto-logout on 401 if we're not on a login/register page
    if (error.response?.status === 401 && !window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
      localStorage.clear();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;