import React from 'react';
import { FaRupeeSign, FaCheckCircle, FaClock, FaDownload } from 'react-icons/fa';
import { BsCalendar } from 'react-icons/bs';

const UserPaymentCard = ({ payment, onDownload }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-lg ${payment.status === 'paid' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}>
            {payment.status === 'paid' ? <FaCheckCircle className="w-5 h-5" /> : <FaClock className="w-5 h-5" />}
          </div>
          <div>
            <p className="font-semibold text-gray-900">{payment.type}</p>
            <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
              <BsCalendar className="w-3 h-3" />
              <span>{payment.date}</span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xl font-bold text-gray-900">₹{payment.amount}</p>
          <p className="text-xs text-gray-500 mt-1">{payment.receiptNo}</p>
        </div>
      </div>
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div className="text-sm">
          <span className="text-gray-600">Method: </span>
          <span className="font-medium">{payment.paymentMethod}</span>
        </div>
        <button onClick={() => onDownload?.(payment)} className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 text-sm font-medium">
          <FaDownload className="w-3 h-3" /> Receipt
        </button>
      </div>
    </div>
  );
};

export default UserPaymentCard;