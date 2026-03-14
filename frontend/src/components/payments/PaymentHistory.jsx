import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import { 
  FiDownload, FiFilter, FiSearch, FiX, FiArrowLeft, FiArrowRight,
  FiCalendar, FiClock, FiUser, FiHash, FiCreditCard
} from 'react-icons/fi';
import { 
  MdWarning, MdPayments, MdReceipt, MdLocalLibrary,
  MdSchool, MdHistory
} from 'react-icons/md';
import { 
  FaIndianRupeeSign, FaUserGraduate, FaSpinner, FaUserTie 
} from 'react-icons/fa6';
import { 
  BsPersonWorkspace, BsPersonBadge, BsCashStack, BsBank2, BsQrCode 
} from 'react-icons/bs';
import { 
  GiTeacher, GiPayMoney, GiMoneyStack 
} from 'react-icons/gi';
import { 
  RiGovernmentLine, RiRefund2Line, RiBankLine 
} from 'react-icons/ri';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

const PaymentHistory = ({ userId, isAdmin = false }) => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    type: 'all', paymentMethod: 'all', startDate: null, endDate: null, search: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [summary, setSummary] = useState(null);

  useEffect(() => { fetchPayments(); }, [filters, currentPage, userId]);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage, limit: 20, ...(userId && { userId }),
        type: filters.type, paymentMethod: filters.paymentMethod,
        ...(filters.startDate && { startDate: filters.startDate.toISOString() }),
        ...(filters.endDate && { endDate: filters.endDate.toISOString() })
      });
      const endpoint = isAdmin ? '/payments/history' : '/payments/my-payments';
      const res = await api.get(`${endpoint}?${params}`);
      setPayments(res.data.payments || []);
      setTotalPages(res.data.pages || 1);
      if (res.data.summary) setSummary(res.data.summary);
    } catch (error) {
      toast.error('Failed to fetch payment history');
    } finally { setLoading(false); }
  };

  const handleDownloadReceipt = async (payment) => {
    try {
      const res = await api.get(`/payments/receipt/${payment.userId || userId}/${payment._id}`);
      const r = res.data.receipt;
      const text = `RECEIPT\n${r.receiptNo}\n${new Date(r.date).toLocaleString()}\n\nCUSTOMER\n${r.user.name}\n${r.user.userId}\n${r.user.email}\n\nPAYMENT\n₹${r.payment.amount}\n${r.payment.type}\n${r.payment.method}\nSTATUS: ${r.status}`;
      const blob = new Blob([text], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Receipt-${r.receiptNo}.txt`;
      a.click();
      toast.success('Receipt downloaded');
    } catch (error) {
      toast.error('Failed to download receipt');
    }
  };

  const resetFilters = () => {
    setFilters({ type: 'all', paymentMethod: 'all', startDate: null, endDate: null, search: '' });
    setCurrentPage(1);
  };

  const formatCurrency = (amt) => {
    if (!amt && amt !== 0) return '₹0';
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(amt);
  };

  const paymentTypes = [
    { value: 'all', label: 'All Types', icon: <MdPayments className="w-3.5 h-3.5" /> },
    { value: 'fee', label: 'Course Fee', icon: <FaIndianRupeeSign className="w-3.5 h-3.5" /> },
    { value: 'salary', label: 'Salary', icon: <BsCashStack className="w-3.5 h-3.5" /> },
    { value: 'advance', label: 'Advance', icon: <GiPayMoney className="w-3.5 h-3.5" /> },
    { value: 'refund', label: 'Refund', icon: <RiRefund2Line className="w-3.5 h-3.5" /> }
  ];

  const paymentMethods = [
    { value: 'all', label: 'All Methods', icon: <FiCreditCard className="w-3.5 h-3.5" /> },
    { value: 'cash', label: 'Cash', icon: <BsCashStack className="w-3.5 h-3.5" /> },
    { value: 'bank_transfer', label: 'Bank Transfer', icon: <RiBankLine className="w-3.5 h-3.5" /> },
    { value: 'upi', label: 'UPI', icon: <BsQrCode className="w-3.5 h-3.5" /> },
    { value: 'card', label: 'Card', icon: <FiCreditCard className="w-3.5 h-3.5" /> }
  ];

  const getStatusIcon = (status) => {
    if (status === 'paid') return <BsCashStack className="w-3.5 h-3.5" />;
    if (status === 'pending') return <FiClock className="w-3.5 h-3.5" />;
    if (status === 'failed') return <MdWarning className="w-3.5 h-3.5" />;
    return <MdHistory className="w-3.5 h-3.5" />;
  };

  const stats = {
    totalAmount: payments.reduce((sum, p) => sum + (p.amount || 0), 0),
    totalCount: payments.length
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <MdHistory className="w-5 h-5 text-blue-600" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Payment History</h2>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors w-full sm:w-auto"
            >
              <FiFilter className="w-4 h-4" />
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </button>
          </div>

          {/* Summary Cards */}
          {summary && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 rounded-lg p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600">Total Amount</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">{formatCurrency(summary.total || 0)}</p>
                </div>
                <div className="p-2 bg-white rounded-lg">
                  <FaIndianRupeeSign className="w-5 h-5 text-blue-600" />
                </div>
              </div>
              <div className="bg-green-50 rounded-lg p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600">Paid Amount</p>
                  <p className="text-xl sm:text-2xl font-bold text-green-600 mt-1">{formatCurrency(summary.paid || 0)}</p>
                </div>
                <div className="p-2 bg-white rounded-lg">
                  <GiPayMoney className="w-5 h-5 text-green-600" />
                </div>
              </div>
              <div className="bg-yellow-50 rounded-lg p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600">Due Amount</p>
                  <p className="text-xl sm:text-2xl font-bold text-yellow-600 mt-1">{formatCurrency(summary.due || 0)}</p>
                </div>
                <div className="p-2 bg-white rounded-lg">
                  <MdWarning className="w-5 h-5 text-yellow-600" />
                </div>
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 pb-2">
            <span className="flex items-center gap-1.5">
              <MdReceipt className="w-4 h-4" />
              Total Payments: <span className="font-bold text-gray-900">{stats.totalCount}</span>
            </span>
            <span className="w-1 h-1 bg-gray-300 rounded-full hidden sm:block" />
            <span className="flex items-center gap-1.5">
              <FaIndianRupeeSign className="w-4 h-4" />
              Total Amount: <span className="font-bold text-gray-900">{formatCurrency(stats.totalAmount)}</span>
            </span>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-1.5">
                  <FiFilter className="w-4 h-4" /> Filters
                </h3>
                <button
                  onClick={resetFilters}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100"
                >
                  <FiX className="w-3.5 h-3.5" /> Reset
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="flex items-center gap-1 text-xs font-medium text-gray-600 mb-1.5">
                    <MdPayments className="w-3.5 h-3.5" /> Payment Type
                  </label>
                  <select
                    value={filters.type}
                    onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    {paymentTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="flex items-center gap-1 text-xs font-medium text-gray-600 mb-1.5">
                    <FiCreditCard className="w-3.5 h-3.5" /> Payment Method
                  </label>
                  <select
                    value={filters.paymentMethod}
                    onChange={(e) => setFilters({ ...filters, paymentMethod: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    {paymentMethods.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="flex items-center gap-1 text-xs font-medium text-gray-600 mb-1.5">
                    <FiCalendar className="w-3.5 h-3.5" /> Start Date
                  </label>
                  <DatePicker
                    selected={filters.startDate}
                    onChange={(date) => setFilters({ ...filters, startDate: date })}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm"
                    placeholderText="Select date"
                    dateFormat="dd/MM/yyyy"
                    isClearable
                  />
                </div>
                <div>
                  <label className="flex items-center gap-1 text-xs font-medium text-gray-600 mb-1.5">
                    <FiCalendar className="w-3.5 h-3.5" /> End Date
                  </label>
                  <DatePicker
                    selected={filters.endDate}
                    onChange={(date) => setFilters({ ...filters, endDate: date })}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm"
                    placeholderText="Select date"
                    dateFormat="dd/MM/yyyy"
                    isClearable
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Payments Table/Cards */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <FaSpinner className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
              <p className="mt-3 text-sm text-gray-600">Loading payments...</p>
            </div>
          </div>
        ) : !payments.length ? (
          <div className="text-center py-16 px-4">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MdReceipt className="w-10 h-10 text-gray-400" />
            </div>
            <p className="text-lg font-semibold text-gray-900">No payments found</p>
            <p className="text-sm text-gray-500 mt-2">No payment records match your criteria</p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {isAdmin && <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">User</th>}
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Receipt</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {payments.map(p => (
                    <tr key={p._id} className="hover:bg-gray-50">
                      {isAdmin && (
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center">
                              <FiUser className="w-3.5 h-3.5 text-gray-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">{p.userDetails?.name}</p>
                              <p className="text-xs text-gray-500">{p.userDetails?.userId}</p>
                            </div>
                          </div>
                        </td>
                      )}
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-gray-900">{new Date(p.date).toLocaleDateString()}</p>
                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                          <FiClock className="w-3 h-3" /> {new Date(p.date).toLocaleTimeString()}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{p.receiptNo || 'N/A'}</td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full capitalize">
                          {p.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">{formatCurrency(p.amount)}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 capitalize">{p.paymentMethod?.replace('_', ' ')}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-full ${
                          p.status === 'paid' ? 'bg-green-100 text-green-700' :
                          p.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {getStatusIcon(p.status)} {p.status?.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleDownloadReceipt(p)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 text-xs font-medium rounded-lg hover:bg-blue-100"
                        >
                          <FiDownload className="w-3.5 h-3.5" /> Receipt
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden space-y-4 p-4">
              {payments.map(p => (
                <div key={p._id} className="bg-white border border-gray-200 rounded-xl p-4">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-blue-100 rounded-lg">
                        <MdReceipt className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Receipt No.</p>
                        <p className="text-sm font-medium text-gray-900">{p.receiptNo || 'N/A'}</p>
                      </div>
                    </div>
                    <span className={`px-2.5 py-1.5 text-xs font-medium rounded-full flex items-center gap-1 ${
                      p.status === 'paid' ? 'bg-green-100 text-green-700' :
                      p.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {getStatusIcon(p.status)} {p.status}
                    </span>
                  </div>

                  {/* User Info (Admin) */}
                  {isAdmin && p.userDetails && (
                    <div className="flex items-center gap-2 mb-3 pb-3 border-b">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                        <FiUser className="w-4 h-4 text-gray-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{p.userDetails.name}</p>
                        <p className="text-xs text-gray-500">{p.userDetails.userId}</p>
                      </div>
                    </div>
                  )}

                  {/* Details Grid */}
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="bg-gray-50 rounded-lg p-2">
                      <p className="text-xs text-gray-500 mb-1">Date</p>
                      <p className="text-sm font-medium">{new Date(p.date).toLocaleDateString()}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{new Date(p.date).toLocaleTimeString()}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2">
                      <p className="text-xs text-gray-500 mb-1">Amount</p>
                      <p className="text-sm font-bold text-gray-900">{formatCurrency(p.amount)}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2">
                      <p className="text-xs text-gray-500 mb-1">Type</p>
                      <span className="text-xs font-medium bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                        {p.type}
                      </span>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2">
                      <p className="text-xs text-gray-500 mb-1">Method</p>
                      <p className="text-sm capitalize">{p.paymentMethod?.replace('_', ' ')}</p>
                    </div>
                  </div>

                  {/* Action */}
                  <div className="flex justify-end pt-3 border-t">
                    <button
                      onClick={() => handleDownloadReceipt(p)}
                      className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
                    >
                      <FiDownload className="w-4 h-4" /> Download Receipt
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t bg-gray-50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <p className="text-sm text-gray-600 flex items-center gap-1">
                  <MdReceipt className="w-4 h-4" /> Page {currentPage} of {totalPages}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="flex items-center gap-1 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                  >
                    <FiArrowLeft className="w-4 h-4" /> Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="flex items-center gap-1 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next <FiArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentHistory;