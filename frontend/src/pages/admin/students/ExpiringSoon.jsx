import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FaEnvelope, FaPhone, FaCalendarAlt, FaSync, FaWhatsapp, 
  FaExclamationTriangle, FaUserClock, FaUserGraduate, FaIdCard,
  FaCheckCircle, FaSpinner, FaArrowRight
} from 'react-icons/fa';
import { 
  MdWarning, MdLocalLibrary, MdSchool, MdRefresh 
} from 'react-icons/md';
import { 
  BsPersonBadge, BsClock, BsCalendar, BsBell 
} from 'react-icons/bs';
import { 
  GiTeacher, GiPayMoney, GiExpense 
} from 'react-icons/gi';

const ExpiringSoon = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ critical: 0, warning: 0, upcoming: 0 });

  useEffect(() => { fetchExpiringStudents(); }, []);

  const fetchExpiringStudents = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await axios.get('${globalThis.API_URL}/admin/students/expiring-soon', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.data.success) {
        const data = res.data.students || [];
        setStudents(data);
        calculateStats(data);
      }
    } catch (error) {
      alert('Failed to load expiring students');
    } finally { setLoading(false); }
  };

  const calculateStats = (data) => {
    let c = 0, w = 0, u = 0;
    data.forEach(s => {
      if (!s.expiryDate) return;
      const days = Math.ceil((new Date(s.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
      if (days <= 7) c++;
      else if (days <= 15) w++;
      else if (days <= 30) u++;
    });
    setStats({ critical: c, warning: w, upcoming: u });
  };

  const sendEmailReminder = (s) => {
    const days = getDaysLeft(s.expiryDate);
    window.open(`mailto:${s.email}?subject=Membership Renewal&body=Dear ${s.name}, your membership expires in ${days} days.`);
  };

  const handleRenew = async (id, name) => {
    if (!window.confirm(`Renew ${name} for 1 month?`)) return;
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`${globalThis.API_URL}/admin/students/${id}/renew`, 
        { duration: '1_month' },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      alert('Renewed!');
      fetchExpiringStudents();
    } catch (error) {
      alert('Renewal failed');
    }
  };

  const getDaysLeft = (expiry) => {
    if (!expiry) return 'N/A';
    return Math.ceil((new Date(expiry) - new Date()) / (1000 * 60 * 60 * 24));
  };

  const getUrgency = (days) => {
    if (typeof days !== 'number') return { color: 'gray', text: 'N/A', icon: <BsClock className="w-4 h-4" /> };
    if (days <= 0) return { color: 'red', text: 'EXPIRED', icon: <FaExclamationTriangle className="w-4 h-4" /> };
    if (days <= 7) return { color: 'red', text: `${days}d left`, icon: <MdWarning className="w-4 h-4" /> };
    if (days <= 15) return { color: 'yellow', text: `${days}d left`, icon: <FaUserClock className="w-4 h-4" /> };
    return { color: 'blue', text: `${days}d left`, icon: <BsBell className="w-4 h-4" /> };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center"><FaSpinner className="w-8 h-8 text-blue-600 animate-spin mx-auto" /><p className="mt-3">Loading...</p></div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl shadow-md">
            <FaExclamationTriangle className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Expiring Soon</h1>
            <p className="text-sm text-gray-600 flex items-center gap-1.5">
              <BsCalendar className="w-4 h-4" /> {students.length} memberships expiring in 30 days
            </p>
          </div>
        </div>
        <button onClick={fetchExpiringStudents} className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 w-full sm:w-auto">
          <FaSync className={loading ? 'animate-spin w-4 h-4' : 'w-4 h-4'} /> Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Critical (≤7d)', value: stats.critical, color: 'red', icon: <FaExclamationTriangle className="w-6 h-6" /> },
          { label: 'Warning (8-15d)', value: stats.warning, color: 'yellow', icon: <FaUserClock className="w-6 h-6" /> },
          { label: 'Upcoming (16-30d)', value: stats.upcoming, color: 'blue', icon: <BsBell className="w-6 h-6" /> }
        ].map((s, i) => (
          <div key={i} className={`bg-${s.color}-50 border border-${s.color}-200 rounded-xl p-5 flex items-center justify-between`}>
            <div>
              <p className="text-sm text-gray-600">{s.label}</p>
              <p className="text-3xl font-bold mt-1">{s.value}</p>
            </div>
            <div className={`p-3 rounded-xl bg-${s.color}-100 text-${s.color}-600`}>{s.icon}</div>
          </div>
        ))}
      </div>

      {/* Students List */}
      {!students.length ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <FaCheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <p className="text-lg font-medium text-gray-900">All Good!</p>
          <p className="text-sm text-gray-500 mt-1">No memberships expiring in next 30 days</p>
        </div>
      ) : (
        <div className="space-y-4">
          {students.map(s => {
            const days = getDaysLeft(s.expiryDate);
            const urgency = getUrgency(days);
            const isAcademy = s.studentCategory === 'academy';
            
            return (
              <div key={s._id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition">
                {/* Mobile: Stacked, Desktop: Grid */}
                <div className="p-5">
                  {/* Header Row */}
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                    <div className="flex items-start gap-3">
                      <div className={`p-2.5 rounded-xl ${isAcademy ? 'bg-blue-100' : 'bg-purple-100'}`}>
                        {isAcademy ? <GiTeacher className={`w-5 h-5 ${isAcademy ? 'text-blue-600' : 'text-purple-600'}`} /> : <MdLocalLibrary className="w-5 h-5 text-purple-600" />}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{s.name}</h3>
                        <p className="text-xs text-gray-500 flex items-center gap-2 mt-1">
                          <FaIdCard className="w-3 h-3" /> {s.studentId || s.userId}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full bg-${urgency.color}-100 text-${urgency.color}-700`}>
                        {urgency.icon} {urgency.text}
                      </span>
                      <button onClick={() => handleRenew(s._id, s.name)} className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700">
                        Renew
                      </button>
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <FaEnvelope className="w-4 h-4 text-gray-400" />
                      <span className="truncate">{s.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <FaPhone className="w-4 h-4 text-gray-400" />
                      <span>{s.phone || 'No phone'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <FaCalendarAlt className="w-4 h-4 text-gray-400" />
                      <span>Exp: {s.expiryDate ? new Date(s.expiryDate).toLocaleDateString() : 'N/A'}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-3 pt-3 border-t">
                    <button onClick={() => sendEmailReminder(s)} className="flex items-center gap-1.5 px-4 py-2 border border-blue-600 text-blue-600 text-sm font-medium rounded-lg hover:bg-blue-50">
                      <FaEnvelope className="w-4 h-4" /> Email
                    </button>
                    {s.phone && (
                      <button onClick={() => window.open(`https://wa.me/91${s.phone}?text=Your membership expires soon`)} className="flex items-center gap-1.5 px-4 py-2 border border-green-600 text-green-600 text-sm font-medium rounded-lg hover:bg-green-50">
                        <FaWhatsapp className="w-4 h-4" /> WhatsApp
                      </button>
                    )}
                    <button onClick={() => window.location.href = `/admin-dashboard/students/${s._id}`} className="flex items-center gap-1.5 px-4 py-2 border border-gray-600 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50 ml-auto">
                      Details <FaArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ExpiringSoon;