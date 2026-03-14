import React from 'react';
import { FaCheckCircle, FaTimesCircle, FaClock, FaSpinner } from 'react-icons/fa';

const AttendanceMarker = ({ todayStatus, onMark, loading }) => {
  // Agar already mark kiya hai to status dikhao
  if (todayStatus) {
    return (
      <div className={`rounded-xl p-6 text-center border ${
        todayStatus === 'present' ? 'bg-green-50 border-green-200' :
        todayStatus === 'absent' ? 'bg-red-50 border-red-200' :
        'bg-yellow-50 border-yellow-200'
      }`}>
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white shadow-lg mb-4">
          {todayStatus === 'present' && <FaCheckCircle className="w-8 h-8 text-green-500" />}
          {todayStatus === 'absent' && <FaTimesCircle className="w-8 h-8 text-red-500" />}
          {todayStatus === 'half-day' && <FaClock className="w-8 h-8 text-yellow-500" />}
        </div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          {todayStatus === 'present' ? 'Present' : 
           todayStatus === 'absent' ? 'Absent' : 'Half Day'} for Today
        </h3>
        <p className="text-sm text-gray-600">
          You have already marked your attendance
        </p>
      </div>
    );
  }

  // Nahi to buttons dikhao
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <span className="w-1 h-6 bg-blue-500 rounded-full"></span>
        Mark Today's Attendance
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button
          onClick={() => onMark('present')}
          disabled={loading}
          className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium py-4 px-4 rounded-xl transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md"
        >
          {loading ? <FaSpinner className="animate-spin" /> : <FaCheckCircle />}
          Present
        </button>
        <button
          onClick={() => onMark('absent')}
          disabled={loading}
          className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-medium py-4 px-4 rounded-xl transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md"
        >
          {loading ? <FaSpinner className="animate-spin" /> : <FaTimesCircle />}
          Absent
        </button>
        <button
          onClick={() => onMark('half-day')}
          disabled={loading}
          className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white font-medium py-4 px-4 rounded-xl transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md"
        >
          {loading ? <FaSpinner className="animate-spin" /> : <FaClock />}
          Half Day
        </button>
      </div>
    </div>
  );
};

export default AttendanceMarker;