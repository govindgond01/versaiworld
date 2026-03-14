import React from 'react';
import { GiTeacher } from 'react-icons/gi';
import AttendancePage from '../../components/attendance/AttendancePage';

const AcademyAttendance = () => {
  return (
    <AttendancePage
      userType="student"
      icon={GiTeacher}
      title="Academy Attendance"
      subtitle="Track your academic attendance"
    />
  );
};

export default AcademyAttendance;