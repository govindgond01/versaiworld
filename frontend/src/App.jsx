import './index.css'
import { Route, Routes, Navigate } from "react-router-dom";
import LoginPage from "./components/forms/LoginPage";
import SignUpPage from "./components/forms/SignUpPage";
import ForgotPasswordPage from "./components/forms/ForgotPasswordPage";
import ResetPasswordPage from "./components/forms/ResetPasswordPage";
import MainLayout from "./components/layouts/MainLayout";
import { useState, useEffect, useRef, useCallback } from 'react';

// Admin Pages
import AdminLibraryDashboard from "./pages/admin/AdminLibraryDashboard";
import AdminAcademyDashboard from "./pages/admin/AdminAcademyDashboard";
import AdminEmployeesDashboard from "./pages/admin/AdminEmployeesDashboard";
import AdminStats from "./pages/admin/AdminStats";
import UserManagement from "./pages/admin/UserManagement";
import AllStudents from "./pages/admin/students/AllStudents";
import AddStudent from "./pages/admin/students/AddStudent";
import StudentTypes from "./pages/admin/students/StudentTypes";
import ExpiringSoon from "./pages/admin/students/ExpiringSoon";
import ViewStudent from "./pages/admin/students/ViewStudent";
import EditStudent from "./pages/admin/students/EditStudent";
import AllEmployees from "./components/employees/AllEmployees";
import AddEmployees from "./components/employees/AddEmployees";
import VieweEployees from "./components/employees/ViewEmployees";
import EditEmployees from "./components/employees/EditEmployees";
import EmployeesStats from "./components/employees/EmployeesStats";
import PaymentsDashboard from "./pages/admin/payments/PaymentsDashboard";
import PaymentHistory from "./components/payments/PaymentHistory";
import AddPayment from "./pages/admin/payments/AddPayment";
import DuePayments from "./pages/admin/payments/DuePayments";
import CategoryPayments from "./components/payments/CategoryPayments";
import ExportData from "./pages/admin/ExportData";
import HelpSupport from "./pages/admin/HelpSupport";
import SystemSettings from "./pages/admin/SystemSettings";
import AdminNotifications from "./pages/admin/AdminNotifications";

// Academy student pages
import AcademyDashboard from "./pages/academy/AcademyDashboard";
import AcademyPayments from "./pages/academy/AcademyPayments";
import AcademyActivity from "./pages/academy/AcademyActivity";
import AcademyProfile from "./pages/academy/AcademyProfile";
import AcademySettings from "./pages/academy/AcademySettings";
import AcademyHelp from "./pages/academy/AcademyHelp";
import AcademyNotifications from "./pages/academy/AcademyNotifications";

// Library student pages
import LibraryDashboard from "./pages/library/LibraryDashboard";
import LibraryPayments from "./pages/library/LibraryPayments";
import LibraryActivity from "./pages/library/LibraryActivity";
import LibraryProfile from "./pages/library/LibraryProfile";
import LibrarySettings from "./pages/library/LibrarySettings";
import LibraryHelp from "./pages/library/LibraryHelp";
import LibraryNotifications from "./pages/library/LibraryNotifications";

// employees pages
import EmployeesDashboard from "./pages/employees/EmployeesDashboard";
import EmployeesPayments from "./pages/employees/EmployeesPayments";
import EmployeesActivity from "./pages/employees/EmployeesActivity";
import EmployeesProfile from "./pages/employees/EmployeesProfile";
import EmployeesSettings from "./pages/employees/EmployeesSettings";
import EmployeesHelp from "./pages/employees/EmployeesHelp";
import EmployeesNotifications from "./pages/employees/EmployeesNotifications";

