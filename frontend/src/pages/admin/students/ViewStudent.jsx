import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  FaArrowLeft, FaEnvelope, FaPhone, FaCalendarAlt, FaRupeeSign, 
  FaUser, FaEdit, FaClock, FaBuilding, FaMapMarkerAlt, FaIdCard,
  FaCheckCircle, FaTimesCircle, FaUserTie, FaBirthdayCake
} from 'react-icons/fa';
import { 
  MdLocalLibrary, MdWarning, MdSchool 
} from 'react-icons/md';
import { 
  BsPersonBadge, BsClock, BsCashStack 
} from 'react-icons/bs';
import { 
  GiTeacher, GiPayMoney 
} from 'react-icons/gi';

const ViewStudent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const res = await axios.get(`${globalThis.API_URL}/admin/students/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.data.success) setStudent(res.data.student);
        else setError(res.data.message || 'Student not found');
      } catch (error) {
        setError(error.response?.data?.message || 'Failed to load');
      } finally { setLoading(false); }
    };
    fetchStudent();
  }, [id]);

  const getDaysLeft = (expiry) => {
    if (!expiry) return { text: 'N/A', color: 'text-gray-500' };
    const days = Math.ceil((new Date(expiry) - new Date()) / (1000 * 60 * 60 * 24));
    if (days <= 0) return { text: 'EXPIRED', color: 'text-red-600' };
    if (days <= 7) return { text: `${days}d (Urgent)`, color: 'text-red-600' };
    if (days <= 15) return { text: `${days}d`, color: 'text-yellow-600' };
    return { text: `${days}d`, color: 'text-green-600' };
  };

  const formatAddress = (addr) => {
    if (!addr) return 'Not specified';
    if (typeof addr === 'string') return addr;
    const parts = [addr.street, addr.city, addr.state, addr.pincode, addr.country].filter(Boolean);
    return parts.length ? parts.join(', ') : 'Not specified';
  };

  const formatDate = (date) => {
    if (!date) return 'Not specified';
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-3 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <FaTimesCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <p className="text-red-800 font-medium">{error || 'Student not found'}</p>
          <button onClick={() => navigate('/admin-dashboard/students')} className="mt-4 flex items-center gap-2 text-blue-600 mx-auto">
            <FaArrowLeft /> Back
          </button>
        </div>
      </div>
    );
  }

  const daysLeft = getDaysLeft(student.expiryDate);
  const isAcademy = student.studentCategory === 'academy';
  const CategoryIcon = isAcademy ? GiTeacher : MdLocalLibrary;

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/admin-dashboard/students')} className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200">
            <FaArrowLeft className="w-4 h-4 text-gray-600" />
          </button>
          <div className="p-2.5 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl shadow-md">
            <FaUser className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Student Profile</h1>
            <p className="text-sm text-gray-600 flex items-center gap-1.5">
              <FaIdCard className="w-4 h-4" /> {student.studentId || student.userId}
            </p>
          </div>
        </div>
        <button 
          onClick={() => navigate(`/admin-dashboard/students/edit/${student._id}`)}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 w-full sm:w-auto"
        >
          <FaEdit className="w-4 h-4" /> Edit
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Profile Card */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className={`h-20 bg-gradient-to-r ${isAcademy ? 'from-blue-500 to-blue-600' : 'from-purple-500 to-purple-600'}`} />
          <div className="px-6 pb-6 -mt-8">
            <div className="flex justify-center mb-3">
              <div className={`p-3 rounded-xl bg-white shadow-md border-2 ${isAcademy ? 'border-blue-200' : 'border-purple-200'}`}>
                <CategoryIcon className={`w-8 h-8 ${isAcademy ? 'text-blue-600' : 'text-purple-600'}`} />
              </div>
            </div>
            <h2 className="text-xl font-bold text-center text-gray-900">{student.name}</h2>
            <p className="text-sm text-gray-500 text-center mb-4">{student.email}</p>
            
            <div className="space-y-2 text-sm">
              {/* ===== NEW: Father's Name ===== */}
              <div className="flex items-center gap-3">
                <FaUserTie className="w-4 h-4 text-gray-400" />
                <span className="font-medium">Father: <span className="font-normal">{student.fatherName || 'Not specified'}</span></span>
              </div>
              
              {/* ===== NEW: Date of Birth ===== */}
              <div className="flex items-center gap-3">
                <FaBirthdayCake className="w-4 h-4 text-gray-400" />
                <span className="font-medium">DOB: <span className="font-normal">{formatDate(student.dob)}</span></span>
              </div>
              
              <div className="flex items-center gap-3">
                <FaPhone className="w-4 h-4 text-gray-400" />
                <span>{student.phone || 'No phone'}</span>
              </div>
              <div className="flex items-center gap-3">
                <FaBuilding className="w-4 h-4 text-gray-400" />
                <span>{student.course || student.department || 'No course'}</span>
              </div>
              <div className="flex items-center gap-3">
                <FaMapMarkerAlt className="w-4 h-4 text-gray-400" />
                <span className="truncate">{formatAddress(student.address)}</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t text-center">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full ${
                student.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                {student.status === 'active' ? <FaCheckCircle className="w-3 h-3" /> : <FaTimesCircle className="w-3 h-3" />}
                {student.status?.toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="lg:col-span-2 space-y-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Total', value: `₹${student.totalFees || 0}`, icon: <BsCashStack />, color: 'blue' },
              { label: 'Paid', value: `₹${student.paidFees || 0}`, icon: <GiPayMoney />, color: 'green' },
              { label: 'Due', value: `₹${student.feesDue || 0}`, icon: <FaRupeeSign />, color: 'red' },
              { label: 'Type', value: isAcademy ? 'Academy' : 'Library', icon: <CategoryIcon />, color: isAcademy ? 'blue' : 'purple' }
            ].map((stat, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-4">
                <div className={`text-${stat.color}-600 mb-2 text-xl`}>{stat.icon}</div>
                <p className="text-xs text-gray-500">{stat.label}</p>
                <p className="text-sm font-bold text-gray-900 mt-1">{stat.value}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FaClock className="w-4 h-4 text-blue-600" /> Membership
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Duration</span>
                  <span className="font-medium capitalize">{student.membershipDuration?.replace('_', ' ') || '1 Month'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Admission</span>
                  <span>{student.admissionDate ? new Date(student.admissionDate).toLocaleDateString() : 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Expiry</span>
                  <span>{student.expiryDate ? new Date(student.expiryDate).toLocaleDateString() : 'N/A'}</span>
                </div>
                <div className="flex justify-between pt-2 border-t">
                  <span className="text-gray-600">Days Left</span>
                  <span className={`font-bold ${daysLeft.color}`}>{daysLeft.text}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FaRupeeSign className="w-4 h-4 text-green-600" /> Fees
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total</span>
                  <span className="font-bold">₹{student.totalFees || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Paid</span>
                  <span className="font-bold text-green-600">₹{student.paidFees || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Due</span>
                  <span className={`font-bold ${student.feesDue > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    ₹{student.feesDue || 0}
                  </span>
                </div>
                <div className="pt-2">
                  <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div className={`h-full ${student.feesDue === 0 ? 'bg-green-500' : 'bg-blue-500'}`}
                      style={{ width: `${student.totalFees > 0 ? ((student.paidFees || 0) / student.totalFees * 100) : 0}%` }} />
                  </div>
                  <p className="text-xs text-gray-500 text-center mt-2">
                    {student.totalFees > 0 ? Math.round(((student.paidFees || 0) / student.totalFees * 100)) : 0}% Paid
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4 flex justify-end">
            <button onClick={() => navigate('/admin-dashboard/students')}
              className="flex items-center gap-2 px-5 py-2.5 bg-gray-600 text-white text-sm font-medium rounded-lg hover:bg-gray-700">
              <FaArrowLeft className="w-4 h-4" /> Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewStudent;