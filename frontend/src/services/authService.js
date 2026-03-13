// src/services/authService.js
const authService = {
  // Get current user from localStorage
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (error) {
        console.error('Error parsing user:', error);
        return null;
      }
    }
    return null;
  },

  // Check if user is logged in
  isAuthenticated: () => {
    return localStorage.getItem('isLoggedIn') === 'true';
  },

  // Get user role
  getUserRole: () => {
    return localStorage.getItem('role') || 'student';
  },

  // Get token
  getToken: () => {
    return localStorage.getItem('token');
  },

  // Logout user
  logout: () => {
    localStorage.clear();
    window.location.href = '/login';
  }
};

export default authService;