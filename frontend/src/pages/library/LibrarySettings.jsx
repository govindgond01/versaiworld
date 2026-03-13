import React, { useState, useEffect } from 'react';
import { MdLocalLibrary } from 'react-icons/md';
import axios from 'axios';
import { toast } from 'react-hot-toast';

import UserLoading from '../../components/user/UserLoading';
import UserSettingsForm from '../../components/user/UserSettingsForm';

const LibrarySettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({ emailNotifications: true, smsNotifications: false, showProfile: true });

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => { fetchSettings(); }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const res = await axios.get('http://localhost:5000/api/users/settings', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

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
      const token = localStorage.getItem('token');
      
      await axios.put('http://localhost:5000/api/users/settings', newSettings, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

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

export default LibrarySettings;