import React from 'react';
import { FaClock, FaCalendarAlt, FaUserTie, FaBook, FaTasks } from 'react-icons/fa';

const UserCourseCard = ({ 
  type = 'course',
  title,
  subtitle,
  instructor,
  progress,
  startDate,
  endDate,
  issued,
  due,
  daysLeft,
  status = 'active',
  onClick
}) => {
  const getStatusColor = () => {
    if (status === 'due-soon') return 'bg-orange-100 text-orange-800 border-orange-200';
    if (status === 'completed' || status === 'returned') return 'bg-green-100 text-green-800 border-green-200';
    if (status === 'active') return 'bg-blue-100 text-blue-800 border-blue-200';
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getIcon = () => {
    if (type === 'course') return <FaUserTie className="w-5 h-5" />;
    if (type === 'book') return <FaBook className="w-5 h-5" />;
    if (type === 'task') return <FaTasks className="w-5 h-5" />;
    return <FaBook className="w-5 h-5" />;
  };

  return (
    <div 
      onClick={onClick}
      className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all cursor-pointer"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gray-100 rounded-lg text-gray-600">
            {getIcon()}
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">{title}</h4>
            <p className="text-sm text-gray-600">{subtitle}</p>
          </div>
        </div>
        <span className={`px-3 py-1.5 text-xs font-medium rounded-full ${getStatusColor()}`}>
          {daysLeft || status}
        </span>
      </div>

      {instructor && (
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
          <FaUserTie className="w-4 h-4 text-gray-400" />
          <span>{instructor}</span>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-gray-100">
        <div className="flex items-center gap-2">
          <FaCalendarAlt className="w-4 h-4 text-gray-400" />
          <div>
            <p className="text-xs text-gray-500">{type === 'book' ? 'Issued' : 'Start'}</p>
            <p className="text-sm font-medium">{startDate || issued}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <FaClock className="w-4 h-4 text-gray-400" />
          <div>
            <p className="text-xs text-gray-500">{type === 'book' ? 'Due' : 'End'}</p>
            <p className="text-sm font-medium">{endDate || due}</p>
          </div>
        </div>
      </div>

      {progress !== undefined && (
        <div className="mt-3">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-gray-600">Progress</span>
            <span className="font-medium">{progress}%</span>
          </div>
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-600 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default UserCourseCard;