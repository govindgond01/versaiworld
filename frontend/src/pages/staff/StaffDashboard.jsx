import React, { useState, useEffect } from 'react';
import { FaRupeeSign, FaUserCheck, FaClock, FaCalendarAlt, FaTasks } from 'react-icons/fa';
import { BsPersonWorkspace } from 'react-icons/bs';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

import UserStatsCard from '../../components/user/UserStatsCard';
import UserLoading from '../../components/user/UserLoading';
import UserActivityItem from '../../components/user/UserActivityItem';
import UserQuickAction from '../../components/user/UserQuickAction';
// import UserAttendanceCalendar from '../../components/user/UserAttendanceCalendar';

const StaffDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState({});
  const [stats, setStats] = useState({ totalSalary: 0, paidSalary: 0, dueSalary: 0, attendance: 0 });
  const [tasks, setTasks] = useState([]);
  const [activities, setActivities] = useState([]);
  const [attendanceData, setAttendanceData] = useState({});

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userId = user?.id || user?._id || '';

  useEffect(() => { fetchDashboardData(); }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const userRes = await axios.get(`${globalThis.API_URL}/staff/${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (userRes.data.success) {
        const data = userRes.data.staff;
        setUserData(data);
        setStats({
          totalSalary: data.fees?.salary || 0,
          paidSalary: data.fees?.paidSalary || 0,
          dueSalary: data.fees?.dueSalary || 0,
          attendance: data.attendance?.percentage || 0
        });
      }

      const attendanceRes = await axios.get(`${globalThis.API_URL}/attendance/monthly/${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (attendanceRes.data.success) {
        const processed = {};
        attendanceRes.data.data?.attendance?.forEach(item => {
          processed[new Date(item.date).toISOString().split('T')[0]] = item.status;
        });
        setAttendanceData(processed);
      }

      const paymentsRes = await axios.get(`${globalThis.API_URL}/payments/user/${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (paymentsRes.data.success) {
        const paymentActivities = paymentsRes.data.payments.map(p => ({
          type: 'payment',
          title: 'Salary Credited',
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
      const token = localStorage.getItem('token');
      await axios.post('${globalThis.API_URL}/attendance/mark', 
        { userId, status, date: new Date() },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      toast.success(`Attendance marked as ${status}`);
      fetchDashboardData();
    } catch (error) {
      toast.error('Failed to mark attendance');
    }
  };

  if (loading) return <UserLoading />;

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Staff Dashboard</h1>
        <p className="text-gray-600">Welcome back, {userData.name}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <UserStatsCard icon={FaRupeeSign} label="Total Salary" value={`₹${stats.totalSalary.toLocaleString()}`} color="blue" />
        <UserStatsCard icon={FaRupeeSign} label="Received" value={`₹${stats.paidSalary.toLocaleString()}`} color="green" />
        <UserStatsCard icon={FaClock} label="Due Salary" value={`₹${stats.dueSalary.toLocaleString()}`} color={stats.dueSalary > 0 ? 'red' : 'gray'} />
        <UserStatsCard icon={FaUserCheck} label="Attendance" value={`${stats.attendance}%`} subValue="This month" color="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-4">My Tasks</h2>
            {tasks.length === 0 ? (
              <p className="text-gray-500">No tasks assigned</p>
            ) : (
              tasks.map((task, idx) => (
                <div key={idx} className="border-b last:border-0 py-3">
                  <h3 className="font-medium">{task.title}</h3>
                  <p className="text-sm text-gray-600">Due: {task.dueDate}</p>
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
          {/* <UserAttendanceCalendar
            attendanceData={attendanceData}
            monthAttendance={stats.attendance}
            onMarkAttendance={handleMarkAttendance}
          /> */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-3">
              <UserQuickAction icon={FaUserCheck} label="Attendance" path="/staff-dashboard/attendance" color="blue" />
              <UserQuickAction icon={FaCalendarAlt} label="Schedule" path="/staff-dashboard/schedule" color="green" />
              <UserQuickAction icon={FaRupeeSign} label="Salary" path="/staff-dashboard/payments" color="purple" />
              <UserQuickAction icon={FaTasks} label="Tasks" path="/staff-dashboard/tasks" color="orange" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;