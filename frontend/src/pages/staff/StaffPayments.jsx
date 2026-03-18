import React, { useState, useEffect } from 'react';
import { FaRupeeSign, FaCheckCircle, FaClock } from 'react-icons/fa';
import { BsPersonWorkspace } from 'react-icons/bs';
import api from '../../services/api';
import { toast } from 'react-hot-toast';

import UserStatsCard from '../../components/user/UserStatsCard';
import Loader from '../../components/common/Loader';
import UserEmptyState from '../../components/user/UserEmptyState';
import UserPaymentCard from '../../components/user/UserPaymentCard';

const StaffPayments = () => {
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState([]);
  const [summary, setSummary] = useState({ total: 0, paid: 0, due: 0 });

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userId = user?.id || user?._id || '';

  useEffect(() => { fetchPayments(); }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      
      const userRes = await api.get(`staff/${userId}`);

      if (userRes.data.success) {
        const data = userRes.data.staff;
        setSummary({
          total: data.fees?.salary || 0,
          paid: data.fees?.paidSalary || 0,
          due: data.fees?.dueSalary || 0
        });
      }

      const paymentsRes = await api.get(`/payments/user/${userId}`);

      if (paymentsRes.data.success) {
        setPayments(paymentsRes.data.payments || []);
      }

    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  const downloadReceipt = (payment) => {
    toast.success(`Receipt ${payment.receiptNo} downloaded`);
  };

  if (loading) return <Loader type="spinner" size="large" />;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Salary</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
        <UserStatsCard icon={FaRupeeSign} label="Total Salary" value={`₹${summary.total.toLocaleString()}`} color="blue" />
        <UserStatsCard icon={FaCheckCircle} label="Received" value={`₹${summary.paid.toLocaleString()}`} color="green" />
        <UserStatsCard icon={FaClock} label="Due" value={`₹${summary.due.toLocaleString()}`} color={summary.due > 0 ? 'red' : 'gray'} />
      </div>

      <div className="space-y-6">
        {payments.length === 0 ? (
          <UserEmptyState icon={BsPersonWorkspace} title="No payments found" description="No salary records found" />
        ) : (
          payments.map(payment => <UserPaymentCard key={payment._id} payment={payment} onDownload={downloadReceipt} />)
        )}
      </div>
    </div>
  );
};

export default StaffPayments;