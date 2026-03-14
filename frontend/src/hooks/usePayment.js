import { useState } from 'react';
import axios from 'axios';

export const usePayment = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createPaymentIntent = async (paymentData) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('/api/payments/create', paymentData, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
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
      const token = localStorage.getItem('token');
      const response = await axios.post('/api/payments/confirm', 
        { paymentId },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      return response.data;
    } catch (err) {
      setError('Payment confirmation failed');
      throw err;
    }
  };

  const getStudentPayments = async (studentId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/payments/student/${studentId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
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