import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { 
  FaArrowLeft, FaSave, FaUserTie, FaRupeeSign, FaBuilding, 
  FaPhone, FaEnvelope, FaCalendarAlt, FaCreditCard, FaCheck,
  FaSpinner, FaUserGraduate, FaHome, FaMapMarkerAlt, FaIdCard
} from 'react-icons/fa';
import { 
  MdLocalLibrary, MdSchool, MdWarning, MdPayments, MdPerson,
  MdWork, MdLocationCity
} from 'react-icons/md';
import { 
  BsPersonBadge, BsPersonWorkspace, BsCashStack, BsChevronDown,
  BsCalendar, BsEnvelope, BsTelephone, BsBank2, BsBuilding
} from 'react-icons/bs';
import { 
  GiTeacher, GiPayMoney, GiExpense, GiReceiveMoney
} from 'react-icons/gi';

const EditStaff = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', staffRole: 'teacher', salary: '', paidSalary: '',
    joinDate: '', status: 'active', department: '', address: '',
    accountNumber: '', bankName: '', ifsc: ''
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [staffDetails, setStaffDetails] = useState(null);

  useEffect(() => { fetchStaff(); }, [id]);

  const fetchStaff = async () => {
    try {
      setFetching(true);
      const token = localStorage.getItem('token');
      const res = await axios.get(`${globalThis.API_URL}/staff/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.data.success && res.data.staff) {
        const s = res.data.staff;
        setStaffDetails(s);
        setFormData({
          name: s.name || '', email: s.email || '', phone: s.phone || '',
          staffRole: s.staffRole || 'teacher', salary: s.salary || 0,
          paidSalary: s.paidSalary || 0,
          joinDate: s.joinDate ? new Date(s.joinDate).toISOString().split('T')[0] : '',
          status: s.status || 'active', department: s.department || '',
          address: s.address || '',
          accountNumber: s.bankDetails?.accountNumber || '',
          bankName: s.bankDetails?.bankName || '',
          ifsc: s.bankDetails?.ifsc || ''
        });
      } else { toast.error('Staff not found'); navigate('/admin-dashboard/staff'); }
    } catch (error) { toast.error('Failed to load staff'); navigate('/admin-dashboard/staff'); }
    finally { setFetching(false); }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const updateData = {
        name: formData.name, email: formData.email, phone: formData.phone,
        staffRole: formData.staffRole, salary: parseFloat(formData.salary) || 0,
        paidSalary: parseFloat(formData.paidSalary) || 0, joinDate: formData.joinDate,
        status: formData.status, department: formData.department, address: formData.address,
        bankDetails: { accountNumber: formData.accountNumber, bankName: formData.bankName, ifsc: formData.ifsc }
      };
      const res = await axios.put(`${globalThis.API_URL}/staff/${id}`, updateData, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.data.success) {
        toast.success('Staff updated!');
        setTimeout(() => navigate(`/admin-dashboard/staff/${id}`), 1000);
      } else toast.error(res.data.message || 'Update failed');
    } catch (error) { toast.error('Update failed'); }
    finally { setLoading(false); }
  };

  const calculateSalaryDue = () => (parseFloat(formData.salary) || 0) - (parseFloat(formData.paidSalary) || 0);
  const salaryDue = calculateSalaryDue();

  const getRoleConfig = (role) => {
    switch(role) {
      case 'teacher': return { name: 'Teacher', icon: <GiTeacher className="w-5 h-5" />, color: 'blue' };
      case 'librarian': return { name: 'Librarian', icon: <MdLocalLibrary className="w-5 h-5" />, color: 'purple' };
      case 'accountant': return { name: 'Accountant', icon: <BsCashStack className="w-5 h-5" />, color: 'green' };
      case 'admin': return { name: 'Admin', icon: <FaUserTie className="w-5 h-5" />, color: 'red' };
      default: return { name: 'Staff', icon: <BsPersonWorkspace className="w-5 h-5" />, color: 'gray' };
    }
  };

  const staffRoles = [
    { value: 'teacher', label: 'Teacher', icon: <GiTeacher className="w-5 h-5" /> },
    { value: 'librarian', label: 'Librarian', icon: <MdLocalLibrary className="w-5 h-5" /> },
    { value: 'accountant', label: 'Accountant', icon: <BsCashStack className="w-5 h-5" /> },
    { value: 'admin', label: 'Admin', icon: <FaUserTie className="w-5 h-5" /> }
  ];

  const departments = ["Academic", "Admin", "Accounts", "Library", "IT", "HR", "General"];
  const banks = ["State Bank of India", "HDFC Bank", "ICICI Bank", "Axis Bank", "PNB", "BOB"];

  const inputClass = "w-full px-4 py-2.5 pl-10 bg-white border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm";
  const labelClass = "flex items-center gap-1.5 text-xs font-medium text-gray-600 mb-1.5";

  if (fetching) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center"><FaSpinner className="w-8 h-8 text-blue-600 animate-spin mx-auto" /><p className="mt-3">Loading...</p></div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(`/admin-dashboard/staff/${id}`)} className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200">
          <FaArrowLeft className="w-4 h-4 text-gray-600" />
        </button>
        <div className="p-2.5 bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl shadow-md">
          <FaUserTie className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Staff</h1>
          <p className="text-sm text-gray-600 flex items-center gap-1.5">
            <FaIdCard className="w-4 h-4" /> {staffDetails?.staffId || staffDetails?.userId} • {staffDetails?.name}
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Personal Info */}
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold mb-5 flex items-center gap-2"><MdPerson className="w-5 h-5 text-blue-600" /> Personal</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className={labelClass}><FaUserTie /> Name *</label>
              <div className="relative"><FaUserTie className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                <input type="text" name="name" value={formData.name} onChange={handleChange} className={inputClass} required />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className={labelClass}><FaEnvelope /> Email *</label>
              <div className="relative"><FaEnvelope className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                <input type="email" name="email" value={formData.email} onChange={handleChange} className={inputClass} required />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className={labelClass}><FaPhone /> Phone *</label>
              <div className="relative"><FaPhone className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className={inputClass} maxLength="10" required />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className={labelClass}><FaCalendarAlt /> Join Date</label>
              <div className="relative"><FaCalendarAlt className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                <input type="date" name="joinDate" value={formData.joinDate} onChange={handleChange} className={inputClass} />
              </div>
            </div>
          </div>
        </div>

        {/* Role & Status */}
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold mb-5 flex items-center gap-2"><MdWork className="w-5 h-5 text-blue-600" /> Role & Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className={labelClass}>Staff Role</label>
              <div className="grid grid-cols-2 gap-3">
                {staffRoles.map((role) => (
                  <button key={role.value} type="button" onClick={() => setFormData({...formData, staffRole: role.value})}
                    className={`p-3 rounded-lg border-2 flex items-center gap-2 transition-all ${
                      formData.staffRole === role.value ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 hover:border-blue-300'
                    }`}>
                    <span className={formData.staffRole === role.value ? 'text-blue-600' : 'text-gray-600'}>{role.icon}</span>
                    <span className="text-sm font-medium">{role.label}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <label className={labelClass}>Status</label>
              <div className="grid grid-cols-2 gap-3">
                <button type="button" onClick={() => setFormData({...formData, status: 'active'})}
                  className={`p-3 rounded-lg border-2 flex items-center justify-center gap-2 ${
                    formData.status === 'active' ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 hover:border-green-300'
                  }`}>
                  <FaCheck className="w-4 h-4" /> Active
                </button>
                <button type="button" onClick={() => setFormData({...formData, status: 'inactive'})}
                  className={`p-3 rounded-lg border-2 flex items-center justify-center gap-2 ${
                    formData.status === 'inactive' ? 'border-red-500 bg-red-50 text-red-700' : 'border-gray-200 hover:border-red-300'
                  }`}>
                  <FaCheck className="w-4 h-4" /> Inactive
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Department & Address */}
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold mb-5 flex items-center gap-2"><FaBuilding className="w-5 h-5 text-blue-600" /> Department & Address</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className={labelClass}><FaBuilding /> Department</label>
              <div className="relative">
                <FaBuilding className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                <select name="department" value={formData.department} onChange={handleChange} className="w-full px-4 py-2.5 pl-10 bg-white border border-gray-200 rounded-lg appearance-none text-sm">
                  <option value="">Select</option>
                  {departments.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                <BsChevronDown className="absolute right-3 top-3 text-gray-400 w-4 h-4" />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className={labelClass}><FaHome /> Address</label>
              <div className="relative"><FaMapMarkerAlt className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                <input type="text" name="address" value={formData.address} onChange={handleChange} className={inputClass} placeholder="Address" />
              </div>
            </div>
          </div>
        </div>

        {/* Salary */}
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold mb-5 flex items-center gap-2"><FaRupeeSign className="w-5 h-5 text-blue-600" /> Salary</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="space-y-1.5">
              <label className={labelClass}><FaRupeeSign /> Monthly</label>
              <div className="relative"><FaRupeeSign className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                <input type="number" name="salary" value={formData.salary} onChange={handleChange} className={inputClass} />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className={labelClass}><GiPayMoney /> Paid</label>
              <div className="relative"><GiPayMoney className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                <input type="number" name="paidSalary" value={formData.paidSalary} onChange={handleChange} className={inputClass} />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className={labelClass}><GiExpense /> Due</label>
              <div className="relative">
                <input type="text" value={salaryDue} readOnly className="w-full px-4 py-2.5 pl-10 bg-gray-50 border border-gray-200 rounded-lg text-sm" />
                <span className="absolute left-3 top-3 text-gray-400"><FaRupeeSign className="w-4 h-4" /></span>
              </div>
              <p className={`text-xs ${salaryDue > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {salaryDue > 0 ? 'Pending' : 'Paid'}
              </p>
            </div>
          </div>
        </div>

        {/* Bank Details */}
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold mb-5 flex items-center gap-2"><FaCreditCard className="w-5 h-5 text-blue-600" /> Bank</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="space-y-1.5">
              <label className={labelClass}>Bank Name</label>
              <div className="relative">
                <BsBank2 className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                <select name="bankName" value={formData.bankName} onChange={handleChange} className="w-full px-4 py-2.5 pl-10 bg-white border border-gray-200 rounded-lg appearance-none text-sm">
                  <option value="">Select</option>
                  {banks.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
                <BsChevronDown className="absolute right-3 top-3 text-gray-400 w-4 h-4" />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className={labelClass}>Account No.</label>
              <div className="relative"><FaCreditCard className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                <input type="text" name="accountNumber" value={formData.accountNumber} onChange={handleChange} className={inputClass} />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className={labelClass}>IFSC</label>
              <div className="relative"><FaCreditCard className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                <input type="text" name="ifsc" value={formData.ifsc} onChange={handleChange} className={inputClass} />
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 bg-gray-50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex gap-3">
            <button type="submit" disabled={loading} className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50">
              {loading ? <FaSpinner className="w-4 h-4 animate-spin" /> : <FaSave className="w-4 h-4" />}
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
            <button type="button" onClick={() => navigate(`/admin-dashboard/staff/${id}`)} className="px-6 py-2.5 border bg-white text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50">
              Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EditStaff;