// Attendance pages
import AcademyAttendance from "./pages/academy/AcademyAttendance";
import LibraryAttendance from "./pages/library/LibraryAttendance";
import EmployeesAttendance from "./pages/employees/EmployeesAttendance";
import AdminAcademyAttendance from "./pages/admin/attendance/AdminAcademyAttendance";
import AdminLibraryAttendance from "./pages/admin/attendance/AdminLibraryAttendance";
import AdminEmployeesAttendance from "./pages/admin/attendance/AdminEmployeesAttendance";
import Profile from "./pages/admin/Profile";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => 
    localStorage.getItem("isLoggedIn") === "true"
  );
  const [role, setRole] = useState(() => 
    localStorage.getItem("role") || ''
  );
  const [studentCategory, setStudentCategory] = useState(() => 
    localStorage.getItem("studentCategory") || ''
  );

  const storageTimeoutRef = useRef(null);

  useEffect(() => {
    const checkAuth = () => {
      if (storageTimeoutRef.current) {
        clearTimeout(storageTimeoutRef.current);
      }

      storageTimeoutRef.current = setTimeout(() => {
        const newIsLoggedIn = localStorage.getItem("isLoggedIn") === "true";
        const newRole = localStorage.getItem("role") || '';
        const newStudentCategory = localStorage.getItem("studentCategory") || '';

        setIsLoggedIn(prev => prev === newIsLoggedIn ? prev : newIsLoggedIn);
        setRole(prev => prev === newRole ? prev : newRole);
        setStudentCategory(prev => prev === newStudentCategory ? prev : newStudentCategory);
      }, 100);
    };

    const handleLoginSuccess = (event) => {
      const { role, studentCategory } = event.detail;
      setIsLoggedIn(true);
      setRole(role);
      setStudentCategory(studentCategory || '');
    };

    window.addEventListener('storage', checkAuth);
    window.addEventListener('loginSuccess', handleLoginSuccess);
    return () => {
      window.removeEventListener('storage', checkAuth);
      window.removeEventListener('loginSuccess', handleLoginSuccess);
      if (storageTimeoutRef.current) {
        clearTimeout(storageTimeoutRef.current);
      }
    };
  }, []);

  const getDashboardPath = useCallback(() => {
    if (!isLoggedIn) return '/login';
    
    if (role === 'admin' || role === 'superAdmin') return '/admin';
    if (role === 'employees') return '/employees';
    if (role === 'student') {
      if (studentCategory === 'academy') return '/academy';
      if (studentCategory === 'library') return '/library';
    }
    return '/login';
  }, [isLoggedIn, role, studentCategory]);

  return (
    <Routes>
      <Route path="/" element={
        <Navigate to={getDashboardPath()} replace />
      } />

      {/* Auth routes */}
      <Route path="/login" element={
        !isLoggedIn ? <LoginPage /> : <Navigate to={getDashboardPath()} replace />
      } />
      <Route path="/signup" element={
        !isLoggedIn ? <SignUpPage /> : <Navigate to={getDashboardPath()} replace />
      } />
      <Route path="/forgot-password" element={
        !isLoggedIn ? <ForgotPasswordPage /> : <Navigate to={getDashboardPath()} replace />
      } />
      <Route path="/reset-password/:token" element={
        !isLoggedIn ? <ResetPasswordPage /> : <Navigate to={getDashboardPath()} replace />
      } />

      {/* ========== ADMIN ROUTES ========== */}
      <Route path="/admin" element={
        isLoggedIn && (role === "admin" || role === "superAdmin") ? <MainLayout /> : <Navigate to="/login" replace />
      }>
        <Route index element={<AdminLibraryDashboard />} />
        <Route path="library-dash" element={<AdminLibraryDashboard />} />
        <Route path="academy-dash" element={<AdminAcademyDashboard />} />
        <Route path="employees-dash" element={<AdminEmployeesDashboard />} />
        
        <Route path="students">
          <Route index element={<AllStudents />} />
          <Route path="all" element={<AllStudents />} />
          <Route path="add" element={<AddStudent />} />
          <Route path="types" element={<StudentTypes />} />
          <Route path=":id" element={<ViewStudent />} />
          <Route path="edit/:id" element={<EditStudent />} />
          <Route path="expiring-soon" element={<ExpiringSoon />} />
        </Route>
        
        <Route path="payments">
          <Route index element={<CategoryPayments category="academy" />} />
          <Route path="dashboard" element={<PaymentsDashboard />} />
          <Route path="academy" element={<CategoryPayments category="academy" />} />
          <Route path="library" element={<CategoryPayments category="library" />} />
          <Route path="employees" element={<CategoryPayments category="employees" />} />
          <Route path="add" element={<AddPayment />} />
          <Route path="history" element={<PaymentHistory isAdmin={true} />} />
          <Route path="due-payments" element={<DuePayments />} />
        </Route>
        
        <Route path="attendance">
          <Route index element={<AdminAcademyAttendance />} />
          <Route path="academy" element={<AdminAcademyAttendance />} />
          <Route path="library" element={<AdminLibraryAttendance />} />
          <Route path="employees" element={<AdminEmployeesAttendance />} />
        </Route>

        <Route path="export" element={<ExportData />} />
        
        <Route path="employees">
          <Route index element={<AllEmployees />} />
          <Route path="all" element={<AllEmployees />} />
          <Route path="add" element={<AddEmployees />} />
          <Route path=":id" element={<VieweEployees />} />
          <Route path="edit/:id" element={<EditEmployees />} />
          <Route path="analytics" element={<EmployeesStats />} />
        </Route>
        <Route path="profile" element={<Profile/>} />
        <Route path="settings" element={<SystemSettings />} />
        <Route path="notifications" element={<AdminNotifications />} />
        <Route path="help" element={<HelpSupport />} />

        <Route path="super-admin">
          <Route index element={<AdminStats />} />
          <Route path="stats" element={<AdminStats />} />
          <Route path="users" element={<UserManagement />} />
        </Route>
      </Route>

      {/* ========== ACADEMY STUDENT ROUTES ========== */}
      <Route path="/academy" element={
        isLoggedIn && role === "student" && studentCategory === "academy" ? 
        <MainLayout /> : <Navigate to="/login" replace />
      }>
        <Route index element={<AcademyDashboard />} />
        <Route path="attendance" element={<AcademyAttendance />} />
        <Route path="payments" element={<AcademyPayments />} />
        <Route path="activity" element={<AcademyActivity />} />
        <Route path="profile" element={<AcademyProfile />} />
        <Route path="settings" element={<AcademySettings />} />
        <Route path="notifications" element={<AcademyNotifications />} />
        <Route path="help" element={<AcademyHelp />} />
      </Route>

      {/* ========== LIBRARY STUDENT ROUTES ========== */}
      <Route path="/library" element={
        isLoggedIn && role === "student" && studentCategory === "library" ? 
        <MainLayout /> : <Navigate to="/login" replace />
      }>
        <Route index element={<LibraryDashboard />} />
        <Route path="attendance" element={<LibraryAttendance />} />
        <Route path="payments" element={<LibraryPayments />} />
        <Route path="activity" element={<LibraryActivity />} />
        <Route path="profile" element={<LibraryProfile />} />
        <Route path="settings" element={<LibrarySettings />} />
        <Route path="notifications" element={<LibraryNotifications />} /> 
        <Route path="help" element={<LibraryHelp />} />
      </Route>

      {/* ========== employees ROUTES ========== */}
      <Route path="/employees" element={
        isLoggedIn && role === "employees" ? <MainLayout /> : <Navigate to="/login" replace />
      }>
        <Route index element={<EmployeesDashboard />} />
        <Route path="attendance" element={<EmployeesAttendance />} />
        <Route path="payments" element={<EmployeesPayments />} />
        <Route path="activity" element={<EmployeesActivity />} />
        <Route path="profile" element={<EmployeesProfile />} />
        <Route path="settings" element={<EmployeesSettings />} />
        <Route path="notifications" element={<EmployeesNotifications />} />
        <Route path="help" element={<EmployeesHelp />} />
      </Route>
    </Routes>
  );
}

export default App;