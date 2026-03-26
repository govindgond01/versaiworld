import React, { useState, useEffect } from 'react';
import {
  FaUsers, FaUserTie, FaRupeeSign, FaBuilding,
  FaEnvelope, FaPhone, FaCalendar
} from 'react-icons/fa';
import {
  FiUsers, FiUserCheck, FiTrendingUp, FiCreditCard,
  FiRefreshCw, FiArrowRight, FiActivity
} from 'react-icons/fi';
import {
  MdLocalLibrary, MdWarning, MdPerson, MdWork
} from 'react-icons/md';
import {
  BsPersonWorkspace, BsCashStack, BsClock
} from 'react-icons/bs';
import Loader from '../../components/common/Loader';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const AdminEmployeesDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalemployees: 0,
    activeemployees: 0,
    inactiveemployees: 0,
    totalSalary: 0,
    paidSalary: 0,
    dueSalary: 0,
    avgSalary: 0
  });
  const [recentemployees, setRecentemployees] = useState([]);
  const [roles, setRoles] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [activeemployeesList, setActiveemployeesList] = useState([]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const response = await api.get('/employees/dashboard-stats');

      if (response.data.success) {
        const data = response.data;
        setStats(data.stats || {
          totalemployees: 0, activeemployees: 0, inactiveemployees: 0,
          totalSalary: 0, paidSalary: 0, dueSalary: 0, avgSalary: 0
        });
        setRecentemployees(Array.isArray(data.recentemployees) ? data.recentemployees : []);
        setRoles(Array.isArray(data.roles) ? data.roles : []);
        setDepartments(Array.isArray(data.departments) ? data.departments : []);
        setActiveemployeesList(Array.isArray(data.activeemployeesList) ? data.activeemployeesList : []);

        toast.success('Dashboard data loaded successfully!');
      } else {
        toast.error('Failed to load dashboard data');
      }
    } catch (error) {
      console.error('Dashboard error:', error);
      toast.error('Error loading dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const getRoleIcon = (role) => {
    switch(role) {
      case 'teacher': return <FaUserTie className="text-lg" />;
      case 'librarian': return <MdLocalLibrary className="text-lg" />;
      case 'accountant': return <BsCashStack className="text-lg" />;
      case 'admin': return <FaUserTie className="text-lg" />;
      default: return <BsPersonWorkspace className="text-lg" />;
    }
  };

  const getRoleColor = (role) => {
    switch(role) {
      case 'teacher': return 'bg-blue-100 text-blue-800';
      case 'librarian': return 'bg-purple-100 text-purple-800';
      case 'accountant': return 'bg-green-100 text-green-800';
      case 'admin': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amt) => {
    if (!amt && amt !== 0) return '₹0';
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(amt);
  };

  if (loading) return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <Loader type="spinner" size="large" />
        <p className="mt-4 text-gray-600">Loading employees dashboard...</p>
      </div>
    </div>
  );

  const statsCards = [
    { title: "Total employees", value: stats.totalemployees, icon: <FiUsers className="text-2xl" />, color: "bg-blue-500", bg: "bg-blue-100", text: "text-blue-600" },
    { title: "Active employees", value: stats.activeemployees, icon: <FiUserCheck className="text-2xl" />, color: "bg-green-500", bg: "bg-green-100", text: "text-green-600" },
    { title: "Total Salary", value: formatCurrency(stats.totalSalary), icon: <FaRupeeSign className="text-2xl" />, color: "bg-purple-500", bg: "bg-purple-100", text: "text-purple-600" },
    { title: "Avg Salary", value: formatCurrency(stats.avgSalary), icon: <FaRupeeSign className="text-2xl" />, color: "bg-orange-500", bg: "bg-orange-100", text: "text-orange-600" }
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">employees Management Dashboard</h1>
          <p className="text-gray-600 mt-1">Overview of all employees members and their details</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={fetchDashboardData}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            {loading ? <Loader type="inline" size="small" /> : <FiRefreshCw />}
            Refresh
          </button>
          <button
            onClick={() => navigate('/admin/employees/add')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <FaUserTie /> Add employees
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {statsCards.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">{stat.title}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-lg ${stat.color} text-white`}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Salary Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {[
          { title: 'Paid Salary', value: formatCurrency(stats.paidSalary), icon: <FiTrendingUp />, bg: 'bg-green-50', text: 'text-green-600' },
          { title: 'Due Salary', value: formatCurrency(stats.dueSalary), icon: <MdWarning />, bg: 'bg-red-50', text: 'text-red-600' },
          { title: 'Departments', value: departments.length, icon: <FaBuilding />, bg: 'bg-blue-50', text: 'text-blue-600' }
        ].map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">{stat.title}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-lg ${stat.bg} ${stat.text}`}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Recent employees */}
        <div className="lg:col-span-2 space-y-4 md:space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
            <div className="flex justify-between items-center mb-4 md:mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-800">Recent employees Members</h2>
                <p className="text-gray-600 text-sm">Latest employees additions</p>
              </div>
              <button
                onClick={() => navigate('/admin/employees')}
                className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
              >
                View All <FiArrowRight />
              </button>
            </div>

            <div className="space-y-4">
              {recentemployees.length > 0 ? (
                recentemployees.map((employees, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="font-bold text-blue-600">
                          {employees.name?.charAt(0) || 'S'}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold">{employees.name}</p>
                        <p className="text-gray-500 text-sm">{employees.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <span className={`px-3 py-1 rounded-full text-xs ${getRoleColor(employees.employeesRole)}`}>
                        {getRoleIcon(employees.employeesRole)} {employees.employeesRole}
                      </span>
                      <span className="font-bold">{formatCurrency(employees.salary)}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No employees members found
                </div>
              )}
            </div>
          </div>

          {/* Departments */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 md:mb-6">Departments</h2>
            <div className="space-y-4">
              {departments.length > 0 ? (
                departments.map((dept, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center">
                      <FaBuilding className="text-gray-400 mr-3" />
                      <div>
                        <p className="font-medium">{dept._id}</p>
                        <p className="text-gray-500 text-sm">{dept.count} employees members</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-bold">{dept.count}</span>
                      <p className="text-gray-500 text-sm">employees</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-gray-500">
                  No department data
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-4 md:space-y-6">
          {/* Active employees */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
            <div className="flex justify-between items-center mb-4 md:mb-6">
              <h2 className="text-xl font-bold text-gray-800">Active employees</h2>
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                {activeemployeesList.length} Active
              </span>
            </div>

            <div className="space-y-4">
              {activeemployeesList.length > 0 ? (
                activeemployeesList.map((employees, index) => (
                  <div key={index} className="p-3 border border-green-200 bg-green-50 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-semibold">{employees.name}</p>
                      <span className={`px-2 py-1 rounded text-xs ${getRoleColor(employees.employeesRole)}`}>
                        {employees.employeesRole}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div className="flex items-center">
                        <FaEnvelope className="mr-2" size={12} />
                        <span>{employees.email}</span>
                      </div>
                      <div className="flex items-center">
                        <FaBuilding className="mr-2" size={12} />
                        <span>{employees.department || 'General'}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-gray-500">
                  No active employees
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 md:mb-6">Quick Actions</h2>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/admin/employees/add')}
                className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                + Add New employees
              </button>
              <button
                onClick={() => navigate('/admin/employees')}
                className="w-full py-3 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 font-medium"
              >
                View All employees
              </button>
              <button
                onClick={() => navigate('/admin/employees/analytics')}
                className="w-full py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
              >
                View Detailed Stats
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminEmployeesDashboard;