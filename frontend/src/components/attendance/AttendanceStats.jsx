import React from 'react';
import { FaCheckCircle, FaTimesCircle, FaClock, FaChartLine } from 'react-icons/fa';

const AttendanceStats = ({ stats, title = "Overview", totalDays }) => {
  const displayStats = {
    present: stats?.present || 0,
    absent: stats?.absent || 0,
    halfDay: stats?.halfDay || 0,
    percentage: stats?.percentage || 0
  };

  const statCards = [
    {
      label: 'Present',
      value: displayStats.present,
      icon: FaCheckCircle,
      color: 'green',
      bg: 'from-green-50 to-green-100',
      text: 'text-green-600'
    },
    {
      label: 'Absent',
      value: displayStats.absent,
      icon: FaTimesCircle,
      color: 'red',
      bg: 'from-red-50 to-red-100',
      text: 'text-red-600'
    },
    {
      label: 'Half Day',
      value: displayStats.halfDay,
      icon: FaClock,
      color: 'yellow',
      bg: 'from-yellow-50 to-yellow-100',
      text: 'text-yellow-600'
    },
    {
      label: 'Percentage',
      value: `${displayStats.percentage}%`,
      subValue: totalDays ? `of ${totalDays} days` : '',
      icon: FaChartLine,
      color: 'blue',
      bg: 'from-blue-50 to-blue-100',
      text: 'text-blue-600'
    }
  ];

  return (
    <div className="mb-4">
      {title && (
        <h2 className="text-base font-semibold text-gray-800 mb-2">{title}</h2>
      )}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {statCards.map((card, idx) => (
          <div
            key={idx}
            className={`bg-gradient-to-br ${card.bg} rounded-lg p-3 shadow-sm`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-gray-600">{card.label}</p>
                <p className={`text-lg font-bold ${card.text}`}>{card.value}</p>
                {card.subValue && (
                  <p className="text-[10px] text-gray-500">{card.subValue}</p>
                )}
              </div>
              <card.icon className={`w-4 h-4 ${card.text}`} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AttendanceStats;