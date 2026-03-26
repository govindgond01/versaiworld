import React, { useState, useEffect } from 'react';
import useDebouncedNavigation from '../../hooks/useDebouncedNavigation';
import api from '../../services/api';
import {
  FaEye, FaEdit, FaTrash, FaSearch, FaCheckCircle, FaTimesCircle,
  FaEnvelope, FaPhone, FaUserTie, FaRupeeSign, FaBuilding, FaCalendarAlt,
  FaFilter, FaDownload, FaPlus, FaArrowLeft, FaArrowRight,
  FaIdCard, FaUserGraduate, FaChartLine
} from 'react-icons/fa';
import {
  MdLocalLibrary, MdSchool, MdWarning, MdPayments, MdPerson
} from 'react-icons/md';
import {
  BsPersonBadge, BsPersonWorkspace, BsCashStack, BsChevronDown,
  BsCalendar, BsEnvelope, BsTelephone, BsGraphUp
} from 'react-icons/bs';
import Loader from '../common/Loader';
import {
  GiTeacher, GiPayMoney, GiExpense, GiReceiveMoney
} from 'react-icons/gi';

const AllEmployees = () => {
  const debouncedNavigate = useDebouncedNavigation(300);
  const [employees, setemployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalemployees, setTotalemployees] = useState(0);

  useEffect(() => { fetchemployees(); }, [currentPage, statusFilter, roleFilter]);

  const fetchemployees = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage, limit: 10, search: searchTerm,
        status: statusFilter !== 'all' ? statusFilter : '',
        employeesRole: roleFilter !== 'all' ? roleFilter : ''
      };
      const res = await api.get('/employees', { params });

      if (res.data.success) {
        setemployees(res.data.employees || []);
        setTotalemployees(res.data.total || 0);
        setTotalPages(res.data.pages || 1);
      }
    } catch { alert('Failed to fetch employees'); }
    finally { setLoading(false); }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchemployees();
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete ${name}?`)) return;
    try {
      await api.delete(`/employees/${id}`);
      alert('Deleted!');
      fetchemployees();
    } catch { alert('Delete failed'); }
  };

  const handleExport = async () => {
    try {
      const res = await api.get('/employees/export');
      if (res.data.success) {
        const csv = [Object.keys(res.data.data[0] || {}).join(',')];
        res.data.data.forEach(row => csv.push(Object.values(row).join(',')));
        const blob = new Blob([csv.join('\n')], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `employees_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
      }
    } catch { alert('Export failed'); }
  };

  const getRoleConfig = (role) => {
    switch (role) {
      case 'teacher': return { name: 'Teacher', icon: <GiTeacher className="w-4 h-4" />, color: 'blue', bg: 'bg-blue-100', text: 'text-blue-700' };
      case 'librarian': return { name: 'Librarian', icon: <MdLocalLibrary className="w-4 h-4" />, color: 'purple', bg: 'bg-purple-100', text: 'text-purple-700' };
      case 'accountant': return { name: 'Accountant', icon: <BsCashStack className="w-4 h-4" />, color: 'green', bg: 'bg-green-100', text: 'text-green-700' };
      case 'admin': return { name: 'Admin', icon: <FaUserTie className="w-4 h-4" />, color: 'red', bg: 'bg-red-100', text: 'text-red-700' };
      default: return { name: 'employees', icon: <BsPersonWorkspace className="w-4 h-4" />, color: 'gray', bg: 'bg-gray-100', text: 'text-gray-700' };
    }
  };

  const inputClass = "w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

  return (
    <div className="max-w-7xl mx-auto space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 md:p-2.5 bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl shadow-md">
            <BsPersonWorkspace className="w-4 h-4 md:w-5 md:h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">employees Members</h1>
            <p className="text-sm text-gray-600 flex items-center gap-1.5">
              <FaUserGraduate className="w-4 h-4" /> {totalemployees} total employees
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <button onClick={() => debouncedNavigate('/admin/employees/add')} className="flex items-center gap-2 px-3 md:px-4 py-2 md:py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700">
            <FaPlus className="w-4 h-4" /> Add
          </button>
          <button onClick={handleExport} className="flex items-center gap-2 px-3 md:px-4 py-2 md:py-2.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700">
            <FaDownload className="w-4 h-4" /> Export
          </button>
          <button onClick={() => debouncedNavigate('/admin/employees')} className="flex items-center gap-2 px-3 md:px-4 py-2 md:py-2.5 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700">
            <FaChartLine className="w-4 h-4" /> Dashboard
          </button>
        </div>
      </div>

      {/* Filters */}
      <form onSubmit={handleSearch} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 md:p-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-2 relative">
            <FaSearch className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
            <input type="text" placeholder="Search name, email, ID..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              className={inputClass} />
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
            <FaUserTie className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
            <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg appearance-none text-sm">
              <option value="all">All Roles</option>
              <option value="teacher">Teacher</option>
              <option value="librarian">Librarian</option>
              <option value="accountant">Accountant</option>
              <option value="admin">Admin</option>
            </select>
            <BsChevronDown className="absolute right-3 top-3 text-gray-400 w-4 h-4" />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="flex-1 px-3 md:px-4 py-2 md:py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2">
              <FaSearch className="w-4 h-4" /> Search
            </button>
            <button type="button" onClick={() => { setSearchTerm(''); setStatusFilter('all'); setRoleFilter('all'); setCurrentPage(1); }}
              className="px-3 md:px-4 py-2 md:py-2.5 border border-gray-200 bg-white text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50">
              Clear
            </button>
          </div>
        </div>
      </form>

      {/* employees Table/Cards */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center"><Loader type="spinner" size="large" /><p className="mt-3">Loading...</p></div>
          </div>
        ) : !employees.length ? (
          <div className="text-center py-12"><p className="text-gray-500">No employees found</p></div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    {['ID', 'Name & Details', 'Role', 'Salary', 'Status', 'Actions'].map(h => (
                      <th key={h} className="px-5 py-4 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {employees.map(s => {
                    const role = getRoleConfig(s.employeesRole);
                    return (
                      <tr key={s._id} className="hover:bg-gray-50">
                        <td className="px-5 py-4">
                          <p className="font-medium text-blue-600 text-sm">{s.employeesId || s.userId}</p>
                          <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                            <FaCalendarAlt className="w-3 h-3" /> {s.joinDate ? new Date(s.joinDate).toLocaleDateString() : 'N/A'}
                          </p>
                        </td>
                        <td className="px-5 py-4">
                          <p className="font-medium text-gray-900">{s.name}</p>
                          <div className="text-xs text-gray-500 mt-1 space-y-1">
                            <p className="flex items-center gap-1"><FaEnvelope className="w-3 h-3" /> {s.email}</p>
                            <p className="flex items-center gap-1"><FaPhone className="w-3 h-3" /> {s.phone || 'N/A'}</p>
                            {s.department && <p className="flex items-center gap-1"><FaBuilding className="w-3 h-3" /> {s.department}</p>}
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full ${role.bg} ${role.text}`}>
                            {role.icon} {role.name}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <p className="font-medium text-gray-900 flex items-center gap-1"><FaRupeeSign className="w-3 h-3" /> {s.salary?.toLocaleString() || 0}</p>
                          <p className="text-xs text-gray-500 mt-1">Paid: ₹{s.paidSalary?.toLocaleString() || 0}</p>
                          <p className={`text-xs ${s.dueSalary > 0 ? 'text-red-600' : 'text-green-600'}`}>Due: ₹{s.dueSalary?.toLocaleString() || 0}</p>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full ${
                            s.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {s.status === 'active' ? <FaCheckCircle className="w-3 h-3" /> : <FaTimesCircle className="w-3 h-3" />}
                            {s.status}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <button onClick={() => debouncedNavigate(`/admin/employees/${s._id}`)} className="p-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100"><FaEye className="w-4 h-4" /></button>
                            <button onClick={() => debouncedNavigate(`/admin/employees/edit/${s._id}`)} className="p-2 text-green-600 bg-green-50 rounded-lg hover:bg-green-100"><FaEdit className="w-4 h-4" /></button>
                            <button onClick={() => handleDelete(s._id, s.name)} className="p-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100"><FaTrash className="w-4 h-4" /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden space-y-4 p-4">
              {employees.map(s => {
                const role = getRoleConfig(s.employeesRole);
                return (
                  <div key={s._id} className="bg-white border border-gray-200 rounded-xl p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className={`p-2 rounded-lg ${role.bg}`}>{role.icon}</div>
                        <div>
                          <p className="font-semibold text-gray-900">{s.name}</p>
                          <p className="text-xs text-blue-600">{s.employeesId || s.userId}</p>
                        </div>
                      </div>
                      <span className={`px-2.5 py-1.5 text-xs font-medium rounded-full ${
                        s.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {s.status === 'active' ? <FaCheckCircle className="inline w-3 h-3 mr-1" /> : <FaTimesCircle className="inline w-3 h-3 mr-1" />}
                        {s.status}
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
                        <p className="text-xs text-gray-500 mb-1 flex items-center gap-1"><FaRupeeSign className="w-3 h-3" /> Salary</p>
                        <p className="text-xs font-medium">₹{s.salary?.toLocaleString() || 0}</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-2">
                        <p className="text-xs text-gray-500 mb-1 flex items-center gap-1"><GiPayMoney className="w-3 h-3" /> Due</p>
                        <p className={`text-xs font-medium ${s.dueSalary > 0 ? 'text-red-600' : 'text-green-600'}`}>
                          ₹{s.dueSalary?.toLocaleString() || 0}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t">
                      <span className={`px-2.5 py-1.5 text-xs font-medium rounded-full ${role.bg} ${role.text} flex items-center gap-1`}>
                        {role.icon} {role.name}
                      </span>
                      <div className="flex gap-2">
                        <button onClick={() => debouncedNavigate(`/admin/employees/${s._id}`)} className="p-2 bg-blue-50 text-blue-600 rounded-lg"><FaEye className="w-4 h-4" /></button>
                        <button onClick={() => debouncedNavigate(`/admin/employees/edit/${s._id}`)} className="p-2 bg-green-50 text-green-600 rounded-lg"><FaEdit className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(s._id, s.name)} className="p-2 bg-red-50 text-red-600 rounded-lg"><FaTrash className="w-4 h-4" /></button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-4 md:px-6 py-3 md:py-4 border-t bg-gray-50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <p className="text-sm text-gray-600">Page {currentPage} of {totalPages} • {totalemployees} employees</p>
                <div className="flex gap-2">
                  <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1}
                    className="flex items-center gap-1 px-3 md:px-4 py-2 border bg-white text-gray-700 text-sm rounded-lg disabled:opacity-50">
                    <FaArrowLeft className="w-3 h-3" /> Prev
                  </button>
                  <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages}
                    className="flex items-center gap-1 px-3 md:px-4 py-2 border bg-white text-gray-700 text-sm rounded-lg disabled:opacity-50">
                    Next <FaArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AllEmployees;