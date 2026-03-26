import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from '../../services/api';
import { toast } from "react-hot-toast";
import { 
  FaUserTie, FaRupeeSign, FaBuilding, FaPhone, FaEnvelope, 
  FaCalendarAlt, FaCreditCard, FaSave, FaTimes,
  FaCheckCircle, FaArrowLeft, FaUserGraduate, FaMapMarkerAlt,
  FaHome, FaBriefcase
} from "react-icons/fa";
import { 
  MdLocalLibrary, MdSchool, MdWork, MdPerson 
} from "react-icons/md";
import { 
  BsPersonBadge, BsPersonWorkspace, BsBank2, BsChevronDown,
  BsCashStack, BsCalendar, BsEnvelope, BsTelephone
} from "react-icons/bs";
import { 
  GiTeacher, GiPayMoney, GiExpense 
} from "react-icons/gi";
import Loader from '../common/Loader';

const AddEmployees = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "", email: "", phone: "", employeesRole: "teacher", salary: "25000",
    joinDate: new Date().toISOString().split('T')[0], department: "Academic",
    address: "", accountNumber: "", bankName: "State Bank of India", ifsc: ""
  });
  const [loading, setLoading] = useState(false);
  const [generatedemployeesId, setGeneratedemployeesId] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    if (!formData.name || !formData.email || !formData.phone) {
      toast.error("Please fill all required fields");
      return false;
    }
    if (!/^[0-9]{10}$/.test(formData.phone)) {
      toast.error("Phone must be 10 digits");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast.error("Please enter valid email");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    
    setLoading(true);
    try {
      const employeesData = {
        name: formData.name, email: formData.email, phone: formData.phone,
        employeesRole: formData.employeesRole, salary: parseFloat(formData.salary) || 25000,
        joinDate: formData.joinDate, department: formData.department,
        address: formData.address, bankDetails: {
          accountNumber: formData.accountNumber, bankName: formData.bankName, ifsc: formData.ifsc
        }
      };
      const res = await api.post('/employees', employeesData);

      if (res.data.success) {
        setGeneratedemployeesId(res.data.employees?.employeesId || res.data.employees?.userId);
        toast.success('employees created!');
        setFormData({
          name: "", email: "", phone: "", employeesRole: "teacher", salary: "25000",
          joinDate: new Date().toISOString().split('T')[0], department: "Academic",
          address: "", accountNumber: "", bankName: "State Bank of India", ifsc: ""
        });
        setTimeout(() => navigate('/admin/employees'), 3000);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add employees');
    } finally { setLoading(false); }
  };

  const employeesRoles = [
    { value: 'teacher', label: 'Teacher', icon: <GiTeacher className="w-5 h-5" /> },
    { value: 'librarian', label: 'Librarian', icon: <MdLocalLibrary className="w-5 h-5" /> },
    { value: 'accountant', label: 'Accountant', icon: <BsCashStack className="w-5 h-5" /> },
    { value: 'admin', label: 'Admin', icon: <FaUserTie className="w-5 h-5" /> }
  ];

  const departments = ["Academic", "Admin", "Accounts", "Library", "IT", "HR"];
  const banks = ["State Bank of India", "HDFC Bank", "ICICI Bank", "Axis Bank", "PNB"];

  const inputClass = "w-full px-4 py-2.5 pl-10 bg-white border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm";
  const labelClass = "flex items-center gap-1.5 text-xs font-medium text-gray-600 mb-1.5";

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 md:mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/admin/employees')} className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200">
            <FaArrowLeft className="w-4 h-4 text-gray-600" />
          </button>
          <div className="p-2 md:p-2.5 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl shadow-md">
            <FaUserTie className="w-4 h-4 md:w-5 md:h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">Add employees Member</h1>
            <p className="text-sm text-gray-600 flex items-center gap-1.5">
              <BsPersonWorkspace className="w-4 h-4" /> Create new employees account
            </p>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {generatedemployeesId && (
        <div className="mb-4 md:mb-6 p-3 md:p-4 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3">
          <FaCheckCircle className="w-4 h-4 md:w-5 md:h-5 text-green-600 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-green-800">employees created! ID: {generatedemployeesId}</p>
            <p className="text-xs text-green-600 mt-1">Login: {formData.email} | Pass: {formData.phone}</p>
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Personal Info */}
        <div className="p-4 md:p-6 border-b">
          <h2 className="text-base md:text-lg font-semibold mb-4 md:mb-5 flex items-center gap-2"><MdPerson className="w-4 h-4 md:w-5 md:h-5 text-blue-600" /> Personal Info</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
            <div className="space-y-1.5">
              <label className={labelClass}><FaUserTie /> Name *</label>
              <div className="relative"><FaUserTie className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                <input type="text" name="name" value={formData.name} onChange={handleChange} className={inputClass} required />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className={labelClass}><BsEnvelope /> Email *</label>
              <div className="relative"><FaEnvelope className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                <input type="email" name="email" value={formData.email} onChange={handleChange} className={inputClass} required />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className={labelClass}><BsTelephone /> Phone *</label>
              <div className="relative"><FaPhone className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className={inputClass} maxLength="10" required />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className={labelClass}><BsCalendar /> Join Date</label>
              <div className="relative"><FaCalendarAlt className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                <input type="date" name="joinDate" value={formData.joinDate} onChange={handleChange} className={inputClass} />
              </div>
            </div>
          </div>
        </div>

        {/* Role & Department */}
        <div className="p-4 md:p-6 border-b">
          <h2 className="text-base md:text-lg font-semibold mb-4 md:mb-5 flex items-center gap-2"><FaBriefcase className="w-4 h-4 md:w-5 md:h-5 text-blue-600" /> Role & Dept</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
            <div className="space-y-2">
              <label className={labelClass}>employees Role *</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {employeesRoles.map((role) => (
                  <button key={role.value} type="button" onClick={() => setFormData({...formData, employeesRole: role.value})}
                    className={`p-3 rounded-lg border-2 flex items-center gap-2 transition-all ${
                      formData.employeesRole === role.value ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 hover:border-blue-300'
                    }`}>
                    <span className={formData.employeesRole === role.value ? 'text-blue-600' : 'text-gray-600'}>{role.icon}</span>
                    <span className="text-sm font-medium">{role.label}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <label className={labelClass}><FaBuilding /> Department</label>
              <div className="relative">
                <FaBuilding className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                <select name="department" value={formData.department} onChange={handleChange} className="w-full px-4 py-2.5 pl-10 bg-white border border-gray-200 rounded-lg appearance-none text-sm">
                  {departments.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                <BsChevronDown className="absolute right-3 top-3 text-gray-400 w-4 h-4" />
              </div>
            </div>
          </div>
        </div>

        {/* Salary & Address */}
        <div className="p-4 md:p-6 border-b">
          <h2 className="text-base md:text-lg font-semibold mb-4 md:mb-5 flex items-center gap-2"><FaRupeeSign className="w-4 h-4 md:w-5 md:h-5 text-blue-600" /> Salary & Address</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
            <div className="space-y-1.5">
              <label className={labelClass}><FaRupeeSign /> Monthly Salary</label>
              <div className="relative"><FaRupeeSign className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                <input type="number" name="salary" value={formData.salary} onChange={handleChange} className={inputClass} />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className={labelClass}><FaHome /> Address</label>
              <div className="relative"><FaMapMarkerAlt className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                <input type="text" name="address" value={formData.address} onChange={handleChange} className={inputClass} placeholder="Full address" />
              </div>
            </div>
          </div>
        </div>

        {/* Bank Details */}
        <div className="p-4 md:p-6 border-b">
          <h2 className="text-base md:text-lg font-semibold mb-4 md:mb-5 flex items-center gap-2"><FaCreditCard className="w-4 h-4 md:w-5 md:h-5 text-blue-600" /> Bank Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
            <div className="space-y-1.5">
              <label className={labelClass}>Bank Name</label>
              <div className="relative">
                <BsBank2 className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                <select name="bankName" value={formData.bankName} onChange={handleChange} className="w-full px-4 py-2.5 pl-10 bg-white border border-gray-200 rounded-lg appearance-none text-sm">
                  <option value="">Select Bank</option>
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
              <label className={labelClass}>IFSC Code</label>
              <div className="relative"><FaCreditCard className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                <input type="text" name="ifsc" value={formData.ifsc} onChange={handleChange} className={inputClass} />
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 md:p-6 bg-gray-50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap gap-3">
            <button type="submit" disabled={loading} className="flex items-center gap-2 px-4 md:px-6 py-2 md:py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50">
              {loading ? <Loader type="inline" size="small" /> : <FaSave className="w-4 h-4" />}
              {loading ? 'Creating...' : 'Create employees'}
            </button>
            <button type="button" onClick={() => navigate('/admin/employees')} className="px-4 md:px-6 py-2 md:py-2.5 border bg-white text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50">
              Cancel
            </button>
          </div>
          <button type="button" onClick={() => setFormData({
            ...formData, name: "Rajesh Kumar", email: "rajesh@example.com", phone: "9876543210",
            employeesRole: "teacher", salary: "35000", department: "Academic", address: "123 Street, Delhi",
            accountNumber: "123456789012", bankName: "HDFC Bank", ifsc: "HDFC0001234"
          })} className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
            <BsCashStack className="w-4 h-4" /> Sample Data
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddEmployees;