import React, { useState, useEffect } from 'react';
import { FaEye, FaEdit, FaTrash, FaSearch, FaUserTie, FaUser, FaUserCheck, FaUserTimes, FaFilter, FaDownload } from 'react-icons/fa';
import api from '../../services/api';
import { toast } from 'react-hot-toast';
import Loader from '../../components/common/Loader';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [newRole, setNewRole] = useState('');
  const [showAddAdminModal, setShowAddAdminModal] = useState(false);
  const [newAdmin, setNewAdmin] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  useEffect(() => {
    fetchUsers();
  }, [currentPage, roleFilter, statusFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 10,
        search: searchTerm,
        role: roleFilter !== 'all' ? roleFilter : '',
        status: statusFilter !== 'all' ? statusFilter : ''
      };
      const res = await api.get('/admin/users', { params });

      if (res.data.success) {
        setUsers(res.data.users || []);
        setTotalUsers(res.data.count || 0);
        setTotalPages(res.data.totalPages || 1);
      }
    } catch (error) {
      toast.error('Failed to fetch users');
      console.error('Fetch users error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchUsers();
  };

  const handleRoleChange = async () => {
    if (!selectedUser || !newRole) return;

    try {
      await api.patch(`/admin/users/${selectedUser._id}/role`, { userType: newRole });
      toast.success('User role updated successfully');
      setShowRoleModal(false);
      setSelectedUser(null);
      setNewRole('');
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update role');
    }
  };

  const handleBlockUser = async (userId, isActive) => {
    try {
      await api.patch(`/admin/users/${userId}/block`, { isActive: !isActive });
      toast.success(`User ${!isActive ? 'blocked' : 'unblocked'} successfully`);
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update user status');
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to delete ${userName}? This action cannot be undone.`)) return;

    try {
      await api.delete(`/admin/users/${userId}`);
      toast.success('User deleted successfully');
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to delete user');
    }
  };

  const getRoleBadge = (role) => {
    const roleConfig = {
      superAdmin: { color: 'bg-red-100 text-red-800', icon: <FaUserTie className="w-3 h-3" /> },
      admin: { color: 'bg-purple-100 text-purple-800', icon: <FaUserTie className="w-3 h-3" /> },
      staff: { color: 'bg-blue-100 text-blue-800', icon: <FaUser className="w-3 h-3" /> },
      student: { color: 'bg-green-100 text-green-800', icon: <FaUser className="w-3 h-3" /> }
    };
    return roleConfig[role] || roleConfig.student;
  };

  const getStatusBadge = (isActive, status) => {
    if (!isActive) return { text: 'Blocked', color: 'bg-red-100 text-red-800' };
    switch (status) {
      case 'active': return { text: 'Active', color: 'bg-green-100 text-green-800' };
      case 'inactive': return { text: 'Inactive', color: 'bg-yellow-100 text-yellow-800' };
      case 'suspended': return { text: 'Suspended', color: 'bg-red-100 text-red-800' };
      default: return { text: 'Unknown', color: 'bg-gray-100 text-gray-800' };
    }
  };

  const userRole = localStorage.getItem('role') || '';

  const handleAddAdmin = async (e) => {
    e.preventDefault();
    
    if (!newAdmin.name || !newAdmin.email || !newAdmin.password) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (newAdmin.password !== newAdmin.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (newAdmin.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    try {
      const response = await api.post('/auth/register-admin', {
        name: newAdmin.name,
        email: newAdmin.email,
        password: newAdmin.password,
        userType: 'admin'
      });

      if (response.data.success) {
        toast.success('Admin user created successfully');
        setShowAddAdminModal(false);
        setNewAdmin({ name: '', email: '', password: '', confirmPassword: '' });
        fetchUsers();
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to create admin user');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewAdmin(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="space-y-4 sm:space-y-6 px-4 sm:px-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">Manage all users in the system</p>
        </div>
        <div className="flex gap-2 sm:gap-3">
          <button
            onClick={fetchUsers}
            className="flex items-center justify-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-600 text-white text-xs sm:text-sm font-medium rounded-lg hover:bg-blue-700 w-full sm:w-auto"
          >
            <FaDownload className="w-3 h-3 sm:w-4 sm:h-4" /> Refresh
          </button>
        </div>
      </div>

      {/* Filters */}
      <form onSubmit={handleSearch} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 bg-white border border-gray-200 rounded-lg text-xs sm:text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
          <div className="relative">
            <FaFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full pl-9 sm:pl-10 pr-8 sm:pr-10 py-2 sm:py-2.5 bg-white border border-gray-200 rounded-lg appearance-none text-xs sm:text-sm"
            >
              <option value="all">All Roles</option>
              <option value="superAdmin">Super Admin</option>
              <option value="admin">Admin</option>
              <option value="staff">Staff</option>
              <option value="student">Student</option>
            </select>
          </div>
          <div className="relative">
            <FaUserCheck className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-9 sm:pl-10 pr-8 sm:pr-10 py-2 sm:py-2.5 bg-white border border-gray-200 rounded-lg appearance-none text-xs sm:text-sm"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 bg-blue-600 text-white text-xs sm:text-sm font-medium rounded-lg hover:bg-blue-700 flex items-center justify-center gap-1 sm:gap-2"
            >
              <FaSearch className="w-3 h-3 sm:w-4 sm:h-4" /> Search
            </button>
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                setRoleFilter('all');
                setStatusFilter('all');
                setCurrentPage(1);
                fetchUsers();
              }}
              className="px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-200 bg-white text-gray-700 text-xs sm:text-sm font-medium rounded-lg hover:bg-gray-50"
            >
              Clear
            </button>
          </div>
        </div>
      </form>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <Loader type="table" rows={8} cols={5} />
        ) : !users.length ? (
          <div className="text-center py-8 sm:py-12">
            <FaUser className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
            <p className="text-sm sm:text-base text-gray-500">No users found</p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    {['User Details', 'Role', 'Status', 'Last Login', 'Actions'].map(h => (
                      <th key={h} className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {users.map(user => {
                    const roleConfig = getRoleBadge(user.userType);
                    const statusConfig = getStatusBadge(user.isActive, user.status);
                    return (
                      <tr key={user._id} className="hover:bg-gray-50">
                        <td className="px-4 sm:px-6 py-3 sm:py-4">
                          <div className="flex items-center gap-2 sm:gap-3">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                              <FaUser className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-gray-900 text-sm sm:text-base truncate">{user.name}</p>
                              <p className="text-xs text-gray-500 truncate">{user.email}</p>
                              <p className="text-[10px] sm:text-xs text-gray-400 truncate">ID: {user.userId}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4">
                          <span className={`inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs font-medium rounded-full ${roleConfig.color}`}>
                            {roleConfig.icon} {user.userType}
                          </span>
                        </td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4">
                          <span className={`inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs font-medium rounded-full ${statusConfig.color}`}>
                            {user.isActive ? <FaUserCheck className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> : <FaUserTimes className="w-2.5 h-2.5 sm:w-3 sm:h-3" />}
                            {statusConfig.text}
                          </span>
                        </td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4">
                          <p className="text-xs sm:text-sm text-gray-900">
                            {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                          </p>
                          <p className="text-[10px] sm:text-xs text-gray-500">
                            {user.lastLogin ? new Date(user.lastLogin).toLocaleTimeString() : ''}
                          </p>
                        </td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4">
                          <div className="flex items-center gap-1.5 sm:gap-2">
                            <button
                              onClick={() => {
                                setSelectedUser(user);
                                setNewRole(user.userType);
                                setShowRoleModal(true);
                              }}
                              className="p-1.5 sm:p-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100"
                              title="Change Role"
                            >
                              <FaEdit className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            </button>
                            <button
                              onClick={() => handleBlockUser(user._id, user.isActive)}
                              className={`p-1.5 sm:p-2 rounded-lg ${user.isActive ? 'text-red-600 bg-red-50 hover:bg-red-100' : 'text-green-600 bg-green-50 hover:bg-green-100'}`}
                              title={user.isActive ? 'Block User' : 'Unblock User'}
                            >
                              {user.isActive ? <FaUserTimes className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <FaUserCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user._id, user.name)}
                              className="p-1.5 sm:p-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100"
                              title="Delete User"
                            >
                              <FaTrash className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden space-y-3 p-4">
              {users.map(user => {
                const roleConfig = getRoleBadge(user.userType);
                const statusConfig = getStatusBadge(user.isActive, user.status);
                return (
                  <div key={user._id} className="bg-white border border-gray-200 rounded-xl p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                          <FaUser className="w-5 h-5 text-gray-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{user.name}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                          <p className="text-xs text-gray-400">ID: {user.userId}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${roleConfig.color}`}>
                          {roleConfig.icon} {user.userType}
                        </span>
                        <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${statusConfig.color}`}>
                          {user.isActive ? <FaUserCheck className="w-3 h-3" /> : <FaUserTimes className="w-3 h-3" />}
                          {statusConfig.text}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div className="bg-gray-50 rounded-lg p-2">
                        <p className="text-xs text-gray-500 mb-1">Last Login</p>
                        <p className="text-xs font-medium">
                          {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                        </p>
                        <p className="text-[10px] text-gray-400">
                          {user.lastLogin ? new Date(user.lastLogin).toLocaleTimeString() : ''}
                        </p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-2">
                        <p className="text-xs text-gray-500 mb-1">Status</p>
                        <p className="text-xs font-medium capitalize">{user.status || 'active'}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-3 border-t">
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setNewRole(user.userType);
                          setShowRoleModal(true);
                        }}
                        className="p-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100"
                      >
                        <FaEdit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleBlockUser(user._id, user.isActive)}
                        className={`p-2 rounded-lg ${user.isActive ? 'text-red-600 bg-red-50 hover:bg-red-100' : 'text-green-600 bg-green-50 hover:bg-green-100'}`}
                      >
                        {user.isActive ? <FaUserTimes className="w-4 h-4" /> : <FaUserCheck className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user._id, user.name)}
                        className="p-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100"
                      >
                        <FaTrash className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-4 sm:px-6 py-3 sm:py-4 border-t bg-gray-50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                <p className="text-xs sm:text-sm text-gray-600 text-center sm:text-left">
                  Page {currentPage} of {totalPages} • {totalUsers} users
                </p>
                <div className="flex gap-2 justify-center">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-3 sm:px-4 py-1.5 sm:py-2 border bg-white text-gray-700 text-xs sm:text-sm rounded-lg disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-3 sm:px-4 py-1.5 sm:py-2 border bg-white text-gray-700 text-xs sm:text-sm rounded-lg disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Role Change Modal - Responsive */}
      {showRoleModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4">
            <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
              <h3 className="text-base sm:text-lg font-bold text-gray-900">Change User Role</h3>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">Update role for {selectedUser.name}</p>
            </div>

            <div className="p-4 sm:p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                    New Role
                  </label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  >
                    <option value="academy">Academy</option>
                    <option value="library">Library</option>
                    <option value="staff">Staff</option>
                    <option value="admin">Admin</option>
                    <option value="superAdmin">Super Admin</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-200 flex justify-end gap-2 sm:gap-3">
              <button
                onClick={() => {
                  setShowRoleModal(false);
                  setSelectedUser(null);
                  setNewRole('');
                }}
                className="px-3 sm:px-4 py-1.5 sm:py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleRoleChange}
                disabled={!newRole || newRole === selectedUser.userType}
                className="px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Update Role
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;