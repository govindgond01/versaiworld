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
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">{title}</p>
          <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mt-1 break-words">{value}</p>
          {subtitle && <p className="text-[10px] sm:text-xs text-gray-500 mt-1 truncate">{subtitle}</p>}
        </div>
        <div className={`p-2 sm:p-3 rounded-lg flex-shrink-0 ${color} ml-2`}>
          <div className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white">
            {icon}
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-6 px-4 sm:px-0">
        {/* Header Skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div className="space-y-2">
            <div className="h-6 sm:h-8 bg-gray-200 rounded animate-pulse w-36 sm:w-48" />
            <div className="h-3 sm:h-4 bg-gray-100 rounded animate-pulse w-24 sm:w-36" />
          </div>
          <div className="h-8 sm:h-10 bg-gray-200 rounded animate-pulse w-20 sm:w-24" />
        </div>

        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="h-3 sm:h-4 bg-gray-200 rounded animate-pulse w-20 sm:w-24 mb-2" />
                  <div className="h-6 sm:h-8 bg-gray-200 rounded animate-pulse w-12 sm:w-16" />
                </div>
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-200 rounded-lg animate-pulse" />
              </div>
            </div>
          ))}
        </div>

        {/* Card Skeletons */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6 space-y-3 sm:space-y-4">
          <div className="h-5 sm:h-6 bg-gray-200 rounded animate-pulse w-32 sm:w-40" />
          <div className="space-y-2 sm:space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex justify-between items-center">
                <div className="h-3 sm:h-4 bg-gray-200 rounded animate-pulse w-20 sm:w-24" />
                <div className="h-3 sm:h-4 bg-gray-200 rounded animate-pulse w-16 sm:w-20" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-8 sm:py-12 px-4">
        <FaChartLine className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
        <p className="text-sm sm:text-base text-gray-500">Unable to load statistics</p>
        <button
          onClick={fetchStats}
          className="mt-3 sm:mt-4 px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 px-4 sm:px-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">System overview and statistics</p>
        </div>
        <button
          onClick={fetchStats}
          className="flex items-center justify-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-600 text-white text-xs sm:text-sm font-medium rounded-lg hover:bg-blue-700 w-full sm:w-auto"
        >
          <FaChartLine className="w-3 h-3 sm:w-4 sm:h-4" /> Refresh Stats
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          icon={<FaUsers className="w-full h-full" />}
          color="bg-blue-600"
          subtitle={`${stats.activeUsers} active`}
        />
        <StatCard
          title="Super Admins"
          value={stats.superAdmins}
          icon={<FaUserTie className="w-full h-full" />}
          color="bg-red-600"
        />
        <StatCard
          title="Admins"
          value={stats.admins}
          icon={<FaUserTie className="w-full h-full" />}
          color="bg-purple-600"
        />
        <StatCard
          title="employees Members"
          value={stats.employees}
          icon={<FaUser className="w-full h-full" />}
          color="bg-green-600"
        />
        <StatCard
          title="Students"
          value={stats.students}
          icon={<FaUser className="w-full h-full" />}
          color="bg-indigo-600"
        />
        <StatCard
          title="Active Users"
          value={stats.activeUsers}
          icon={<FaUserCheck className="w-full h-full" />}
          color="bg-emerald-600"
          subtitle={`${Math.round((stats.activeUsers / stats.totalUsers) * 100)}% of total`}
        />
        <StatCard
          title="Blocked Users"
          value={stats.blockedUsers}
          icon={<FaUserTimes className="w-full h-full" />}
          color="bg-red-500"
          subtitle={`${Math.round((stats.blockedUsers / stats.totalUsers) * 100)}% of total`}
        />
        <StatCard
          title="Recent Logins"
          value={stats.recentLogins}
          icon={<FaCalendarAlt className="w-full h-full" />}
          color="bg-orange-600"
          subtitle="Last 7 days"
        />
      </div>

      {/* User Distribution Chart */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">User Distribution</h2>
        <div className="space-y-3 sm:space-y-4">
          {[
            { label: 'Super Admins', value: stats.superAdmins, color: 'bg-red-500', percentage: Math.round((stats.superAdmins / stats.totalUsers) * 100) },
            { label: 'Admins', value: stats.admins, color: 'bg-purple-500', percentage: Math.round((stats.admins / stats.totalUsers) * 100) },
            { label: 'employees', value: stats.employees, color: 'bg-green-500', percentage: Math.round((stats.employees / stats.totalUsers) * 100) },
            { label: 'Students', value: stats.students, color: 'bg-indigo-500', percentage: Math.round((stats.students / stats.totalUsers) * 100) }
          ].map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className={`w-3 h-3 sm:w-4 sm:h-4 rounded ${item.color}`}></div>
                <span className="text-xs sm:text-sm font-medium text-gray-700">{item.label}</span>
              </div>
              <div className="flex items-center gap-2 sm:gap-4">
                <span className="text-xs sm:text-sm text-gray-600">{item.value} users</span>
                <span className="text-xs sm:text-sm font-medium text-gray-900 w-10 sm:w-12 text-right">{item.percentage}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">Recent Activity</h2>
        <div className="space-y-3 sm:space-y-4">
          {stats.recentActivity && stats.recentActivity.length > 0 ? (
            stats.recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center justify-between py-2 sm:py-3 border-b border-gray-100 last:border-b-0 flex-wrap gap-2">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <FaUser className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">{activity.action}</p>
                    <p className="text-[10px] sm:text-xs text-gray-500 truncate">{activity.user} • {new Date(activity.timestamp).toLocaleString()}</p>
                  </div>
                </div>
                <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs rounded-full flex-shrink-0 ${
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
            <p className="text-gray-500 text-center py-6 sm:py-8 text-sm">No recent activity</p>
          )}
        </div>
      </div>

      {/* System Health */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">System Health</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="text-center">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
              <FaUserCheck className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
            </div>
            <p className="text-xs sm:text-sm font-medium text-gray-900">Active Users</p>
            <p className="text-xl sm:text-2xl font-bold text-green-600">{stats.activeUsers}</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
              <FaUserTimes className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-600" />
            </div>
            <p className="text-xs sm:text-sm font-medium text-gray-900">Blocked Users</p>
            <p className="text-xl sm:text-2xl font-bold text-yellow-600">{stats.blockedUsers}</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
              <FaCalendarAlt className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
            </div>
            <p className="text-xs sm:text-sm font-medium text-gray-900">Recent Logins</p>
            <p className="text-xl sm:text-2xl font-bold text-blue-600">{stats.recentLogins}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminStats;