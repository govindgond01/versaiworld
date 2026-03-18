import React, { useState, useEffect } from 'react';
import { FaBook, FaClock, FaRupeeSign, FaUserCheck } from 'react-icons/fa';
import { MdLocalLibrary } from 'react-icons/md';
import api from '../../services/api';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

import UserStatsCard from '../../components/user/UserStatsCard';
import Loader from '../../components/common/Loader';
import UserActivityItem from '../../components/user/UserActivityItem';
import UserQuickAction from '../../components/user/UserQuickAction';
// import UserAttendanceCalendar from '../../components/user/UserAttendanceCalendar';

const LibraryDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState({});
  const [stats, setStats] = useState({ totalFees: 0, paidFees: 0, dueFees: 0, attendance: 0 });
  const [books, setBooks] = useState([]);
  const [activities, setActivities] = useState([]);
  const [attendanceData, setAttendanceData] = useState({});

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userId = user?.id || user?._id || '';

  useEffect(() => { fetchDashboardData(); }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Use the profile endpoint instead of admin endpoint
      const userRes = await api.get('/auth/profile');

      if (userRes.data.success) {
        const data = userRes.data.user;
        setUserData(data);
        setStats({
          totalFees: data.totalFees || 0,
          paidFees: data.paidFees || 0,
          dueFees: data.dueFees || 0,
          attendance: 0 // Will be updated when attendance API is available
        });
      }

      const attendanceRes = await api.get(`attendance/monthly/${userId}`);
      
      if (attendanceRes.data.success) {
        const processed = {};
        attendanceRes.data.data?.attendance?.forEach(item => {
          processed[new Date(item.date).toISOString().split('T')[0]] = item.status;
        });
        setAttendanceData(processed);
      }

      const paymentsRes = await api.get(`payments/user/${userId}`);

      if (paymentsRes.data.success) {
        const paymentActivities = paymentsRes.data.payments.map(p => ({
          type: 'payment',
          title: 'Payment Made',
          description: `₹${p.amount} - ${p.type}`,
          time: new Date(p.date).toLocaleDateString()
        }));
        setActivities(paymentActivities.slice(0, 5));
      }

    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAttendance = async (status) => {
    try {
      await api.post(`attendance/mark`, { userId, status, date: new Date() });
      toast.success(`Attendance marked as ${status}`);
      fetchDashboardData();
    } catch (error) {
      toast.error('Failed to mark attendance');
    }
  };

  if (loading) return <Loader type="spinner" size="large" />;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Library Dashboard</h1>
        <p className="text-gray-600">Welcome back, {userData.name}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <UserStatsCard icon={FaRupeeSign} label="Total Fees" value={`₹${stats.totalFees.toLocaleString()}`} color="blue" />
        <UserStatsCard icon={FaRupeeSign} label="Paid Fees" value={`₹${stats.paidFees.toLocaleString()}`} color="green" />
        <UserStatsCard icon={FaClock} label="Due Fees" value={`₹${stats.dueFees.toLocaleString()}`} color={stats.dueFees > 0 ? 'red' : 'gray'} />
        <UserStatsCard icon={FaUserCheck} label="Attendance" value={`${stats.attendance}%`} subValue="This month" color="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 space-y-6 md:space-y-0">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-6">My Books</h2>
            {books.length === 0 ? (
              <p className="text-gray-500">No books borrowed</p>
            ) : (
              books.map((book, idx) => (
                <div key={idx} className="border-b last:border-0 py-3">
                  <h3 className="font-medium">{book.title}</h3>
                  <p className="text-sm text-gray-600">by {book.author}</p>
                </div>
              ))
            )}
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-6">Recent Activity</h2>
            {activities.length === 0 ? (
              <p className="text-gray-500">No recent activity</p>
            ) : (
              activities.map((act, idx) => <UserActivityItem key={idx} {...act} />)
            )}
          </div>
        </div>

        <div className="space-y-6">
          {/* <UserAttendanceCalendar
            attendanceData={attendanceData}
            monthAttendance={stats.attendance}
            onMarkAttendance={handleMarkAttendance}
          /> */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-6">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-4 md:gap-6">
              <UserQuickAction icon={FaBook} label="Books" path="/library-dashboard/books" color="blue" />
              <UserQuickAction icon={FaCalendarAlt} label="Attendance" path="/library-dashboard/attendance" color="green" />
              <UserQuickAction icon={FaRupeeSign} label="Pay Fees" path="/library-dashboard/payments" color="purple" />
              <UserQuickAction icon={FaUserCheck} label="Profile" path="/library-dashboard/profile" color="orange" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LibraryDashboard;