import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaRupeeSign } from 'react-icons/fa';
import { FiUsers, FiUserCheck, FiAlertCircle, FiTrendingUp, FiClock, FiCreditCard, FiRefreshCw, FiCalendar, FiArrowRight } from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { toast } from 'react-hot-toast';
import api from '../../services/api';
import Loader from '../../components/common/Loader';

const AdminLibraryDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    stats: {},
    recent: [],
    expiring: [],
    categories: [],
  });

  const fetchData = async () => {
    try {
      setLoading(true);

      const [studentsRes, statsRes] = await Promise.all([
        api.get('/admin/students?studentCategory=library&status=active&limit=7'),
        api.get('/admin/students/stats')
      ]);

      const students = studentsRes.data?.students || [];
      const stats = statsRes.data || {};

      const libraryCategories = stats.categories?.filter(cat =>
        cat._id === 'library' || cat.name === 'library'
      ) || [];

      const libraryCourses = stats.courses || [];
      const libraryDepartments = stats.departments || [];

      const totalStudents = students.length;
      const activeStudents = students.filter(s => s.status === 'active').length;

      const expiringStudents = students
        .filter(s => s.expiryDate && new Date(s.expiryDate) > new Date())
        .slice(0, 4);

      const expiringCount = expiringStudents.length;

      const pendingFees = students.reduce((sum, s) =>
        sum + (s.feesDue || s.financials?.due || 0), 0
      );

      const monthlyRevenue = students.reduce((sum, s) =>
        sum + (s.paidFees || s.financials?.paid || 0), 0
      );

      setData({
        stats: {
          totalStudents,
          activeStudents,
          expiringCount,
          pendingFees,
          monthlyRevenue
        },
        recent: students.slice(0, 7),
        expiring: expiringStudents,
        categories: libraryCategories,
        courses: libraryCourses,
        departments: libraryDepartments
      });

      toast.success('Library dashboard loaded successfully!');
    } catch (error) {
      console.error('Library Dashboard Error:', error.response || error);
      toast.error('Failed to load library dashboard');

      setData({
        stats: { totalStudents: 0, activeStudents: 0, expiringCount: 0, pendingFees: 0, monthlyRevenue: 0 },
        recent: [],
        expiring: [],
        categories: [],
        courses: [],
        departments: []
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const statsCards = [
    {
      title: "Total Members",
      value: data.stats.totalStudents || 0,
      icon: <FiUsers className="text-2xl" />,
      color: "bg-blue-500",
      change: "+12%",
      desc: "All library members"
    },
    {
      title: "Active Members",
      value: data.stats.activeStudents || 0,
      icon: <FiUserCheck className="text-2xl" />,
      color: "bg-green-500",
      change: "+5",
      desc: "Active library members"
    },
    {
      title: "Pending Fees",
      value: `₹${(data.stats.pendingFees || 0).toLocaleString('en-IN')}`,
      icon: <FaRupeeSign className="text-2xl" />,
      color: "bg-yellow-500",
      change: "Pending",
      desc: "Library fees due"
    },
    {
      title: "Expiring Soon",
      value: data.stats.expiringCount || 0,
      icon: <FiAlertCircle className="text-2xl" />,
      color: "bg-red-500",
      change: `${data.stats.expiringCount || 0} due`,
      desc: "Library memberships expiring"
    }
  ];

  const quickStats = [
    {
      title: 'Monthly Revenue',
      value: `₹${(data.stats.monthlyRevenue || 0).toLocaleString('en-IN')}`,
      desc: 'Library revenue this month',
      icon: <FiTrendingUp />,
      color: 'bg-blue-50 text-blue-600'
    },
    {
      title: 'Active Members',
      value: data.stats.activeStudents || 0,
      desc: 'Currently active',
      icon: <FiClock />,
      color: 'bg-green-50 text-green-600'
    },
    {
      title: 'Courses',
      value: data.courses?.length || 0,
      desc: 'Different courses',
      icon: <FiCreditCard />,
      color: 'bg-purple-50 text-purple-600'
    }
  ];

  if (loading) return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <Loader type="spinner" size="large" />
        <p className="mt-4 text-gray-600">Loading library dashboard...</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Library Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">Managing library members and subscriptions</p>
        </div>
        <button onClick={fetchData} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          {loading ? <Loader type="inline" size="small" /> : <FiRefreshCw />}
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {statsCards.map((stat, i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${stat.color} text-white`}>{stat.icon}</div>
              <div className="text-right">
                <h3 className="text-2xl font-bold">{stat.value}</h3>
                <p className="text-sm text-gray-500">{stat.title}</p>
              </div>
            </div>
            <div className="text-sm">
              <span className={`font-medium ${
                stat.color.includes('red') ? 'text-red-600' :
                stat.color.includes('yellow') ? 'text-yellow-600' :
                'text-green-600'
              }`}>
                {stat.change}
              </span>
              <p className="text-gray-500 mt-1">{stat.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Library Monthly Revenue</h3>
          <div className="min-h-[300px]">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={[{month: new Date().toLocaleString('default', { month: 'short' }), revenue: data.stats.monthlyRevenue || 0}]}>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`₹${value}`, 'Amount']} />
                <Bar dataKey="revenue" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Library Courses</h3>
          <div className="min-h-[300px]">
            {data.courses?.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={data.courses.map((course, i) => ({
                      name: course._id || `Course ${i+1}`,
                      value: course.count || 0,
                      color: i === 0 ? '#3B82F6' : i === 1 ? '#10B981' : '#8B5CF6'
                    }))}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(e) => `${e.name} (${e.value})`}
                    outerRadius={70}
                    innerRadius={30}
                    dataKey="value"
                  >
                    {data.courses.map((_, i) => (
                      <Cell key={i} fill={i === 0 ? '#3B82F6' : i === 1 ? '#10B981' : '#8B5CF6'} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} members`, 'Count']} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">
                No course data available
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6">
            <div className="flex justify-between items-center mb-4 md:mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-800">Recent Library Members</h2>
                <p className="text-sm text-gray-500 mt-1">Latest library enrollments</p>
              </div>
              <button
                onClick={() => navigate('/admin-dashboard/students?studentCategory=library')}
                className="px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-sm"
              >
                View All →
              </button>
            </div>
            <div className="space-y-3">
              {data.recent.length > 0 ? (
                data.recent.map((member, i) => (
                  <div key={i} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold mr-4">
                        {member.name?.charAt(0) || 'M'}
                      </div>
                      <div>
                        <p className="font-semibold">{member.name || member.userId}</p>
                        <div className="flex items-center text-sm text-gray-500">
                          <FiCalendar className="mr-1" size={12} />
                          <span>{member.admissionDate ? new Date(member.admissionDate).toLocaleDateString() : 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs ${
                        member.status === 'active' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {member.status || 'active'}
                      </span>
                      <FiArrowRight className="text-blue-600" />
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No library members found
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4 md:space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6">
            <div className="flex justify-between items-center mb-4 md:mb-6">
              <h2 className="text-xl font-bold text-gray-800">Upcoming Renewals</h2>
              <span className="px-3 py-1 bg-red-50 text-red-700 rounded-full text-sm">
                {data.expiring.length} Due
              </span>
            </div>
            <div className="space-y-4">
              {data.expiring.length > 0 ? (
                data.expiring.map((student, i) => (
                  <div key={i} className="p-4 border border-red-200 bg-red-50 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-semibold">{student.name || student.userId}</p>
                      <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs">Due</span>
                    </div>
                    <div className="flex justify-between items-center text-sm text-gray-600 mb-3">
                      <span>Expires: {student.expiryDate ? new Date(student.expiryDate).toLocaleDateString() : 'N/A'}</span>
                      <span className="font-bold">₹{student.feesDue || 0}</span>
                    </div>
                    <button className="w-full py-2 bg-white border border-blue-500 text-blue-600 hover:bg-blue-50 rounded-lg">
                      Send Reminder
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-gray-500">
                  No upcoming renewals
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 md:mb-6">Library Quick Stats</h2>
            <div className="space-y-4">
              {quickStats.map((stat, i) => (
                <div key={i} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center">
                    <div className={`p-2 rounded-lg mr-3 ${stat.color}`}>{stat.icon}</div>
                    <div>
                      <p className="font-medium">{stat.title}</p>
                      <p className="text-sm text-gray-500">{stat.desc}</p>
                    </div>
                  </div>
                  <span className="font-bold text-lg">{stat.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLibraryDashboard;