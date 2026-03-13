import React from 'react';
import { FaBook, FaRupeeSign, FaUserCheck, FaClock, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';

const UserActivityItem = ({ icon: Icon, title, description, time, amount, status, type }) => {
  const getIcon = () => {
    if (Icon) return Icon;
    switch(type) {
      case 'book': return FaBook;
      case 'payment': return FaRupeeSign;
      case 'attendance': return FaUserCheck;
      default: return FaClock;
    }
  };

  const getIconColor = () => {
    switch(type) {
      case 'book': return 'bg-blue-100 text-blue-600';
      case 'payment': return 'bg-green-100 text-green-600';
      case 'attendance': return 'bg-purple-100 text-purple-600';
      case 'warning': return 'bg-red-100 text-red-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const IconComponent = getIcon();

  return (
    <div className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg transition">
      <div className={`p-2.5 rounded-lg ${getIconColor()}`}>
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