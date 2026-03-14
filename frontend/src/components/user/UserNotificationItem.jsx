import React from 'react';
import { FaBell, FaCheckCircle, FaClock, FaExclamationCircle } from 'react-icons/fa';
import { BsCalendar } from 'react-icons/bs';

const UserNotificationItem = ({ notification, onMarkRead }) => {
  const getIcon = () => {
    switch(notification.type) {
      case 'payment': return <FaCheckCircle className="w-5 h-5" />;
      case 'warning': return <FaExclamationCircle className="w-5 h-5" />;
      case 'reminder': return <FaClock className="w-5 h-5" />;
      default: return <FaBell className="w-5 h-5" />;
    }
  };

  const getIconColor = () => {
    switch(notification.type) {
      case 'payment': return 'bg-green-100 text-green-600';
      case 'warning': return 'bg-red-100 text-red-600';
      case 'reminder': return 'bg-yellow-100 text-yellow-600';
      default: return 'bg-blue-100 text-blue-600';
    }
  };

  return (
    <div className={`p-4 hover:bg-gray-50 transition ${!notification.read ? 'bg-blue-50' : ''}`}>
      <div className="flex items-start gap-3">
        <div className={`p-2.5 rounded-lg ${getIconColor()}`}>{getIcon()}</div>
        <div className="flex-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h4 className="font-semibold text-gray-900">{notification.title}</h4>
              <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
            </div>
            {!notification.read && (
              <button onClick={() => onMarkRead?.(notification.id)} className="text-xs text-blue-600 hover:text-blue-700 font-medium whitespace-nowrap">
                Mark Read
              </button>
            )}
          </div>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <BsCalendar className="w-3 h-3" /> {notification.date}
            </span>
            {!notification.read && (
              <span className="px-2 py-0.5 bg-blue-100 text-blue-600 text-xs rounded-full">New</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserNotificationItem;