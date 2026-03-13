import React from 'react';
import { FaRupeeSign, FaCheckCircle, FaClock, FaExclamationTriangle } from 'react-icons/fa';

const UserFeesSummary = ({ 
  total = 0, 
  paid = 0, 
  due = 0,
  lastPayment,
  nextDue,
  payments = []
}) => {
  const paidPercentage = total > 0 ? (paid / total) * 100 : 0;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <FaRupeeSign className="text-green-600" /> Fees Summary
      </h3>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-600">Payment Progress</span>
          <span className="font-medium">{paidPercentage.toFixed(1)}% Paid</span>
        </div>
        <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-green-500 rounded-full"
            style={{ width: `${paidPercentage}%` }}
          />
        </div>
      </div>

      {/* Amount Cards */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <p className="text-xs text-gray-600 mb-1">Total</p>
          <p className="text-lg font-bold text-blue-600">₹{total.toLocaleString()}</p>
        </div>
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <p className="text-xs text-gray-600 mb-1">Paid</p>
          <p className="text-lg font-bold text-green-600">₹{paid.toLocaleString()}</p>
        </div>
        <div className="text-center p-3 bg-red-50 rounded-lg">
          <p className="text-xs text-gray-600 mb-1">Due</p>
          <p className={`text-lg font-bold ${due > 0 ? 'text-red-600' : 'text-gray-600'}`}>
            ₹{due.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Status */}
      {due > 0 ? (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
          <FaExclamationTriangle className="text-red-500 w-5 h-5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-red-800">Payment Due</p>
            <p className="text-xs text-red-600 mt-0.5">Please clear your dues</p>
          </div>
        </div>
      ) : (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
          <FaCheckCircle className="text-green-500 w-5 h-5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-green-800">All Clear</p>
            <p className="text-xs text-green-600 mt-0.5">No pending payments</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserFeesSummary;