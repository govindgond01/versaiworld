import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import {
  FiSettings, FiSave, FiRefreshCw, FiShield, FiMail,
  FiBell, FiLock, FiUsers, FiGlobe, FiMoon, FiSun,
  FiDollarSign, FiCalendar, FiClock, FiServer
} from 'react-icons/fi';
import {
  MdOutlineSecurity, MdOutlineNotifications, MdOutlineLanguage,
  MdOutlineBackup, MdOutlinePayment
} from 'react-icons/md';
import {
  BsToggleOn, BsToggleOff, BsChevronDown, BsShieldCheck,
  BsCreditCard, BsEnvelope, BsClockHistory
} from 'react-icons/bs';
import api from '../../services/api';

const SystemSettings = () => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({
    general: {
      siteName: 'Library Management',
      siteUrl: 'http://localhost:5173',
      adminEmail: 'admin@library.com',
      timezone: 'Asia/Kolkata',
      dateFormat: 'DD/MM/YYYY',
      language: 'en'
    },
    security: {
      twoFactorAuth: true,
      sessionTimeout: 30,
      passwordExpiry: 90,
      maxLoginAttempts: 5,
      ipWhitelist: false
    },
    notifications: {
      emailNotifications: true,
      smsNotifications: false,
      paymentAlerts: true,
      expiryAlerts: true,
      attendanceAlerts: false
    },
    financial: {
      currency: 'INR',
      taxRate: 18,
      lateFeeEnabled: true,
      lateFeeAmount: 100,
      discountEnabled: true
    },
    backup: {
      autoBackup: true,
      backupFrequency: 'daily',
      retentionDays: 30,
      lastBackup: '2026-02-14'
    }
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await api.get('/settings');
      if (res.data.success) setSettings(res.data.data);
    } catch (error) {
      toast.error('Failed to load settings');
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
    { id: 'financial', label: 'Financial', icon: <FiDollarSign className="w-4 h-4" /> },
    { id: 'backup', label: 'Backup', icon: <MdOutlineBackup className="w-4 h-4" /> }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-3 text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
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
            {saving ? <FiRefreshCw className="w-4 h-4 animate-spin" /> : <FiSave className="w-4 h-4" />}
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
                        <select value={settings.general[item.field]} onChange={(e) => handleChange('general', item.field, e.target.value)}
                          className="w-full px-4 py-2.5 pl-10 bg-white border border-gray-200 rounded-lg appearance-none text-sm">
                          {item.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                        <BsChevronDown className="absolute right-3 top-3 text-gray-400 w-4 h-4" />
                      </div>
                    ) : (
                      <input type={item.type} value={settings.general[item.field]} onChange={(e) => handleChange('general', item.field, e.target.value)}
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
                    <input type="number" value={settings.security[item.field]} onChange={(e) => handleChange('security', item.field, parseInt(e.target.value))}
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

          {/* Financial Settings */}
          {activeTab === 'financial' && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {[
                  { label: 'Currency', field: 'currency', type: 'select', options: ['INR', 'USD', 'EUR'], icon: <FiDollarSign /> },
                  { label: 'Tax Rate (%)', field: 'taxRate', type: 'number', icon: <FiDollarSign /> }
                ].map((item, i) => (
                  <div key={i} className="space-y-1.5">
                    <label className="flex items-center gap-1.5 text-xs font-medium text-gray-600">{item.icon} {item.label}</label>
                    {item.type === 'select' ? (
                      <div className="relative">
                        <select value={settings.financial[item.field]} onChange={(e) => handleChange('financial', item.field, e.target.value)}
                          className="w-full px-4 py-2.5 pl-10 bg-white border border-gray-200 rounded-lg appearance-none text-sm">
                          {item.options.map(opt => <option key={opt}>{opt}</option>)}
                        </select>
                        <BsChevronDown className="absolute right-3 top-3 text-gray-400 w-4 h-4" />
                      </div>
                    ) : (
                      <input type="number" value={settings.financial[item.field]} onChange={(e) => handleChange('financial', item.field, e.target.value)}
                        className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm" />
                    )}
                  </div>
                ))}
              </div>

              {[
                { label: 'Late Fee Enabled', field: 'lateFeeEnabled', icon: <FiClock /> },
                { label: 'Discount Enabled', field: 'discountEnabled', icon: <FiDollarSign /> }
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${settings.financial[item.field] ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-500'}`}>
                      {item.icon}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{item.label}</p>
                    </div>
                  </div>
                  <button onClick={() => handleChange('financial', item.field, !settings.financial[item.field])}
                    className={`text-2xl ${settings.financial[item.field] ? 'text-green-600' : 'text-gray-300'}`}>
                    {settings.financial[item.field] ? <BsToggleOn /> : <BsToggleOff />}
                  </button>
                </div>
              ))}

              {settings.financial.lateFeeEnabled && (
                <div className="mt-4">
                  <label className="text-sm font-medium text-gray-700">Late Fee Amount (₹)</label>
                  <input type="number" value={settings.financial.lateFeeAmount} onChange={(e) => handleChange('financial', 'lateFeeAmount', e.target.value)}
                    className="w-full mt-2 px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm" />
                </div>
              )}
            </div>
          )}

          {/* Backup Settings */}
          {activeTab === 'backup' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${settings.backup.autoBackup ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-500'}`}>
                    <MdOutlineBackup className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Auto Backup</p>
                    <p className="text-xs text-gray-500">Automatic system backups</p>
                  </div>
                </div>
                <button onClick={() => handleChange('backup', 'autoBackup', !settings.backup.autoBackup)}
                  className={`text-2xl ${settings.backup.autoBackup ? 'text-green-600' : 'text-gray-300'}`}>
                  {settings.backup.autoBackup ? <BsToggleOn /> : <BsToggleOff />}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {[
                  { label: 'Backup Frequency', field: 'backupFrequency', type: 'select', options: ['daily', 'weekly', 'monthly'], icon: <FiClock /> },
                  { label: 'Retention Days', field: 'retentionDays', type: 'number', icon: <FiCalendar /> }
                ].map((item, i) => (
                  <div key={i} className="space-y-1.5">
                    <label className="flex items-center gap-1.5 text-xs font-medium text-gray-600">{item.icon} {item.label}</label>
                    {item.type === 'select' ? (
                      <div className="relative">
                        <select value={settings.backup[item.field]} onChange={(e) => handleChange('backup', item.field, e.target.value)}
                          className="w-full px-4 py-2.5 pl-10 bg-white border border-gray-200 rounded-lg appearance-none text-sm">
                          {item.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                        <BsChevronDown className="absolute right-3 top-3 text-gray-400 w-4 h-4" />
                      </div>
                    ) : (
                      <input type="number" value={settings.backup[item.field]} onChange={(e) => handleChange('backup', item.field, parseInt(e.target.value))}
                        className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm" />
                    )}
                  </div>
                ))}
              </div>

              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                      <BsClockHistory className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Last Backup</p>
                      <p className="text-xs text-gray-600">{settings.backup.lastBackup}</p>
                    </div>
                  </div>
                  <button className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700">
                    Backup Now
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