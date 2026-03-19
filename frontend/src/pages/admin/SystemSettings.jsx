import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import {
  FiSettings, FiSave, FiShield, FiMail,
  FiBell, FiLock, FiUsers, FiGlobe, FiMoon, FiSun,
  FiDollarSign, FiCalendar, FiClock, FiRefreshCw,
  FiPalette, FiServer, FiMenu
} from 'react-icons/fi';
import {
  MdOutlineSecurity, MdOutlineNotifications, MdOutlineLanguage,
  MdOutlineBackup, MdOutlinePayment
} from 'react-icons/md';
import {
  BsToggleOn, BsToggleOff, BsChevronDown, BsShieldCheck,
  BsCreditCard, BsEnvelope, BsClockHistory
} from 'react-icons/bs';
import Loader from '../../components/common/Loader';
import api from '../../services/api';

const SystemSettings = () => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({
    general: {},
    appearance: {},
    notifications: {},
    security: {}
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await api.get('/settings');
      if (res.data.success) {
        const backendSettings = res.data.settings || {};
        setSettings({
          general: {
            siteName: 'Library Management',
            siteUrl: 'http://localhost:5173',
            adminEmail: 'admin@library.com',
            timezone: backendSettings.preferences?.timezone || 'Asia/Kolkata',
            dateFormat: backendSettings.preferences?.dateFormat || 'DD/MM/YYYY',
            language: backendSettings.preferences?.language || 'en'
          },
          appearance: {
            theme: 'light',
            primaryColor: '#4F46E5',
            sidebarCollapsed: false
          },
          notifications: {
            emailNotifications: backendSettings.notifications?.email ?? true,
            smsNotifications: backendSettings.notifications?.sms ?? false,
            paymentAlerts: true,
            expiryAlerts: true,
            attendanceAlerts: false
          },
          security: {
            twoFactorAuth: false,
            sessionTimeout: 30,
            passwordExpiry: 90,
            maxLoginAttempts: 5,
            ipWhitelist: false
          }
        });
      }
    } catch (error) {
      toast.error('Failed to load settings');
      console.error('Settings fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/settings', settings);
      toast.success('Settings saved successfully');
    } catch (error) {
      toast.error('Failed to save settings');
      console.error('Settings save error:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (section, field, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: { ...prev[section], [field]: value }
    }));
  };

  const tabs = [
    { id: 'general', label: 'General', icon: <FiSettings className="w-4 h-4" /> },
    { id: 'security', label: 'Security', icon: <FiShield className="w-4 h-4" /> },
    { id: 'notifications', label: 'Notifications', icon: <FiBell className="w-4 h-4" /> },
    { id: 'appearance', label: 'Appearance', icon: <FiMoon className="w-4 h-4" /> }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader type="spinner" size="medium" />
          <p className="mt-3 text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-xl shadow-md">
            <FiSettings className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
            <p className="text-sm text-gray-600 flex items-center gap-1.5">
              <FiServer className="w-4 h-4" /> Configure system preferences
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={fetchSettings} className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50">
            <FiRefreshCw className="w-4 h-4" /> Refresh
          </button>
          <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50">
            {saving ? <Loader type="inline" size="small" /> : <FiSave className="w-4 h-4" />}
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="border-b overflow-x-auto">
          <div className="flex">
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-4 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
                  activeTab === tab.id ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}>
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {/* General Settings */}
          {activeTab === 'general' && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {[
                  { label: 'Site Name', field: 'siteName', type: 'text', icon: <FiSettings /> },
                  { label: 'Site URL', field: 'siteUrl', type: 'url', icon: <FiGlobe /> },
                  { label: 'Admin Email', field: 'adminEmail', type: 'email', icon: <FiMail /> },
                  { label: 'Timezone', field: 'timezone', type: 'select', options: ['Asia/Kolkata', 'UTC', 'America/New_York'], icon: <FiClock /> },
                  { label: 'Date Format', field: 'dateFormat', type: 'select', options: ['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'], icon: <FiCalendar /> },
                  { label: 'Language', field: 'language', type: 'select', options: ['en', 'hi', 'fr'], icon: <FiGlobe /> }
                ].map((item, i) => (
                  <div key={i} className="space-y-1.5">
                    <label className="flex items-center gap-1.5 text-xs font-medium text-gray-600">
                      <span className="text-indigo-600">{item.icon}</span> {item.label}
                    </label>
                    {item.type === 'select' ? (
                      <div className="relative">
                        <select value={settings.general[item.field] || ''} onChange={(e) => handleChange('general', item.field, e.target.value)}
                          className="w-full px-4 py-2.5 pl-10 bg-white border border-gray-200 rounded-lg appearance-none text-sm">
                          {item.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                        <BsChevronDown className="absolute right-3 top-3 text-gray-400 w-4 h-4" />
                      </div>
                    ) : (
                      <input type={item.type} value={settings.general[item.field] || ''} onChange={(e) => handleChange('general', item.field, e.target.value)}
                        className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Security Settings */}
          {activeTab === 'security' && (
            <div className="space-y-5">
              {[
                { label: 'Two Factor Authentication', field: 'twoFactorAuth', icon: <FiShield /> },
                { label: 'IP Whitelist', field: 'ipWhitelist', icon: <FiLock /> }
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">{item.icon}</div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{item.label}</p>
                      <p className="text-xs text-gray-500">Enable/disable {item.label.toLowerCase()}</p>
                    </div>
                  </div>
                  <button onClick={() => handleChange('security', item.field, !settings.security[item.field])}
                    className={`text-2xl ${settings.security[item.field] ? 'text-indigo-600' : 'text-gray-300'}`}>
                    {settings.security[item.field] ? <BsToggleOn /> : <BsToggleOff />}
                  </button>
                </div>
              ))}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-5">
                {[
                  { label: 'Session Timeout', field: 'sessionTimeout', unit: 'minutes', icon: <FiClock /> },
                  { label: 'Password Expiry', field: 'passwordExpiry', unit: 'days', icon: <FiLock /> },
                  { label: 'Max Login Attempts', field: 'maxLoginAttempts', unit: 'attempts', icon: <FiUsers /> }
                ].map((item, i) => (
                  <div key={i} className="space-y-1.5">
                    <label className="flex items-center gap-1.5 text-xs font-medium text-gray-600">
                      <span className="text-indigo-600">{item.icon}</span> {item.label}
                    </label>
                    <input type="number" value={settings.security[item.field] || 0} onChange={(e) => handleChange('security', item.field, parseInt(e.target.value))}
                      className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm" />
                    <p className="text-xs text-gray-500">{item.unit}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notifications Settings */}
          {activeTab === 'notifications' && (
            <div className="space-y-4">
              {[
                { label: 'Email Notifications', field: 'emailNotifications', icon: <FiMail /> },
                { label: 'SMS Notifications', field: 'smsNotifications', icon: <FiBell /> },
                { label: 'Payment Alerts', field: 'paymentAlerts', icon: <FiDollarSign /> },
                { label: 'Expiry Alerts', field: 'expiryAlerts', icon: <FiCalendar /> },
                { label: 'Attendance Alerts', field: 'attendanceAlerts', icon: <FiUsers /> }
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${settings.notifications[item.field] ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-500'}`}>
                      {item.icon}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{item.label}</p>
                      <p className="text-xs text-gray-500">Toggle {item.label.toLowerCase()}</p>
                    </div>
                  </div>
                  <button onClick={() => handleChange('notifications', item.field, !settings.notifications[item.field])}
                    className={`text-2xl ${settings.notifications[item.field] ? 'text-green-600' : 'text-gray-300'}`}>
                    {settings.notifications[item.field] ? <BsToggleOn /> : <BsToggleOff />}
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Appearance Settings */}
          {activeTab === 'appearance' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${settings.appearance.theme === 'dark' ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-200 text-gray-500'}`}>
                    {settings.appearance.theme === 'dark' ? <FiMoon /> : <FiSun />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Dark Mode</p>
                    <p className="text-xs text-gray-500">Toggle dark theme</p>
                  </div>
                </div>
                <button onClick={() => handleChange('appearance', 'theme', settings.appearance.theme === 'dark' ? 'light' : 'dark')}
                  className={`text-2xl ${settings.appearance.theme === 'dark' ? 'text-indigo-600' : 'text-gray-300'}`}>
                  {settings.appearance.theme === 'dark' ? <BsToggleOn /> : <BsToggleOff />}
                </button>
              </div>

              <div className="space-y-5">
                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 text-xs font-medium text-gray-600">
                    <FiPalette className="text-indigo-600" /> Primary Color
                  </label>
                  <div className="flex gap-3">
                    {['#4F46E5', '#DC2626', '#059669', '#D97706', '#7C3AED'].map(color => (
                      <button
                        key={color}
                        onClick={() => handleChange('appearance', 'primaryColor', color)}
                        className={`w-10 h-10 rounded-full border-2 ${settings.appearance.primaryColor === color ? 'border-gray-900' : 'border-gray-200'}`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${settings.appearance.sidebarCollapsed ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-500'}`}>
                      <FiMenu />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Collapsed Sidebar</p>
                      <p className="text-xs text-gray-500">Hide sidebar labels</p>
                    </div>
                  </div>
                  <button onClick={() => handleChange('appearance', 'sidebarCollapsed', !settings.appearance.sidebarCollapsed)}
                    className={`text-2xl ${settings.appearance.sidebarCollapsed ? 'text-green-600' : 'text-gray-300'}`}>
                    {settings.appearance.sidebarCollapsed ? <BsToggleOn /> : <BsToggleOff />}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SystemSettings;