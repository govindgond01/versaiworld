import React, { useState, useEffect } from 'react';
import { MdLocalLibrary } from 'react-icons/md';
import { FiRefreshCw } from 'react-icons/fi';
import axios from 'axios';
import { toast } from 'react-hot-toast';

import AdminAttendanceStats from '../../../components/admin/attendance/AdminAttendanceStats';
import AdminAttendanceFilters from '../../../components/admin/attendance/AdminAttendanceFilters';
import AdminAttendanceTable from '../../../components/admin/attendance/AdminAttendanceTable';
import AdminAttendanceEditor from '../../../components/admin/attendance/AdminAttendanceEditor';

const AdminLibraryAttendance = () => {
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
      const token = localStorage.getItem('token');

      const usersRes = await axios.get(
        '${globalThis.API_URL}/admin/students?studentCategory=library&limit=100',
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      const usersData = usersRes.data?.students || [];
      setUsers(usersData);

      const dateStr = selectedDate.toISOString().split('T')[0];
      const attendanceRes = await axios.get(
        `${globalThis.API_URL}/attendance/all?date=${dateStr}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      const map = {};
      let present = 0, absent = 0, halfDay = 0;

      attendanceRes.data.data?.forEach(record => {
        if (record.userId?.studentCategory === 'library') {
          map[record.userId._id] = record;
          if (record.status === 'present') present++;
          else if (record.status === 'absent') absent++;
          else if (record.status === 'half-day') halfDay++;
        }
      });

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
      const token = localStorage.getItem('token');
      const dateStr = selectedDate.toISOString().split('T')[0];
      const existing = attendanceMap[selectedUser._id];

      if (existing) {
        await axios.put(
          `${globalThis.API_URL}/attendance/${existing._id}`,
          { status: editStatus },
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
      } else {
        await axios.post(
          '${globalThis.API_URL}/attendance/user',
          { userId: selectedUser._id, status: editStatus, date: dateStr },
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
      }

      toast.success('Attendance updated');
      fetchData();
      setShowEditor(false);
    } catch (error) {
      toast.error('Failed to update');
    } finally {
      setSaving(false);
    }
  };

  const filteredUsers = users.filter(user => {
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matches = user.name?.toLowerCase().includes(term) ||
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
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading library attendance...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl shadow-lg">
            <MdLocalLibrary className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Library Attendance</h1>
            <p className="text-sm text-gray-500">Manage attendance for library members</p>
          </div>
        </div>
        <button onClick={fetchData} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <FiRefreshCw className={loading ? 'animate-spin' : ''} /> Refresh
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
        category="Library"
      />

      <AdminAttendanceTable
        users={filteredUsers}
        attendanceMap={attendanceMap}
        onEdit={handleEdit}
        category="library"
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

export default AdminLibraryAttendance;