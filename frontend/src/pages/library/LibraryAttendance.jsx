import React from 'react';
import { MdLocalLibrary } from 'react-icons/md';
import AttendancePage from '../../components/attendance/AttendancePage';

const LibraryAttendance = () => {
  return (
    <AttendancePage
      userType="student"
      icon={MdLocalLibrary}
      title="Library Attendance"
      subtitle="Track your library visits"
    />
  );
};

export default LibraryAttendance;