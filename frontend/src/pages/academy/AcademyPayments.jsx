import React, { useState, useEffect } from 'react';
import { FaRupeeSign, FaCheckCircle, FaClock } from 'react-icons/fa';
import { GiTeacher } from 'react-icons/gi';
import { toast } from 'react-hot-toast';

import UserStatsCard from '../../components/user/UserStatsCard';
import UserLoading from '../../components/user/UserLoading';
import UserEmptyState from '../../components/user/UserEmptyState';
import UserPaymentCard from '../../components/user/UserPaymentCard';
import api from '../../services/api';

const AcademyPayments = () => {
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState([]);
  const [summary, setSummary] = useState({ total: 0, paid: 0, due: 0 });

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userId = user?.id || user?._id || '';

  useEffect(() => { fetchPayments(); }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      
      const userRes = await api.get(`/admin/students/${userId}`);

      if (userRes.data.success) {
        const data = userRes.data.student;
        setSummary({
          total: data.fees?.totalFee || 0,
          paid: data.fees?.paidFee || 0,
          due: data.fees?.dueFee || 0
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

  if (loading) return <UserLoading />;

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">My Payments</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <UserStatsCard icon={FaRupeeSign} label="Total Fees" value={`₹${summary.total.toLocaleString()}`} color="blue" />
        <UserStatsCard icon={FaCheckCircle} label="Paid" value={`₹${summary.paid.toLocaleString()}`} color="green" />
        <UserStatsCard icon={FaClock} label="Due" value={`₹${summary.due.toLocaleString()}`} color={summary.due > 0 ? 'red' : 'gray'} />
      </div>

      <div className="space-y-4">
        {payments.length === 0 ? (
          <UserEmptyState icon={GiTeacher} title="No payments found" description="No payment records found" />
        ) : (
          payments.map(payment => <UserPaymentCard key={payment._id} payment={payment} onDownload={downloadReceipt} />)
        )}
      </div>
    </div>
  );
};

export default AcademyPayments;