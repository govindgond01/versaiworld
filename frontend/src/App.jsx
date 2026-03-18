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
import AdminStaffDashboard from "./pages/admin/AdminStaffDashboard";
import AdminStats from "./pages/admin/AdminStats";
import UserManagement from "./pages/admin/UserManagement";
import AllStudents from "./pages/admin/students/AllStudents";
import AddStudent from "./pages/admin/students/AddStudent";
import StudentTypes from "./pages/admin/students/StudentTypes";
import ExpiringSoon from "./pages/admin/students/ExpiringSoon";
import ViewStudent from "./pages/admin/students/ViewStudent";
import EditStudent from "./pages/admin/students/EditStudent";
import AllStaff from "./components/staff/AllStaff";
import AddStaff from "./components/staff/AddStaff";
import ViewStaff from "./components/staff/ViewStaff";
import EditStaff from "./components/staff/EditStaff";
import StaffStats from "./components/staff/StaffStats";
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

// Staff pages
import StaffDashboard from "./pages/staff/StaffDashboard";
import StaffPayments from "./pages/staff/StaffPayments";
import StaffActivity from "./pages/staff/StaffActivity";
import StaffProfile from "./pages/staff/StaffProfile";
import StaffSettings from "./pages/staff/StaffSettings";
import StaffHelp from "./pages/staff/StaffHelp";
import StaffNotifications from "./pages/staff/StaffNotifications";

// Attendance pages
import AcademyAttendance from "./pages/academy/AcademyAttendance";
import LibraryAttendance from "./pages/library/LibraryAttendance";
import StaffAttendance from "./pages/staff/StaffAttendance";
import AdminAcademyAttendance from "./pages/admin/attendance/AdminAcademyAttendance";
import AdminLibraryAttendance from "./pages/admin/attendance/AdminLibraryAttendance";
import AdminStaffAttendance from "./pages/admin/attendance/AdminStaffAttendance";
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

    window.addEventListener('storage', checkAuth);
    return () => {
      window.removeEventListener('storage', checkAuth);
      if (storageTimeoutRef.current) {
        clearTimeout(storageTimeoutRef.current);
      }
    };
  }, []);

  // ============ FIX 1: Get dashboard path based on role ============
  const getDashboardPath = useCallback(() => {
    if (!isLoggedIn) return '/login';
    
    if (role === 'admin') return '/admin-dashboard';
    if (role === 'staff') return '/staff-dashboard';
    if (role === 'student') {
      if (studentCategory === 'academy') return '/academy-dashboard';
      if (studentCategory === 'library') return '/library-dashboard';
    }
    return '/login';
  }, [isLoggedIn, role, studentCategory]);

  // ============ FIX 2: Check if current path is valid ============
  const isValidPath = useCallback((path) => {
    if (!isLoggedIn) return path === '/login' || path === '/signup' || path === '/forgot-password' || path.startsWith('/reset-password');
    
    if (role === 'admin') return path.startsWith('/admin-dashboard');
    if (role === 'staff') return path.startsWith('/staff-dashboard');
    if (role === 'student') {
      if (studentCategory === 'academy') return path.startsWith('/academy-dashboard');
      if (studentCategory === 'library') return path.startsWith('/library-dashboard');
    }
    return false;
  }, [isLoggedIn, role, studentCategory]);

  return (
    <Routes>
      {/* ============ FIX 3: Home route - single redirect point ============ */}
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
      <Route path="/admin-dashboard" element={
        isLoggedIn && role === "admin" ? <MainLayout /> : <Navigate to="/login" replace />
      }>
        {/* FIX 4: Remove nested redirects - use direct components */}
        <Route index element={<AdminLibraryDashboard />} />
        <Route path="library-dash" element={<AdminLibraryDashboard />} />
        <Route path="academy-dash" element={<AdminAcademyDashboard />} />
        <Route path="staff-dash" element={<AdminStaffDashboard />} />
        
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
          <Route path="staff" element={<CategoryPayments category="staff" />} />
          <Route path="add" element={<AddPayment />} />
          <Route path="history" element={<PaymentHistory isAdmin={true} />} />
          <Route path="due-payments" element={<DuePayments />} />
        </Route>
        
        <Route path="attendance">
          <Route index element={<AdminAcademyAttendance />} />
          <Route path="academy" element={<AdminAcademyAttendance />} />
          <Route path="library" element={<AdminLibraryAttendance />} />
          <Route path="staff" element={<AdminStaffAttendance />} />
        </Route>

        <Route path="export" element={<ExportData />} />
        
        <Route path="staff">
          <Route index element={<AllStaff />} />
          <Route path="all" element={<AllStaff />} />
          <Route path="add" element={<AddStaff />} />
          <Route path=":id" element={<ViewStaff />} />
          <Route path="edit/:id" element={<EditStaff />} />
          <Route path="analytics" element={<StaffStats />} />
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
      <Route path="/academy-dashboard" element={
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
      <Route path="/library-dashboard" element={
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

      {/* ========== STAFF ROUTES ========== */}
      <Route path="/staff-dashboard" element={
        isLoggedIn && role === "staff" ? <MainLayout /> : <Navigate to="/login" replace />
      }>
        <Route index element={<StaffDashboard />} />
        <Route path="attendance" element={<StaffAttendance />} />
        <Route path="payments" element={<StaffPayments />} />
        <Route path="activity" element={<StaffActivity />} />
        <Route path="profile" element={<StaffProfile />} />
        <Route path="settings" element={<StaffSettings />} />
        <Route path="notifications" element={<StaffNotifications />} />
        <Route path="help" element={<StaffHelp />} />
      </Route>
    </Routes>
  );
}

export default App;