import React from 'react';
import { FaSpinner } from 'react-icons/fa';

const UserLoading = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <FaSpinner className="animate-spin text-4xl text-blue-600 mx-auto" />
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    </div>
  );
};

export default UserLoading;