import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { 
  FaArrowLeft, FaEnvelope, FaPhone, FaCalendarAlt, FaRupeeSign, 
  FaUserTie, FaEdit, FaBuilding, FaMapMarkerAlt, FaCreditCard, 
  FaIdCard, FaMoneyBillWave, FaPrint, FaTrash, FaHistory,
  FaCheckCircle, FaTimesCircle, FaSpinner, FaUserGraduate,
  FaHome, FaBriefcase, FaClock, FaChartLine
} from 'react-icons/fa';
import { 
  MdLocalLibrary, MdSchool, MdWarning, MdPayments, MdPerson,
  MdWork, MdLocationCity, MdAccountBalance
} from 'react-icons/md';
import { 
  BsPersonBadge, BsPersonWorkspace, BsCashStack, BsCalendar,
  BsEnvelope, BsTelephone, BsBank2, BsBuilding, BsGraphUp
} from 'react-icons/bs';
import { 
  GiTeacher, GiPayMoney, GiExpense, GiReceiveMoney
} from 'react-icons/gi';

const ViewStaff = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [staff, setStaff] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('personal');

  useEffect(() => { fetchStaffDetails(); }, [id]);

  const fetchStaffDetails = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await axios.get(`http://localhost:5000/api/staff/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.data.success) setStaff(res.data.staff);
      else { toast.error('Staff not found'); navigate('/admin-dashboard/staff'); }
    } catch (error) {
      toast.error('Failed to load staff');
      navigate('/admin-dashboard/staff');
    } finally { setLoading(false); }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete ${staff?.name}?`)) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/staff/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      toast.success('Staff deleted');
      navigate('/admin-dashboard/staff');
    } catch (error) { toast.error('Delete failed'); }
  };

  const getRoleConfig = (role) => {
    switch(role) {
      case 'teacher': return { name: 'Teacher', icon: <GiTeacher className="w-5 h-5" />, color: 'blue' };
      case 'librarian': return { name: 'Librarian', icon: <MdLocalLibrary className="w-5 h-5" />, color: 'purple' };
      case 'accountant': return { name: 'Accountant', icon: <BsCashStack className="w-5 h-5" />, color: 'green' };
      case 'admin': return { name: 'Admin', icon: <FaUserTie className="w-5 h-5" />, color: 'red' };
      default: return { name: 'Staff', icon: <BsPersonWorkspace className="w-5 h-5" />, color: 'gray' };
    }
  };

  const formatAddress = (addr) => {
    if (!addr) return 'Not specified';
    if (typeof addr === 'string') return addr;
    const parts = [addr.street, addr.city, addr.state, addr.pincode, addr.country].filter(Boolean);
    return parts.length ? parts.join(', ') : 'Not specified';
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A';
  const formatCurrency = (amt) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(amt || 0);
  const progress = staff ? Math.min(Math.round((staff.paidSalary || 0) / (staff.salary || 1) * 100), 100) : 0;

  const tabs = [
    { id: 'personal', name: 'Personal', icon: <MdPerson className="w-4 h-4" /> },
    { id: 'salary', name: 'Salary', icon: <FaMoneyBillWave className="w-4 h-4" /> },
    { id: 'bank', name: 'Bank', icon: <FaCreditCard className="w-4 h-4" /> },
    { id: 'documents', name: 'Documents', icon: <FaHistory className="w-4 h-4" /> }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center"><FaSpinner className="w-8 h-8 text-blue-600 animate-spin mx-auto" /><p className="mt-3">Loading...</p></div>
      </div>
    );
  }

  if (!staff) return null;

  const role = getRoleConfig(staff.staffRole);
  const isActive = staff.status === 'active';

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex items-start gap-3">
          <button onClick={() => navigate('/admin-dashboard/staff')} className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200">
            <FaArrowLeft className="w-4 h-4 text-gray-600" />
          </button>
          <div className="p-2.5 bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl shadow-md">
            <FaUserTie className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{staff.name}</h1>
            <p className="text-sm text-gray-600 flex items-center gap-1.5 mt-1">
              <FaIdCard className="w-4 h-4" /> {staff.staffId || staff.userId}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => navigate(`/admin-dashboard/staff/edit/${staff._id}`)} className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700">
            <FaEdit className="w-4 h-4" /> Edit
          </button>
          <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2.5 bg-gray-600 text-white text-sm font-medium rounded-lg hover:bg-gray-700">
            <FaPrint className="w-4 h-4" /> Print
          </button>
          <button onClick={handleDelete} className="flex items-center gap-2 px-4 py-2.5 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700">
            <FaTrash className="w-4 h-4" /> Delete
          </button>
        </div>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 px-6 py-8 text-white">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-3xl font-bold">
                {staff.name?.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full bg-white/20`}>
                    {role.icon} {role.name}
                  </span>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full ${isActive ? 'bg-green-500' : 'bg-red-500'}`}>
                    {isActive ? <FaCheckCircle className="w-3 h-3" /> : <FaTimesCircle className="w-3 h-3" />}
                    {staff.status}
                  </span>
                </div>
                <p className="text-sm opacity-90">Staff ID: {staff.staffId || staff.userId}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm opacity-80">Joined</p>
              <p className="text-lg font-semibold">{formatDate(staff.joinDate)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="border-b overflow-x-auto">
          <div className="flex">
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id ? 'border-purple-600 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}>
                {tab.icon} {tab.name}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {/* Personal Tab */}
          {activeTab === 'personal' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { label: 'Full Name', value: staff.name, icon: <FaUserTie className="w-4 h-4" /> },
                { label: 'Email', value: staff.email, icon: <FaEnvelope className="w-4 h-4" /> },
                { label: 'Phone', value: staff.phone || 'N/A', icon: <FaPhone className="w-4 h-4" /> },
                { label: 'Department', value: staff.department || 'Not specified', icon: <FaBuilding className="w-4 h-4" /> },
                { label: 'Join Date', value: formatDate(staff.joinDate), icon: <FaCalendarAlt className="w-4 h-4" /> },
                { label: 'Address', value: formatAddress(staff.address), icon: <FaMapMarkerAlt className="w-4 h-4" /> }
              ].map((item, i) => (
                <div key={i} className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">{item.icon} {item.label}</p>
                  <p className="text-sm font-medium text-gray-900">{item.value}</p>
                </div>
              ))}
            </div>
          )}

          {/* Salary Tab */}
          {activeTab === 'salary' && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { label: 'Monthly', value: staff.salary, color: 'blue', icon: <FaRupeeSign className="w-5 h-5" /> },
                  { label: 'Paid', value: staff.paidSalary, color: 'green', icon: <GiPayMoney className="w-5 h-5" /> },
                  { label: 'Due', value: staff.dueSalary, color: staff.dueSalary > 0 ? 'red' : 'green', icon: <GiExpense className="w-5 h-5" /> }
                ].map((item, i) => (
                  <div key={i} className={`bg-${item.color}-50 rounded-lg p-4`}>
                    <div className={`text-${item.color}-600 mb-2`}>{item.icon}</div>
                    <p className={`text-sm text-${item.color}-600 font-medium`}>{item.label}</p>
                    <p className={`text-2xl font-bold text-${item.color}-700 mt-1`}>{formatCurrency(item.value)}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Payment Progress</span>
                  <span className="font-medium text-purple-600">{progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div className="bg-purple-600 h-2.5 rounded-full transition-all" style={{ width: `${progress}%` }} />
                </div>
              </div>
            </div>
          )}

          {/* Bank Tab */}
          {activeTab === 'bank' && staff.bankDetails?.accountNumber ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: 'Account Number', value: staff.bankDetails.accountNumber, icon: <FaIdCard className="w-4 h-4" /> },
                { label: 'Bank Name', value: staff.bankDetails.bankName, icon: <BsBank2 className="w-4 h-4" /> },
                { label: 'IFSC Code', value: staff.bankDetails.ifsc, icon: <FaCreditCard className="w-4 h-4" /> },
                { label: 'Account Type', value: 'Savings Account', icon: <MdAccountBalance className="w-4 h-4" /> }
              ].map((item, i) => (
                <div key={i} className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">{item.icon} {item.label}</p>
                  <p className="text-sm font-medium text-gray-900">{item.value}</p>
                </div>
              ))}
            </div>
          ) : activeTab === 'bank' && (
            <div className="text-center py-8">
              <FaCreditCard className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No bank details</p>
              <button onClick={() => navigate(`/admin-dashboard/staff/edit/${staff._id}`)} className="mt-3 text-sm text-purple-600 hover:text-purple-700">
                Add Details →
              </button>
            </div>
          )}

          {/* Documents Tab */}
          {activeTab === 'documents' && (
            <div className="text-center py-8">
              <FaHistory className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No documents</p>
              <p className="text-xs text-gray-400 mt-1">Coming soon</p>
            </div>
          )}
        </div>
      </div>

      {/* Footer Info */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2"><FaClock className="w-4 h-4 text-gray-500" /> Timeline</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          <div><span className="text-gray-500">Created</span><p className="font-medium mt-1">{formatDate(staff.createdAt)}</p></div>
          <div><span className="text-gray-500">Updated</span><p className="font-medium mt-1">{formatDate(staff.updatedAt)}</p></div>
          <div><span className="text-gray-500">Staff ID</span><p className="font-medium mt-1 font-mono">{staff.staffId || staff.userId}</p></div>
        </div>
      </div>
    </div>
  );
};

export default ViewStaff;