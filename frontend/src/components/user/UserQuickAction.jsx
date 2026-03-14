import React from 'react';
import { useNavigate } from 'react-router-dom';

const UserQuickAction = ({ icon: Icon, label, path, color = 'blue' }) => {
  const navigate = useNavigate();
  
  const colorClasses = {
    blue: 'bg-blue-50 hover:bg-blue-100 text-blue-600',
    green: 'bg-green-50 hover:bg-green-100 text-green-600',
    purple: 'bg-purple-50 hover:bg-purple-100 text-purple-600',
    orange: 'bg-orange-50 hover:bg-orange-100 text-orange-600',
    red: 'bg-red-50 hover:bg-red-100 text-red-600'
  };

  return (
    <button onClick={() => navigate(path)} className={`p-4 rounded-lg transition-all flex flex-col items-center gap-2 ${colorClasses[color]}`}>
      <Icon className="w-5 h-5" />
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
};

export default UserQuickAction;