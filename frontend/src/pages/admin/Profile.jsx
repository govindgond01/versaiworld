import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiUser, FiMail, FiPhone, FiMapPin, 
  FiCalendar, FiBook, FiDollarSign,
  FiClock, FiAward, FiEdit2, FiCamera,
  FiSave, FiX
} from 'react-icons/fi';
import { GiTeacher, GiGraduateCap } from 'react-icons/gi';
import { MdLocalLibrary } from 'react-icons/md';
import { BsPersonWorkspace } from 'react-icons/bs';
import { toast } from 'react-hot-toast';
import api from '../../services/api';  // 👈 CORRECT PATH - services folder
import Loader from '../../components/common/Loader';

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchUserData();
  }, []);

  // ✅ FETCH USER DATA
  const fetchUserData = async () => {
    try {
      const res = await api.get('/auth/me');
      
      if (res.data.success) {
        setUser(res.data.user);
        setFormData(res.data.user);
      }
    } catch (error) {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  // ✅ GET IMAGE URL
  const getImageUrl = () => {
    if (!user?.profileImage) return null;
    
    // Cloudinary image (object)
    if (user.profileImage.secure_url) {
      return user.profileImage.secure_url;
    }
    
    // Cloudinary image (string URL)
    if (typeof user.profileImage === 'string' && user.profileImage.includes('cloudinary')) {
      return user.profileImage;
    }
    
    // Legacy local image (string)
    if (typeof user.profileImage === 'string') {
      return `http://localhost:5000/uploads/${user.profileImage}`;
    }
    
    return null;
  };

  // ✅ IMAGE UPLOAD
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    const formData = new FormData();
    formData.append('profileImage', file);

    setUploading(true);
    try {
      // 👈 CLOUDINARY UPLOAD
      const res = await api.post('/upload/profile-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.success) {
        setUser({ ...user, profileImage: res.data.image });
        toast.success('Profile image updated');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.message || 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  // ✅ UPDATE PROFILE
  const handleUpdate = async () => {
    try {
      const res = await api.put('/auth/me', formData);

      if (res.data.success) {
        setUser(res.data.user);
        setEditMode(false);
        toast.success('Profile updated');
      }
    } catch (error) {
      toast.error('Failed to update');
    }
  };

  const getRoleIcon = () => {
    if (!user) return <FiUser />;
    if (user.role === 'admin') return <FiUser className="w-8 h-8" />;
    if (user.role === 'staff') return <BsPersonWorkspace className="w-8 h-8" />;
    if (user.studentCategory === 'academy') return <GiGraduateCap className="w-8 h-8" />;
    if (user.studentCategory === 'library') return <MdLocalLibrary className="w-8 h-8" />;
    return <FiUser className="w-8 h-8" />;
  };

  const getRoleBadge = () => {
    if (!user) return '';
    if (user.role === 'admin') return 'bg-purple-100 text-purple-700';
    if (user.role === 'staff') return 'bg-blue-100 text-blue-700';
    if (user.studentCategory === 'academy') return 'bg-green-100 text-green-700';
    if (user.studentCategory === 'library') return 'bg-yellow-100 text-yellow-700';
    return 'bg-gray-100 text-gray-700';
  };

  const getRoleText = () => {
    if (!user) return '';
    if (user.role === 'admin') return 'Administrator';
    if (user.role === 'staff') return user.staffRole || 'Staff Member';
    if (user.studentCategory === 'academy') return 'Academy Student';
    if (user.studentCategory === 'library') return 'Library Member';
    return 'User';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader type="spinner" size="large" />
      </div>
    );
  }

  const imageUrl = getImageUrl();

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <button
          onClick={() => setEditMode(!editMode)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
        >
          {editMode ? <FiX /> : <FiEdit2 />}
          {editMode ? 'Cancel' : 'Edit Profile'}
        </button>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Cover Photo */}
        <div className="h-32 bg-gradient-to-r from-purple-500 to-pink-500"></div>

        {/* Profile Info */}
        <div className="px-6 pb-6">
          {/* Avatar */}
          <div className="flex justify-center -mt-16 mb-4">
            <div className="relative">
              <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg overflow-hidden bg-white">
                {imageUrl ? (
                  <img 
                    src={imageUrl}
                    alt={user?.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.style.display = 'none';
                      e.target.parentNode.innerHTML = `
                        <div class="w-full h-full flex items-center justify-center text-4xl font-bold ${getRoleBadge()}">
                          ${user?.name?.charAt(0).toUpperCase()}
                        </div>
                      `;
                    }}
                  />
                ) : (
                  <div className={`w-full h-full flex items-center justify-center text-4xl font-bold ${getRoleBadge()}`}>
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              
              {editMode && (
                <label className="absolute bottom-0 right-0 w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-purple-700 transition">
                  <FiCamera className="w-4 h-4 text-white" />
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploading}
                  />
                </label>
              )}
              
              {uploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
                  <Loader type="inline" size="small" />
                </div>
              )}
            </div>
          </div>

          {/* Name & Role */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">{user?.name}</h2>
            <div className="flex items-center justify-center gap-2 mt-1">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleBadge()}`}>
                {getRoleText()}
              </span>
              <span className="text-sm text-gray-500">ID: {user?.userId}</span>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Personal Info */}
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <FiUser className="text-purple-600" />
                Personal Information
              </h3>
              
              <div className="space-y-2">
                <div className="flex items-center gap-3 text-sm">
                  <FiMail className="w-4 h-4 text-gray-400" />
                  {editMode ? (
                    <input
                      type="email"
                      value={formData.email || ''}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="flex-1 p-1 border rounded"
                    />
                  ) : (
                    <span>{user?.email}</span>
                  )}
                </div>

                <div className="flex items-center gap-3 text-sm">
                  <FiPhone className="w-4 h-4 text-gray-400" />
                  {editMode ? (
                    <input
                      type="text"
                      value={formData.phone || ''}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="flex-1 p-1 border rounded"
                    />
                  ) : (
                    <span>{user?.phone || 'Not provided'}</span>
                  )}
                </div>

                <div className="flex items-center gap-3 text-sm">
                  <FiCalendar className="w-4 h-4 text-gray-400" />
                  <span>Joined {new Date(user?.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {/* Role Specific Info */}
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                {getRoleIcon()}
                {user?.role === 'student' ? 'Academic Information' : 'Work Information'}
              </h3>

              <div className="space-y-2">
                {user?.role === 'student' && (
                  <>
                    <div className="flex items-center gap-3 text-sm">
                      <FiBook className="w-4 h-4 text-gray-400" />
                      <span>Course: {user?.course || 'Not assigned'}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <FiClock className="w-4 h-4 text-gray-400" />
                      <span>Membership: {user?.membershipDuration || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <FiCalendar className="w-4 h-4 text-gray-400" />
                      <span>Expires: {user?.expiryDate ? new Date(user.expiryDate).toLocaleDateString() : 'N/A'}</span>
                    </div>
                  </>
                )}

                {user?.role === 'staff' && (
                  <>
                    <div className="flex items-center gap-3 text-sm">
                      <GiTeacher className="w-4 h-4 text-gray-400" />
                      <span>Role: {user?.staffRole || 'Staff'}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <FiBook className="w-4 h-4 text-gray-400" />
                      <span>Department: {user?.department || 'General'}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <FiDollarSign className="w-4 h-4 text-gray-400" />
                      <span>Salary: ₹{user?.salary || 0}/month</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Address */}
          {user?.address && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-2">
                <FiMapPin className="text-purple-600" />
                Address
              </h3>
              <p className="text-sm text-gray-600">
                {typeof user.address === 'object' ? (
                  <>
                    {user.address.street && `${user.address.street}, `}
                    {user.address.city && `${user.address.city}, `}
                    {user.address.state && `${user.address.state} - `}
                    {user.address.pincode}
                  </>
                ) : (
                  user.address
                )}
              </p>
            </div>
          )}

          {/* Edit/Save Buttons */}
          {editMode && (
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setEditMode(false)}
                className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
              >
                <FiSave />
                Save Changes
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;