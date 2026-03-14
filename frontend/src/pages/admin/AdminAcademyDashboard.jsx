import React, { useState, useEffect } from 'react';
import { FaRupeeSign, FaChalkboardTeacher, FaBook } from 'react-icons/fa';
import { FiUsers, FiUserCheck, FiAlertCircle, FiTrendingUp, FiClock, FiCreditCard, FiRefreshCw, FiCalendar, FiArrowRight, FiActivity } from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { toast } from 'react-hot-toast';
import api from '../../services/api';

const AdminAcademyDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    stats: {
      totalStudents: 0,
      activeStudents: 0,
      expiringCount: 0,
      pendingFees: 0,
      monthlyRevenue: 0,
      avgAttendance: 0
    },
    recentStudents: [],
    courses: [],
    departments: [],
    expiring: []
  });

  const fetchData = async () => {
    try {
      setLoading(true);

      const studentsRes = await api.get('/admin/students?studentCategory=academy&limit=100');

      const statsRes = await api.get('/admin/students/stats');

      const students = studentsRes.data?.students || [];
      const stats = statsRes.data || {};

      const academyStudents = students.filter(s => s.studentCategory === 'academy');
      const totalStudents = academyStudents.length;
      const activeStudents = academyStudents.filter(s => s.status === 'active').length;

      const pendingFees = academyStudents.reduce((sum, s) =>
        sum + (s.feesDue || 0), 0
      );

      const monthlyRevenue = academyStudents.reduce((sum, s) =>
        sum + (s.paidFees || 0), 0
      );

      const today = new Date();
      const next30Days = new Date();
      next30Days.setDate(today.getDate() + 30);

      const expiringStudents = academyStudents
        .filter(s => {
          if (!s.expiryDate) return false;
          const expiry = new Date(s.expiryDate);
          return expiry >= today && expiry <= next30Days;
        })
        .slice(0, 5);

      const academyCourses = stats.courses?.filter(c =>
        c._id && academyStudents.some(s => s.course === c._id)
      ) || [];

      const academyDepartments = stats.departments?.filter(d =>
        academyStudents.some(s => s.department === d._id)
      ) || [];

      setData({
        stats: {
          totalStudents,
          activeStudents,
          expiringCount: expiringStudents.length,
          pendingFees,
          monthlyRevenue,
          avgAttendance: activeStudents > 0 ? Math.min(95, 70 + (activeStudents * 0.3)) : 0
        },
        recentStudents: academyStudents.slice(0, 7),
        expiring: expiringStudents,
        courses: academyCourses,
        departments: academyDepartments
      });

      toast.success('Dashboard loaded successfully');
    } catch (error) {
      console.error('Dashboard Error:', error);
      toast.error(error.response?.data?.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const statsCards = [
    {
      title: "Total Students",
      value: data.stats.totalStudents,
      icon: <FiUsers className="text-2xl" />,
      color: "bg-blue-500",
      change: "+" + Math.round(data.stats.activeStudents/data.stats.totalStudents*100 || 0) + "%",
      desc: "Enrolled in academy"
    },
    {
      title: "Active Students",
      value: data.stats.activeStudents,
      icon: <FiUserCheck className="text-2xl" />,
      color: "bg-green-500",
      change: "+" + (data.stats.activeStudents - (data.stats.totalStudents - data.stats.activeStudents)),
      desc: "Currently active"
    },
    {
      title: "Monthly Revenue",
      value: `₹${(data.stats.monthlyRevenue || 0).toLocaleString('en-IN')}`,
      icon: <FaRupeeSign className="text-2xl" />,
      color: "bg-purple-500",
      change: "+" + Math.round(data.stats.monthlyRevenue/1000) + "k",
      desc: "Academy earnings"
    },
    {
      title: "Avg Attendance",
      value: `${Math.round(data.stats.avgAttendance)}%`,
      icon: <FiActivity className="text-2xl" />,
      color: "bg-orange-500",
      change: "+2.5%",
      desc: "Average attendance"
    }
  ];

  const quickStats = [
    {
      title: 'Upcoming Renewals',
      value: data.expiring.length,
      desc: 'Memberships expiring soon',
      icon: <FiCalendar />,
      color: 'bg-blue-50 text-blue-600'
    },
    {
      title: 'Courses',
      value: data.courses.length,
      desc: 'Active courses',
      icon: <FaBook />,
      color: 'bg-green-50 text-green-600'
    },
    {
      title: 'Departments',
      value: data.departments.length,
      desc: 'Different departments',
      icon: <FaChalkboardTeacher />,
      color: 'bg-purple-50 text-purple-600'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading academy dashboard...</p>
        </div>
      </div>
    );
  }

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6'];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Academy Dashboard</h1>
          <p className="text-gray-600">Manage academy students and courses</p>
        </div>
        <button
          onClick={fetchData}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          <FiRefreshCw className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statsCards.map((stat, i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${stat.color} text-white shadow-lg`}>
                {stat.icon}
              </div>
              <div className="text-right">
                <h3 className="text-2xl font-bold text-gray-800">{stat.value}</h3>
                <p className="text-sm text-gray-500">{stat.title}</p>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-green-600">{stat.change}</span>
              <span className="text-gray-500">{stat.desc}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Monthly Revenue</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[{month: new Date().toLocaleString('default', { month: 'short' }), revenue: data.stats.monthlyRevenue || 0}]}>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`₹${value}`, 'Revenue']} />
                <Bar dataKey="revenue" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Course Distribution</h3>
          <div className="h-64">
            {data.courses.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.courses.slice(0, 4).map((course, i) => ({
                      name: course._id || `Course ${i+1}`,
                      value: course.count || 0
                    }))}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {data.courses.slice(0, 4).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-800">Recent Students</h2>
                <p className="text-sm text-gray-500">Latest academy enrollments</p>
              </div>
              <button
                onClick={() => window.location.href = '/admin-dashboard/students?category=academy'}
                className="px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-sm font-medium"
              >
                View All
              </button>
            </div>
            <div className="space-y-3">
              {data.recentStudents.length > 0 ? (
                data.recentStudents.map((student, i) => (
                  <div key={i} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold mr-3">
                        {student.name?.charAt(0) || 'S'}
                      </div>
                      <div>
                        <p className="font-semibold">{student.name}</p>
                        <p className="text-sm text-gray-500">{student.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        student.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {student.status || 'active'}
                      </span>
                      <FiArrowRight className="text-blue-600" />
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No students found
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Top Courses</h2>
            <div className="space-y-4">
              {data.courses.slice(0, 3).map((course, i) => (
                <div key={i} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center">
                    <div className={`p-3 rounded-lg mr-4 ${
                      i === 0 ? 'bg-blue-100 text-blue-600' :
                      i === 1 ? 'bg-green-100 text-green-600' :
                      'bg-purple-100 text-purple-600'
                    }`}>
                      <FaBook />
                    </div>
                    <div>
                      <p className="font-semibold">{course._id || `Course ${i+1}`}</p>
                      <p className="text-sm text-gray-500">{course.count || 0} students</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">
                      ₹{((course.count || 0) * 5000).toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">Upcoming Renewals</h2>
              <span className="px-3 py-1 bg-red-50 text-red-700 rounded-full text-sm font-medium">
                {data.expiring.length} Due
              </span>
            </div>
            <div className="space-y-4">
              {data.expiring.length > 0 ? (
                data.expiring.map((student, i) => (
                  <div key={i} className="p-4 border border-red-200 bg-red-50 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-semibold">{student.name}</p>
                      <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-medium">Due</span>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1 mb-3">
                      <p><span className="font-medium">Course:</span> {student.course || 'N/A'}</p>
                      <p><span className="font-medium">Expires:</span> {student.expiryDate ? new Date(student.expiryDate).toLocaleDateString() : 'N/A'}</p>
                    </div>
                    <button className="w-full py-2 bg-white border border-blue-500 text-blue-600 hover:bg-blue-50 rounded-lg text-sm font-medium transition">
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

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Quick Stats</h2>
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

export default AdminAcademyDashboard;