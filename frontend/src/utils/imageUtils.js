// Get image URL (handles both Cloudinary and legacy)
export const getImageUrl = (user) => {
  if (!user?.profileImage) return null;
  
  // Cloudinary image (object)
  if (user.profileImage.secure_url) {
    return user.profileImage.secure_url;
  }
  
  // Legacy image (string)
  if (typeof user.profileImage === 'string') {
    return `http://localhost:5000/uploads/${user.profileImage}`;
  }
  
  return null;
};

// Get optimized Cloudinary URL
export const getOptimizedImageUrl = (image, width = 200) => {
  if (!image?.secure_url) return null;
  return image.secure_url.replace('/upload/', `/upload/w_${width},c_fill/`);
};

// Format file size
export const formatFileSize = (bytes) => {
  if (!bytes) return 'Unknown';
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  return `${size.toFixed(1)} ${units[unitIndex]}`;
};

// Get initials from name
export const getInitials = (name) => {
  if (!name) return 'U';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};