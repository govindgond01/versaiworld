import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../../services/api';
import { toast } from 'react-hot-toast';
import { 
  FaIndianRupeeSign,
  FaUserGraduate
} from 'react-icons/fa6';
import { 
  FiUsers, 
  FiTrendingUp,
  FiClock,
  FiArrowRight
} from 'react-icons/fi';
import Loader from '../../../components/common/Loader';
import { 
  MdLocalLibrary,
  MdPayments,
  MdWarning
} from 'react-icons/md';
import { 
  BsCalendarCheck,
  BsPersonWorkspace,
  BsPersonBadge
} from 'react-icons/bs';
import { 
  GiTeacher,
  GiPayMoney
} from 'react-icons/gi';
import { 
  RiGovernmentLine
} from 'react-icons/ri';

const PaymentsDashboard = () => {
  const [summary, setSummary] = useState({
    financials: {
      totalPaidFees: 0,
      totalDueFees: 0,
      totalPaidSalary: 0,
      totalDueSalary: 0
    },
    payments: {
      today: 0,
      thisMonth: 0
    }
  });
  const [duePayments, setDuePayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [summaryRes, dueRes] = await Promise.all([
        api.get('/payments/summary'),
        api.get('/payments/due-payments?category=all')
      ]);
      
      setSummary(summaryRes.data.summary || {
        financials: {
          totalPaidFees: 0,
          totalDueFees: 0,
          totalPaidSalary: 0,
          totalDueSalary: 0
        },
        payments: {
          today: 0,
          thisMonth: 0
        }
      });
      
      setDuePayments(dueRes.data.users || []);
    } catch (error) {
      console.error('Dashboard error:', error);
      toast.error('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return '₹0';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader type="spinner" size="large" />
          <p className="mt-3 text-sm text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const totalCollection = (summary?.financials?.totalPaidFees || 0) + (summary?.financials?.totalPaidSalary || 0);
  const totalDue = (summary?.financials?.totalDueFees || 0) + (summary?.financials?.totalDueSalary || 0);

  const statCards = [
    {
      title: 'Total Collection',
      value: totalCollection,
      icon: <FaIndianRupeeSign className="w-6 h-6 text-blue-600" />,
      bg: 'bg-blue-100',
      desc: 'All time payments'
    },
    {
      title: 'Total Due',
      value: totalDue,
      icon: <FiClock className="w-6 h-6 text-yellow-600" />,
      bg: 'bg-yellow-100',
      desc: 'Pending payments'
    },
    {
      title: "Today's Payments",
      value: summary?.payments?.today || 0,
      icon: <BsCalendarCheck className="w-6 h-6 text-green-600" />,
      bg: 'bg-green-100',
      desc: 'Transactions today'
    },
    {
      title: 'This Month',
      value: summary?.payments?.thisMonth || 0,
      icon: <MdPayments className="w-6 h-6 text-purple-600" />,
      bg: 'bg-purple-100',
      desc: 'Monthly transactions'
    }
  ];

  const categories = [
    { 
      title: 'Academy', 
      path: 'academy', 
      icon: <GiTeacher className="w-8 h-8 text-white" />,
      color: 'bg-blue-600',
      lightBg: 'bg-blue-50',
      text: 'text-blue-700',
      count: summary?.financials?.totalDueFees || 0,
      desc: 'Student course fees',
      icon2: <FaUserGraduate className="w-5 h-5" />
    },
    { 
      title: 'Library', 
      path: 'library', 
      icon: <MdLocalLibrary className="w-8 h-8 text-white" />,
      color: 'bg-green-600',
      lightBg: 'bg-green-50',
      text: 'text-green-700',
      count: summary?.financials?.totalDueFees || 0,
      desc: 'Library membership',
      icon2: <BsPersonBadge className="w-5 h-5" />
    },
    { 
      title: 'Staff', 
      path: 'staff', 
      icon: <RiGovernmentLine className="w-8 h-8 text-white" />,
      color: 'bg-purple-600',
      lightBg: 'bg-purple-50',
      text: 'text-purple-700',
      count: summary?.financials?.totalDueSalary || 0,
      desc: 'Staff salaries',
      icon2: <BsPersonWorkspace className="w-5 h-5" />
    }
  ];

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl shadow-md">
            <FaIndianRupeeSign className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Payments Dashboard</h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">Overview of all payment activities</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg w-fit shadow-sm">
          <span className="text-xs sm:text-sm font-medium text-gray-700">Admin</span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {statCards.map((card, idx) => (
          <div key={idx} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 sm:p-6 hover:shadow-md transition-all duration-200">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-xs sm:text-sm text-gray-600">{card.title}</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{formatCurrency(card.value)}</p>
                <p className="text-xs text-gray-500">{card.desc}</p>
              </div>
              <div className={`p-2.5 sm:p-3 rounded-xl ${card.bg}`}>
                {card.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Category Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
        {categories.map((cat) => (
          <Link
            key={cat.path}
            to={`/admin-dashboard/payments/${cat.path}`}
            className="group bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden"
          >
            <div className="p-5 sm:p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-lg ${cat.lightBg}`}>
                      <span className={cat.text}>{cat.icon2}</span>
                    </div>
                    <p className="text-sm font-medium text-gray-700">{cat.title}</p>
                  </div>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-2">
                    {formatCurrency(cat.count)}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1">{cat.desc}</p>
                </div>
                <div className={`p-3 sm:p-4 rounded-xl ${cat.color} bg-opacity-10 group-hover:scale-110 transition-transform duration-300`}>
                  <span className="text-2xl sm:text-3xl">{cat.icon}</span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end">
                <span className="inline-flex items-center gap-1 text-xs sm:text-sm font-medium text-blue-600 group-hover:text-blue-700">
                  Manage
                  <FiArrowRight className="w-3 h-3 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Actions - Original Cards Restored */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 sm:mb-5">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/admin-dashboard/payments/add"
            className="p-5 border-2 border-dashed border-gray-300 rounded-xl text-center hover:border-blue-500 hover:bg-blue-50/50 transition-all duration-200 group"
          >
            <div className="flex flex-col items-center gap-2">
              <div className="p-3 bg-blue-100 rounded-full group-hover:scale-110 transition-transform">
                <GiPayMoney className="w-6 h-6 text-blue-600" />
              </div>
              <span className="font-semibold text-gray-900">Record Payment</span>
              <span className="text-xs sm:text-sm text-gray-500">Add new payment</span>
            </div>
          </Link>
          
          <Link
            to="/admin-dashboard/payments/history"
            className="p-5 border-2 border-dashed border-gray-300 rounded-xl text-center hover:border-green-500 hover:bg-green-50/50 transition-all duration-200 group"
          >
            <div className="flex flex-col items-center gap-2">
              <div className="p-3 bg-green-100 rounded-full group-hover:scale-110 transition-transform">
                <MdPayments className="w-6 h-6 text-green-600" />
              </div>
              <span className="font-semibold text-gray-900">View History</span>
              <span className="text-xs sm:text-sm text-gray-500">All payment records</span>
            </div>
          </Link>
          
          <Link
            to="/admin-dashboard/payments/due-payments"
            className="p-5 border-2 border-dashed border-gray-300 rounded-xl text-center hover:border-yellow-500 hover:bg-yellow-50/50 transition-all duration-200 group"
          >
            <div className="flex flex-col items-center gap-2">
              <div className="p-3 bg-yellow-100 rounded-full group-hover:scale-110 transition-transform">
                <MdWarning className="w-6 h-6 text-yellow-600" />
              </div>
              <span className="font-semibold text-gray-900">Due Payments</span>
              <span className="text-xs sm:text-sm text-gray-500">Pending collections</span>
            </div>
          </Link>
        </div>
      </div>

      {/* Recent Due Payments */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 sm:px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-red-100 rounded-lg">
              <MdWarning className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">Pending Due Payments</h3>
          </div>
          <Link 
            to="/admin-dashboard/payments/due-payments" 
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors w-fit"
          >
            View All
            <FiArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
          </Link>
        </div>
        
        <div className="p-5 sm:p-6">
          {duePayments.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl sm:text-4xl"></span>
              </div>
              <p className="text-sm sm:text-base font-medium text-gray-900">No pending due payments</p>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">All members are up to date!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {duePayments.slice(0, 5).map(user => (
                <div key={user._id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-white border border-gray-200 rounded-xl hover:border-gray-300 hover:shadow-sm transition-all gap-4">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      user.userType === 'staff' ? 'bg-purple-100' : 'bg-blue-100'
                    }`}>
                      {user.userType === 'staff' ? 
                        <BsPersonWorkspace className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" /> : 
                        <FaUserGraduate className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                      }
                    </div>
                    <div>
                      <p className="text-sm sm:text-base font-semibold text-gray-900">{user.name}</p>
                      <p className="text-xs sm:text-sm text-gray-600 mt-0.5">{user.userId} • {user.email}</p>
                      <p className="text-xs text-gray-500 mt-1 capitalize flex items-center gap-1">
                        <span className={`px-2 py-0.5 rounded-full text-xs ${
                          user.userType === 'staff' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {user.userType === 'staff' ? user.staffRole : user.studentCategory}
                        </span>
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 sm:gap-1 ml-13 sm:ml-0">
                    <div>
                      <p className="text-xs text-gray-500">Due Amount</p>
                      <p className="text-lg sm:text-xl font-bold text-red-600">{formatCurrency(user.dueAmount)}</p>
                    </div>
                    <Link
                      to={`/admin-dashboard/payments/${user.userType === 'staff' ? 'staff' : user.studentCategory}`}
                      className="inline-flex items-center gap-1 text-xs sm:text-sm font-medium text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      Pay Now
                      <FiArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ))}
              
              {duePayments.length > 5 && (
                <div className="text-center pt-4">
                  <Link 
                    to="/admin-dashboard/payments/due-payments" 
                    className="inline-flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-gray-900"
                  >
                    View all {duePayments.length} due payments
                    <FiArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentsDashboard;