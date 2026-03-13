import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FaUsers, FaSync, FaUserGraduate, FaBook, FaChartPie,
  FaCheckCircle, FaTimesCircle, FaSpinner
} from 'react-icons/fa';
import { 
  MdLocalLibrary, MdSchool, MdWarning 
} from 'react-icons/md';
import { 
  BsPersonBadge, BsPersonWorkspace, BsGraphUp 
} from 'react-icons/bs';
import { 
  GiTeacher, GiPayMoney, GiExpense 
} from 'react-icons/gi';

const StudentTypes = () => {
  const [stats, setStats] = useState({ 
    categories: [], stats: { total: 0, active: 0, inactive: 0 }, departments: [] 
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/admin/students/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.data.success) setStats({
        categories: res.data.categories || [],
        stats: res.data.stats || { total: 0, active: 0, inactive: 0 },
        departments: res.data.departments || []
      });
    } catch (error) {
      alert('Failed to load statistics');
    } finally { setLoading(false); }
  };

  const getCategoryConfig = (type) => {
    switch(type) {
      case 'academy': 
        return { name: 'Academy Students', icon: <GiTeacher className="w-5 h-5" />, color: 'blue', bg: 'bg-blue-100', text: 'text-blue-600' };
      case 'library': 
        return { name: 'Library Students', icon: <MdLocalLibrary className="w-5 h-5" />, color: 'purple', bg: 'bg-purple-100', text: 'text-purple-600' };
      default: 
        return { name: type || 'Other', icon: <FaUsers className="w-5 h-5" />, color: 'gray', bg: 'bg-gray-100', text: 'text-gray-600' };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <FaSpinner className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
          <p className="mt-3 text-gray-600">Loading statistics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl shadow-md">
            <FaChartPie className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Student Categories</h1>
            <p className="text-sm text-gray-600 flex items-center gap-1.5">
              <FaUsers className="w-4 h-4" /> {stats.stats.total} total students • {stats.categories.length} categories
            </p>
          </div>
        </div>
        <button onClick={fetchData} className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 w-full sm:w-auto">
          <FaSync className={loading ? 'animate-spin w-4 h-4' : 'w-4 h-4'} /> Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Students', value: stats.stats.total, icon: <FaUsers className="w-6 h-6" />, bg: 'bg-blue-100', text: 'text-blue-600' },
          { label: 'Active Students', value: stats.stats.active, icon: <FaCheckCircle className="w-6 h-6" />, bg: 'bg-green-100', text: 'text-green-600' },
          { label: 'Inactive Students', value: stats.stats.inactive || 0, icon: <FaTimesCircle className="w-6 h-6" />, bg: 'bg-red-100', text: 'text-red-600' }
        ].map((card, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 flex items-center justify-between hover:shadow-md transition">
            <div>
              <p className="text-xs sm:text-sm text-gray-600">{card.label}</p>
              <p className="text-2xl font-bold mt-1">{card.value}</p>
            </div>
            <div className={`p-3 rounded-xl ${card.bg} ${card.text}`}>{card.icon}</div>
          </div>
        ))}
      </div>

      {/* Category Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {stats.categories.map((cat, i) => {
          const config = getCategoryConfig(cat._id);
          const percentage = stats.stats.total > 0 ? ((cat.count / stats.stats.total) * 100).toFixed(1) : 0;
          
          return (
            <div key={i} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition group">
              <div className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl ${config.bg} group-hover:scale-110 transition`}>
                    <span className={config.text}>{config.icon}</span>
                  </div>
                  <span className="text-2xl font-bold text-gray-900">{cat.count}</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{config.name}</h3>
                <p className="text-sm text-gray-500 mb-3">{percentage}% of total</p>
                <div className="w-full bg-gray-100 rounded-full h-2.5">
                  <div className={`h-2.5 rounded-full bg-${config.color}-500`} style={{ width: `${percentage}%` }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Distribution Chart */}
      {stats.categories.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 sm:px-6 py-4 bg-gray-50 border-b flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-blue-100 rounded-lg">
                <BsGraphUp className="w-4 h-4 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Category Distribution</h3>
            </div>
            <span className="text-xs text-gray-500">{stats.categories.length} categories</span>
          </div>

          <div className="p-5 space-y-4">
            {stats.categories.map((cat, i) => {
              const config = getCategoryConfig(cat._id);
              const percentage = stats.stats.total > 0 ? ((cat.count / stats.stats.total) * 100).toFixed(1) : 0;
              
              return (
                <div key={i} className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex items-center gap-2 w-full sm:w-48">
                    <div className={`p-2 rounded-lg ${config.bg}`}>
                      <span className={config.text}>{config.icon}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{config.name}</p>
                      <p className="text-xs text-gray-500">{cat.count} students</p>
                    </div>
                  </div>

                  <div className="flex-1 flex items-center gap-3">
                    <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-2.5 rounded-full bg-${config.color}-500`} style={{ width: `${percentage}%` }} />
                    </div>
                    <span className="text-sm font-bold text-gray-900 w-12">{percentage}%</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Total Footer */}
          <div className="px-5 py-3 bg-gray-50 border-t flex justify-between items-center">
            <span className="text-sm text-gray-600">Total Students</span>
            <span className="font-bold text-gray-900">{stats.stats.total}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentTypes;