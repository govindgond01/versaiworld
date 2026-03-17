import React from 'react';
import { FaTimes, FaCheckCircle, FaTimesCircle, FaClock } from 'react-icons/fa';
import Loader from '../../common/Loader';

const AdminAttendanceEditor = ({ 
  isOpen, 
  onClose, 
  user, 
  selectedStatus, 
  onStatusChange,
  onSave,
  loading,
  isEditing
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">
            {isEditing ? 'Edit Attendance' : 'Mark Attendance'}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <FaTimes className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* User Info */}
        <div className="p-6">
          {user && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">User</p>
              <p className="font-medium text-gray-900">{user.name}</p>
              <p className="text-xs text-gray-500">{user.email}</p>
              <p className="text-xs text-gray-400 mt-1">ID: {user.userId}</p>
            </div>
          )}

          {/* Status Selection */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Select Status
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => onStatusChange('present')}
                className={`p-4 rounded-lg border-2 transition flex flex-col items-center gap-2 ${
                  selectedStatus === 'present'
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-green-200 hover:bg-green-50/50'
                }`}
              >
                <FaCheckCircle className={`w-6 h-6 ${
                  selectedStatus === 'present' ? 'text-green-500' : 'text-gray-400'
                }`} />
                <span className={`text-sm font-medium ${
                  selectedStatus === 'present' ? 'text-green-700' : 'text-gray-600'
                }`}>
                  Present
                </span>
              </button>

              <button
                onClick={() => onStatusChange('absent')}
                className={`p-4 rounded-lg border-2 transition flex flex-col items-center gap-2 ${
                  selectedStatus === 'absent'
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-200 hover:border-red-200 hover:bg-red-50/50'
                }`}
              >
                <FaTimesCircle className={`w-6 h-6 ${
                  selectedStatus === 'absent' ? 'text-red-500' : 'text-gray-400'
                }`} />
                <span className={`text-sm font-medium ${
                  selectedStatus === 'absent' ? 'text-red-700' : 'text-gray-600'
                }`}>
                  Absent
                </span>
              </button>

              <button
                onClick={() => onStatusChange('half-day')}
                className={`p-4 rounded-lg border-2 transition flex flex-col items-center gap-2 ${
                  selectedStatus === 'half-day'
                    ? 'border-yellow-500 bg-yellow-50'
                    : 'border-gray-200 hover:border-yellow-200 hover:bg-yellow-50/50'
                }`}
              >
                <FaClock className={`w-6 h-6 ${
                  selectedStatus === 'half-day' ? 'text-yellow-500' : 'text-gray-400'
                }`} />
                <span className={`text-sm font-medium ${
                  selectedStatus === 'half-day' ? 'text-yellow-700' : 'text-gray-600'
                }`}>
                  Half Day
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-100 transition"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-2 min-w-[100px] justify-center"
          >
            {loading ? (
              <>
                <Loader type="inline" size="small" />
                Saving...
              </>
            ) : (
              isEditing ? 'Update' : 'Mark'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminAttendanceEditor;