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

  // Logout user
  logout: () => {
    localStorage.clear();
    // Clear cookies by making a logout request or redirecting
    window.location.href = '/login';
  }
};

export default authService;