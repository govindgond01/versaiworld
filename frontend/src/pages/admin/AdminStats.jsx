import React, { useState, useEffect } from 'react';
import { FaUsers, FaUserTie, FaUser, FaUserCheck, FaUserTimes, FaChartLine, FaCalendarAlt, FaDollarSign } from 'react-icons/fa';
import api from '../../services/api';
import { toast } from 'react-hot-toast';
import Loader from '../../components/common/Loader';

const AdminStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/stats');

      if (res.data.success) {
        setStats(res.data.stats);
      }
    } catch (error) {
      toast.error('Failed to fetch admin statistics');
      console.error('Fetch stats error:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon, color, subtitle }) => (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          {icon}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-2">
            <div className="h-8 bg-gray-200 rounded animate-pulse w-48" />
            <div className="h-4 bg-gray-100 rounded animate-pulse w-36" />
          </div>
          <div className="h-10 bg-gray-200 rounded animate-pulse w-24" />
        </div>

        {/* Stats Grid Skeleton */}
        <Loader type="stats-grid" rows={8} />

        {/* Card Skeletons */}
        <Loader type="skeleton" rows={4} className="p-6" />
        <Loader type="skeleton" rows={4} className="p-6" />
        <Loader type="skeleton" rows={4} className="p-6" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <FaChartLine className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">Unable to load statistics</p>
        <button
          onClick={fetchStats}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">System overview and statistics</p>
        </div>
        <button
          onClick={fetchStats}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
        >
          <FaChartLine className="w-4 h-4" /> Refresh Stats
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          icon={<FaUsers className="w-6 h-6 text-white" />}
          color="bg-blue-600"
          subtitle={`${stats.activeUsers} active`}
        />
        <StatCard
          title="Super Admins"
          value={stats.superAdmins}
          icon={<FaUserTie className="w-6 h-6 text-white" />}
          color="bg-red-600"
        />
        <StatCard
          title="Admins"
          value={stats.admins}
          icon={<FaUserTie className="w-6 h-6 text-white" />}
          color="bg-purple-600"
        />
        <StatCard
          title="Staff Members"
          value={stats.staff}
          icon={<FaUser className="w-6 h-6 text-white" />}
          color="bg-green-600"
        />
        <StatCard
          title="Students"
          value={stats.students}
          icon={<FaUser className="w-6 h-6 text-white" />}
          color="bg-indigo-600"
        />
        <StatCard
          title="Active Users"
          value={stats.activeUsers}
          icon={<FaUserCheck className="w-6 h-6 text-white" />}
          color="bg-emerald-600"
          subtitle={`${Math.round((stats.activeUsers / stats.totalUsers) * 100)}% of total`}
        />
        <StatCard
          title="Blocked Users"
          value={stats.blockedUsers}
          icon={<FaUserTimes className="w-6 h-6 text-white" />}
          color="bg-red-500"
          subtitle={`${Math.round((stats.blockedUsers / stats.totalUsers) * 100)}% of total`}
        />
        <StatCard
          title="Recent Logins"
          value={stats.recentLogins}
          icon={<FaCalendarAlt className="w-6 h-6 text-white" />}
          color="bg-orange-600"
          subtitle="Last 7 days"
        />
      </div>

      {/* User Distribution Chart */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">User Distribution</h2>
        <div className="space-y-4">
          {[
            { label: 'Super Admins', value: stats.superAdmins, color: 'bg-red-500', percentage: Math.round((stats.superAdmins / stats.totalUsers) * 100) },
            { label: 'Admins', value: stats.admins, color: 'bg-purple-500', percentage: Math.round((stats.admins / stats.totalUsers) * 100) },
            { label: 'Staff', value: stats.staff, color: 'bg-green-500', percentage: Math.round((stats.staff / stats.totalUsers) * 100) },
            { label: 'Students', value: stats.students, color: 'bg-indigo-500', percentage: Math.round((stats.students / stats.totalUsers) * 100) }
          ].map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-4 h-4 rounded ${item.color}`}></div>
                <span className="text-sm font-medium text-gray-700">{item.label}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">{item.value} users</span>
                <span className="text-sm font-medium text-gray-900">{item.percentage}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Activity</h2>
        <div className="space-y-4">
          {stats.recentActivity && stats.recentActivity.length > 0 ? (
            stats.recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <FaUser className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                    <p className="text-xs text-gray-500">{activity.user} • {new Date(activity.timestamp).toLocaleString()}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  activity.type === 'login' ? 'bg-green-100 text-green-800' :
                  activity.type === 'register' ? 'bg-blue-100 text-blue-800' :
                  activity.type === 'block' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {activity.type}
                </span>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center py-8">No recent activity</p>
          )}
        </div>
      </div>

      {/* System Health */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">System Health</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <FaUserCheck className="w-8 h-8 text-green-600" />
            </div>
            <p className="text-sm font-medium text-gray-900">Active Users</p>
            <p className="text-2xl font-bold text-green-600">{stats.activeUsers}</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <FaUserTimes className="w-8 h-8 text-yellow-600" />
            </div>
            <p className="text-sm font-medium text-gray-900">Blocked Users</p>
            <p className="text-2xl font-bold text-yellow-600">{stats.blockedUsers}</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <FaCalendarAlt className="w-8 h-8 text-blue-600" />
            </div>
            <p className="text-sm font-medium text-gray-900">Recent Logins</p>
            <p className="text-2xl font-bold text-blue-600">{stats.recentLogins}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminStats;