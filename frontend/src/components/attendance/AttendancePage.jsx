import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaSpinner } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-hot-toast';

import AttendanceStats from './AttendanceStats';
import AttendanceMarker from './AttendanceMarker';
import MonthSelector from './MonthSelector';
import AttendanceCalendar from './AttendanceCalendar';
import AttendanceHistory from './AttendanceHistory';

const AttendancePage = ({
    userType = 'student',
    icon: Icon,
    title = "Attendance",
    subtitle = "Track and manage your attendance"
}) => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [attendance, setAttendance] = useState([]);
    const [todayStatus, setTodayStatus] = useState(null);
    const [marking, setMarking] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [stats, setStats] = useState({
        present: 0,
        absent: 0,
        halfDay: 0,
        percentage: 0
    });

    useEffect(() => {
        fetchTodayStatus();
        fetchAttendance();
    }, []);

    useEffect(() => {
        calculateStats();
    }, [attendance]);

    // Fetch today's status
    const fetchTodayStatus = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const res = await axios.get(
                '${globalThis.API_URL}/attendance/my-today',
                { headers: { 'Authorization': `Bearer ${token}` } }
            );

            if (res.data.success && res.data.data) {
                setTodayStatus(res.data.data.status);
            }
        } catch (error) {
            console.error('Error fetching today status:', error);
        }
    };

    // ✅ FIXED: Mark attendance with proper error handling
    const markAttendance = async (status) => {
        try {
            setMarking(true);
            const token = localStorage.getItem('token');

            const res = await axios.post(
                '${globalThis.API_URL}/attendance/mark',
                { status },
                { headers: { 'Authorization': `Bearer ${token}` } }
            );

            if (res.data.success) {
                setTodayStatus(status);
                toast.success(`✓ Marked as ${status}`);
                fetchAttendance(); // Refresh history
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to mark attendance');
        } finally {
            setMarking(false);
        }
    };

    const fetchAttendance = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const year = new Date().getFullYear();

            const res = await axios.get(
                `${globalThis.API_URL}/attendance/my-all?year=${year}`,
                { headers: { 'Authorization': `Bearer ${token}` } }
            );

            if (res.data.success) {
                const data = res.data.data;

                // Har month ka percentage sahi se calculate karo
                const processedData = data.map(month => {
                    const totalDaysInMonth = new Date(month.year, month.month + 1, 0).getDate();
                    const present = month.stats.present || 0;
                    const halfDay = month.stats.halfDay || 0;

                    // ✅ FIX: Total days = month ke total days
                    const weightedPresent = present + (halfDay * 0.5);
                    const percentage = Math.round((weightedPresent / totalDaysInMonth) * 100);

                    return {
                        ...month,
                        stats: {
                            ...month.stats,
                            percentage: percentage
                        }
                    };
                });

                setAttendance(processedData);
            }
        } catch (error) {
            toast.error('Failed to load attendance');
        } finally {
            setLoading(false);
        }
    };

    // ✅ FIXED: Percentage calculation
    // ✅ FIXED: Overall percentage calculation
const calculateStats = () => {
  let present = 0, absent = 0, halfDay = 0;
  let totalDaysInYear = 0;
  
  attendance.forEach(month => {
    present += month.stats?.present || 0;
    absent += month.stats?.absent || 0;
    halfDay += month.stats?.halfDay || 0;
    
    // Har month ke total days add karo
    const daysInMonth = new Date(month.year, month.month + 1, 0).getDate();
    totalDaysInYear += daysInMonth;
  });
  
  const weightedPresent = present + (halfDay * 0.5);
  const percentage = totalDaysInYear > 0 
    ? Math.round((weightedPresent / totalDaysInYear) * 100) 
    : 0;

  setStats({ present, absent, halfDay, percentage });
};

    // Get current month data
    const getMonthData = () => {
        return attendance.find(
            m => m.month === selectedDate.getMonth() && m.year === selectedDate.getFullYear()
        );
    };

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
                <div className="text-center">
                    <FaSpinner className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
                    <p className="text-gray-600 text-lg">Loading your attendance...</p>
                </div>
            </div>
        );
    }

    const monthData = getMonthData();

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            {Icon && (
                                <div className="p-3 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl shadow-lg">
                                    <Icon className="w-6 h-6 text-white" />
                                </div>
                            )}
                            <div>
                                <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
                                <p className="text-sm text-gray-500">{subtitle}</p>
                            </div>
                        </div>
                        <button
                            onClick={() => navigate(-1)}
                            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition flex items-center gap-2"
                        >
                            <FaArrowLeft className="w-4 h-4" />
                            Back
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
                {/* Overall Stats */}
                <AttendanceStats stats={stats} title="Overall Statistics" />

                {/* Mark Attendance - Only for non-admin users */}
                {userType !== 'admin' && (
                    <AttendanceMarker
                        todayStatus={todayStatus}
                        onMark={markAttendance}
                        loading={marking}
                    />
                )}

                {/* Month Selector */}
                <MonthSelector
                    currentDate={selectedDate}
                    onPrev={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1))}
                    onNext={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1))}
                    onDateChange={setSelectedDate}
                />

                {/* Current Month Calendar - FIXED: Chhota box */}
                <AttendanceCalendar
                    attendance={monthData?.attendance || []}
                    currentDate={selectedDate}
                    monthStats={monthData?.stats}
                />

                {/* Complete History */}
                <AttendanceHistory
                    history={attendance}
                    onMonthClick={(date) => setSelectedDate(date)}
                />
            </div>
        </div>
    );
};

export default AttendancePage;