// src/services/studentService.js
import api from './api';

export const studentService = {
  // Get student profile
  getProfile: async () => {
    try {
      const response = await api.get('/students/profile/me');
      return response.data.data;
    } catch (error) {
      throw error.response?.data?.message || error.message;
    }
  },

  // Update student profile
  updateProfile: async (profileData) => {
    try {
      const response = await api.put('/students/profile/me', profileData);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || error.message;
    }
  },

  // Get attendance data
  getAttendance: async () => {
    try {
      const response = await api.get('/students/attendance/me');
      return response.data.data;
    } catch (error) {
      throw error.response?.data?.message || error.message;
    }
  },

  // Upload profile picture (optional)
  uploadProfilePicture: async (file) => {
    try {
      const formData = new FormData();
      formData.append('profilePicture', file);
      
      const response = await api.post('/students/profile/picture', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || error.message;
    }
  }
};