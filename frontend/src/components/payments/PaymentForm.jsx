import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { toast } from 'react-hot-toast';
import { 
  FaIndianRupeeSign, FaUser, FaUserTie, FaBuilding, FaSpinner
} from 'react-icons/fa6';
import { 
  FiDollarSign, FiCreditCard, FiHash, FiSearch, FiCalendar
} from 'react-icons/fi';
import { 
  MdPayment, MdDescription, MdClear, MdRefresh, MdLocalLibrary
} from 'react-icons/md';
import { 
  BsCashStack, BsBank2, BsQrCode, BsChevronDown, BsPersonWorkspace
} from 'react-icons/bs';
import { 
  GiPayMoney, GiReceiveMoney, GiTeacher, GiMoneyStack
} from 'react-icons/gi';
import { 
  RiRefund2Line, RiGovernmentLine, RiBankLine
} from 'react-icons/ri';

const PaymentForm = ({ user, category, onPaymentSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState(user || null);
  
  const userRole = localStorage.getItem('role');

  const getDefaultPaymentType = () => {
    if (category === 'staff') return 'salary';
    if (category === 'academy' || category === 'library') return 'fee';
    if (user?.userType === 'staff') return 'salary';
    return 'fee';
  };

  const [formData, setFormData] = useState({
    amount: '',
    type: getDefaultPaymentType(),
    paymentMethod: 'cash',
    month: new Date().toISOString().slice(0, 7),
    description: '',
    transactionId: '',
    receiptNo: `REC-${Date.now().toString().slice(-6)}`
  });

  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      type: getDefaultPaymentType(),
      receiptNo: `REC-${Date.now().toString().slice(-6)}`
    }));
  }, [user, category]);

  useEffect(() => {
    let timeoutId;
    if (!user && userRole === 'admin' && searchQuery.trim().length > 2) {
      timeoutId = setTimeout(() => fetchUsers(), 500);
    }
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      let studentPromise, staffPromise;
      
      if (category === 'staff') {
        studentPromise = Promise.resolve({ data: { students: [] } });
        staffPromise = api.get(`/staff?search=${searchQuery}&limit=10`);
      } else if (category === 'academy') {
        studentPromise = api.get(`/admin/students?search=${searchQuery}&studentCategory=academy&limit=10`);
        staffPromise = Promise.resolve({ data: { staff: [] } });
      } else if (category === 'library') {
        studentPromise = api.get(`/admin/students?search=${searchQuery}&studentCategory=library&limit=10`);
        staffPromise = Promise.resolve({ data: { staff: [] } });
      } else {
        studentPromise = api.get(`/admin/students?search=${searchQuery}&limit=10`);
        staffPromise = api.get(`/staff?search=${searchQuery}&limit=10`);
      }

      const [studentResponse, staffResponse] = await Promise.all([studentPromise, staffPromise]);

      const students = studentResponse.data?.students || [];
      const staff = staffResponse.data?.staff || [];

      const allUsers = [
        ...students.map(s => ({ ...s, userType: 'student' })),
        ...staff.map(s => ({ ...s, userType: 'staff' }))
      ];
      
      setUsers(allUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedUser && !user) {
      toast.error('Please select a user');
      return;
    }
    
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (formData.type === 'salary' && !formData.month) {
      toast.error('Please select month for salary payment');
      return;
    }
    
    setLoading(true);
    try {
      const paymentData = {
        userId: selectedUser?._id || user?._id,
        amount: parseFloat(formData.amount),
        type: formData.type,
        paymentMethod: formData.paymentMethod,
        month: formData.month,
        description: formData.description || `${formData.type} payment`,
        transactionId: formData.transactionId || undefined,
        receiptNo: formData.receiptNo
      };
      
      const response = await api.post('/payments/add', paymentData);
      
      toast.success('Payment recorded successfully!');
      
      setFormData({
        amount: '',
        type: getDefaultPaymentType(),
        paymentMethod: 'cash',
        month: new Date().toISOString().slice(0, 7),
        description: '',
        transactionId: '',
        receiptNo: `REC-${Date.now().toString().slice(-6)}`
      });
      
      if (selectedUser) setSelectedUser(null);
      setSearchQuery('');
      setUsers([]);
      
      if (onPaymentSuccess) onPaymentSuccess(response.data);
    } catch (error) {
      console.error('Payment error:', error);
      toast.error(error.response?.data?.message || 'Failed to record payment');
    } finally {
      setLoading(false);
    }
  };

  const paymentTypes = {
    student: [
      { value: 'fee', label: 'Course Fee', icon: <FaIndianRupeeSign className="w-3.5 h-3.5" /> },
      { value: 'advance', label: 'Advance Payment', icon: <GiPayMoney className="w-3.5 h-3.5" /> },
      { value: 'refund', label: 'Refund', icon: <RiRefund2Line className="w-3.5 h-3.5" /> }
    ],
    staff: [
      { value: 'salary', label: 'Salary', icon: <BsCashStack className="w-3.5 h-3.5" /> },
      { value: 'advance', label: 'Advance Salary', icon: <GiMoneyStack className="w-3.5 h-3.5" /> },
      { value: 'other', label: 'Other Payment', icon: <MdPayment className="w-3.5 h-3.5" /> }
    ]
  };

  const paymentMethods = [
    { value: 'cash', label: 'Cash', icon: <BsCashStack className="w-3.5 h-3.5" /> },
    { value: 'bank_transfer', label: 'Bank Transfer', icon: <RiBankLine className="w-3.5 h-3.5" /> },
    { value: 'upi', label: 'UPI', icon: <BsQrCode className="w-3.5 h-3.5" /> },
    { value: 'card', label: 'Card', icon: <FiCreditCard className="w-3.5 h-3.5" /> },
    { value: 'cheque', label: 'Cheque', icon: <MdPayment className="w-3.5 h-3.5" /> }
  ];

  const currentUserType = selectedUser?.userType || user?.userType || 
    (category === 'staff' ? 'staff' : 'student');

  const getCategoryIcon = () => {
    if (category === 'academy') return <GiTeacher className="w-4 h-4" />;
    if (category === 'library') return <MdLocalLibrary className="w-4 h-4" />;
    if (category === 'staff') return <RiGovernmentLine className="w-4 h-4" />;
    return null;
  };

  return (
    <div className="w-full p-5 sm:p-6">
      <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-100">
        <div className="p-2 bg-blue-50 rounded-lg">
          <GiReceiveMoney className="w-5 h-5 text-blue-600" />
        </div>
        <h2 className="text-lg font-semibold text-gray-900">Payment Details</h2>
        {category && (
          <span className="ml-2 px-2.5 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full capitalize flex items-center gap-1">
            {getCategoryIcon()}
            {category}
          </span>
        )}
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-5">
        {!user && userRole === 'admin' && (
          <div className="space-y-3">
            <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
              <FaUser className="w-4 h-4 text-gray-500" />
              Select User <span className="text-red-500">*</span>
            </label>
            
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <FiSearch className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, email or ID"
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg
                         focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none
                         text-sm text-gray-700"
              />
              {loading && searchQuery && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <FaSpinner className="w-4 h-4 text-blue-500 animate-spin" />
                </div>
              )}
              
              {searchQuery && users.length > 0 && !loading && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {users.map(u => (
                    <div
                      key={u._id}
                      onClick={() => {
                        setSelectedUser(u);
                        setSearchQuery('');
                        setUsers([]);
                        setFormData(prev => ({
                          ...prev,
                          type: u.userType === 'staff' ? 'salary' : 'fee'
                        }));
                      }}
                      className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                    >
                      <div className="flex items-center gap-2">
                        <div className={`p-1.5 rounded-full ${u.userType === 'staff' ? 'bg-purple-100' : 'bg-green-100'}`}>
                          {u.userType === 'staff' ? 
                            <FaBuilding className="w-3 h-3 text-purple-600" /> : 
                            <FaUser className="w-3 h-3 text-green-600" />
                          }
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{u.name}</p>
                          <p className="text-xs text-gray-500">{u.email} • {u.userId}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {selectedUser && (
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex justify-between items-start">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-white rounded-full">
                      {selectedUser.userType === 'staff' ? 
                        <FaBuilding className="w-4 h-4 text-purple-600" /> : 
                        <FaUser className="w-4 h-4 text-green-600" />
                      }
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{selectedUser.name}</p>
                      <p className="text-xs text-gray-600 mt-0.5">ID: {selectedUser.userId}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {selectedUser.userType === 'staff' ? selectedUser.staffRole : selectedUser.studentCategory}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedUser(null)}
                    className="p-1.5 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                  >
                    <MdClear className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-medium text-gray-600">
              <FaIndianRupeeSign className="w-3.5 h-3.5" />
              Amount <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₹</span>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({...formData, amount: e.target.value})}
                className="w-full pl-8 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg
                         focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none
                         text-sm text-gray-700"
                placeholder="0.00"
                min="1"
                step="1"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-medium text-gray-600">
              <GiPayMoney className="w-3.5 h-3.5" />
              Payment Type <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value})}
                className="w-full px-4 py-2.5 pl-10 pr-10 bg-white border border-gray-200 rounded-lg
                         focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none
                         appearance-none cursor-pointer text-sm text-gray-700"
                required
              >
                {paymentTypes[currentUserType]?.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                {paymentTypes[currentUserType]?.find(t => t.value === formData.type)?.icon || <GiPayMoney className="w-3.5 h-3.5" />}
              </div>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                <BsChevronDown className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-medium text-gray-600">
              <RiBankLine className="w-3.5 h-3.5" />
              Payment Method <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                value={formData.paymentMethod}
                onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})}
                className="w-full px-4 py-2.5 pl-10 pr-10 bg-white border border-gray-200 rounded-lg
                         focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none
                         appearance-none cursor-pointer text-sm text-gray-700"
                required
              >
                {paymentMethods.map(method => (
                  <option key={method.value} value={method.value}>{method.label}</option>
                ))}
              </select>
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                {paymentMethods.find(m => m.value === formData.paymentMethod)?.icon || <RiBankLine className="w-3.5 h-3.5" />}
              </div>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                <BsChevronDown className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-medium text-gray-600">
              <FiCalendar className="w-3.5 h-3.5" />
              Month
            </label>
            <input
              type="month"
              value={formData.month}
              onChange={(e) => setFormData({...formData, month: e.target.value})}
              disabled={formData.type !== 'salary'}
              className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg
                       focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none
                       disabled:bg-gray-50 disabled:text-gray-500 text-sm text-gray-700"
            />
          </div>

          <div className="sm:col-span-2 space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-medium text-gray-600">
              <MdDescription className="w-3.5 h-3.5" />
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              rows="2"
              className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg
                       focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none
                       text-sm text-gray-700 resize-none"
              placeholder="Enter payment description..."
            />
          </div>

          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-medium text-gray-600">
              <FiHash className="w-3.5 h-3.5" />
              Transaction ID
            </label>
            <input
              type="text"
              value={formData.transactionId}
              onChange={(e) => setFormData({...formData, transactionId: e.target.value})}
              className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg
                       focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none
                       text-sm text-gray-700"
              placeholder="Optional"
            />
          </div>

          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-medium text-gray-600">
              <MdRefresh className="w-3.5 h-3.5" />
              Receipt Number
            </label>
            <input
              type="text"
              value={formData.receiptNo}
              onChange={(e) => setFormData({...formData, receiptNo: e.target.value})}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg
                       text-sm text-gray-700"
              readOnly
              required
            />
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={loading || (!selectedUser && !user)}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium 
                     rounded-lg transition-colors duration-200 flex items-center gap-2
                     focus:outline-none focus:ring-4 focus:ring-blue-100
                     disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <FaSpinner className="w-4 h-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <FaIndianRupeeSign className="w-4 h-4" />
                Record Payment
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PaymentForm;