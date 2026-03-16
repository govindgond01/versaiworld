import { useState } from 'react';
import api from '../services/api';

export const usePayment = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createPaymentIntent = async (paymentData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/payments/create', paymentData);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Payment creation failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const confirmPayment = async (paymentId) => {
    try {
      const response = await api.post('/payments/confirm', { paymentId });
      return response.data;
    } catch (err) {
      setError('Payment confirmation failed');
      throw err;
    }
  };

  const getStudentPayments = async (studentId) => {
    try {
      const response = await api.get(`/payments/student/${studentId}`);
      return response.data;
    } catch (err) {
      setError('Failed to fetch payments');
      throw err;
    }
  };

  return {
    createPaymentIntent,
    confirmPayment,
    getStudentPayments,
    loading,
    error
  };
};