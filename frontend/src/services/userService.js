import api from './api'; 

const userService = {
  // Get all users with filters
  getAllUsers: async (filters = {}) => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key]) params.append(key, filters[key]);
    });
    
    return api.get(`/users?${params}`);
  },

  // Get single user
  getUserById: async (userId) => {
    return api.get(`/users/${userId}`);
  },

  // Update user
  updateUser: async (userId, userData) => {
    return api.put(`/users/${userId}`, userData);
  },

  // Delete user
  deleteUser: async (userId) => {
    return api.delete(`/users/${userId}`);
  },

  // Get current user from localStorage
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (error) {
        console.error('Error parsing user data:', error);
        return null;
      }
    }
    return null;
  },

  // Get user's role
  getUserRole: () => {
    const user = userService.getCurrentUser();
    return user?.userType || 'student';
  }
};

export default userService;