import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import api from '../services/api';

const useDashboardData = (dashboardType = 'academy') => {
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [stats, setStats] = useState([]);
  const [attendanceData, setAttendanceData] = useState({ 
    percentage: 0, 
    todayMarked: false, 
    todayStatus: null,
    present: 0,
    absent: 0
  });
  const [activities, setActivities] = useState([]);
  const [infoItems, setInfoItems] = useState([]);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setUserData(user);
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }
    fetchData();
  }, [dashboardType]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const userId = userData?._id || localStorage.getItem('userId');

      if (!token || !userId) {
        toast.error('Please login again');
        return;
      }

      //  No need to define API_URL - api instance handles baseURL

      // Fetch user data based on type
      let userResponse;
      if (dashboardType === 'employees') {
        userResponse = await api.get(`/employees/${userId}`);
      } else {
        userResponse = await api.get(`/admin/students/${userId}`);
      }

      if (userResponse.data.success) {
        const user = userResponse.data.employees || userResponse.data.student;
        
        if (dashboardType === 'employees') {
          // employees dashboard data
          setStats([
            { 
              label: "Salary", 
              value: `₹${user.salary?.toLocaleString() || 0}`,
              detail: `Paid: ₹${user.paidSalary || 0}`,
              bgColor: "bg-blue-100",
            },
            { 
              label: "Due Salary", 
              value: `₹${user.dueSalary?.toLocaleString() || 0}`,
              detail: user.dueSalary > 0 ? "Pending" : "Cleared",
              bgColor: user.dueSalary > 0 ? "bg-red-100" : "bg-green-100",
            },
            { 
              label: "Attendance", 
              value: `${user.attendance?.percentage || 0}%`,
              detail: `Present: ${user.attendance?.present || 0}`,
              bgColor: "bg-purple-100",
            },
            { 
              label: "Classes", 
              value: "4",
              detail: "Today's schedule",
              bgColor: "bg-green-100",
            },
          ]);

          setInfoItems([
            { label: "Role", value: user.employeesRole || 'employees' },
            { label: "Department", value: user.department || 'General' },
            { label: "Join Date", value: user.joinDate ? new Date(user.joinDate).toLocaleDateString() : 'N/A' },
          ]);

        } else {
          // Student dashboard data
          const totalFees = user.totalFees || user.financials?.amount || user.fees?.totalFee || 0;
          const paidFees = user.paidFees || user.financials?.paid || user.fees?.paidFee || 0;
          const dueFees = user.feesDue || user.financials?.due || user.fees?.dueFee || (totalFees - paidFees);
          const attendancePercent = user.attendance?.percentage || 0;
          const presentDays = user.attendance?.present || 0;
          const absentDays = user.attendance?.absent || 0;

          setStats([
            { 
              label: "Total Fees", 
              value: `₹${totalFees.toLocaleString()}`,
              detail: `Course: ${user.course || 'N/A'}`,
              bgColor: "bg-blue-100",
            },
            { 
              label: "Paid Fees", 
              value: `₹${paidFees.toLocaleString()}`,
              detail: totalFees > 0 ? `${((paidFees/totalFees)*100).toFixed(1)}% paid` : '0%',
              bgColor: "bg-green-100",
            },
            { 
              label: "Due Fees", 
              value: `₹${dueFees.toLocaleString()}`,
              detail: dueFees > 0 ? "Pending" : "Fully paid",
              bgColor: dueFees > 0 ? "bg-red-100" : "bg-green-100",
            },
            { 
              label: "Attendance", 
              value: `${attendancePercent}%`,
              detail: `Present: ${presentDays} | Absent: ${absentDays}`,
              bgColor: "bg-purple-100",
            },
          ]);

          setInfoItems([
            { label: "Category", value: user.studentCategory || 'Academy' },
            { label: "Membership", value: user.membershipDuration?.replace('_', ' ') || '1 Month' },
            { label: "Expiry", value: user.expiryDate ? new Date(user.expiryDate).toLocaleDateString() : 'N/A' },
          ]);
        }

        setAttendanceData({
          percentage: user.attendance?.percentage || 0,
          present: user.attendance?.present || 0,
          absent: user.attendance?.absent || 0,
          todayMarked: false,
          todayStatus: null
        });
      }

      // Fetch attendance
      try {
        const attendanceResponse = await api.get(`/attendance/monthly/${userId}`);

        if (attendanceResponse.data.success) {
          const today = new Date().toISOString().split('T')[0];
          const attendanceList = attendanceResponse.data.data?.attendance || [];
          const todayAttendance = attendanceList.find(
            a => new Date(a.date).toISOString().split('T')[0] === today
          );

          setAttendanceData(prev => ({
            ...prev,
            todayMarked: !!todayAttendance,
            todayStatus: todayAttendance?.status || null
          }));
        }
      } catch (error) {
        console.log('Attendance API not available');
      }

      // Fetch activities
      try {
        const paymentsResponse = await api.get('/payments/my-payments');

        if (paymentsResponse.data.success) {
          const payments = paymentsResponse.data.payments || [];
          const recentActivities = payments.slice(0, 5).map(p => ({
            action: p.type === 'fee' ? 'Fee Payment' : (p.type || 'Payment'),
            detail: `₹${p.amount} - ${p.description || 'Payment'}`,
            time: new Date(p.date).toLocaleDateString('en-IN', { 
              day: 'numeric', month: 'short'
            })
          }));
          setActivities(recentActivities);
        }
      } catch (error) {
        console.log('Payments API not available');
        setActivities([
          { action: "Welcome", detail: "Dashboard loaded", time: "Just now" }
        ]);
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const markAttendance = async (status) => {
    try {
      const token = localStorage.getItem('token');
      const userId = userData?._id || localStorage.getItem('userId');

      const response = await api.post('/attendance/mark', 
        { userId, status, userType: dashboardType }
      );

      if (response.data.success) {
        toast.success(`Attendance marked as ${status}`);
        setAttendanceData(prev => ({
          ...prev,
          todayMarked: true,
          todayStatus: status
        }));
        fetchData(); // Refresh data
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to mark attendance');
      throw error;
    }
  };

  return {
    loading,
    userData,
    stats,
    attendanceData,
    activities,
    infoItems,
    markAttendance,
    refresh: fetchData,
    dashboardType
  };
};

export default useDashboardData;