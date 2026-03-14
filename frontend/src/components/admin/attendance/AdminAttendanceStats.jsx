import React from 'react';
import { FiUsers, FiUserCheck, FiClock } from 'react-icons/fi';
import { MdWarning } from 'react-icons/md';

const AdminAttendanceStats = ({ stats }) => {
  const statCards = [
    {
      label: 'Total Users',
      value: stats.total,
      icon: FiUsers,
      color: 'blue',
      bg: 'from-blue-50 to-blue-100',
      text: 'text-blue-600'
    },
    {
      label: 'Present',
      value: stats.present,
      icon: FiUserCheck,
      color: 'green',
      bg: 'from-green-50 to-green-100',
      text: 'text-green-600'
    },
    {
      label: 'Absent',
      value: stats.absent,
      icon: FiClock,
      color: 'red',
      bg: 'from-red-50 to-red-100',
      text: 'text-red-600'
    },
    {
      label: 'Half Day',
      value: stats.halfDay,
      icon: MdWarning,
      color: 'yellow',
      bg: 'from-yellow-50 to-yellow-100',
      text: 'text-yellow-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {statCards.map((card, idx) => (
        <div
          key={idx}
          className={`bg-gradient-to-br ${card.bg} rounded-xl p-5 shadow-sm border border-${card.color}-200`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">{card.label}</p>
              <p className={`text-2xl font-bold ${card.text}`}>{card.value}</p>
            </div>
            <div className={`p-3 rounded-lg bg-white/80 ${card.text}`}>
              <card.icon className="w-5 h-5" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AdminAttendanceStats;