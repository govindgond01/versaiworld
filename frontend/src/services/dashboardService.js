import api from './api';

const dashboardService = {
  // Academy dashboard stats
  getAcademyStats: async () => {
    try {
      const response = await api.get('/dashboard/academy/stats');
      return response.data;
    } catch (error) {
      console.error('Error:', error);
      return {
        data: [
          { label: 'Total Students', value: 0, icon: 'students', type: 'number' },
          { label: 'Active Students', value: 0, icon: 'students', type: 'number' },
          { label: 'Total Fees', value: 0, icon: 'fees', type: 'currency' },
          { label: 'Due Fees', value: 0, icon: 'fees', type: 'currency' }
        ]
      };
    }
  },

  // Library dashboard stats
  getLibraryStats: async () => {
    try {
      const response = await api.get('/dashboard/library/stats');
      return response.data;
    } catch (error) {
      return {
        data: [
          { label: 'Total Members', value: 0, icon: 'students', type: 'number' },
          { label: 'Active Members', value: 0, icon: 'students', type: 'number' },
          { label: 'Books Issued', value: 0, icon: 'books', type: 'number' },
          { label: 'Due Returns', value: 0, icon: 'books', type: 'number' }
        ]
      };
    }
  },

  // Staff dashboard stats
  getStaffStats: async () => {
    try {
      const response = await api.get('/dashboard/staff/stats');
      return response.data;
    } catch (error) {
      return {
        data: [
          { label: 'Total Staff', value: 0, icon: 'staff', type: 'number' },
          { label: 'Present Today', value: 0, icon: 'attendance', type: 'number' },
          { label: 'Total Salary', value: 0, icon: 'salary', type: 'currency' },
          { label: 'Pending Tasks', value: 0, icon: 'pending', type: 'number' }
        ]
      };
    }
  },

  // Get activities
  getActivities: async (type) => {
    try {
      const response = await api.get(`/dashboard/${type}/activities`);
      return response.data;
    } catch (error) {
      return { data: [] };
    }
  },

  // Get notifications
  getNotifications: async () => {
    try {
      const response = await api.get('/notifications');
      return response.data;
    } catch (error) {
      return { data: [] };
    }
  },

  // Get attendance
  getAttendance: async (type, userId) => {
    try {
      const response = await api.get(`/attendance/${type}/${userId || 'me'}`);
      return response.data;
    } catch (error) {
      return { data: {} };
    }
  }
};

export default dashboardService;