import React from 'react';
import { FaArrowRight } from 'react-icons/fa';

const UserHelpCard = ({ icon: Icon, title, description, action, onClick }) => {
  return (
    <div onClick={onClick} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition cursor-pointer">
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 bg-blue-100 rounded-lg text-blue-600">
          <Icon className="w-6 h-6" />
        </div>
        <FaArrowRight className="text-gray-400" />
      </div>
      <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-600 mb-4">{description}</p>
      <p className="text-sm text-blue-600 font-medium">{action} →</p>
    </div>
  );
};

export default UserHelpCard;