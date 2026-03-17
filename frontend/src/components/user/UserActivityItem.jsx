import React from 'react';
import { FaBook, FaRupeeSign, FaUserCheck, FaClock, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';

const ICON_MAP = {
  book: FaBook,
  payment: FaRupeeSign,
  attendance: FaUserCheck,
  default: FaClock,
};

const COLOR_MAP = {
  book: 'bg-blue-100 text-blue-600',
  payment: 'bg-green-100 text-green-600',
  attendance: 'bg-purple-100 text-purple-600',
  warning: 'bg-red-100 text-red-600',
  default: 'bg-gray-100 text-gray-600',
};

const UserActivityItem = ({ icon: Icon, title, description, time, amount, status, type }) => {
  const IconComponent = Icon || ICON_MAP[type] || ICON_MAP.default;
  const iconColor = COLOR_MAP[type] || COLOR_MAP.default;

  return (
    <div className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg transition">
      <div className={`p-2.5 rounded-lg ${iconColor}`}>
        <IconComponent className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="font-medium text-gray-900">{title}</p>
          {amount && <span className="font-semibold text-green-600">₹{amount}</span>}
        </div>
        <p className="text-sm text-gray-600 mt-0.5">{description}</p>
        <div className="flex items-center gap-3 mt-2">
          <span className="text-xs text-gray-500">{time}</span>
        </div>
      </div>
    </div>
  );
};

export default UserActivityItem;