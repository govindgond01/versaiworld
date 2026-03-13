import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  FaEye, FaEdit, FaTrash, FaSearch, FaCheckCircle, FaTimesCircle, 
  FaEnvelope, FaPhone, FaSync, FaCalendarAlt, FaUserGraduate,
  FaRupeeSign, FaFilter, FaPlus, FaArrowLeft, FaArrowRight
} from 'react-icons/fa';
import { 
  MdLocalLibrary, MdWarning, MdSchool, MdRefresh 
} from 'react-icons/md';
import { 
  BsPersonBadge, BsPersonWorkspace, BsChevronDown, BsClock,
  BsCalendar, BsCashStack
} from 'react-icons/bs';
import { 
  GiTeacher, GiPayMoney, GiExpense 
} from 'react-icons/gi';
import { 
  RiGovernmentLine, RiBankLine 
} from 'react-icons/ri';

const AllStudents = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => { fetchStudents(); }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await axios.get('${globalThis.API_URL}/admin/students', {
        params: { search: searchTerm, status: statusFilter !== 'all' ? statusFilter : undefined, studentCategory: categoryFilter !== 'all' ? categoryFilter : undefined },
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.data.success) setStudents(res.data.students || []);
    } catch (error) {
      alert('Failed to fetch students');
    } finally { setLoading(false); }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete ${name}?`)) return;
    try {
      const token = localStorage.getItem('token');
      const res = await axios.delete(`${globalThis.API_URL}/admin/students/${id}`, { 
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.data.success) { alert('Deleted!'); fetchStudents(); }
    } catch (error) { alert('Delete failed'); }
  };

  const getDaysLeft = (expiry) => {
    if (!expiry) return 'N/A';
    const days = Math.ceil((new Date(expiry) - new Date()) / (1000 * 60 * 60 * 24));
    return days > 0 ? `${days}d` : 'Expired';
  };

  const getStatusColor = (status) => {
    if (status === 'active') return 'bg-green-100 text-green-700';
    if (status === 'inactive') return 'bg-red-100 text-red-700';
    return 'bg-gray-100 text-gray-700';
  };

  if (loading && !students.length) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-3 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl shadow-md">
            <FaUserGraduate className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Students</h1>
            <p className="text-sm text-gray-600 flex items-center gap-1.5">
              <BsPersonWorkspace className="w-4 h-4" /> {students.length} total students
            </p>
          </div>
        </div>
        <button 
          onClick={() => navigate('/admin-dashboard/students/add')}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 w-full sm:w-auto"
        >
          <FaPlus className="w-4 h-4" /> Add Student
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="relative">
            <FaSearch className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
            <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              onKeyUp={(e) => e.key === 'Enter' && fetchStudents()} />
          </div>
          <div className="relative">
            <FaFilter className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg appearance-none text-sm">
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <BsChevronDown className="absolute right-3 top-3 text-gray-400 w-4 h-4" />
          </div>
          <div className="relative">
            <MdLocalLibrary className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg appearance-none text-sm">
              <option value="all">All Categories</option>
              <option value="academy">Academy</option>
              <option value="library">Library</option>
            </select>
            <BsChevronDown className="absolute right-3 top-3 text-gray-400 w-4 h-4" />
          </div>
          <div className="flex gap-2">
            <button onClick={fetchStudents} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
              <FaSync className="w-4 h-4" /> Search
            </button>
            <button onClick={() => { setSearchTerm(''); setStatusFilter('all'); setCategoryFilter('all'); fetchStudents(); }}
              className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-50">
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Students Table/Cards */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {!students.length ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <FaUserGraduate className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-900 font-medium">No students found</p>
            <p className="text-sm text-gray-500 mt-1">Add a new student to get started</p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    {['ID', 'Student', 'Category', 'Membership', 'Fees', 'Status', 'Actions'].map(h => (
                      <th key={h} className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {students.map(s => (
                    <tr key={s._id} className="hover:bg-gray-50">
                      <td className="px-5 py-4">
                        <p className="font-medium text-blue-600 text-sm">{s.studentId || s.userId}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          <BsCalendar className="inline mr-1 w-3 h-3" />
                          {s.admissionDate ? new Date(s.admissionDate).toLocaleDateString() : 'N/A'}
                        </p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-medium text-gray-900">{s.name}</p>
                        <p className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                          <FaEnvelope className="w-3 h-3" /> {s.email}
                        </p>
                        <p className="text-xs text-gray-500 flex items-center gap-2 mt-0.5">
                          <FaPhone className="w-3 h-3" /> {s.phone || 'N/A'}
                        </p>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-full ${
                          s.studentCategory === 'academy' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                        }`}>
                          {s.studentCategory === 'academy' ? <GiTeacher className="w-3 h-3" /> : <MdLocalLibrary className="w-3 h-3" />}
                          {s.studentCategory === 'academy' ? 'Academy' : 'Library'}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-sm text-gray-900 capitalize">{s.membershipDuration?.replace('_', ' ') || '1 Month'}</p>
                        <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                          <BsClock className="w-3 h-3" />
                          {s.expiryDate ? new Date(s.expiryDate).toLocaleDateString() : 'N/A'}
                        </p>
                        <span className={`text-xs inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full ${
                          getDaysLeft(s.expiryDate) === 'Expired' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                        }`}>
                          <FaCalendarAlt className="w-2.5 h-2.5" />
                          {getDaysLeft(s.expiryDate)}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-sm font-medium text-gray-900 flex items-center gap-1">
                          <FaRupeeSign className="w-3 h-3" /> {s.paidFees || 0} / {s.totalFees || 0}
                        </p>
                        <p className={`text-xs mt-1 flex items-center gap-1 ${(s.feesDue || 0) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                          <GiPayMoney className="w-3 h-3" /> Due: ₹{s.feesDue || 0}
                        </p>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-full ${getStatusColor(s.status)}`}>
                          {s.status === 'active' ? <FaCheckCircle className="w-3 h-3" /> : <FaTimesCircle className="w-3 h-3" />}
                          {s.status || 'N/A'}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <button onClick={() => navigate(`/admin-dashboard/students/${s._id}`)} className="p-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100"><FaEye className="w-4 h-4" /></button>
                          <button onClick={() => navigate(`/admin-dashboard/students/edit/${s._id}`)} className="p-2 text-green-600 bg-green-50 rounded-lg hover:bg-green-100"><FaEdit className="w-4 h-4" /></button>
                          <button onClick={() => handleDelete(s._id, s.name)} className="p-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100"><FaTrash className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden space-y-3 p-4">
              {students.map(s => (
                <div key={s._id} className="bg-white border border-gray-200 rounded-xl p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className={`p-2 rounded-lg ${s.studentCategory === 'academy' ? 'bg-blue-100' : 'bg-purple-100'}`}>
                        {s.studentCategory === 'academy' ? <GiTeacher className="w-4 h-4 text-blue-600" /> : <MdLocalLibrary className="w-4 h-4 text-purple-600" />}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{s.name}</p>
                        <p className="text-xs text-blue-600">{s.studentId || s.userId}</p>
                      </div>
                    </div>
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-full ${getStatusColor(s.status)}`}>
                      {s.status === 'active' ? <FaCheckCircle className="w-3 h-3" /> : <FaTimesCircle className="w-3 h-3" />}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="bg-gray-50 rounded-lg p-2">
                      <p className="text-xs text-gray-500 mb-1 flex items-center gap-1"><FaEnvelope className="w-3 h-3" /> Email</p>
                      <p className="text-xs font-medium truncate">{s.email}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2">
                      <p className="text-xs text-gray-500 mb-1 flex items-center gap-1"><FaPhone className="w-3 h-3" /> Phone</p>
                      <p className="text-xs font-medium">{s.phone || 'N/A'}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2">
                      <p className="text-xs text-gray-500 mb-1 flex items-center gap-1"><BsCalendar className="w-3 h-3" /> Expiry</p>
                      <p className="text-xs font-medium">{s.expiryDate ? new Date(s.expiryDate).toLocaleDateString() : 'N/A'}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2">
                      <p className="text-xs text-gray-500 mb-1 flex items-center gap-1"><BsCashStack className="w-3 h-3" /> Fees</p>
                      <p className="text-xs font-medium">₹{s.paidFees || 0}/₹{s.totalFees || 0}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      (s.feesDue || 0) > 0 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                    }`}>
                      <GiPayMoney className="inline mr-1 w-3 h-3" /> Due: ₹{s.feesDue || 0}
                    </span>
                    <div className="flex gap-2">
                      <button onClick={() => navigate(`/admin-dashboard/students/${s._id}`)} className="p-2 bg-blue-50 text-blue-600 rounded-lg"><FaEye className="w-4 h-4" /></button>
                      <button onClick={() => navigate(`/admin-dashboard/students/edit/${s._id}`)} className="p-2 bg-green-50 text-green-600 rounded-lg"><FaEdit className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(s._id, s.name)} className="p-2 bg-red-50 text-red-600 rounded-lg"><FaTrash className="w-4 h-4" /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AllStudents;