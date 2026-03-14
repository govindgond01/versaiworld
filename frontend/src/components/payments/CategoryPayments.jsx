import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { toast } from 'react-hot-toast';
import { 
  FiUsers, FiDollarSign, FiCalendar, FiTrendingUp, FiArrowRight, FiX
} from 'react-icons/fi';
import { 
  MdWarning, MdPayments, MdLocalLibrary, MdSchool, MdPerson 
} from 'react-icons/md';
import { 
  FaIndianRupeeSign, FaUserGraduate, FaSpinner, FaUserTie 
} from 'react-icons/fa6';
import { 
  BsPersonWorkspace, BsPersonBadge, BsCashStack, BsClock 
} from 'react-icons/bs';
import { 
  GiTeacher, GiPayMoney 
} from 'react-icons/gi';
import { 
  RiGovernmentLine 
} from 'react-icons/ri';
import PaymentForm from './PaymentForm';

const CategoryPayments = ({ category }) => {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({ totalUsers: 0, totalPaid: 0, totalDue: 0, recentPaymentsCount: 0 });
  const [users, setUsers] = useState([]);
  const [recentPayments, setRecentPayments] = useState([]);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => { if (category) fetchCategoryData(); }, [category]);

  const fetchCategoryData = async () => {
    setLoading(true);
    try {
      const res = await api.get(`payments/category/${category}`);
      const data = res.data;
      setSummary({
        totalUsers: data.summary?.totalUsers || 0,
        totalPaid: data.summary?.totalPaid || 0,
        totalDue: data.summary?.totalDue || 0,
        recentPaymentsCount: data.summary?.recentPaymentsCount || 0
      });
      setUsers(Array.isArray(data.users) ? data.users : []);
      setRecentPayments(Array.isArray(data.recentPayments) ? data.recentPayments : []);
    } catch (error) {
      toast.error('Failed to fetch category data');
    } finally { setLoading(false); }
  };

  const formatCurrency = (amt) => {
    if (!amt && amt !== 0) return '₹0';
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(amt);
  };

  const getCategoryConfig = () => {
    switch(category) {
      case 'academy': 
        return { title: 'Academy Payments', color: 'blue', icon: <GiTeacher className="w-5 h-5" />, icon2: <FaUserGraduate className="w-4 h-4" /> };
      case 'library': 
        return { title: 'Library Payments', color: 'green', icon: <MdLocalLibrary className="w-5 h-5" />, icon2: <BsPersonBadge className="w-4 h-4" /> };
      case 'staff': 
        return { title: 'Staff Payments', color: 'purple', icon: <RiGovernmentLine className="w-5 h-5" />, icon2: <BsPersonWorkspace className="w-4 h-4" /> };
      default: 
        return { title: 'Payments', color: 'gray', icon: <MdPayments className="w-5 h-5" />, icon2: <FiUsers className="w-4 h-4" /> };
    }
  };

  const config = getCategoryConfig();
  const usersWithDue = users.filter(u => u?.dueAmount > 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <FaSpinner className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
          <p className="mt-3 text-sm text-gray-600">Loading {category} payments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 bg-${config.color}-600 rounded-xl shadow-md`}>
            <span className="text-white">{config.icon}</span>
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{config.title}</h1>
            <p className="text-sm text-gray-600 mt-1 flex items-center gap-1.5">
              <BsClock className="w-4 h-4" /> Manage payments for {category} members
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowPaymentForm(true)}
          className={`flex items-center justify-center gap-2 px-5 py-2.5 bg-${config.color}-600 text-white text-sm font-medium rounded-xl hover:bg-${config.color}-700 transition-colors w-full sm:w-auto`}
        >
          <GiPayMoney className="w-4 h-4" /> Record Payment
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Members', value: summary.totalUsers, icon: <FiUsers className="w-6 h-6" />, bg: 'bg-gray-100', color: `text-${config.color}-600` },
          { label: 'Total Paid', value: summary.totalPaid, icon: <FaIndianRupeeSign className="w-6 h-6" />, bg: 'bg-green-100', color: 'text-green-600' },
          { label: 'Total Due', value: summary.totalDue, icon: <MdWarning className="w-6 h-6" />, bg: 'bg-yellow-100', color: 'text-yellow-600' },
          { label: 'Recent Payments', value: summary.recentPaymentsCount, icon: <MdPayments className="w-6 h-6" />, bg: 'bg-blue-100', color: 'text-blue-600' }
        ].map((card, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 flex items-center justify-between hover:shadow-md transition">
            <div>
              <p className="text-xs sm:text-sm text-gray-600">{card.label}</p>
              <p className="text-xl sm:text-2xl font-bold mt-1">
                {card.label.includes('Paid') || card.label.includes('Due') ? formatCurrency(card.value) : card.value}
              </p>
            </div>
            <div className={`p-3 rounded-xl ${card.bg} ${card.color}`}>{card.icon}</div>
          </div>
        ))}
      </div>

      {/* Payment Form Modal */}
      {showPaymentForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl bg-${config.color}-100`}>
                    <span className={`text-${config.color}-600 text-xl`}>{config.icon}</span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Record Payment</h2>
                    <p className="text-sm text-gray-600 capitalize flex items-center gap-1 mt-1">
                      {config.icon2} {category}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => { setShowPaymentForm(false); setSelectedUser(null); }}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>
              <PaymentForm user={selectedUser} category={category} onPaymentSuccess={() => {
                setShowPaymentForm(false);
                setSelectedUser(null);
                fetchCategoryData();
                toast.success('Payment recorded!');
              }} />
            </div>
          </div>
        </div>
      )}

      {/* Users with Due */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 sm:px-6 py-4 bg-gray-50 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-red-100 rounded-lg">
              <MdWarning className="w-4 h-4 text-red-600" />
            </div>
            <h3 className="text-base font-semibold text-gray-900">Users with Due Payments</h3>
          </div>
          <span className="px-2.5 py-1.5 bg-red-100 text-red-700 text-xs font-medium rounded-full">
            {usersWithDue.length} Pending
          </span>
        </div>

        {/* Desktop Table */}
        <div className="hidden lg:block overflow-x-auto">
          {!usersWithDue.length ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">✅</span>
              </div>
              <p className="text-gray-900 font-medium">No pending due payments</p>
              <p className="text-sm text-gray-500 mt-1">All members are up to date!</p>
            </div>
          ) : (
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  {['Name', 'User ID', 'Total', 'Paid', 'Due', 'Actions'].map(h => (
                    <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {usersWithDue.map(user => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-${config.color}-100`}>
                          <span className={`text-${config.color}-600`}>{config.icon2}</span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{user.name}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{user.userId}</td>
                    <td className="px-6 py-4 font-medium">{formatCurrency(user.totalAmount)}</td>
                    <td className="px-6 py-4 text-green-600 font-medium">{formatCurrency(user.paidAmount)}</td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1.5 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                        {formatCurrency(user.dueAmount)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => { setSelectedUser(user); setShowPaymentForm(true); }}
                        className="flex items-center gap-1.5 px-4 py-2 bg-blue-50 text-blue-700 text-sm font-medium rounded-lg hover:bg-blue-100"
                      >
                        <GiPayMoney className="w-4 h-4" /> Pay
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Mobile Cards */}
        <div className="lg:hidden space-y-4 p-4">
          {!usersWithDue.length ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">✅</span>
              </div>
              <p className="text-gray-900 font-medium">No pending due payments</p>
              <p className="text-sm text-gray-500 mt-1">All members are up to date!</p>
            </div>
          ) : (
            usersWithDue.map(user => (
              <div key={user._id} className="bg-white border border-gray-200 rounded-xl p-4">
                <div className="flex items-start gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-${config.color}-100`}>
                    <span className={`text-${config.color}-600 text-lg`}>{config.icon2}</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-600">{user.email}</p>
                    <p className="text-xs text-gray-400 mt-1">ID: {user.userId}</p>
                  </div>
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
                <button
                  onClick={() => { setSelectedUser(user); setShowPaymentForm(true); }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
                >
                  <GiPayMoney className="w-4 h-4" /> Record Payment
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Recent Payments */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 sm:px-6 py-4 bg-gray-50 border-b">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-100 rounded-lg">
              <MdPayments className="w-4 h-4 text-blue-600" />
            </div>
            <h3 className="text-base font-semibold text-gray-900">Recent Payments</h3>
          </div>
        </div>
        <div className="p-5">
          {!recentPayments.length ? (
            <p className="text-center text-gray-500 py-6">No recent payments</p>
          ) : (
            <div className="space-y-3">
              {recentPayments.slice(0, 5).map(p => (
                <div key={p._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                  <div className="flex items-center gap-3">
                    <div className={`p-1.5 rounded-full bg-${config.color}-100`}>
                      <span className={`text-${config.color}-600 text-sm`}>{config.icon2}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{p.userDetails?.name || 'Unknown'}</p>
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                        <BsClock className="w-3 h-3" />
                        {new Date(p.date).toLocaleDateString()} {new Date(p.date).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-base font-bold text-gray-900">{formatCurrency(p.amount)}</p>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full ${
                      p.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {p.status === 'paid' ? <BsCashStack className="w-3 h-3" /> : <FiCalendar className="w-3 h-3" />}
                      {p.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryPayments;