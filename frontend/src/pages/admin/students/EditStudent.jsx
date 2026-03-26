import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../../services/api';
import { 
  FaArrowLeft, FaSave, FaUser, FaEnvelope, FaPhone, FaRupeeSign, 
  FaCalendarAlt, FaClock, FaBuilding, FaMapMarkerAlt, FaTag,
  FaCheckCircle, FaTimesCircle, FaBook, FaUserTie
} from 'react-icons/fa';
import { 
  MdLocalLibrary, MdWarning, MdSchool, MdPayment 
} from 'react-icons/md';
import { 
  BsPersonBadge, BsClock, BsCashStack, BsChevronDown 
} from 'react-icons/bs';
import { 
  GiTeacher, GiPayMoney, GiExpense 
} from 'react-icons/gi';
import Loader from '../../../components/common/Loader';

const EditStudent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '', 
    // ===== NEW: Father's Name =====
    fatherName: '',
    // ===== NEW: Date of Birth =====
    dob: '',
    email: '', 
    phone: '', 
    totalFees: '', 
    admissionDate: '', 
    studentCategory: 'academy', 
    status: 'active', 
    paidFees: '', 
    membershipDuration: '1_month', 
    // ===== CHANGED: department → course =====
    course: '', 
    address: ''
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [studentDetails, setStudentDetails] = useState(null);

  // Course options from User model
  const courseOptions = [
    "RS-CIT", "Excel", "Advance Excel", "Web Development", 
    "php", "Graphic Design", "Digital Marketing", "Tally"
  ];

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        setFetching(true);
        const res = await api.get(`/admin/students/${id}`);

        if (res.data.success && res.data.student) {
          const s = res.data.student;
          setStudentDetails(s);
          setFormData({
            name: s.name || '', 
            // ===== NEW: Father's Name =====
            fatherName: s.fatherName || '',
            // ===== NEW: Date of Birth =====
            dob: s.dob ? new Date(s.dob).toISOString().split('T')[0] : '',
            email: s.email || '', 
            phone: s.phone || '',
            totalFees: s.totalFees || 0, 
            paidFees: s.paidFees || 0,
            admissionDate: s.admissionDate ? new Date(s.admissionDate).toISOString().split('T')[0] : '',
            studentCategory: s.studentCategory || 'academy',
            status: s.status || 'active',
            membershipDuration: s.membershipDuration || '1_month',
            // ===== CHANGED: department → course =====
            course: s.course || '', 
            address: s.address || ''
          });
        } else setError('Student not found');
      } catch (error) {
        console.error('Fetch student error:', error);
        setError('Failed to load student data');
      } finally { setFetching(false); }
    };
    fetchStudent();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(''); setSuccess('');

    try {
      const res = await api.put(`/admin/students/${id}`, {
        ...formData, 
        totalFees: parseFloat(formData.totalFees) || 0,
        paidFees: parseFloat(formData.paidFees) || 0,
        // Ensure course is sent
        course: formData.course
      });

      if (res.data.success) {
        setSuccess('Student updated!');
        setTimeout(() => navigate(`/admin/students/${id}`), 1500);
      } else setError(res.data.message || 'Update failed');
    } catch (error) {
      console.error('Update student error:', error);
      setError('Failed to update student');
    } finally { setLoading(false); }
  };

  const calculateFeesDue = () => (parseFloat(formData.totalFees) || 0) - (parseFloat(formData.paidFees) || 0);
  const feesDue = calculateFeesDue();
  const isAcademy = formData.studentCategory === 'academy';
  const CategoryIcon = isAcademy ? GiTeacher : MdLocalLibrary;

  const inputClass = "w-full px-4 py-2.5 pl-10 bg-white border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm";
  const labelClass = "flex items-center gap-1.5 text-xs font-medium text-gray-600 mb-1.5";

  if (fetching) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader type="spinner" size="large" />
          <p className="mt-3 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(`/admin/students/${id}`)} className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200">
            <FaArrowLeft className="w-4 h-4 text-gray-600" />
          </button>
          <div className="p-2.5 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl shadow-md">
            <FaUser className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Student</h1>
            <p className="text-sm text-gray-600">{studentDetails?.studentId} • {studentDetails?.name}</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
          <FaCheckCircle className="w-5 h-5 text-green-600" />
          <p className="text-sm font-medium text-green-800">{success}</p>
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <FaTimesCircle className="w-5 h-5 text-red-600" />
          <p className="text-sm font-medium text-red-800">{error}</p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 space-y-5">
          {/* Personal Info - Now with 2 columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Name */}
            <div className="space-y-1.5">
              <label className={labelClass}><FaUser /> Name *</label>
              <div className="relative">
                <FaUser className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                <input type="text" name="name" value={formData.name} onChange={handleChange} className={inputClass} required />
              </div>
            </div>

            {/* ===== NEW: Father's Name ===== */}
            <div className="space-y-1.5">
              <label className={labelClass}><FaUserTie /> Father's Name</label>
              <div className="relative">
                <FaUserTie className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                <input type="text" name="fatherName" value={formData.fatherName} onChange={handleChange} className={inputClass} placeholder="Enter father's name" />
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className={labelClass}><FaEnvelope /> Email *</label>
              <div className="relative">
                <FaEnvelope className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                <input type="email" name="email" value={formData.email} onChange={handleChange} className={inputClass} required />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className={labelClass}><FaPhone /> Phone *</label>
              <div className="relative">
                <FaPhone className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className={inputClass} maxLength="10" required />
              </div>
            </div>
          </div>

          {/* ===== NEW: Date of Birth with Category ===== */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className={labelClass}><FaCalendarAlt /> Date of Birth</label>
              <div className="relative">
                <FaCalendarAlt className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                <input type="date" name="dob" value={formData.dob} onChange={handleChange} className={inputClass} />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className={labelClass}><CategoryIcon /> Category</label>
              <div className="relative">
                <CategoryIcon className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                <select name="studentCategory" value={formData.studentCategory} onChange={handleChange} className="w-full px-4 py-2.5 pl-10 bg-white border border-gray-200 rounded-lg appearance-none text-sm">
                  <option value="academy">Academy</option>
                  <option value="library">Library</option>
                </select>
                <BsChevronDown className="absolute right-3 top-3 text-gray-400 w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Fees */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="space-y-1.5">
              <label className={labelClass}><FaRupeeSign /> Total Fees</label>
              <div className="relative">
                <FaRupeeSign className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                <input type="number" name="totalFees" value={formData.totalFees} onChange={handleChange} className={inputClass} />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className={labelClass}><GiPayMoney /> Paid Fees</label>
              <div className="relative">
                <GiPayMoney className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                <input type="number" name="paidFees" value={formData.paidFees} onChange={handleChange} className={inputClass} />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className={labelClass}><GiExpense /> Due Fees</label>
              <div className="relative">
                <input type="text" value={feesDue} readOnly className="w-full px-4 py-2.5 pl-10 bg-gray-50 border border-gray-200 rounded-lg text-sm" />
                <span className="absolute left-3 top-3 text-gray-400"><FaRupeeSign className="w-4 h-4" /></span>
              </div>
              <p className={`text-xs ${feesDue > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {feesDue > 0 ? 'Pending' : 'Fully Paid'}
              </p>
            </div>
          </div>

          {/* Date & Duration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className={labelClass}><FaCalendarAlt /> Admission Date</label>
              <div className="relative">
                <FaCalendarAlt className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                <input type="date" name="admissionDate" value={formData.admissionDate} onChange={handleChange} className={inputClass} />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className={labelClass}><FaClock /> Duration</label>
              <div className="relative">
                <FaClock className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                <select name="membershipDuration" value={formData.membershipDuration} onChange={handleChange} className="w-full px-4 py-2.5 pl-10 bg-white border border-gray-200 rounded-lg appearance-none text-sm">
                  <option value="1_month">1 Month</option>
                  <option value="3_months">3 Months</option>
                  <option value="6_months">6 Months</option>
                  <option value="1_year">1 Year</option>
                </select>
                <BsChevronDown className="absolute right-3 top-3 text-gray-400 w-4 h-4" />
              </div>
            </div>
          </div>

          {/* ===== CHANGED: Course & Status ===== */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className={labelClass}><FaBook /> Course</label>
              <div className="relative">
                <FaBook className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                <select name="course" value={formData.course} onChange={handleChange} className="w-full px-4 py-2.5 pl-10 bg-white border border-gray-200 rounded-lg appearance-none text-sm">
                  <option value="">Select Course</option>
                  {courseOptions.map(course => (
                    <option key={course} value={course}>{course}</option>
                  ))}
                </select>
                <BsChevronDown className="absolute right-3 top-3 text-gray-400 w-4 h-4" />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className={labelClass}><FaTag /> Status</label>
              <div className="relative">
                <FaTag className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                <select name="status" value={formData.status} onChange={handleChange} className="w-full px-4 py-2.5 pl-10 bg-white border border-gray-200 rounded-lg appearance-none text-sm">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                  <option value="graduated">Graduated</option>
                  <option value="left">Left</option>
                </select>
                <BsChevronDown className="absolute right-3 top-3 text-gray-400 w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="space-y-1.5">
            <label className={labelClass}><FaMapMarkerAlt /> Address</label>
            <div className="relative">
              <FaMapMarkerAlt className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
              <input type="text" name="address" value={formData.address} onChange={handleChange} className={inputClass} placeholder="Full address" />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 py-4 bg-gray-50 border-t flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap gap-3">
            <button type="submit" disabled={loading} className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50">
              {loading ? <Loader type="inline" size="small" /> : <FaSave className="w-4 h-4" />}
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
            <button type="button" onClick={() => navigate(`/admin/students/${id}`)} className="px-6 py-2.5 border bg-white text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50">
              Cancel
            </button>
          </div>
          <button type="button" onClick={() => navigate('/admin/students')} className="text-sm text-blue-600 hover:text-blue-700 font-medium">
            Back to All Students
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditStudent;