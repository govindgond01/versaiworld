import React from 'react';

const UserEmptyState = ({ icon: Icon, title, description, actionLabel, onAction }) => {
  return (
    <div className="text-center py-12">
      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        {Icon && <Icon className="w-10 h-10 text-gray-400" />}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 mb-6">{description}</p>
      {actionLabel && onAction && (
        <button onClick={onAction} className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default UserEmptyState;