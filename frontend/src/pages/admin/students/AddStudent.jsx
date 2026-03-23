import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../services/api";
import { 
  FaUser, FaEnvelope, FaPhone, FaRupeeSign, FaCalendarAlt, 
  FaBuilding, FaMapMarkerAlt, FaClock,
  FaCheckCircle, FaTimesCircle, FaArrowLeft, FaBook, FaUserTie
} from "react-icons/fa";
import { MdLocalLibrary, MdRefresh } from "react-icons/md";
import { BsPersonWorkspace, BsChevronDown } from "react-icons/bs";
import { GiTeacher } from "react-icons/gi";
import Loader from '../../../components/common/Loader';

const AddStudent = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "", 
    fatherName: "",
    dob: "",
    email: "", 
    phone: "", 
    totalFees: "5000",
    admissionDate: new Date().toISOString().split('T')[0],
    userType: "student", 
    studentCategory: "academy",
    membershipDuration: "1_month", 
    course: "", 
    address: ""
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [generatedStudentId, setGeneratedStudentId] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 👇 SIRF YEH DEBUG LINE ADD KI HAI
    console.log('📤 Submitting student with category:', formData.studentCategory);
    
    if (!formData.name || !formData.email || !formData.phone) {
      setError("Please fill all required fields");
      return;
    }
    if (!/^[0-9]{10}$/.test(formData.phone)) {
      setError("Phone must be 10 digits");
      return;
    }
    
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await api.post('/admin/students', { 
        ...formData, 
        totalFees: parseFloat(formData.totalFees) || 5000,
        course: formData.course
      });

      if (response.data.success) {
        const studentId = response.data.student?.studentId || response.data.student?.userId;
        setGeneratedStudentId(studentId);
        setSuccess(`Student created! ID: ${studentId}`);
        setFormData({
          name: "", 
          fatherName: "",
          dob: "",
          email: "", 
          phone: "", 
          totalFees: "5000",
          admissionDate: new Date().toISOString().split('T')[0],
          userType: "student", 
          studentCategory: "academy",
          membershipDuration: "1_month", 
          course: "", 
          address: ""
        });
      } else {
        setError(response.data.message || "Failed");
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full px-4 py-2.5 pl-10 bg-white border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm focus:outline-none";

  const courseOptions = [
    "RS CIT", "Excel", "Advance Excel", "Web Development", 
    "php", "Graphic Design", "Digital Marketing", "Tally"
  ];

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-600 rounded-xl"><GiTeacher className="w-5 h-5 text-white" /></div>
          <div>
            <h1 className="text-2xl font-bold">Add Student</h1>
            <p className="text-sm text-gray-600 flex items-center gap-1"><BsPersonWorkspace className="w-4 h-4" /> Create new student</p>
          </div>
        </div>
        <button onClick={() => navigate('/admin-dashboard/students')} className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200">
          <FaArrowLeft className="w-4 h-4" /> Back
        </button>
      </div>

      {/* Messages */}
      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
          <FaCheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-green-800">{success}</p>
            {generatedStudentId && (
              <p className="text-xs text-gray-600 mt-1">ID: <span className="font-bold text-blue-600">{generatedStudentId}</span> | Login: {formData.email}</p>
            )}
          </div>
        </div>
      )}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
          <FaTimesCircle className="w-5 h-5 text-red-600" />
          <p className="text-sm font-medium text-red-800">{error}</p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200">
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Name */}
          <div>
            <label className="flex items-center gap-1 text-xs font-medium text-gray-600 mb-1.5"><FaUser /> Name *</label>
            <div className="relative">
              <FaUser className="absolute left-3 top-3 text-gray-400" />
              <input type="text" name="name" value={formData.name} onChange={handleChange} className={inputClass} />
            </div>
          </div>

          {/* Father's Name */}
          <div>
            <label className="flex items-center gap-1 text-xs font-medium text-gray-600 mb-1.5"><FaUserTie /> Father's Name</label>
            <div className="relative">
              <FaUserTie className="absolute left-3 top-3 text-gray-400" />
              <input type="text" name="fatherName" value={formData.fatherName} onChange={handleChange} className={inputClass} placeholder="Enter father's name" />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="flex items-center gap-1 text-xs font-medium text-gray-600 mb-1.5"><FaEnvelope /> Email *</label>
            <div className="relative">
              <FaEnvelope className="absolute left-3 top-3 text-gray-400" />
              <input type="email" name="email" value={formData.email} onChange={handleChange} className={inputClass} />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="flex items-center gap-1 text-xs font-medium text-gray-600 mb-1.5"><FaPhone /> Phone *</label>
            <div className="relative">
              <FaPhone className="absolute left-3 top-3 text-gray-400" />
              <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className={inputClass} maxLength="10" />
            </div>
          </div>

          {/* Date of Birth */}
          <div>
            <label className="flex items-center gap-1 text-xs font-medium text-gray-600 mb-1.5"><FaCalendarAlt /> Date of Birth</label>
            <div className="relative">
              <FaCalendarAlt className="absolute left-3 top-3 text-gray-400" />
              <input type="date" name="dob" value={formData.dob} onChange={handleChange} className={inputClass} />
            </div>
          </div>

          {/* Fees */}
          <div>
            <label className="flex items-center gap-1 text-xs font-medium text-gray-600 mb-1.5"><FaRupeeSign /> Fees</label>
            <div className="relative">
              <FaRupeeSign className="absolute left-3 top-3 text-gray-400" />
              <input type="number" name="totalFees" value={formData.totalFees} onChange={handleChange} className={inputClass} />
            </div>
          </div>

          {/* Admission Date */}
          <div>
            <label className="flex items-center gap-1 text-xs font-medium text-gray-600 mb-1.5"><FaCalendarAlt /> Admission Date</label>
            <div className="relative">
              <FaCalendarAlt className="absolute left-3 top-3 text-gray-400" />
              <input type="date" name="admissionDate" value={formData.admissionDate} onChange={handleChange} className={inputClass} />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="flex items-center gap-1 text-xs font-medium text-gray-600 mb-1.5"><MdLocalLibrary /> Category *</label>
            <div className="relative">
              <MdLocalLibrary className="absolute left-3 top-3 text-gray-400" />
              <select name="studentCategory" value={formData.studentCategory} onChange={handleChange} className="w-full px-4 py-2.5 pl-10 bg-white border border-gray-200 rounded-lg appearance-none text-sm">
                <option value="academy">Academy</option>
                <option value="library">Library</option>
              </select>
              <BsChevronDown className="absolute right-3 top-3 text-gray-400" />
            </div>
          </div>

          {/* Duration */}
          <div>
            <label className="flex items-center gap-1 text-xs font-medium text-gray-600 mb-1.5"><FaClock /> Duration *</label>
            <div className="relative">
              <FaClock className="absolute left-3 top-3 text-gray-400" />
              <select name="membershipDuration" value={formData.membershipDuration} onChange={handleChange} className="w-full px-4 py-2.5 pl-10 bg-white border border-gray-200 rounded-lg appearance-none text-sm">
                <option value="1_month">1 Month</option>
                <option value="3_months">3 Months</option>
                <option value="6_months">6 Months</option>
                <option value="1_year">1 Year</option>
              </select>
              <BsChevronDown className="absolute right-3 top-3 text-gray-400" />
            </div>
          </div>

          {/* Course */}
          <div>
            <label className="flex items-center gap-1 text-xs font-medium text-gray-600 mb-1.5"><FaBook /> Course</label>
            <div className="relative">
              <FaBook className="absolute left-3 top-3 text-gray-400" />
              <select name="course" value={formData.course} onChange={handleChange} className="w-full px-4 py-2.5 pl-10 bg-white border border-gray-200 rounded-lg appearance-none text-sm">
                <option value="">Select Course</option>
                {courseOptions.map(course => (
                  <option key={course} value={course}>{course}</option>
                ))}
              </select>
              <BsChevronDown className="absolute right-3 top-3 text-gray-400" />
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="flex items-center gap-1 text-xs font-medium text-gray-600 mb-1.5"><FaMapMarkerAlt /> Address</label>
            <div className="relative">
              <FaMapMarkerAlt className="absolute left-3 top-3 text-gray-400" />
              <input type="text" name="address" value={formData.address} onChange={handleChange} className={inputClass} />
            </div>
          </div>

          {/* Role (Hidden - Always Student for this form) */}
          <input type="hidden" name="userType" value="student" />
        </div>

        {/* Actions */}
        <div className="px-6 py-4 bg-gray-50 border-t flex justify-between items-center">
          <div className="flex gap-3">
            <button type="submit" disabled={loading} className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
              {loading ? <Loader type="inline" size="small" /> : <GiTeacher className="w-4 h-4" />}
              {loading ? 'Creating...' : 'Create Student'}
            </button>
            <button type="button" onClick={() => navigate('/admin-dashboard/students')} className="px-6 py-2.5 border bg-white rounded-lg hover:bg-gray-50">
              Cancel
            </button>
          </div>
          <button 
            type="button" 
            onClick={() => setFormData({
              ...formData,
              name: "John Doe",
              fatherName: "Robert Doe",
              dob: "2000-01-01",
              email: "john@example.com",
              phone: "9876543210",
              course: "Web Development",
              address: "123 Main Street, City"
            })} 
            className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
          >
            <MdRefresh className="w-4 h-4" /> Sample Data
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddStudent;