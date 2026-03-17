import React, { useState } from 'react';
import api from '../../services/api';
import { toast } from 'react-hot-toast';
import { FiCamera, FiTrash2 } from 'react-icons/fi';
import { getImageUrl, getInitials } from '../../utils/imageUtils';
import Loader from './Loader';

const ProfileImageUpload = ({ user, onImageUpdate, size = 'md' }) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [showOptions, setShowOptions] = useState(false);

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
    xl: 'w-40 h-40'
  };

  const handleImageSelect = (e) => {
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

    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(file);

    uploadImage(file);
  };

  const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append('profileImage', file);

    try {
      setUploading(true);
      const res = await api.post('/upload/profile-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.success) {
        toast.success('Profile image updated!');
        onImageUpdate(res.data.image);
        setPreview(null);
        setShowOptions(false);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Upload failed');
      setPreview(null);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteImage = async () => {
    if (!window.confirm('Are you sure?')) return;

    try {
      const res = await api.delete('/upload/profile-image');
      if (res.data.success) {
        toast.success('Profile image deleted');
        onImageUpdate(null);
        setShowOptions(false);
      }
    } catch (error) {
      toast.error('Failed to delete image');
    }
  };

  const imageUrl = preview || getImageUrl(user);

  return (
    <div className="relative">
      <div className="relative group">
        <div className={`${sizeClasses[size]} rounded-full overflow-hidden border-4 border-purple-200`}>
          {imageUrl ? (
            <img src={imageUrl} alt={user?.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
              {getInitials(user?.name)}
            </div>
          )}
        </div>

        <button
          onClick={() => setShowOptions(!showOptions)}
          className="absolute bottom-0 right-0 bg-purple-600 text-white p-2 rounded-full shadow-lg hover:bg-purple-700"
        >
          <FiCamera className="w-4 h-4" />
        </button>
      </div>

      {showOptions && (
        <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
          <div className="p-2">
            <label className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
              <FiCamera className="w-4 h-4 text-gray-600" />
              <span className="text-sm text-gray-700">Upload New</span>
              <input type="file" accept="image/*" onChange={handleImageSelect} className="hidden" disabled={uploading} />
            </label>

            {user?.profileImage && (
              <button onClick={handleDeleteImage} className="flex items-center gap-3 p-2 hover:bg-red-50 rounded-lg w-full">
                <FiTrash2 className="w-4 h-4 text-red-600" />
                <span className="text-sm text-red-600">Remove Photo</span>
              </button>
            )}
          </div>
        </div>
      )}

      {uploading && (
        <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
          <Loader type="inline" size="small" />
        </div>
      )}
    </div>
  );
};

export default ProfileImageUpload;