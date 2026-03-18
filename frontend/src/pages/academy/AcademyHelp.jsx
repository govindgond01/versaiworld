import React from 'react';
import { FaBook, FaVideo, FaEnvelope, FaPhone } from 'react-icons/fa';
import { GiTeacher } from 'react-icons/gi';

import UserHelpCard from '../../components/user/UserHelpCard';

const AcademyHelp = () => {
  const helpItems = [
    { icon: FaBook, title: 'User Guide', description: 'Learn how to use the platform', action: 'Read Guide' },
    { icon: FaVideo, title: 'Video Tutorials', description: 'Watch tutorials', action: 'Watch Now' },
    { icon: FaEnvelope, title: 'Email Support', description: 'support@academy.com', action: 'Send Email' },
    { icon: FaPhone, title: 'Contact Support', description: '+91 9876543210', action: 'Call Now' }
  ];

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Help & Support</h1>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {helpItems.map((item, idx) => <UserHelpCard key={idx} {...item} />)}
      </div>
    </div>
  );
};

export default AcademyHelp;