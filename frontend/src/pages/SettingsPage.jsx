import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock, Bell, Palette, LogOut } from 'lucide-react';
import DashboardLayout from '../layouts/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { authApi, dashboardApi } from '../services/api';

function SettingsPage() {
  const { user, setUser, settings, setSettings, logout } = useAuth();
  const notify = useNotification();
  const navigate = useNavigate();

  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    institution: user?.institution || '',
    academicLevel: user?.academicLevel || 'Undergraduate',
    bio: user?.bio || '',
  });
  const [savingProfile, setSavingProfile] = useState(false);

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [savingPassword, setSavingPassword] = useState(false);

  const [prefForm, setPrefForm] = useState({
    notifications: settings?.notifications || {
      emailDigest: true,
      studyReminders: true,
      quizAlerts: true,
    },
    theme: settings?.theme || 'academic_cream',
    dailyGoal: settings?.dailyGoal || 5,
  });
  const [savingPrefs, setSavingPrefs] = useState(false);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await authApi.updateProfile(profileForm);
      setUser(res.user);
      notify.success('Profile updated.');
    } catch (err) {
      notify.error(err.message || 'Could not update profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      notify.error('New passwords do not match.');
      return;
    }
    setSavingPassword(true);
    try {
      await authApi.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      notify.success('Password changed successfully.');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      notify.error(err.message || 'Could not change password.');
    } finally {
      setSavingPassword(false);
    }
  };

  const handleSavePrefs = async (e) => {
    e.preventDefault();
    setSavingPrefs(true);
    try {
      const res = await dashboardApi.updateSettings(prefForm);
      setSettings(res.settings);
      notify.success('Preferences saved.');
    } catch (err) {
      notify.error(err.message || 'Could not save preferences.');
    } finally {
      setSavingPrefs(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    notify.info('Signed out.');
    navigate('/', { replace: true });
  };

  return (
    <DashboardLayout pageTitle="Settings & Profile">
      <div className="max-w-4xl space-y-6">
        {/* Profile Information */}
        <section className="bg-white border border-[#E5E1D8] rounded-lg p-6 shadow-xs">
          <div className="flex items-center gap-2.5 pb-3 border-b border-[#E5E1D8] mb-5">
            <User className="w-5 h-5 text-[#C49A45]" />
            <h2 className="font-serif font-bold text-lg text-[#172B4D]">Academic Profile</h2>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#6B7280] mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm border border-[#E5E1D8] rounded-md"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#6B7280] mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="w-full px-3.5 py-2 text-sm border border-[#E5E1D8] rounded-md bg-[#F1F3F5] text-[#6B7280]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#6B7280] mb-1.5">
                  Institution / University
                </label>
                <input
                  type="text"
                  value={profileForm.institution}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, institution: e.target.value })
                  }
                  placeholder="e.g., State University"
                  className="w-full px-3.5 py-2 text-sm border border-[#E5E1D8] rounded-md"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#6B7280] mb-1.5">
                  Academic Level
                </label>
                <select
                  value={profileForm.academicLevel}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, academicLevel: e.target.value })
                  }
                  className="w-full px-3.5 py-2 text-sm border border-[#E5E1D8] rounded-md bg-white"
                >
                  <option value="High School">High School</option>
                  <option value="Undergraduate">Undergraduate</option>
                  <option value="Graduate">Graduate</option>
                  <option value="Doctoral / Research">Doctoral / Research</option>
                  <option value="Self-Study">Self-Study</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#6B7280] mb-1.5">
                Study Focus / Bio
              </label>
              <textarea
                rows={3}
                value={profileForm.bio}
                onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                placeholder="Major, exam targets, or subjects you are focusing on..."
                className="w-full p-3 text-sm border border-[#E5E1D8] rounded-md"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={savingProfile}
                className="px-5 py-2 rounded-md bg-[#172B4D] hover:bg-[#10213A] disabled:opacity-60 text-white text-sm font-semibold transition"
              >
                {savingProfile ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </form>
        </section>

        {/* Preferences & Theme */}
        <section className="bg-white border border-[#E5E1D8] rounded-lg p-6 shadow-xs">
          <div className="flex items-center gap-2.5 pb-3 border-b border-[#E5E1D8] mb-5">
            <Palette className="w-5 h-5 text-[#C49A45]" />
            <h2 className="font-serif font-bold text-lg text-[#172B4D]">
              Theme & Notification Preferences
            </h2>
          </div>

          <form onSubmit={handleSavePrefs} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#6B7280] mb-1.5">
                  Workspace Theme
                </label>
                <select
                  value={prefForm.theme}
                  onChange={(e) => setPrefForm({ ...prefForm, theme: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm border border-[#E5E1D8] rounded-md bg-white"
                >
                  <option value="academic_cream">Warm Academic Cream (#F7F4EC)</option>
                  <option value="classic_white">Classic Crisp White (#F8F9FA)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#6B7280] mb-1.5">
                  Daily Study Goal (Sessions / Day)
                </label>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={prefForm.dailyGoal}
                  onChange={(e) =>
                    setPrefForm({ ...prefForm, dailyGoal: Number(e.target.value) || 5 })
                  }
                  className="w-full px-3.5 py-2 text-sm border border-[#E5E1D8] rounded-md"
                />
              </div>
            </div>

            <div className="space-y-2.5 pt-2">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#6B7280]">
                <Bell className="w-3.5 h-3.5" />
                <span>Notifications</span>
              </div>
              {[
                { key: 'emailDigest', label: 'Weekly academic progress digest' },
                { key: 'studyReminders', label: 'Daily study goal reminders' },
                { key: 'quizAlerts', label: 'Quiz performance summaries' },
              ].map((item) => (
                <label key={item.key} className="flex items-center gap-2.5 text-sm text-[#172B4D]">
                  <input
                    type="checkbox"
                    checked={Boolean(prefForm.notifications[item.key])}
                    onChange={(e) =>
                      setPrefForm({
                        ...prefForm,
                        notifications: {
                          ...prefForm.notifications,
                          [item.key]: e.target.checked,
                        },
                      })
                    }
                    className="rounded border-[#E5E1D8]"
                  />
                  <span>{item.label}</span>
                </label>
              ))}
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={savingPrefs}
                className="px-5 py-2 rounded-md bg-[#172B4D] hover:bg-[#10213A] disabled:opacity-60 text-white text-sm font-semibold transition"
              >
                {savingPrefs ? 'Saving...' : 'Save Preferences'}
              </button>
            </div>
          </form>
        </section>

        {/* Password Management */}
        <section className="bg-white border border-[#E5E1D8] rounded-lg p-6 shadow-xs">
          <div className="flex items-center gap-2.5 pb-3 border-b border-[#E5E1D8] mb-5">
            <Lock className="w-5 h-5 text-[#C49A45]" />
            <h2 className="font-serif font-bold text-lg text-[#172B4D]">Change Password</h2>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#6B7280] mb-1.5">
                  Current Password
                </label>
                <input
                  type="password"
                  required
                  value={passwordForm.currentPassword}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
                  }
                  className="w-full px-3.5 py-2 text-sm border border-[#E5E1D8] rounded-md"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#6B7280] mb-1.5">
                  New Password
                </label>
                <input
                  type="password"
                  required
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                  }
                  className="w-full px-3.5 py-2 text-sm border border-[#E5E1D8] rounded-md"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#6B7280] mb-1.5">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  required
                  value={passwordForm.confirmPassword}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                  }
                  className="w-full px-3.5 py-2 text-sm border border-[#E5E1D8] rounded-md"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={savingPassword}
                className="px-5 py-2 rounded-md border border-[#172B4D] text-[#172B4D] hover:bg-[#172B4D] hover:text-white text-sm font-semibold transition"
              >
                {savingPassword ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </form>
        </section>

        {/* Session / Logout */}
        <section className="bg-white border border-[#E5E1D8] rounded-lg p-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="font-serif font-bold text-base text-[#172B4D]">Account Session</h3>
            <p className="text-xs text-[#6B7280] mt-0.5">
              Sign out of your current StudyBuddy AI session on this device.
            </p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-[#B94A48] hover:bg-[#9c3b39] text-white text-sm font-semibold transition"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </section>
      </div>
    </DashboardLayout>
  );
}

export default SettingsPage;
