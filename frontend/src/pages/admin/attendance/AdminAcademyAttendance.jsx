import React, { useState, useEffect } from 'react';
import { GiTeacher } from 'react-icons/gi';
import { FiRefreshCw } from 'react-icons/fi';
import axios from 'axios';
import { toast } from 'react-hot-toast';

import AdminAttendanceStats from '../../../components/admin/attendance/AdminAttendanceStats';
import AdminAttendanceFilters from '../../../components/admin/attendance/AdminAttendanceFilters';
import AdminAttendanceTable from '../../../components/admin/attendance/AdminAttendanceTable';
import AdminAttendanceEditor from '../../../components/admin/attendance/AdminAttendanceEditor';

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
      const token = localStorage.getItem('token');

      // 1️⃣ Pehle academy students fetch karo
      const usersRes = await axios.get(
        'http://localhost:5000/api/admin/students?studentCategory=academy&limit=100',
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      const usersData = usersRes.data?.students || [];

      // 2️⃣ Attendance fetch karo selected date ke liye
      const dateStr = selectedDate.toISOString().split('T')[0];
      const attendanceRes = await axios.get(
        `http://localhost:5000/api/attendance/all?date=${dateStr}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      // 3️⃣ Attendance map banayo - sirf academy students ke liye
      const map = {};
      let present = 0, absent = 0, halfDay = 0;

      attendanceRes.data.data?.forEach(record => {
        // 🔥 IMPORTANT: Sirf academy students ka attendance lo
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
      const token = localStorage.getItem('token');
      const dateStr = selectedDate.toISOString().split('T')[0];
      const existing = attendanceMap[selectedUser._id];

      if (existing) {
        await axios.put(
          `http://localhost:5000/api/attendance/${existing._id}`,
          { status: editStatus },
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
      } else {
        await axios.post(
          'http://localhost:5000/api/attendance/user',
          { userId: selectedUser._id, status: editStatus, date: dateStr },
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
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

  // Filter users based on search and status
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
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading academy attendance...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header - UI SAME RAHEGA */}
      <div className="flex items-center justify-between mb-6">
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
          <FiRefreshCw className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Stats - UI SAME */}
      <AdminAttendanceStats stats={stats} />

      {/* Filters - UI SAME */}
      <AdminAttendanceFilters
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        category="Academy"
      />

      {/* Users Table - UI SAME */}
      <AdminAttendanceTable
        users={filteredUsers}
        attendanceMap={attendanceMap}
        onEdit={handleEdit}
        category="academy"
      />

      {/* Edit Modal - UI SAME */}
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