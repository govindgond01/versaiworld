import React from 'react';
import { BsPersonWorkspace } from 'react-icons/bs';
import AttendancePage from '../../components/attendance/AttendancePage';

const EmployeesAttendance = () => {
  return (
    <AttendancePage
      userType="employees"
      icon={BsPersonWorkspace}
      title="employees Attendance"
      subtitle="Track your work attendance"
    />
  );
};

export default EmployeesAttendance;