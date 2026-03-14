import React, { useState, useEffect } from 'react';
import { BsPersonWorkspace } from 'react-icons/bs';
import api from '../../services/api';
import { toast } from 'react-hot-toast';

import UserLoading from '../../components/user/UserLoading';
import UserSettingsForm from '../../components/user/UserSettingsForm';

const StaffSettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({ emailNotifications: true, smsNotifications: false, showProfile: true });

  useEffect(() => { fetchSettings(); }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await api.get('users/settings');

      if (res.data.success) {
        setSettings(res.data.settings);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (newSettings) => {
    try {
      setSaving(true);
      await api.put('users/settings', newSettings);

      setSettings(newSettings);
      toast.success('Settings saved');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <UserLoading />;

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      <UserSettingsForm settings={settings} onSave={handleSave} loading={saving} />
    </div>
  );
};

export default StaffSettings;