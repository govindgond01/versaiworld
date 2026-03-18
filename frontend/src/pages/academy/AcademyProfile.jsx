import React, { useState, useEffect } from 'react';
import { GiTeacher } from 'react-icons/gi';
import api from '../../services/api';
import { toast } from 'react-hot-toast';

import Loader from '../../components/common/Loader';
import ProfileImageUpload from '../../components/common/ProfileImageUpload';

const AcademyProfile = () => {
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState({});
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => { 
    fetchProfile(); 
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get('/profile');

      if (res.data.success) {
        const profileUser = res.data.user;
        setUserData(profileUser);
        setFormData(profileUser);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpdate = (newImage) => {
    setUserData(prev => ({
      ...prev,
      profileImage: newImage
    }));
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleUpdate = async () => {
    try {
      // Only send the fields that can be updated via settings/profile
      const updateData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        fatherName: formData.fatherName,
        dob: formData.dob,
        address: formData.address
      };

      const res = await api.put('/settings/profile', updateData);

      if (res.data.success) {
        // Merge the updated fields back into userData
        setUserData(prev => ({
          ...prev,
          ...res.data.user
        }));
        setEditMode(false);
        toast.success('Profile updated successfully');
      }
    } catch (error) {
      console.error('Update error:', error);
      toast.error('Failed to update profile');
    }
  };

  if (loading) return <Loader type="spinner" size="large" />;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <button
          onClick={() => setEditMode(!editMode)}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          {editMode ? 'Cancel' : 'Edit Profile'}
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex flex-col items-center mb-8">
          <ProfileImageUpload 
            user={userData} 
            onImageUpdate={handleImageUpdate}
            size="lg"
          />
          
          <div className="mt-4 flex items-center gap-2">
            <GiTeacher className="text-purple-600" />
            <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
              Academy Student
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              <label className="text-sm text-gray-500">Father's Name</label>
              {editMode ? (
                <input
                  type="text"
                  name="fatherName"
                  value={formData.fatherName || ''}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded mt-1"
                />
              ) : (
                <p className="font-medium">{userData?.fatherName || 'Not provided'}</p>
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

            <div>
              <label className="text-sm text-gray-500">Date of Birth</label>
              {editMode ? (
                <input
                  type="date"
                  name="dob"
                  value={formData.dob ? formData.dob.split('T')[0] : ''}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded mt-1"
                />
              ) : (
                <p className="font-medium">
                  {userData?.dob ? new Date(userData.dob).toLocaleDateString() : 'Not provided'}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-gray-700 border-b pb-2">Academy Information</h3>
            
            <div>
              <label className="text-sm text-gray-500">Student ID</label>
              <p className="font-medium">{userData?.studentId || userData?.userId}</p>
            </div>

            <div>
              <label className="text-sm text-gray-500">Course</label>
              <p className="font-medium">{userData?.course || 'N/A'}</p>
            </div>

            <div>
              <label className="text-sm text-gray-500">Join Date</label>
              <p className="font-medium">
                {userData?.admissionDate ? new Date(userData.admissionDate).toLocaleDateString() : 'N/A'}
              </p>
            </div>

            <div>
              <label className="text-sm text-gray-500">Membership Expiry</label>
              <p className="font-medium">
                {userData?.expiryDate ? new Date(userData.expiryDate).toLocaleDateString() : 'N/A'}
              </p>
            </div>

            <div>
              <label className="text-sm text-gray-500">Fees Status</label>
              <p className="font-medium">
                ₹{userData?.paidFees || 0} paid of ₹{userData?.totalFees || 0}
              </p>
            </div>
          </div>
        </div>

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

export default AcademyProfile;