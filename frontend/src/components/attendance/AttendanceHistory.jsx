import React from 'react';
import { FaHistory, FaCheckCircle, FaTimesCircle, FaClock } from 'react-icons/fa';

const AttendanceHistory = ({ history, onMonthClick }) => {
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Agar koi history nahi hai
  if (!history || history.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
        <FaHistory className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-800 mb-2">No Attendance History</h3>
        <p className="text-gray-500">Your attendance records will appear here</p>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch(status) {
      case 'present': return 'bg-green-500';
      case 'absent': return 'bg-red-500';
      case 'half-day': return 'bg-yellow-500';
      default: return 'bg-gray-200';
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <span className="w-1 h-6 bg-blue-500 rounded-full"></span>
        <FaHistory className="text-blue-500" />
        Complete History
      </h3>
      
      <div className="space-y-4">
        {history.map((month, idx) => (
          <div
            key={idx}
            onClick={() => onMonthClick?.(new Date(month.year, month.month))}
            className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition cursor-pointer"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
              <h4 className="font-semibold text-gray-800">
                {monthNames[month.month]} {month.year}
              </h4>
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1 px-3 py-1 bg-green-50 rounded-full">
                  <FaCheckCircle className="text-green-500 w-3 h-3" />
                  <span className="text-xs font-medium text-green-600">{month.stats.present}</span>
                </div>
                <div className="flex items-center gap-1 px-3 py-1 bg-red-50 rounded-full">
                  <FaTimesCircle className="text-red-500 w-3 h-3" />
                  <span className="text-xs font-medium text-red-600">{month.stats.absent}</span>
                </div>
                <div className="flex items-center gap-1 px-3 py-1 bg-yellow-50 rounded-full">
                  <FaClock className="text-yellow-500 w-3 h-3" />
                  <span className="text-xs font-medium text-yellow-600">{month.stats.halfDay}</span>
                </div>
                <div className="px-3 py-1 bg-blue-50 rounded-full">
                  <span className="text-xs font-bold text-blue-600">{month.stats.percentage}%</span>
                </div>
              </div>
            </div>

            {/* Mini calendar preview */}
            <div className="flex flex-wrap gap-1 mt-2">
              {month.attendance.slice(0, 20).map((day, i) => (
                <div
                  key={i}
                  className={`w-5 h-5 rounded-sm ${getStatusColor(day.status)}`}
                  title={`${new Date(day.date).getDate()}: ${day.status}`}
                />
              ))}
              {month.attendance.length > 20 && (
                <span className="text-xs text-gray-500 ml-2">
                  +{month.attendance.length - 20} more
                </span>
              )}
            </div>

            {/* Mini stats bar */}
            <div className="mt-3 h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-green-500 rounded-full"
                style={{ 
                  width: `${month.stats.percentage}%` 
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AttendanceHistory;