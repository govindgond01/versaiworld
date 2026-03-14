import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { toast } from 'react-hot-toast';
import { 
  FaUsers, FaChartPie, FaUserTie, FaRupeeSign, 
  FaBuilding, FaDownload, FaCalendar, FaSpinner,
  FaCheckCircle, FaTimesCircle
} from 'react-icons/fa';
import { 
  MdLocalLibrary, MdWarning, MdPerson 
} from 'react-icons/md';
import { 
  BsPersonWorkspace, BsCashStack, BsCalendar,
  BsBarChart, BsPieChart, BsChevronDown
} from 'react-icons/bs';
import { GiTeacher } from 'react-icons/gi';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, CartesianGrid 
} from 'recharts';

const StaffStats = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0 });
  const [roles, setRoles] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [timeFilter, setTimeFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');

  useEffect(() => { fetchStats(); }, [timeFilter, departmentFilter]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await api.get('/staff/stats', {
        params: { timeFilter, departmentFilter }
      });
      
      if (res.data.success) {
        setStats(res.data.stats || { total: 0, active: 0, inactive: 0 });
        setRoles(Array.isArray(res.data.roles) ? res.data.roles : []);
        setDepartments(Array.isArray(res.data.departments) ? res.data.departments : []);
      } else {
        toast.error('Failed to load stats');
      }
    } catch (error) { 
      toast.error('Error loading stats'); 
    } finally { 
      setLoading(false); 
    }
  };

  const exportStats = () => {
    const data = { summary: stats, roles, departments };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `staff_stats_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    toast.success('Exported!');
  };

  const getRoleConfig = (role) => {
    switch(role) {
      case 'teacher': return { name: 'Teachers', icon: <GiTeacher className="w-5 h-5" />, color: '#3B82F6', bg: 'bg-blue-100', text: 'text-blue-600' };
      case 'librarian': return { name: 'Librarians', icon: <MdLocalLibrary className="w-5 h-5" />, color: '#8B5CF6', bg: 'bg-purple-100', text: 'text-purple-600' };
      case 'accountant': return { name: 'Accountants', icon: <BsCashStack className="w-5 h-5" />, color: '#10B981', bg: 'bg-green-100', text: 'text-green-600' };
      case 'admin': return { name: 'Admins', icon: <FaUserTie className="w-5 h-5" />, color: '#EF4444', bg: 'bg-red-100', text: 'text-red-600' };
      default: return { name: 'Staff', icon: <BsPersonWorkspace className="w-5 h-5" />, color: '#6B7280', bg: 'bg-gray-100', text: 'text-gray-600' };
    }
  };

  const formatCurrency = (amt) => {
    if (!amt && amt !== 0) return '₹0';
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(amt);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <FaSpinner className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
          <p className="mt-3">Loading stats...</p>
        </div>
      </div>
    );
  }

  const roleData = roles.map(r => ({ ...getRoleConfig(r._id), count: r.count, avgSalary: r.avgSalary }));
  const deptData = departments.map(d => ({ name: d._id, count: d.count }));
  const activeData = [
    { name: 'Active', value: stats.active, color: '#10B981' },
    { name: 'Inactive', value: stats.inactive || 0, color: '#EF4444' }
  ];

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl shadow-md">
            <FaChartPie className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Staff Analytics</h1>
            <p className="text-sm text-gray-600 flex items-center gap-1.5">
              <FaUsers className="w-4 h-4" /> {stats.total} total staff
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={fetchStats} className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50">
            Refresh
          </button>
          <button onClick={exportStats} className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700">
            <FaDownload className="w-4 h-4" /> Export
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { label: 'Time Period', value: timeFilter, set: setTimeFilter, icon: <FaCalendar className="w-4 h-4" />, options: ['all', 'month', 'quarter', 'year'] },
            { label: 'Department', value: departmentFilter, set: setDepartmentFilter, icon: <FaBuilding className="w-4 h-4" />, options: ['all', ...departments.map(d => d._id)] }
          ].map((filter, i) => (
            <div key={i} className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-medium text-gray-600">{filter.icon} {filter.label}</label>
              <div className="relative">
                <select value={filter.value} onChange={(e) => filter.set(e.target.value)}
                  className="w-full px-4 py-2.5 pl-10 bg-white border border-gray-200 rounded-lg appearance-none text-sm">
                  {filter.options.map(opt => (
                    <option key={opt} value={opt}>{opt === 'all' ? 'All' : opt}</option>
                  ))}
                </select>
                <BsChevronDown className="absolute right-3 top-3 text-gray-400 w-4 h-4" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Staff', value: stats.total, icon: <FaUsers className="w-6 h-6" />, bg: 'bg-blue-100', text: 'text-blue-600' },
          { label: 'Active', value: stats.active, icon: <FaCheckCircle className="w-6 h-6" />, bg: 'bg-green-100', text: 'text-green-600' },
          { label: 'Inactive', value: stats.inactive, icon: <FaTimesCircle className="w-6 h-6" />, bg: 'bg-red-100', text: 'text-red-600' },
          { label: 'Departments', value: departments.length, icon: <FaBuilding className="w-6 h-6" />, bg: 'bg-purple-100', text: 'text-purple-600' }
        ].map((card, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 flex items-center justify-between hover:shadow-md transition">
            <div>
              <p className="text-xs text-gray-500">{card.label}</p>
              <p className="text-2xl font-bold mt-1">{card.value}</p>
            </div>
            <div className={`p-3 rounded-xl ${card.bg} ${card.text}`}>{card.icon}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Role Distribution */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold mb-4 flex items-center gap-2"><BsPieChart className="w-5 h-5 text-blue-600" /> Role Distribution</h3>
          <div className="h-64">
            {roleData.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={roleData} cx="50%" cy="50%" innerRadius={40} outerRadius={80} dataKey="count" label={e => `${e.name}: ${e.count}`}>
                    {roleData.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : <div className="h-full flex items-center justify-center text-gray-400">No data</div>}
          </div>
        </div>

        {/* Department Chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold mb-4 flex items-center gap-2"><BsBarChart className="w-5 h-5 text-blue-600" /> Department Wise</h3>
          <div className="h-64">
            {deptData.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={deptData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3B82F6" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : <div className="h-full flex items-center justify-center text-gray-400">No data</div>}
          </div>
        </div>
      </div>

      {/* Role Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold mb-4 flex items-center gap-2"><MdPerson className="w-5 h-5 text-blue-600" /> Role Details</h3>
          <div className="space-y-4">
            {roleData.map((r, i) => {
              const percent = stats.total ? ((r.count / stats.total) * 100).toFixed(1) : 0;
              return (
                <div key={i} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`p-2 rounded-lg ${r.bg} ${r.text}`}>{r.icon}</div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{r.name}</p>
                        <p className="text-xs text-gray-500">{r.count} staff</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-900">{percent}%</p>
                      {r.avgSalary && <p className="text-xs text-green-600">{formatCurrency(r.avgSalary)}</p>}
                    </div>
                  </div>
                  <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${percent}%`, backgroundColor: r.color }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Department Details */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold mb-4 flex items-center gap-2"><FaBuilding className="w-5 h-5 text-blue-600" /> Department Details</h3>
          <div className="space-y-3">
            {deptData.map((d, i) => {
              const percent = stats.total ? ((d.count / stats.total) * 100).toFixed(1) : 0;
              return (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 font-bold">
                      {d.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{d.name}</p>
                      <p className="text-xs text-gray-500">{d.count} staff</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-gray-900">{d.count}</span>
                    <p className="text-xs text-gray-500">{percent}%</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'Total', value: stats.total, color: 'blue' },
            { label: 'Active Ratio', value: stats.total ? Math.round((stats.active / stats.total) * 100) : 0, color: 'green', unit: '%' },
            { label: 'Distribution', value: `${roles.length} / ${departments.length}`, color: 'purple' }
          ].map((item, i) => (
            <div key={i} className={`p-4 bg-${item.color}-50 rounded-lg`}>
              <p className={`text-xs text-${item.color}-600 font-medium`}>{item.label}</p>
              <p className={`text-2xl font-bold text-${item.color}-700 mt-1`}>{item.value}{item.unit || ''}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400 text-center mt-4">
          Generated: {new Date().toLocaleString()}
        </p>
      </div>
    </div>
  );
};

export default StaffStats;