import React, { useState, useEffect } from 'react';
import { GiTeacher } from 'react-icons/gi';
import { FiRefreshCw } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import Loader from '../../../components/common/Loader';

import AdminAttendanceStats from '../../../components/admin/attendance/AdminAttendanceStats';
import AdminAttendanceFilters from '../../../components/admin/attendance/AdminAttendanceFilters';
import AdminAttendanceTable from '../../../components/admin/attendance/AdminAttendanceTable';
import AdminAttendanceEditor from '../../../components/admin/attendance/AdminAttendanceEditor';
import api from '../../../services/api';

const AdminAcademyAttendance = () => {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [attendanceMap, setAttendanceMap] = useState({});
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [stats, setStats] = useState({ total: 0, present: 0, absent: 0, halfDay: 0 });

  const [showEditor, setShowEditor] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editStatus, setEditStatus] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, [selectedDate]);

  const fetchData = async () => {
    try {
      setLoading(true);

      const usersRes = await api.get('/admin/students?studentCategory=academy&limit=100');

      const usersData = usersRes.data?.students || [];

      const dateStr = selectedDate.toISOString().split('T')[0];
      const attendanceRes = await api.get(`/attendance/all?date=${dateStr}`);

      const map = {};
      let present = 0, absent = 0, halfDay = 0;

      attendanceRes.data.data?.forEach(record => {
        if (record.userId?.studentCategory === 'academy') {
          map[record.userId._id] = record;

          if (record.status === 'present') present++;
          else if (record.status === 'absent') absent++;
          else if (record.status === 'half-day') halfDay++;
        }
      });

      setUsers(usersData);
      setAttendanceMap(map);
      setStats({
        total: usersData.length,
        present,
        absent,
        halfDay
      });

    } catch (error) {
      toast.error('Failed to load attendance data');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user, attendance) => {
    setSelectedUser(user);
    setEditStatus(attendance?.status || 'present');
    setShowEditor(true);
  };

  const handleSaveEdit = async () => {
    try {
      setSaving(true);
      const dateStr = selectedDate.toISOString().split('T')[0];
      const existing = attendanceMap[selectedUser._id];

      if (existing) {
        await api.put(`/attendance/${existing._id}`, { status: editStatus });
      } else {
        await api.post('/attendance/user', { userId: selectedUser._id, status: editStatus, date: dateStr });
      }

      toast.success('Attendance updated');
      fetchData();
      setShowEditor(false);
    } catch (error) {
      toast.error('Failed to update attendance');
    } finally {
      setSaving(false);
    }
  };

  const filteredUsers = users.filter(user => {
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matches =
        user.name?.toLowerCase().includes(term) ||
        user.email?.toLowerCase().includes(term) ||
        user.userId?.toLowerCase().includes(term);
      if (!matches) return false;
    }

    if (statusFilter !== 'all') {
      const attendance = attendanceMap[user._id];
      if (!attendance || attendance.status !== statusFilter) return false;
    }

    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader type="spinner" size="medium" />
          <p className="mt-4 text-gray-600">Loading academy attendance...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl shadow-lg">
            <GiTeacher className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Academy Attendance</h1>
            <p className="text-sm text-gray-500">Manage attendance for academy students</p>
          </div>
        </div>
        <button
          onClick={fetchData}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          {loading ? <Loader type="inline" size="small" /> : <FiRefreshCw />}
          Refresh
        </button>
      </div>

      <AdminAttendanceStats stats={stats} />

      <AdminAttendanceFilters
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        category="Academy"
      />

      <AdminAttendanceTable
        users={filteredUsers}
        attendanceMap={attendanceMap}
        onEdit={handleEdit}
        category="academy"
      />

      <AdminAttendanceEditor
        isOpen={showEditor}
        onClose={() => setShowEditor(false)}
        user={selectedUser}
        selectedStatus={editStatus}
        onStatusChange={setEditStatus}
        onSave={handleSaveEdit}
        loading={saving}
        isEditing={!!attendanceMap[selectedUser?._id]}
      />
    </div>
  );
};

export default AdminAcademyAttendance;