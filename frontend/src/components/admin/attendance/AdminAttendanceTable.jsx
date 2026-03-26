import React from 'react';
import { 
  FaCheckCircle, 
  FaTimesCircle, 
  FaClock, 
  FaEdit,
  FaUserGraduate,
  FaChalkboardTeacher,
  FaBook
} from 'react-icons/fa';
import { MdLocalLibrary } from 'react-icons/md';
import { BsPersonWorkspace } from 'react-icons/bs';
import { GiTeacher } from 'react-icons/gi';

const AdminAttendanceTable = ({ 
  users, 
  attendanceMap,
  onEdit,
  category 
}) => {
  const getStatusBadge = (status) => {
    switch(status) {
      case 'present':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">
            <FaCheckCircle className="w-3 h-3" />
            Present
          </span>
        );
      case 'absent':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-100 text-red-700 rounded-full text-xs font-medium">
            <FaTimesCircle className="w-3 h-3" />
            Absent
          </span>
        );
      case 'half-day':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
            <FaClock className="w-3 h-3" />
            Half Day
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-500 rounded-full text-xs font-medium">
            Not Marked
          </span>
        );
    }
  };

  const getUserIcon = (user) => {
    if (category === 'employees' || user.userType === 'employees') {
      return <BsPersonWorkspace className="w-5 h-5 text-purple-600" />;
    } else if (category === 'academy' || user.studentCategory === 'academy') {
      return <GiTeacher className="w-5 h-5 text-blue-600" />;
    } else if (category === 'library' || user.studentCategory === 'library') {
      return <MdLocalLibrary className="w-5 h-5 text-green-600" />;
    }
    return <FaUserGraduate className="w-5 h-5 text-gray-600" />;
  };

  if (!users || users.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
        <FaUserGraduate className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-800 mb-2">No Users Found</h3>
        <p className="text-gray-500">No {category} users available for this date</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">User</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {users.map((user) => {
              const attendance = attendanceMap[user._id];
              
              return (
                <tr key={user._id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        category === 'employees' ? 'bg-purple-100' :
                        category === 'academy' ? 'bg-blue-100' :
                        'bg-green-100'
                      }`}>
                        {getUserIcon(user)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.userId}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-600">{user.email}</p>
                    <p className="text-xs text-gray-500">{user.phone || 'No phone'}</p>
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(attendance?.status)}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => onEdit(user, attendance)}
                      className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition"
                      title="Edit Attendance"
                    >
                      <FaEdit className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminAttendanceTable;