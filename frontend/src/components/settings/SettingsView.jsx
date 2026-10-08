import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Settings,
  User,
  Mail,
  Lock,
  Upload,
  Database,
  AlertTriangle,
  AtSign,
  ShieldCheck,
  CheckCircle2,
  Save
} from 'lucide-react';

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80'
];

const MAX_AVATAR_SIZE_BYTES = 2 * 1024 * 1024; // 2 MB

export const SettingsView = () => {
  const { currentUser, updateUserProfile } = useApp();

  // Read-only Account Properties
  const name = currentUser?.name || '';
  const username = currentUser?.username || (currentUser?.email ? currentUser.email.split('@')[0] : (currentUser?.name ? currentUser.name.toLowerCase().replace(/\s+/g, '.') : 'user'));
  const email = currentUser?.email || '';

  // Password Edit Local State
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Avatar Selection State
  const [avatar, setAvatar] = useState(currentUser?.avatar || PRESET_AVATARS[0]);
  const [avatarError, setAvatarError] = useState('');
  const [isImageSelected, setIsImageSelected] = useState(false);
  
  // Status Notifications
  const [profileMsg, setProfileMsg] = useState('');

  const handleAvatarFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_AVATAR_SIZE_BYTES) {
      setAvatarError(`Selected photo is too large (${(file.size / (1024 * 1024)).toFixed(2)} MB). Max limit allowed: 2.00 MB.`);
      return;
    }

    setAvatarError('');
    setIsImageSelected(true);
    const reader = new FileReader();
    reader.onload = () => {
      setAvatar(reader.result); // Base64 data URL string
    };
    reader.readAsDataURL(file);
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    if (avatarError) return;

    if (newPassword || confirmPassword) {
      if (newPassword !== confirmPassword) {
        setPasswordError('New password and confirm password do not match.');
        return;
      }
      if (newPassword.length < 4) {
        setPasswordError('Password must be at least 4 characters long.');
        return;
      }
    }
    setPasswordError('');

    const payload = {};
    if (newPassword) payload.password = newPassword;
    if (isImageSelected) payload.avatar = avatar;

    if (Object.keys(payload).length === 0) return;

    const res = await updateUserProfile(payload);
    if (res?.success) {
      setProfileMsg('Settings saved successfully!');
      setNewPassword('');
      setConfirmPassword('');
      setIsImageSelected(false);
      setTimeout(() => setProfileMsg(''), 3000);
    } else {
      setPasswordError(res?.message || 'Failed to update settings.');
    }
  };

  const hasPasswordInput = Boolean(newPassword || confirmPassword);
  const isPasswordValid = hasPasswordInput ? (newPassword && newPassword === confirmPassword && newPassword.length >= 4) : true;
  const hasValidChanges = (isImageSelected || (hasPasswordInput && isPasswordValid));
  const isSaveDisabled = Boolean(avatarError) || !hasValidChanges;

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto text-xs">
      {/* Top Banner */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900 leading-tight">Settings</h1>
            <p className="text-xs text-slate-500">View account details, change profile picture, and update access password</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Account Details & Settings Form */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-6">
          <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <User className="w-4 h-4 text-blue-600" />
              <span>Personal Account & Credentials</span>
            </h2>
            {profileMsg && (
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200 flex items-center space-x-1 animate-in fade-in">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>{profileMsg}</span>
              </span>
            )}
          </div>

          <form onSubmit={handleProfileSave} className="space-y-6">
            {/* Profile Avatar Selection & Upload */}
            <div>
              <label className="block font-bold text-slate-800 mb-2">Profile Picture / Avatar</label>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200 mb-3">
                <div className="flex items-center space-x-4">
                  <img
                    src={avatar}
                    alt="Profile Preview"
                    className="w-16 h-16 rounded-full object-cover ring-2 ring-blue-500 shadow-md"
                  />
                  <div>
                    <div className="text-xs font-bold text-slate-900">{name || currentUser?.name}</div>
                    <div className="text-[11px] text-slate-500">@{username}</div>
                    <span className="text-[10px] text-slate-400 block mt-0.5">Max Image File Size: 2.0 MB</span>
                  </div>
                </div>

                {/* File Upload Button */}
                <div>
                  <input
                    type="file"
                    id="avatar-upload"
                    accept="image/*"
                    onChange={handleAvatarFileUpload}
                    className="hidden"
                  />
                  <label
                    htmlFor="avatar-upload"
                    className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-md shadow-2xs cursor-pointer flex items-center space-x-2 transition-colors inline-flex"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Local Image (Max 2MB)</span>
                  </label>
                </div>
              </div>

              {/* Validation Error Message */}
              {avatarError && (
                <div className="mb-3 p-2.5 bg-red-50 border border-red-200 rounded-md text-red-700 text-xs font-semibold flex items-center space-x-1.5">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{avatarError}</span>
                </div>
              )}

              {/* Preset Avatars Grid */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-slate-500 block">Or select from avatar presets:</span>
                <div className="flex items-center space-x-2">
                  {PRESET_AVATARS.map((url, idx) => (
                    <img
                      key={idx}
                      src={url}
                      alt={`Avatar option ${idx + 1}`}
                      onClick={() => {
                        setAvatar(url);
                        setAvatarError('');
                        setIsImageSelected(true);
                      }}
                      className={`w-10 h-10 rounded-full object-cover cursor-pointer transition-all ${
                        avatar === url ? 'ring-2 ring-blue-600 scale-105 shadow' : 'opacity-70 hover:opacity-100'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Read-Only Account Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                  <span>Full Name</span>
                  <span className="text-[10px] text-slate-400 font-normal flex items-center space-x-1">
                    <Lock className="w-2.5 h-2.5" />
                    <span>Read Only</span>
                  </span>
                </label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    readOnly
                    value={name}
                    className="w-full pl-8 pr-8 py-2 bg-slate-100/80 border border-slate-200 rounded-md text-xs font-medium text-slate-600 cursor-not-allowed outline-none select-none"
                  />
                  <Lock className="w-3 h-3 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 opacity-60" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                  <span>Username</span>
                  <span className="text-[10px] text-slate-400 font-normal flex items-center space-x-1">
                    <Lock className="w-2.5 h-2.5" />
                    <span>Read Only</span>
                  </span>
                </label>
                <div className="relative">
                  <AtSign className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    readOnly
                    value={username}
                    className="w-full pl-8 pr-8 py-2 bg-slate-100/80 border border-slate-200 rounded-md text-xs font-medium text-slate-600 cursor-not-allowed outline-none select-none"
                  />
                  <Lock className="w-3 h-3 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 opacity-60" />
                </div>
              </div>

              <div className="col-span-1 md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                  <span>Email Address</span>
                  <span className="text-[10px] text-slate-400 font-normal flex items-center space-x-1">
                    <Lock className="w-2.5 h-2.5" />
                    <span>Read Only</span>
                  </span>
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    readOnly
                    value={email}
                    className="w-full pl-8 pr-8 py-2 bg-slate-100/80 border border-slate-200 rounded-md text-xs font-medium text-slate-600 cursor-not-allowed outline-none select-none"
                  />
                  <Lock className="w-3 h-3 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 opacity-60" />
                </div>
              </div>

              <div className="col-span-1 md:col-span-2 p-3 bg-slate-50 border border-slate-200/80 rounded-lg flex items-center justify-between text-[11px] text-slate-500">
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>Full Name, Username, and Email are managed under system security policy and are read-only.</span>
                </div>
              </div>
            </div>

            {/* Editable Password Change Section */}
            <div className="pt-4 border-t border-slate-100 space-y-4">
              <div>
                <h3 className="text-xs font-bold text-slate-900 flex items-center space-x-1.5">
                  <Lock className="w-3.5 h-3.5 text-blue-600" />
                  <span>Security Password Management</span>
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Enter a new password below to update your login password.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">New Password</label>
                  <div className="relative">
                    <Lock className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="password"
                      placeholder="Enter new password"
                      value={newPassword}
                      onChange={(e) => {
                        setNewPassword(e.target.value);
                        setPasswordError('');
                      }}
                      className="w-full pl-8 pr-3 py-2 border border-slate-200 rounded-md text-xs font-mono focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Confirm Password</label>
                  <div className="relative">
                    <Lock className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="password"
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        setPasswordError('');
                      }}
                      className={`w-full pl-8 pr-3 py-2 border rounded-md text-xs font-mono outline-none bg-white ${
                        confirmPassword && newPassword !== confirmPassword
                          ? 'border-red-400 focus:ring-1 focus:ring-red-500'
                          : 'border-slate-200 focus:ring-1 focus:ring-blue-500 focus:border-blue-500'
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* Password Error Message */}
              {passwordError && (
                <div className="p-2.5 bg-red-50 border border-red-200 rounded-md text-red-700 text-xs font-semibold flex items-center space-x-1.5 animate-in fade-in">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{passwordError}</span>
                </div>
              )}

              {/* Mismatch Warning */}
              {confirmPassword && newPassword !== confirmPassword && !passwordError && (
                <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-md text-amber-800 text-xs font-semibold flex items-center space-x-1.5 animate-in fade-in">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
                  <span>New password and confirm password do not match.</span>
                </div>
              )}
            </div>

            {/* Unified Save Button */}
            <div className="space-y-1.5 pt-2 border-t border-slate-100">
              <button
                type="submit"
                disabled={isSaveDisabled}
                className={`px-5 py-2 font-bold text-xs rounded-md shadow-2xs transition-colors flex items-center space-x-2 ${
                  isSaveDisabled
                    ? 'opacity-50 cursor-not-allowed bg-slate-300 text-slate-600'
                    : 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer shadow-md shadow-blue-500/20'
                }`}
              >
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </button>
              {!hasValidChanges && !avatarError && (
                <span className="text-[10px] text-slate-400 block italic">
                  Select a new profile picture or enter matching new passwords to enable saving changes.
                </span>
              )}
            </div>
          </form>
        </div>

        {/* Right Column: Database Engine Status */}
        <div className="space-y-6">
          {/* MariaDB Database Status */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3">
            <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2 border-b border-slate-100 pb-3">
              <Database className="w-4 h-4 text-emerald-600" />
              <span>MariaDB Engine Connection</span>
            </h2>
            <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-slate-700 space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-xs text-emerald-900 font-bold">MariaDB Server:</span>
                <span className="font-mono text-[11px] text-emerald-700">Connected</span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-500">Database Schema:</span>
                <span className="font-mono font-semibold">standupflow_db</span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-500">User Table Hash Codes:</span>
                <span className="font-mono font-semibold text-emerald-800">Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
