import React, { useState, useEffect } from 'react';
import { FaBook, FaClock, FaRupeeSign, FaUserCheck } from 'react-icons/fa';
import { GiTeacher } from 'react-icons/gi';
import { toast } from 'react-hot-toast';

import UserStatsCard from '../../components/user/UserStatsCard';
import UserLoading from '../../components/user/UserLoading';
import UserActivityItem from '../../components/user/UserActivityItem';
import UserQuickAction from '../../components/user/UserQuickAction';
import api from '../../services/api';

const AcademyDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState({});
  const [stats, setStats] = useState({ totalFees: 0, paidFees: 0, dueFees: 0, attendance: 0 });
  const [courses, setCourses] = useState([]);
  const [activities, setActivities] = useState([]);

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userId = user?.id || user?._id || '';

  useEffect(() => { fetchDashboardData(); }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      const userRes = await api.get(`/admin/students/${userId}`);

      if (userRes.data.success) {
        const data = userRes.data.student;
        setUserData(data);
        setStats({
          totalFees: data.fees?.totalFee || 0,
          paidFees: data.fees?.paidFee || 0,
          dueFees: data.fees?.dueFee || 0,
          attendance: data.attendance?.percentage || 0
        });
        
        if (data.course) {
          setCourses([{ name: data.course, teacher: 'Instructor' }]);
        }
      }

      const paymentsRes = await api.get(`/payments/user/${userId}`);

      if (paymentsRes.data.success) {
        const paymentActivities = paymentsRes.data.payments.map(p => ({
          type: 'payment',
          title: 'Payment Made',
          description: `₹${p.amount} - ${p.type}`,
          time: new Date(p.date).toLocaleDateString()
        }));
        setActivities(paymentActivities.slice(0, 5));
      }

    } catch (err) {
      console.error('Error:', err);
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <UserLoading />;

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Academy Dashboard</h1>
        <p className="text-gray-600">Welcome back, {userData.name}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <UserStatsCard icon={FaRupeeSign} label="Total Fees" value={`₹${stats.totalFees.toLocaleString()}`} color="blue" />
        <UserStatsCard icon={FaRupeeSign} label="Paid Fees" value={`₹${stats.paidFees.toLocaleString()}`} color="green" />
        <UserStatsCard icon={FaClock} label="Due Fees" value={`₹${stats.dueFees.toLocaleString()}`} color={stats.dueFees > 0 ? 'red' : 'gray'} />
        <UserStatsCard icon={FaUserCheck} label="Attendance" value={`${stats.attendance}%`} subValue="This month" color="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-4">My Courses</h2>
            {courses.length === 0 ? (
              <p className="text-gray-500">No courses enrolled</p>
            ) : (
              courses.map((course, idx) => (
                <div key={idx} className="border-b last:border-0 py-3">
                  <h3 className="font-medium">{course.name}</h3>
                  <p className="text-sm text-gray-600">{course.teacher}</p>
                </div>
              ))
            )}
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
            {activities.length === 0 ? (
              <p className="text-gray-500">No recent activity</p>
            ) : (
              activities.map((act, idx) => <UserActivityItem key={idx} {...act} />)
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-3">
              <UserQuickAction icon={FaBook} label="Courses" path="/academy-dashboard/courses" color="blue" />
              <UserQuickAction icon={FaCalendarAlt} label="Attendance" path="/academy-dashboard/attendance" color="green" />
              <UserQuickAction icon={FaRupeeSign} label="Pay Fees" path="/academy-dashboard/payments" color="purple" />
              <UserQuickAction icon={FaUserCheck} label="Profile" path="/academy-dashboard/profile" color="orange" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AcademyDashboard;