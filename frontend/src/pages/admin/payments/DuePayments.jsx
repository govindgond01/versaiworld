import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { 
  FiSearch, FiFilter, FiDownload, FiArrowRight, FiUsers, FiClock 
} from 'react-icons/fi';
import { 
  MdWarning, MdPayments, MdLocalLibrary 
} from 'react-icons/md';
import { 
  FaIndianRupeeSign, FaUserGraduate, FaSpinner 
} from 'react-icons/fa6';
import { 
  BsPersonWorkspace, BsPersonBadge, BsCalendar, BsCashStack 
} from 'react-icons/bs';
import { 
  GiTeacher, GiPayMoney 
} from 'react-icons/gi';
import { 
  RiGovernmentLine 
} from 'react-icons/ri';

const DuePayments = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ category: 'all', search: '' });
  const [stats, setStats] = useState({ totalDue: 0, totalUsers: 0 });

  useEffect(() => { fetchDuePayments(); }, [filters.category]);

  const fetchDuePayments = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`/api/payments/due-payments?category=${filters.category}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const usersData = res.data.users || [];
      setUsers(usersData);
      setStats({
        totalDue: usersData.reduce((sum, u) => sum + (u.dueAmount || 0), 0),
        totalUsers: usersData.length
      });
    } catch (error) {
      toast.error('Failed to fetch due payments');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return '₹0';
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(amount);
  };

  const filteredUsers = users.filter(u => 
    [u.name, u.email, u.userId].some(field => 
      field?.toLowerCase().includes(filters.search.toLowerCase())
    )
  );

  const handleExport = () => {
    const csvData = filteredUsers.map(u => ({
      'User ID': u.userId || 'N/A',
      'Name': u.name || 'N/A',
      'Email': u.email || 'N/A',
      'Type': u.userType === 'staff' ? u.staffRole : u.studentCategory,
      'Total': u.totalAmount || 0,
      'Paid': u.paidAmount || 0,
      'Due': u.dueAmount || 0
    }));
    const headers = Object.keys(csvData[0] || {}).join(',');
    const rows = csvData.map(obj => Object.values(obj).join(',')).join('\n');
    const blob = new Blob([`${headers}\n${rows}`], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `due-payments-${filters.category}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success('Export started');
  };

  const getCategoryIcon = (cat) => {
    if (cat === 'academy') return <GiTeacher className="w-4 h-4" />;
    if (cat === 'library') return <MdLocalLibrary className="w-4 h-4" />;
    if (cat === 'staff') return <RiGovernmentLine className="w-4 h-4" />;
    return <FiUsers className="w-4 h-4" />;
  };

  const categoryOptions = [
    { value: 'all', label: 'All Categories', icon: <FiUsers className="w-4 h-4" /> },
    { value: 'academy', label: 'Academy', icon: <FaUserGraduate className="w-4 h-4" /> },
    { value: 'library', label: 'Library', icon: <BsPersonBadge className="w-4 h-4" /> },
    { value: 'staff', label: 'Staff', icon: <BsPersonWorkspace className="w-4 h-4" /> }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <FaSpinner className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
          <p className="mt-3 text-sm text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-red-500 to-red-600 rounded-xl">
            <MdWarning className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Due Payments</h1>
            <p className="text-sm text-gray-600 flex items-center gap-1.5 mt-1">
              <FiClock className="w-4 h-4" /> Users with pending payments
            </p>
          </div>
        </div>
        <button
          onClick={handleExport}
          disabled={!filteredUsers.length}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 text-white text-sm font-medium rounded-xl hover:bg-green-700 disabled:opacity-50 w-full sm:w-auto"
        >
          <FiDownload className="w-4 h-4" /> Export CSV
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Due', value: stats.totalDue, icon: <FaIndianRupeeSign className="w-6 h-6" />, bg: 'bg-red-100', text: 'text-red-600', desc: 'Pending collections' },
          { label: 'Users with Due', value: stats.totalUsers, icon: <FiUsers className="w-6 h-6" />, bg: 'bg-blue-100', text: 'text-blue-600', desc: 'Active dues' },
          { label: 'Average Due', value: stats.totalUsers ? stats.totalDue / stats.totalUsers : 0, icon: <BsCashStack className="w-6 h-6" />, bg: 'bg-purple-100', text: 'text-purple-600', desc: 'Per user' }
        ].map((card, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-gray-600">{card.label}</p>
              <p className="text-2xl font-bold mt-1">{card.label.includes('Due') ? formatCurrency(card.value) : card.value}</p>
              <p className="text-xs text-gray-500 mt-1">{card.desc}</p>
            </div>
            <div className={`p-3 rounded-xl ${card.bg}`}>{card.icon}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-medium text-gray-600 flex items-center gap-1 mb-2">
              <FiFilter className="w-3.5 h-3.5" /> Category
            </label>
            <div className="relative">
              <select
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                className="w-full px-4 py-2.5 pl-10 bg-white border border-gray-200 rounded-lg text-sm appearance-none cursor-pointer"
              >
                {categoryOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                {getCategoryIcon(filters.category)}
              </div>
            </div>
          </div>
          <div className="lg:col-span-2">
            <label className="text-xs font-medium text-gray-600 flex items-center gap-1 mb-2">
              <FiSearch className="w-3.5 h-3.5" /> Search
            </label>
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                placeholder="Search by name, email or ID..."
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Users List */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {!filteredUsers.length ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">🎉</span>
            </div>
            <p className="text-lg font-semibold text-gray-900">No pending due payments</p>
            <p className="text-sm text-gray-500 mt-2">All members are up to date!</p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    {['User', 'Type', 'Total', 'Paid', 'Due', 'Last Payment', 'Action'].map(h => (
                      <th key={h} className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredUsers.map(user => (
                    <tr key={user._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${user.userType === 'staff' ? 'bg-purple-100' : 'bg-blue-100'}`}>
                            {user.userType === 'staff' ? <BsPersonWorkspace className="w-4 h-4 text-purple-600" /> : <FaUserGraduate className="w-4 h-4 text-blue-600" />}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{user.name}</p>
                            <p className="text-xs text-gray-500">{user.email}</p>
                            <p className="text-xs text-gray-400">{user.userId}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-full ${
                          user.userType === 'staff' ? 'bg-purple-100 text-purple-700' : 
                          user.studentCategory === 'academy' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                        }`}>
                          {user.userType === 'staff' ? <BsPersonWorkspace className="w-3.5 h-3.5" /> : 
                           user.studentCategory === 'academy' ? <GiTeacher className="w-3.5 h-3.5" /> : <MdLocalLibrary className="w-3.5 h-3.5" />}
                          {user.userType === 'staff' ? user.staffRole || 'Staff' : 
                           user.studentCategory === 'academy' ? 'Academy' : 'Library'}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium">{formatCurrency(user.totalAmount)}</td>
                      <td className="px-6 py-4 text-green-600 font-medium">{formatCurrency(user.paidAmount)}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                          <MdWarning className="w-3.5 h-3.5" /> {formatCurrency(user.dueAmount)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {user.lastPayment ? (
                          <>
                            <span className="font-medium text-gray-900">{formatCurrency(user.lastPayment.amount)}</span>
                            <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                              <BsCalendar className="w-3 h-3" /> {new Date(user.lastPayment.date).toLocaleDateString()}
                            </div>
                          </>
                        ) : <span className="text-xs text-gray-400">No payments</span>}
                      </td>
                      <td className="px-6 py-4">
                        <Link
                          to={`/admin-dashboard/payments/${user.userType === 'staff' ? 'staff' : user.studentCategory}`}
                          className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-50 text-blue-700 text-sm font-medium rounded-lg hover:bg-blue-100"
                        >
                          <GiPayMoney className="w-4 h-4" /> Pay <FiArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden space-y-4 p-4">
              {filteredUsers.map(user => (
                <div key={user._id} className="bg-white border border-gray-200 rounded-xl p-4">
                  <div className="flex items-start gap-3 mb-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${user.userType === 'staff' ? 'bg-purple-100' : 'bg-blue-100'}`}>
                      {user.userType === 'staff' ? <BsPersonWorkspace className="w-5 h-5 text-purple-600" /> : <FaUserGraduate className="w-5 h-5 text-blue-600" />}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-600">{user.email}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{user.userId}</p>
                    </div>
                    <span className={`px-2.5 py-1.5 text-xs font-medium rounded-full flex items-center gap-1 ${
                      user.userType === 'staff' ? 'bg-purple-100 text-purple-700' : 
                      user.studentCategory === 'academy' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                    }`}>
                      {user.userType === 'staff' ? <BsPersonWorkspace className="w-3.5 h-3.5" /> : 
                       user.studentCategory === 'academy' ? <GiTeacher className="w-3.5 h-3.5" /> : <MdLocalLibrary className="w-3.5 h-3.5" />}
                      {user.userType === 'staff' ? user.staffRole || 'Staff' : 
                       user.studentCategory === 'academy' ? 'Academy' : 'Library'}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="bg-gray-50 rounded-lg p-2 text-center">
                      <p className="text-xs text-gray-500">Total</p>
                      <p className="text-sm font-semibold">{formatCurrency(user.totalAmount)}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2 text-center">
                      <p className="text-xs text-gray-500">Paid</p>
                      <p className="text-sm font-semibold text-green-600">{formatCurrency(user.paidAmount)}</p>
                    </div>
                    <div className="bg-red-50 rounded-lg p-2 text-center">
                      <p className="text-xs text-gray-500">Due</p>
                      <p className="text-sm font-semibold text-red-600">{formatCurrency(user.dueAmount)}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Last Payment</p>
                      {user.lastPayment ? (
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{formatCurrency(user.lastPayment.amount)}</span>
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <BsCalendar className="w-3 h-3" /> {new Date(user.lastPayment.date).toLocaleDateString()}
                          </span>
                        </div>
                      ) : <span className="text-xs text-gray-400">No payments</span>}
                    </div>
                    <Link
                      to={`/admin-dashboard/payments/${user.userType === 'staff' ? 'staff' : user.studentCategory}`}
                      className="flex items-center gap-1 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
                    >
                      <GiPayMoney className="w-4 h-4" /> Pay
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t bg-gray-50 flex justify-between items-center">
              <p className="text-sm text-gray-600">
                Showing {filteredUsers.length} of {users.length} users
              </p>
              {filters.search && (
                <button
                  onClick={() => setFilters({ ...filters, search: '' })}
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                >
                  Clear search
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DuePayments;