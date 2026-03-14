import React from 'react';
import { FaBook, FaVideo, FaEnvelope, FaPhone } from 'react-icons/fa';
import { BsPersonWorkspace } from 'react-icons/bs';

import UserHelpCard from '../../components/user/UserHelpCard';

const StaffHelp = () => {
  const helpItems = [
    { icon: FaBook, title: 'Staff Handbook', description: 'Learn about staff policies', action: 'Read Guide' },
    { icon: FaVideo, title: 'Training Videos', description: 'Watch training tutorials', action: 'Watch Now' },
    { icon: FaEnvelope, title: 'HR Support', description: 'hr@company.com', action: 'Send Email' },
    { icon: FaPhone, title: 'IT Support', description: '+91 9876543210', action: 'Call Now' }
  ];

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Help & Support</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {helpItems.map((item, idx) => <UserHelpCard key={idx} {...item} />)}
      </div>
    </div>
  );
};

export default StaffHelp;