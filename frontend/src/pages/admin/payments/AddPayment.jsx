import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PaymentForm from '../../../components/payments/PaymentForm';
import { toast } from 'react-hot-toast';
import { 
  FaIndianRupeeSign,
  FaUserGraduate,
  FaUser
} from 'react-icons/fa6';


import { 
  FiUsers, 
  FiChevronDown,
  FiFilter,
  FiX
} from 'react-icons/fi';
import { 
  MdLocalLibrary,
  MdPayments
} from 'react-icons/md';
import { 
  BsBook,
  BsPersonBadge,
  BsPersonWorkspace
} from 'react-icons/bs';
import { 
  GiTeacher,
  GiReceiveMoney,
  GiPayMoney
} from 'react-icons/gi';
import { 
  RiGovernmentLine,
  RiBankLine
} from 'react-icons/ri';

const AddPayment = () => {
  const navigate = useNavigate();
  const [category, setCategory] = useState('');

  const handlePaymentSuccess = () => {
    toast.success('Payment recorded!');
    navigate(category ? `/admin-dashboard/payments/${category}` : '/admin-dashboard/payments/history');
  };

  const categories = [
    { 
      value: 'academy', 
      label: 'Academy', 
      icon: <FaUserGraduate className="w-4 h-4" />,
      icon2: <GiTeacher className="w-5 h-5" />,
      color: 'blue' 
    },
    { 
      value: 'library', 
      label: 'Library', 
      icon: <BsPersonBadge className="w-4 h-4" />,
      icon2: <MdLocalLibrary className="w-5 h-5" />,
      color: 'green' 
    },
    { 
      value: 'staff', 
      label: 'Staff', 
      icon: <BsPersonWorkspace className="w-4 h-4" />,
      icon2: <RiGovernmentLine className="w-5 h-5" />,
      color: 'purple' 
    }
  ];

  const selected = categories.find(c => c.value === category);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-600 rounded-xl shadow-sm">
            <FaIndianRupeeSign className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Record Payment</h1>
            <p className="text-sm text-gray-500 flex items-center gap-1.5 mt-1">
              <GiReceiveMoney className="w-3.5 h-3.5" />
              Add new payment
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg w-fit">
          <FaUser className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Admin</span>
        </div>
      </div>

      {/* Category Card */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="px-5 py-4 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <FiFilter className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Category Filter</span>
            {selected && (
              <span className={`ml-2 inline-flex items-center gap-1 px-2.5 py-1 bg-${selected.color}-50 text-${selected.color}-700 text-xs font-medium rounded-full`}>
                {selected.icon}
                {selected.label}
              </span>
            )}
          </div>
        </div>

        <div className="p-5">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            {/* Selected Info */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                {selected ? selected.icon2 : <FiUsers className="w-5 h-5 text-gray-500" />}
              </div>
              <div>
                <p className="text-xs text-gray-500">Current</p>
                <p className="text-sm font-semibold text-gray-900">
                  {selected ? selected.label : 'All Categories'}
                </p>
              </div>
            </div>

            {/* Dropdown */}
            <div className="relative w-full sm:w-64 sm:ml-auto">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2.5 pl-10 pr-10 bg-white border border-gray-200 rounded-lg
                         hover:border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 
                         focus:outline-none appearance-none cursor-pointer text-sm text-gray-700"
              >
                <option value="">All Categories</option>
                {categories.map(({ value, label }) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                {selected ? selected.icon : <FiUsers className="w-4 h-4" />}
              </div>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                <FiChevronDown className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Clear Button */}
          {category && (
            <div className="flex justify-end mt-4 pt-4 border-t border-gray-100">
              <button
                onClick={() => setCategory('')}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg"
              >
                <FiX className="w-3.5 h-3.5" />
                Clear
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Payment Form */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <PaymentForm category={category} onPaymentSuccess={handlePaymentSuccess} />
      </div>
    </div>
  );
};

export default AddPayment;