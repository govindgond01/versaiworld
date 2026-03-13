import React from 'react';
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaCalendarAlt, FaIdCard } from 'react-icons/fa';

const UserProfileInfo = ({ user, onEdit }) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="h-24 bg-gradient-to-r from-blue-500 to-purple-600 relative">
        <div className="absolute -bottom-12 left-6">
          <div className="w-24 h-24 rounded-xl bg-white border-4 border-white shadow-lg flex items-center justify-center">
            <FaUser className="w-12 h-12 text-gray-400" />
          </div>
        </div>
      </div>
      <div className="pt-16 p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{user?.name}</h2>
            <p className="text-gray-500 mt-1">{user?.studentId || user?.userId}</p>
          </div>
          {onEdit && (
            <button onClick={onEdit} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
              Edit Profile
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <FaEnvelope className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Email</p>
                <p className="font-medium">{user?.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <FaPhone className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Phone</p>
                <p className="font-medium">{user?.phone || 'Not provided'}</p>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <FaCalendarAlt className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Joined</p>
                <p className="font-medium">{user?.joinDate ? new Date(user.joinDate).toLocaleDateString() : 'N/A'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <FaMapMarkerAlt className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Address</p>
                <p className="font-medium">
                  {typeof user?.address === 'object'
                    ? [user.address.street, user.address.city, user.address.state, user.address.pincode]
                      .filter(Boolean)
                      .join(', ') || 'Not provided'
                    : user?.address || 'Not provided'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfileInfo;