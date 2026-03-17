import React, { useState, useEffect } from 'react';
import { BsPersonWorkspace } from 'react-icons/bs';
import api from '../../services/api';
import { toast } from 'react-hot-toast';

import Loader from '../../components/common/Loader';
import ProfileImageUpload from '../../components/common/ProfileImageUpload';  // 👈 ADD THIS
import { getImageUrl } from '../../utils/imageUtils';  // 👈 ADD THIS

const StaffProfile = () => {
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState({});
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userId = user?.id || user?._id || '';

  useEffect(() => { 
    fetchProfile(); 
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get(`staff/${userId}`);

      if (res.data.success) {
        setUserData(res.data.staff);
        setFormData(res.data.staff);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Image update handler
  const handleImageUpdate = (newImage) => {
    setUserData(prev => ({
      ...prev,
      profileImage: newImage
    }));
  };

  // ✅ Input change handler
  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // ✅ Update profile handler
  const handleUpdate = async () => {
    try {
      const res = await api.put(`staff/${userId}`, formData);

      if (res.data.success) {
        setUserData(res.data.staff);
        setEditMode(false);
        toast.success('Profile updated successfully');
      }
    } catch (error) {
      console.error('Update error:', error);
      toast.error('Failed to update profile');
    }
  };

  if (loading) return <Loader type="spinner" size="large" />;

  const imageUrl = getImageUrl(userData);

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Profile</h1>
        <button
          onClick={() => setEditMode(!editMode)}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          {editMode ? 'Cancel' : 'Edit Profile'}
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        {/* Profile Image Section */}
        <div className="flex flex-col items-center mb-8">
          <ProfileImageUpload 
            user={userData} 
            onImageUpdate={handleImageUpdate}
            size="lg"
          />
          
          {/* Staff Role Badge */}
          <div className="mt-4 flex items-center gap-2">
            <BsPersonWorkspace className="text-purple-600" />
            <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
              {userData?.staffRole || 'Staff Member'}
            </span>
          </div>
        </div>

        {/* Staff Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-700 border-b pb-2">Personal Information</h3>
            
            <div>
              <label className="text-sm text-gray-500">Full Name</label>
              {editMode ? (
                <input
                  type="text"
                  name="name"
                  value={formData.name || ''}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded mt-1"
                />
              ) : (
                <p className="font-medium">{userData?.name}</p>
              )}
            </div>

            <div>
              <label className="text-sm text-gray-500">Email</label>
              {editMode ? (
                <input
                  type="email"
                  name="email"
                  value={formData.email || ''}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded mt-1"
                />
              ) : (
                <p className="font-medium">{userData?.email}</p>
              )}
            </div>

            <div>
              <label className="text-sm text-gray-500">Phone</label>
              {editMode ? (
                <input
                  type="text"
                  name="phone"
                  value={formData.phone || ''}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded mt-1"
                />
              ) : (
                <p className="font-medium">{userData?.phone || 'Not provided'}</p>
              )}
            </div>
          </div>

          {/* Work Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-700 border-b pb-2">Work Information</h3>
            
            <div>
              <label className="text-sm text-gray-500">Staff ID</label>
              <p className="font-medium">{userData?.staffId || userData?.userId}</p>
            </div>

            <div>
              <label className="text-sm text-gray-500">Role</label>
              {editMode ? (
                <select
                  name="staffRole"
                  value={formData.staffRole || ''}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded mt-1"
                >
                  <option value="teacher">Teacher</option>
                  <option value="librarian">Librarian</option>
                  <option value="accountant">Accountant</option>
                  <option value="admin">Admin</option>
                  <option value="other">Other</option>
                </select>
              ) : (
                <p className="font-medium capitalize">{userData?.staffRole}</p>
              )}
            </div>

            <div>
              <label className="text-sm text-gray-500">Department</label>
              {editMode ? (
                <input
                  type="text"
                  name="department"
                  value={formData.department || ''}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded mt-1"
                />
              ) : (
                <p className="font-medium">{userData?.department || 'General'}</p>
              )}
            </div>

            <div>
              <label className="text-sm text-gray-500">Join Date</label>
              <p className="font-medium">
                {userData?.joinDate ? new Date(userData.joinDate).toLocaleDateString() : 'N/A'}
              </p>
            </div>

            <div>
              <label className="text-sm text-gray-500">Salary</label>
              <p className="font-medium">₹{userData?.salary || 0}/month</p>
            </div>
          </div>
        </div>

        {/* Edit/Save Buttons */}
        {editMode && (
          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={() => {
                setEditMode(false);
                setFormData(userData);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleUpdate}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Save Changes
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default StaffProfile;