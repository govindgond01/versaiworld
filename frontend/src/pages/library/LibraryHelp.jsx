import React from 'react';
import { FaBook, FaVideo, FaEnvelope, FaPhone } from 'react-icons/fa';
import { MdLocalLibrary } from 'react-icons/md';

import UserHelpCard from '../../components/user/UserHelpCard';

const LibraryHelp = () => {
  const helpItems = [
    { icon: FaBook, title: 'Library Guide', description: 'Learn how to use the library', action: 'Read Guide' },
    { icon: FaVideo, title: 'Video Tutorials', description: 'Watch tutorials', action: 'Watch Now' },
    { icon: FaEnvelope, title: 'Email Support', description: 'Get help via email', action: 'Send Email' },
    { icon: FaPhone, title: 'Contact Librarian', description: 'Call the library', action: 'Call Now' }
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

export default LibraryHelp;