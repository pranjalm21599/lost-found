import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';
import { formatDate } from '../utils/formatters';
import {
  User,
  Mail,
  BadgeCheck,
  Phone,
  Calendar,
  Lock,
  Camera,
  Save,
  KeyRound
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const toast = useToast();

  const [fullName, setFullName] = useState(user?.full_name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [profilePhoto, setProfilePhoto] = useState(user?.profile_photo || '');
  const [savingProfile, setSavingProfile] = useState(false);

  // Change Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const updated = await api.updateProfile({
        full_name: fullName.trim(),
        phone: phone.trim(),
        profile_photo: profilePhoto.trim() || undefined,
      });
      updateUser(updated);
      toast.success('Profile details updated successfully');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match.');
      return;
    }

    setChangingPassword(true);
    try {
      await api.changePassword({
        current_password: currentPassword,
        new_password: newPassword,
      });
      toast.success('Password updated successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      toast.error(err.message || 'Failed to change password');
    } finally {
      setChangingPassword(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Student Profile
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Manage your verified campus credentials and security settings.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Profile Card */}
        <div className="md:col-span-1 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col items-center text-center">
          <div className="w-24 h-24 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-2xl mb-4 border-2 border-indigo-200 dark:border-indigo-800 overflow-hidden shadow-inner">
            {profilePhoto ? (
              <img
                src={profilePhoto}
                alt={user.full_name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            ) : (
              user.full_name.slice(0, 2).toUpperCase()
            )}
          </div>

          <h2 className="font-bold text-lg text-slate-900 dark:text-white">
            {user.full_name}
          </h2>
          <span className="font-mono text-xs text-indigo-600 dark:text-indigo-400 font-semibold mt-0.5">
            {user.student_id}
          </span>
          <span className="text-xs text-slate-400 mt-1">{user.email}</span>

          <div className="w-full mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 space-y-3 text-xs text-left">
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span>Joined {formatDate(user.created_at)}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
              <BadgeCheck className="w-4 h-4 text-emerald-500" />
              <span>Campus Verified Student</span>
            </div>
          </div>
        </div>

        {/* Right Column: Edit Profile & Change Password */}
        <div className="md:col-span-2 space-y-6">
          {/* Edit Profile Form */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <User className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              Edit Account Information
            </h3>

            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  id="profile-fullname"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    University Email (Permanent)
                  </label>
                  <input
                    type="email"
                    disabled
                    value={user.email}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-850 text-slate-500 text-sm cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Student ID (Permanent)
                  </label>
                  <input
                    type="text"
                    disabled
                    value={user.student_id}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-850 text-slate-500 text-sm font-mono cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Contact Phone Number
                </label>
                <input
                  type="tel"
                  id="profile-phone"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Profile Photo URL (Optional)
                </label>
                <input
                  type="url"
                  id="profile-photo-url"
                  placeholder="https://..."
                  value={profilePhoto}
                  onChange={(e) => setProfilePhoto(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  id="save-profile-btn"
                  disabled={savingProfile}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-colors disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {savingProfile ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </form>
          </div>

          {/* Change Password Form */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              Change Password
            </h3>

            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Current Password
                </label>
                <input
                  type="password"
                  id="current-password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    New Password
                  </label>
                  <input
                    type="password"
                    id="new-password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    id="confirm-new-password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  id="change-password-btn"
                  disabled={changingPassword}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 shadow-xs transition-colors disabled:opacity-50"
                >
                  <Lock className="w-4 h-4" />
                  {changingPassword ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
