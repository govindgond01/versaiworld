import React from 'react';
import { BsPersonWorkspace } from 'react-icons/bs';
import { FaBook, FaVideo, FaEnvelope, FaPhone } from 'react-icons/fa';

import UserHelpCard from '../../components/user/UserHelpCard';

const EmployeesHelp = () => {
  const helpItems = [
    { icon: FaBook, title: 'employees Guide', description: 'Learn how to use the employees portal', action: 'Read Guide' },
    { icon: FaVideo, title: 'Video Tutorials', description: 'Watch tutorials', action: 'Watch Now' },
    { icon: FaEnvelope, title: 'Email Support', description: 'Get help via email', action: 'Send Email' },
    { icon: FaPhone, title: 'Contact Admin', description: 'Call the administrator', action: 'Call Now' }
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Help & Support</h1>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {helpItems.map((item, idx) => <UserHelpCard key={idx} {...item} />)}
      </div>
    </div>
  );
};

export default EmployeesHelp;