import React from 'react';

const UserStatsCard = ({ icon: Icon, label, value, subValue, color = 'blue', onClick }) => {
  const colorClasses = {
    blue: { bg: 'bg-blue-50', icon: 'text-blue-600', border: 'border-blue-200' },
    green: { bg: 'bg-green-50', icon: 'text-green-600', border: 'border-green-200' },
    red: { bg: 'bg-red-50', icon: 'text-red-600', border: 'border-red-200' },
    purple: { bg: 'bg-purple-50', icon: 'text-purple-600', border: 'border-purple-200' },
    yellow: { bg: 'bg-yellow-50', icon: 'text-yellow-600', border: 'border-yellow-200' },
    orange: { bg: 'bg-orange-50', icon: 'text-orange-600', border: 'border-orange-200' }
  };

  const colors = colorClasses[color] || colorClasses.blue;

  return (
    <div onClick={onClick} className={`bg-white rounded-xl border ${colors.border} p-5 hover:shadow-md transition-all cursor-pointer`}>
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm text-gray-600">{label}</p>
          <p className={`text-2xl font-bold ${colors.icon}`}>{value}</p>
          {subValue && <p className="text-xs text-gray-500">{subValue}</p>}
        </div>
        <div className={`p-3 rounded-lg ${colors.bg} ${colors.icon}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};

export default UserStatsCard;