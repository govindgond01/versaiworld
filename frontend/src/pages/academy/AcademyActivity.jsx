import React, { useState, useEffect } from 'react';
import { GiTeacher } from 'react-icons/gi';
import { FiActivity } from 'react-icons/fi';
import { toast } from 'react-hot-toast';

import Loader from '../../components/common/Loader';
import UserEmptyState from '../../components/user/UserEmptyState';
import UserActivityItem from '../../components/user/UserActivityItem';
import api from '../../services/api';

const AcademyActivity = () => {
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState([]);

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userId = user?.id || user?._id || '';

  useEffect(() => { fetchActivities(); }, []);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      
      const paymentsRes = await api.get(`/payments/user/${userId}`);

      if (paymentsRes.data.success) {
        const paymentActivities = paymentsRes.data.payments.map(p => ({
          type: 'payment',
          title: 'Payment',
          description: `₹${p.amount} - ${p.type}`,
          time: new Date(p.date).toLocaleDateString()
        }));
        setActivities(paymentActivities);
      }

    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to load activities');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader type="spinner" size="large" />;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Activity History</h1>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        {activities.length === 0 ? (
          <UserEmptyState icon={FiActivity} title="No activities found" description="No activity records found" />
        ) : (
          <div className="space-y-2">
            {activities.map((activity, idx) => <UserActivityItem key={idx} {...activity} />)}
          </div>
        )}
      </div>
    </div>
  );
};

export default AcademyActivity;