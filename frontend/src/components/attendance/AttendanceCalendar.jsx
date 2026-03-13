import React from 'react';
import { FaCheckCircle, FaTimesCircle, FaClock } from 'react-icons/fa';

const AttendanceCalendar = ({ attendance = [], currentDate, monthStats }) => {
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  
  const days = [];
  
  // Empty cells for days before month starts
  for (let i = 0; i < firstDay; i++) {
    days.push({ day: null, status: null });
  }
  
  // Create attendance map
  const attendanceMap = {};
  attendance.forEach(a => {
    const date = new Date(a.date).getDate();
    attendanceMap[date] = a.status;
  });
  
  // Fill actual days
  const today = new Date();
  const isCurrentMonth = today.getMonth() === currentDate.getMonth() && 
                         today.getFullYear() === currentDate.getFullYear();
  
  for (let day = 1; day <= daysInMonth; day++) {
    const isToday = isCurrentMonth && today.getDate() === day;
    
    days.push({
      day,
      status: attendanceMap[day] || null,
      isToday
    });
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
    <div className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-gray-800">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h3>
        
        {monthStats && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-blue-600">
              {monthStats.percentage}%
            </span>
          </div>
        )}
      </div>

      {/* Week Days - Fixed size */}
      <div className="grid grid-cols-7 gap-0.5 mb-1">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
          <div key={day} className="text-center text-[10px] font-medium text-gray-500 w-6">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid - FIXED SIZE BOXES */}
      <div className="grid grid-cols-7 gap-0.5">
        {days.map((dayData, idx) => (
          <div
            key={idx}
            className={`
              w-6 h-6 rounded-sm border relative flex items-center justify-center
              ${dayData.isToday ? 'border-blue-500 border-2' : 'border-gray-200'}
              ${!dayData.day ? 'bg-gray-50' : ''}
            `}
          >
            {dayData.day && (
              <>
                {/* Date Number */}
                <span className="text-[10px] font-medium text-gray-700">
                  {dayData.day}
                </span>
                
                {/* Status Dot - Small and positioned */}
                {dayData.status && (
                  <div className={`absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 rounded-full ${getStatusColor(dayData.status)}`} />
                )}
              </>
            )}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-3 mt-2 text-[9px] text-gray-500">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span>Present</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
          <span>Absent</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
          <span>Half Day</span>
        </div>
      </div>
    </div>
  );
};

export default AttendanceCalendar;