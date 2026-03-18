import React, { useState, useEffect } from 'react';
import { MdLocalLibrary } from 'react-icons/md';
import api from '../../services/api';
import { toast } from 'react-hot-toast';

import Loader from '../../components/common/Loader';
import UserSettingsForm from '../../components/user/UserSettingsForm';

const LibrarySettings = () => {
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
      toast.error('Failed to load settings');
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

  if (loading) return <Loader type="spinner" size="large" />;

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
      </div>
      <UserSettingsForm settings={settings} onSave={handleSave} loading={saving} />
    </div>
  );
};

export default LibrarySettings;