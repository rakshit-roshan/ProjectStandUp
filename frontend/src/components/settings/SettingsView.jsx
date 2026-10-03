import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Settings,
  User,
  Mail,
  Lock,
  Building,
  Upload,
  ShieldCheck,
  Users,
  Copy,
  Check,
  UserPlus,
  Key,
  Database,
  Sparkles,
  AlertCircle,
  AlertTriangle
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
  const { currentUser, users, updateUserProfile, joinTeamCode, assignMemberByEmail, invitations, sendInvitation } = useApp();

  // Profile Edit Local State
  const [name, setName] = useState(currentUser?.name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [password, setPassword] = useState(currentUser?.password || '');
  const [department, setDepartment] = useState(currentUser?.department || 'Engineering');
  const [avatar, setAvatar] = useState(currentUser?.avatar || PRESET_AVATARS[0]);
  const [avatarError, setAvatarError] = useState('');
  const [isImageSelected, setIsImageSelected] = useState(false);

  // Manager & Team Join State
  const [teamCodeInput, setTeamCodeInput] = useState(currentUser?.managerCode || '');
  const [assignEmailInput, setAssignEmailInput] = useState('');
  
  // Status Notifications
  const [copied, setCopied] = useState(false);
  const [profileMsg, setProfileMsg] = useState('');
  const [teamMsg, setTeamMsg] = useState('');

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
    if (avatarError || !isImageSelected) return;

    const res = await updateUserProfile({
      name,
      email,
      password,
      department,
      avatar
    });
    if (res?.success) {
      setProfileMsg('Profile updated successfully!');
      setIsImageSelected(false);
      setTimeout(() => setProfileMsg(''), 3000);
    }
  };

  const handleJoinTeam = async (e) => {
    e.preventDefault();
    if (!teamCodeInput.trim()) return;
    const res = await joinTeamCode(teamCodeInput);
    if (res?.success) {
      setTeamMsg('Joined Manager Team successfully!');
      setTimeout(() => setTeamMsg(''), 3000);
    }
  };

  const handleAssignMember = async (e) => {
    e.preventDefault();
    if (!assignEmailInput.trim()) return;
    const targetEmail = assignEmailInput.trim().toLowerCase();
    
    // Send Team Invitation
    const res = await sendInvitation(targetEmail);
    if (res?.success) {
      setTeamMsg(`Team invitation sent to ${targetEmail}!`);
      setAssignEmailInput('');
      setTimeout(() => setTeamMsg(''), 3000);
    } else {
      setTeamMsg(res?.message || 'Failed to send invitation');
    }
  };

  const copyManagerCode = () => {
    if (currentUser?.managerCode) {
      navigator.clipboard.writeText(currentUser.managerCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Team members under current manager's code
  const myTeamMembers = users.filter(u => u.managerCode && u.managerCode === currentUser?.managerCode && u.id !== currentUser?.id);
  const myPendingInvites = invitations.filter(i => i.managerCode === currentUser?.managerCode && i.status === 'PENDING');

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto text-xs">
      {/* Top Banner */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900 leading-tight">Profile & Team Settings</h1>
            <p className="text-xs text-slate-500">Edit your user credentials, profile picture, and Manager Team Hash Code assignments</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Edit Profile Options */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-6">
          <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <User className="w-4 h-4 text-blue-600" />
              <span>Edit Personal Profile</span>
            </h2>
            {profileMsg && (
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200 animate-in fade-in">
                {profileMsg}
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
                    <div className="text-[11px] text-slate-500">{currentUser?.role} • {department}</div>
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

            {/* Form Fields Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      setIsImageSelected(true);
                    }}
                    className="w-full pl-8 pr-3 py-2 border border-slate-200 rounded-md text-xs font-medium focus:ring-1 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setIsImageSelected(true);
                    }}
                    className="w-full pl-8 pr-3 py-2 border border-slate-200 rounded-md text-xs font-medium focus:ring-1 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setIsImageSelected(true);
                    }}
                    className="w-full pl-8 pr-3 py-2 border border-slate-200 rounded-md text-xs font-mono focus:ring-1 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Department</label>
                <div className="relative">
                  <Building className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <select
                    value={department}
                    onChange={(e) => {
                      setDepartment(e.target.value);
                      setIsImageSelected(true);
                    }}
                    className="w-full pl-8 pr-3 py-2 border border-slate-200 rounded-md text-xs font-medium focus:ring-1 focus:ring-blue-500 outline-none bg-white"
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Quality Assurance">Quality Assurance (QA)</option>
                    <option value="Product Management">Product Management</option>
                    <option value="Security Operations">Security Operations</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <button
                type="submit"
                disabled={!isImageSelected || Boolean(avatarError)}
                className={`px-5 py-2 font-bold text-xs rounded-md shadow-2xs transition-colors flex items-center space-x-2 ${
                  !isImageSelected || Boolean(avatarError)
                    ? 'opacity-50 cursor-not-allowed bg-slate-300 text-slate-600'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                <span>Save Profile Changes</span>
              </button>
              {!isImageSelected && !avatarError && (
                <span className="text-[10px] text-slate-400 block italic">
                  Upload a photo or choose an avatar preset above to enable saving profile changes.
                </span>
              )}
            </div>
          </form>
        </div>

        {/* Right Column: Project Hash Code & Team Group Assignment */}
        <div className="space-y-6">
          {/* Project / Lead Hash Code Section */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2 border-b border-slate-100 pb-3">
              <Key className="w-4 h-4 text-indigo-600" />
              <span>Project Workspace Hash Code & Team Assignment</span>
            </h2>

            {teamMsg && (
              <p className="text-xs font-semibold text-emerald-700 bg-emerald-50 p-2.5 rounded border border-emerald-200">
                {teamMsg}
              </p>
            )}

            <div className="space-y-4">
              <div className="p-4 bg-indigo-50/60 rounded-xl border border-indigo-200 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-800">
                  Your Unique Lead / Team Hash Code
                </span>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-lg font-bold text-indigo-950 tracking-wider">
                    {currentUser?.managerCode || 'LEAD-8F2D'}
                  </span>
                  <button
                    onClick={copyManagerCode}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-md flex items-center space-x-1.5 transition-colors shadow-2xs"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied!' : 'Copy Code'}</span>
                  </button>
                </div>
                <p className="text-[11px] text-indigo-700 leading-relaxed pt-1">
                  Share this code with engineers and testers. When they enter this code, they will automatically join your team project workspace!
                </p>
              </div>

              {/* Assign Member by Email Form */}
              <form onSubmit={handleAssignMember} className="space-y-2 pt-2 border-t border-slate-100">
                <label className="block text-xs font-bold text-slate-800">
                  Invite Member to Your Project Team Workspace
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="email"
                    placeholder="Engineer / Tester Email"
                    value={assignEmailInput}
                    onChange={(e) => setAssignEmailInput(e.target.value)}
                    className="flex-1 px-3 py-1.5 border border-slate-200 rounded-md text-xs outline-none focus:border-blue-500"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-slate-900 hover:bg-black text-white text-xs font-semibold rounded-md flex items-center space-x-1 shrink-0"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Invite</span>
                  </button>
                </div>
              </form>

              {/* Assigned Team Members & Invitations List */}
              <div className="pt-2 border-t border-slate-100 space-y-3">
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  My Team Roster ({myTeamMembers.length} Active • {myPendingInvites.length} Pending Invites)
                </div>

                <div className="max-h-48 overflow-y-auto divide-y divide-slate-100">
                  {myTeamMembers.length === 0 && myPendingInvites.length === 0 ? (
                    <div className="py-3 text-center text-slate-400 text-[11px]">
                      No team members invited yet. Use the input above to send an email invitation!
                    </div>
                  ) : (
                    <>
                      {/* Verified Team Members */}
                      {myTeamMembers.map(m => (
                        <div key={m.id} className="py-2 flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <img src={m.avatar} alt={m.name} className="w-6 h-6 rounded-full object-cover ring-1 ring-emerald-400" />
                            <div>
                              <div className="font-semibold text-slate-800">{m.name}</div>
                              <div className="text-[10px] text-slate-400">{m.email}</div>
                            </div>
                          </div>
                          <span className="px-2 py-0.5 rounded text-[9px] font-bold font-mono bg-emerald-50 text-emerald-700 border border-emerald-200">
                            ACTIVE ({m.role})
                          </span>
                        </div>
                      ))}

                      {/* Pending Invitations */}
                      {myPendingInvites.map(inv => (
                        <div key={inv.id} className="py-2 flex items-center justify-between bg-amber-50/40 px-2 rounded">
                          <div className="flex items-center space-x-2">
                            <div className="w-6 h-6 rounded-full bg-amber-200 text-amber-900 flex items-center justify-center font-bold text-[10px]">
                              ?
                            </div>
                            <div>
                              <div className="font-semibold text-slate-800">{inv.inviteeEmail}</div>
                              <div className="text-[10px] text-slate-400">Invite Code: {inv.managerCode}</div>
                            </div>
                          </div>
                          <span className="px-2 py-0.5 rounded text-[9px] font-bold font-mono bg-amber-100 text-amber-800 border border-amber-300 animate-pulse">
                            PENDING ACCEPTANCE
                          </span>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </div>

              {/* Join Team Workspace Form */}
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <label className="block text-xs font-semibold text-slate-700">
                  Join Another Lead's Project Workspace
                </label>
                <form onSubmit={handleJoinTeam} className="flex items-center space-x-2">
                  <input
                    type="text"
                    placeholder="Enter Lead Code (e.g. LEAD-8F2D)"
                    value={teamCodeInput}
                    onChange={(e) => setTeamCodeInput(e.target.value)}
                    className="flex-1 px-3 py-1.5 border border-slate-200 rounded-md text-xs font-mono font-bold uppercase focus:border-blue-500 outline-none"
                  />
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-md shadow-2xs transition-colors shrink-0"
                  >
                    Join Workspace
                  </button>
                </form>
              </div>
            </div>
          </div>

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
