import React from 'react';
import { BsPersonWorkspace } from 'react-icons/bs';
import AttendancePage from '../../components/attendance/AttendancePage';

const StaffAttendance = () => {
  return (
    <AttendancePage
      userType="staff"
      icon={BsPersonWorkspace}
      title="Staff Attendance"
      subtitle="Track your work attendance"
    />
  );
};

export default StaffAttendance;