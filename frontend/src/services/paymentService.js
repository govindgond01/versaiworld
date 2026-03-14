// src/services/paymentService.js
import api from './api'; // ✅ Use the api instance

const paymentService = {
  // ✅ Record manual payment (offline)
  recordPayment: async (paymentData) => {
    const response = await api.post('/payments/record', paymentData);
    return response.data;
  },

  // ✅ Get users by category (academy/library/staff)
  getUsersByCategory: async (category, search = '') => {
    const response = await api.get(
      `/payments/${category}${search ? `?search=${search}` : ''}`
    );
    return response.data;
  },

  // ✅ Search users (quick search for recording payment)
  searchUsers: async (searchTerm, category = '') => {
    const response = await api.get(
      `/payments/search?q=${searchTerm}&category=${category}`
    );
    return response.data;
  },

  // ✅ Get payment history for a user
  getPaymentHistory: async (userId) => {
    const response = await api.get(`/payments/history/${userId}`);
    return response.data;
  },

  // ✅ Print receipt (offline - manual payment)
  printReceipt: (paymentData) => {
    // ... same as before
  }
};

export default paymentService;