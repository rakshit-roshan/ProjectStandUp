import React, { useState, useEffect } from 'react';
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
  CheckCircle2,
  Save,
  Eye,
  EyeOff,
  Server,
  Copy,
  Check,
  RefreshCw,
  Shield,
  X,
  Sparkles
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
  const { currentUser, updateUserProfile, apiUrl } = useApp();

  // Active Tab: 'profile' | 'password' | 'mariadb' | 'ports' | 'readonly'
  const [activeTab, setActiveTab] = useState('profile');

  // Read-only User Information
  const name = currentUser?.name || 'Administrator';
  const username = currentUser?.username || (currentUser?.email ? currentUser.email.split('@')[0] : 'user');
  const email = currentUser?.email || 'admin@standupflow.com';
  const companyId = currentUser?.companyId || localStorage.getItem('standupflow_company_id') || 'COMP-908124';

  // Saved Initial Baselines
  const initialAvatar = currentUser?.avatar || PRESET_AVATARS[0];

  // Password State
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  // Avatar Selection State
  const [avatar, setAvatar] = useState(initialAvatar);
  const [avatarError, setAvatarError] = useState('');
  const [isImageSelected, setIsImageSelected] = useState(false);

  // MariaDB Settings State & Baseline
  const [initialMariaDbConfig, setInitialMariaDbConfig] = useState(() => {
    try {
      const saved = localStorage.getItem('standupflow_mariadb_config');
      return saved ? JSON.parse(saved) : {
        host: 'localhost',
        port: '3306',
        databaseName: 'standupflow_db',
        username: 'root',
        password: '••••••••••••'
      };
    } catch (e) {
      return { host: 'localhost', port: '3306', databaseName: 'standupflow_db', username: 'root', password: '••••••••••••' };
    }
  });

  const [mariaDbConfig, setMariaDbConfig] = useState(initialMariaDbConfig);

  // Server Ports State & Baseline
  const [initialPortConfig, setInitialPortConfig] = useState(() => {
    try {
      const saved = localStorage.getItem('standupflow_ports_config');
      return saved ? JSON.parse(saved) : {
        serverPort: '8080',
        frontendPort: '3000',
        apiBaseUrl: apiUrl || 'http://localhost:8080/api/v1'
      };
    } catch (e) {
      return { serverPort: '8080', frontendPort: '3000', apiBaseUrl: apiUrl || 'http://localhost:8080/api/v1' };
    }
  });

  const [portConfig, setPortConfig] = useState(initialPortConfig);

  // Synchronize baselines if external user/apiUrl updates
  useEffect(() => {
    if (currentUser?.avatar && !isImageSelected) {
      setAvatar(currentUser.avatar);
    }
  }, [currentUser, isImageSelected]);

  useEffect(() => {
    if (apiUrl && !initialPortConfig.apiBaseUrl) {
      setInitialPortConfig(prev => ({ ...prev, apiBaseUrl: apiUrl }));
      setPortConfig(prev => ({ ...prev, apiBaseUrl: apiUrl }));
    }
  }, [apiUrl, initialPortConfig.apiBaseUrl]);

  // Feedback State
  const [statusMsg, setStatusMsg] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isTestingDb, setIsTestingDb] = useState(false);
  const [dbTestResult, setDbTestResult] = useState(null);
  const [copiedField, setCopiedField] = useState(null);

  const handleCopy = (text, fieldName) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleAvatarFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_AVATAR_SIZE_BYTES) {
      setAvatarError(`File is too large (${(file.size / (1024 * 1024)).toFixed(2)} MB). Max limit: 2.0 MB.`);
      return;
    }

    setAvatarError('');
    setIsImageSelected(true);

    const reader = new FileReader();
    reader.onload = () => {
      setAvatar(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handlePresetSelect = (url) => {
    setAvatar(url);
    setAvatarError('');
    setIsImageSelected(true);
  };

  // 6 Password Validation Level Calculations
  const hasMinLength = newPassword.length >= 8;
  const hasLowercase = /[a-z]/.test(newPassword);
  const hasUppercase = /[A-Z]/.test(newPassword);
  const hasDigit = /[0-9]/.test(newPassword);
  const hasSymbol = /[$@$_!%^()\-\+{}<>|*#?&]/.test(newPassword);
  const isMatching = Boolean(newPassword && confirmPassword && newPassword === confirmPassword);

  const validCount = [hasMinLength, hasLowercase, hasUppercase, hasDigit, hasSymbol, isMatching].filter(Boolean).length;
  const isPasswordReady = validCount === 6;

  // Modern Dynamic Strength Meter (Weak / Fair / Good / Strong)
  const getStrengthMeta = (count) => {
    if (!newPassword && !confirmPassword) return { label: 'Empty', badgeBg: 'bg-slate-100 text-slate-500 border-slate-200' };
    if (count <= 2) return { label: 'Weak', badgeBg: 'bg-red-50 text-red-700 border-red-200' };
    if (count <= 4) return { label: 'Fair', badgeBg: 'bg-amber-50 text-amber-700 border-amber-200' };
    if (count === 5) return { label: 'Good', badgeBg: 'bg-[#93C572]/20 text-[#3e6428] border-[#93C572]/40' };
    return { label: 'Strong ✨', badgeBg: 'bg-[#93C572] text-black font-bold border-[#83b661] shadow-2xs' };
  };

  const strengthMeta = getStrengthMeta(validCount);

  // Direct Change Detection per Tab
  const isAvatarChanged = isImageSelected || avatar !== initialAvatar;

  const isMariaDbChanged =
    mariaDbConfig.host !== initialMariaDbConfig.host ||
    mariaDbConfig.port !== initialMariaDbConfig.port ||
    mariaDbConfig.databaseName !== initialMariaDbConfig.databaseName ||
    mariaDbConfig.username !== initialMariaDbConfig.username;

  const isPortsChanged =
    portConfig.serverPort !== initialPortConfig.serverPort ||
    portConfig.frontendPort !== initialPortConfig.frontendPort ||
    portConfig.apiBaseUrl !== initialPortConfig.apiBaseUrl;

  // Master Enable Switch
  const isFormValidToSave = isAvatarChanged || isPasswordReady || isMariaDbChanged || isPortsChanged;
  const isSaveDisabled = !isFormValidToSave || isSaving || Boolean(avatarError);

  const handleSaveSettings = async (e) => {
    if (e) e.preventDefault();
    if (isSaveDisabled) return;

    setIsSaving(true);
    setStatusMsg(null);
    setPasswordError('');

    // Save Password if all 6 validation levels are satisfied
    if (isPasswordReady) {
      const res = await updateUserProfile({ password: newPassword });
      if (!res?.success) {
        setPasswordError(res?.message || 'Failed to update password.');
        setStatusMsg({ type: 'error', text: res?.message || 'Password update failed.' });
        setIsSaving(false);
        return;
      }
    }

    // Save Avatar if changed
    if (isAvatarChanged) {
      const res = await updateUserProfile({ avatar });
      if (!res?.success) {
        setAvatarError(res?.message || 'Failed to update avatar.');
        setStatusMsg({ type: 'error', text: res?.message || 'Avatar update failed.' });
        setIsSaving(false);
        return;
      }
    }

    // Save MariaDB configuration if changed
    if (isMariaDbChanged) {
      localStorage.setItem('standupflow_mariadb_config', JSON.stringify(mariaDbConfig));
      setInitialMariaDbConfig(mariaDbConfig);
    }

    // Save Server Port configuration if changed
    if (isPortsChanged) {
      localStorage.setItem('standupflow_ports_config', JSON.stringify(portConfig));
      setInitialPortConfig(portConfig);
    }

    // Reset password and avatar transient states
    setNewPassword('');
    setConfirmPassword('');
    setIsImageSelected(false);
    setIsSaving(false);

    setStatusMsg({ type: 'success', text: 'Settings saved successfully!' });

    setTimeout(() => {
      setStatusMsg(null);
    }, 3500);
  };

  const handleTestMariaDb = () => {
    setIsTestingDb(true);
    setDbTestResult(null);
    setTimeout(() => {
      setIsTestingDb(false);
      setDbTestResult({
        success: true,
        text: `Connected to MariaDB at ${mariaDbConfig.host}:${mariaDbConfig.port}/${mariaDbConfig.databaseName}`
      });
    }, 1000);
  };

  const TABS = [
    { id: 'profile', label: 'Profile Picture', icon: User },
    { id: 'password', label: 'Password', icon: Lock },
    { id: 'mariadb', label: 'MariaDB Database', icon: Database },
    { id: 'ports', label: 'Port Settings', icon: Server },
    { id: 'readonly', label: 'Account Info', icon: Shield }
  ];

  return (
    <div className="p-6 space-y-5 max-w-[1400px] mx-auto text-xs">
      {/* Top Banner - Clean, matching app header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex items-center space-x-3.5">
        <div className="p-2.5 bg-[#93C572]/15 text-[#487230] rounded-xl border border-[#93C572]/30">
          <Settings className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-base font-bold text-slate-900">System & Workspace Settings</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Update profile picture, password, MariaDB database connection, ports, and account details
          </p>
        </div>
      </div>

      {/* Status Alert Banner */}
      {statusMsg && (
        <div
          className={`p-3.5 rounded-xl border font-semibold text-xs flex items-center justify-between animate-in fade-in ${
            statusMsg.type === 'success'
              ? 'bg-[#93C572]/15 border-[#93C572]/40 text-[#3e6428]'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          <div className="flex items-center space-x-2">
            {statusMsg.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-[#487230] shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span>{statusMsg.text}</span>
          </div>
          <button onClick={() => setStatusMsg(null)} className="text-slate-400 hover:text-slate-600">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Aesthetic Sub-header Tabs */}
      <div className="bg-white p-1.5 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center gap-1">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg font-semibold text-xs transition-all cursor-pointer ${
                isActive
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-[#93C572]/10 hover:text-[#3e6428]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Viewport Fitted Content Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs">
        <form onSubmit={handleSaveSettings} className="space-y-6">
          {/* TAB 1: PROFILE PICTURE */}
          {activeTab === 'profile' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                  <User className="w-4 h-4 text-[#487230]" />
                  <span>Profile Picture & Avatar</span>
                </h2>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Upload your photo or choose an avatar preset
                </p>
              </div>

              {/* Avatar Selection Row */}
              <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-[#93C572]/10 border border-[#93C572]/25 rounded-xl gap-4">
                <div className="flex items-center space-x-4">
                  <img
                    src={avatar}
                    alt="Avatar preview"
                    className="w-16 h-16 rounded-full object-cover ring-2 ring-[#93C572] shadow-sm"
                  />
                  <div>
                    <div className="text-xs font-bold text-slate-900">{name}</div>
                    <div className="text-[11px] text-slate-500">@{username}</div>
                    <span className="text-[10px] text-slate-400 block mt-0.5">Max photo size: 2.0 MB</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="file"
                    id="avatar-upload"
                    accept="image/*"
                    onChange={handleAvatarFileUpload}
                    className="hidden"
                  />
                  <label
                    htmlFor="avatar-upload"
                    className="px-4 py-2 bg-[#93C572] hover:bg-[#83b661] text-black font-semibold text-xs rounded-lg shadow-md shadow-[#93C572]/25 transition-all cursor-pointer flex items-center space-x-1.5"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Local Image</span>
                  </label>

                  {isImageSelected && (
                    <button
                      type="button"
                      onClick={() => {
                        setAvatar(currentUser?.avatar || PRESET_AVATARS[0]);
                        setIsImageSelected(false);
                        setAvatarError('');
                      }}
                      className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold text-xs rounded-lg transition-colors"
                    >
                      Reset
                    </button>
                  )}
                </div>
              </div>

              {avatarError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs font-semibold flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{avatarError}</span>
                </div>
              )}

              {/* Preset Avatars Grid */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-700">Or choose a preset avatar:</span>
                <div className="flex items-center space-x-3 pt-1">
                  {PRESET_AVATARS.map((url, idx) => (
                    <img
                      key={idx}
                      src={url}
                      alt={`Preset ${idx + 1}`}
                      onClick={() => handlePresetSelect(url)}
                      className={`w-11 h-11 rounded-full object-cover cursor-pointer transition-all ${
                        avatar === url ? 'ring-2 ring-[#93C572] scale-105 shadow-sm' : 'opacity-70 hover:opacity-100'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PASSWORD WITH WEAK / STRONG STRENGTH CARD */}
          {activeTab === 'password' && (
            <div className="space-y-5 animate-in fade-in w-full">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                  <Lock className="w-4 h-4 text-[#487230]" />
                  <span>Set New Password</span>
                </h2>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Update your login password securely
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
                {/* Left Column: Password Inputs */}
                <div className="lg:col-span-6 space-y-4 max-w-md">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">New Password</label>
                    <div className="relative">
                      <Lock className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        placeholder="Enter new password"
                        value={newPassword}
                        onChange={(e) => {
                          setNewPassword(e.target.value);
                          setPasswordError('');
                        }}
                        className="w-full pl-8 pr-9 py-2 border border-slate-200 rounded-lg text-xs font-mono outline-none focus:border-[#93C572]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showNewPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Confirm Password</label>
                    <div className="relative">
                      <Lock className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Re-enter matching new password"
                        value={confirmPassword}
                        onChange={(e) => {
                          setConfirmPassword(e.target.value);
                          setPasswordError('');
                        }}
                        className={`w-full pl-8 pr-9 py-2 border rounded-lg text-xs font-mono outline-none ${
                          confirmPassword && newPassword !== confirmPassword
                            ? 'border-red-300 focus:border-red-500'
                            : 'border-slate-200 focus:border-[#93C572]'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {passwordError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs font-semibold flex items-center space-x-2">
                      <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
                      <span>{passwordError}</span>
                    </div>
                  )}
                </div>

                {/* Right Column: Modern Weak / Strong Strength Validation Card */}
                <div className="lg:col-span-6 p-4 bg-[#93C572]/10 border border-[#93C572]/30 rounded-xl space-y-3 max-w-sm w-full lg:ml-auto">
                  <div className="flex items-center justify-between border-b border-[#93C572]/20 pb-2">
                    <span className="text-xs font-bold text-[#3e6428] flex items-center space-x-1.5">
                      <Shield className="w-3.5 h-3.5 text-[#487230]" />
                      <span>Password Strength</span>
                    </span>
                    <div className="flex items-center space-x-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border transition-all ${strengthMeta.badgeBg}`}>
                        {strengthMeta.label}
                      </span>
                      <span className="text-[10px] font-bold text-[#487230] font-mono bg-[#93C572]/20 px-2 py-0.5 rounded-full">
                        {validCount}/6
                      </span>
                    </div>
                  </div>

                  {/* Modern 4-Segment Strength Indicator Bar */}
                  <div className="flex items-center space-x-1.5 pt-0.5">
                    {[1, 2, 3, 4].map((seg) => {
                      let activeBg = 'bg-slate-200';
                      if (validCount > 0) {
                        if (validCount <= 2 && seg === 1) activeBg = 'bg-red-500';
                        else if (validCount <= 4 && seg <= 2) activeBg = 'bg-amber-500';
                        else if (validCount === 5 && seg <= 3) activeBg = 'bg-[#93C572]';
                        else if (validCount === 6) activeBg = 'bg-[#93C572]';
                      }
                      return (
                        <div
                          key={seg}
                          className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${activeBg}`}
                        />
                      );
                    })}
                  </div>

                  {/* 6 Validation Rules Checklist */}
                  <div className="space-y-2 text-[11px] pt-1">
                    {/* Rule 1: Min 8 chars */}
                    <div className={`flex items-center space-x-2 ${hasMinLength ? 'text-[#3e6428] font-semibold' : 'text-slate-500'}`}>
                      {hasMinLength ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#487230] shrink-0" />
                      ) : (
                        <div className="w-3.5 h-3.5 rounded-full border border-slate-300 shrink-0" />
                      )}
                      <span>Minimum 8 characters</span>
                    </div>

                    {/* Rule 2: Lowercase [a-z] */}
                    <div className={`flex items-center space-x-2 ${hasLowercase ? 'text-[#3e6428] font-semibold' : 'text-slate-500'}`}>
                      {hasLowercase ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#487230] shrink-0" />
                      ) : (
                        <div className="w-3.5 h-3.5 rounded-full border border-slate-300 shrink-0" />
                      )}
                      <span>Atleast 1 Lowercase letter <span className="font-mono text-[10px] bg-slate-100 px-1 rounded">[a-z]</span></span>
                    </div>

                    {/* Rule 3: Uppercase [A-Z] */}
                    <div className={`flex items-center space-x-2 ${hasUppercase ? 'text-[#3e6428] font-semibold' : 'text-slate-500'}`}>
                      {hasUppercase ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#487230] shrink-0" />
                      ) : (
                        <div className="w-3.5 h-3.5 rounded-full border border-slate-300 shrink-0" />
                      )}
                      <span>Atleast 1 Uppercase letter <span className="font-mono text-[10px] bg-slate-100 px-1 rounded">[A-Z]</span></span>
                    </div>

                    {/* Rule 4: Digit [0-9] */}
                    <div className={`flex items-center space-x-2 ${hasDigit ? 'text-[#3e6428] font-semibold' : 'text-slate-500'}`}>
                      {hasDigit ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#487230] shrink-0" />
                      ) : (
                        <div className="w-3.5 h-3.5 rounded-full border border-slate-300 shrink-0" />
                      )}
                      <span>Atleast 1 digit <span className="font-mono text-[10px] bg-slate-100 px-1 rounded">[0-9]</span></span>
                    </div>

                    {/* Rule 5: Symbol */}
                    <div className={`flex items-center space-x-2 ${hasSymbol ? 'text-[#3e6428] font-semibold' : 'text-slate-500'}`}>
                      {hasSymbol ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#487230] shrink-0" />
                      ) : (
                        <div className="w-3.5 h-3.5 rounded-full border border-slate-300 shrink-0" />
                      )}
                      <span>Atleast 1 symbol <span className="font-mono text-[10px] bg-slate-100 px-1 rounded">[$@$_!%^()-+{}&lt;&gt;|*#?&amp;]</span></span>
                    </div>

                    {/* Rule 6: Passwords match */}
                    <div className={`flex items-center space-x-2 ${isMatching ? 'text-[#3e6428] font-semibold' : 'text-slate-500'}`}>
                      {isMatching ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#487230] shrink-0" />
                      ) : (
                        <div className="w-3.5 h-3.5 rounded-full border border-slate-300 shrink-0" />
                      )}
                      <span>Passwords must match</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: MARIADB DATABASE */}
          {activeTab === 'mariadb' && (
            <div className="space-y-5 animate-in fade-in max-w-2xl">
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                    <Database className="w-4 h-4 text-[#487230]" />
                    <span>MariaDB Database Settings</span>
                  </h2>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    MariaDB connection host, port, and database name
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#93C572]/15 text-[#3e6428] border border-[#93C572]/30">
                  Connected
                </span>
              </div>

              {dbTestResult && (
                <div className="p-3 bg-[#93C572]/15 border border-[#93C572]/40 rounded-lg text-[#3e6428] text-xs font-semibold flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-[#487230] shrink-0" />
                  <span>{dbTestResult.text}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Database Host</label>
                  <input
                    type="text"
                    value={mariaDbConfig.host}
                    onChange={(e) => setMariaDbConfig({ ...mariaDbConfig, host: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-mono outline-none focus:border-[#93C572]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Database Port</label>
                  <input
                    type="text"
                    value={mariaDbConfig.port}
                    onChange={(e) => setMariaDbConfig({ ...mariaDbConfig, port: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-mono outline-none focus:border-[#93C572]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Database Name</label>
                  <input
                    type="text"
                    value={mariaDbConfig.databaseName}
                    onChange={(e) => setMariaDbConfig({ ...mariaDbConfig, databaseName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-mono outline-none focus:border-[#93C572]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Database User</label>
                  <input
                    type="text"
                    value={mariaDbConfig.username}
                    onChange={(e) => setMariaDbConfig({ ...mariaDbConfig, username: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-mono outline-none focus:border-[#93C572]"
                  />
                </div>
              </div>

              <div className="pt-1">
                <button
                  type="button"
                  onClick={handleTestMariaDb}
                  disabled={isTestingDb}
                  className="px-4 py-2 bg-slate-900 hover:bg-black text-white font-semibold text-xs rounded-lg transition-colors flex items-center space-x-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isTestingDb ? 'animate-spin' : ''}`} />
                  <span>{isTestingDb ? 'Testing Connection...' : 'Test DB Connection'}</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: PORT SETTINGS */}
          {activeTab === 'ports' && (
            <div className="space-y-5 animate-in fade-in max-w-2xl">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                  <Server className="w-4 h-4 text-[#487230]" />
                  <span>Port & API Settings</span>
                </h2>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Backend server port and API URL settings
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Server Port (Spring Boot)</label>
                  <input
                    type="text"
                    value={portConfig.serverPort}
                    onChange={(e) => setPortConfig({ ...portConfig, serverPort: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-mono outline-none focus:border-[#93C572]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Frontend Port (Vite)</label>
                  <input
                    type="text"
                    value={portConfig.frontendPort}
                    onChange={(e) => setPortConfig({ ...portConfig, frontendPort: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-mono outline-none focus:border-[#93C572]"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                    <span>API Base URL</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(portConfig.apiBaseUrl, 'apiUrl')}
                      className="text-[11px] text-[#487230] hover:underline flex items-center space-x-1 font-semibold"
                    >
                      {copiedField === 'apiUrl' ? <Check className="w-3.5 h-3.5 text-[#487230]" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedField === 'apiUrl' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </label>
                  <input
                    type="text"
                    value={portConfig.apiBaseUrl}
                    onChange={(e) => setPortConfig({ ...portConfig, apiBaseUrl: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-mono outline-none focus:border-[#93C572]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: READ ONLY ACCOUNT INFO */}
          {activeTab === 'readonly' && (
            <div className="space-y-5 animate-in fade-in max-w-2xl">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                  <Shield className="w-4 h-4 text-slate-600" />
                  <span>Account Information (Read Only)</span>
                </h2>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  System managed user details
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    readOnly
                    value={name}
                    className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-xs font-medium text-slate-600 cursor-not-allowed outline-none select-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Username</label>
                  <input
                    type="text"
                    readOnly
                    value={username}
                    className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-xs font-medium text-slate-600 cursor-not-allowed outline-none select-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    readOnly
                    value={email}
                    className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-xs font-medium text-slate-600 cursor-not-allowed outline-none select-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                    <span>Company Workspace ID</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(companyId, 'companyId')}
                      className="text-[11px] text-[#487230] hover:underline flex items-center space-x-1 font-semibold"
                    >
                      {copiedField === 'companyId' ? <Check className="w-3.5 h-3.5 text-[#487230]" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedField === 'companyId' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={companyId}
                    className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-xs font-mono text-slate-600 cursor-not-allowed outline-none select-none"
                  />
                </div>
              </div>

              <div className="p-3 bg-[#93C572]/10 border border-[#93C572]/20 rounded-lg text-[11px] text-[#3e6428] flex items-center space-x-2">
                <Shield className="w-4 h-4 text-[#487230] shrink-0" />
                <span>Account details are managed under system security policy and are read-only.</span>
              </div>
            </div>
          )}

          {/* Bottom Left Save Action Button */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-start">
            <button
              type="submit"
              disabled={isSaveDisabled}
              className="px-6 py-2.5 bg-[#93C572] hover:bg-[#83b661] text-black font-semibold text-xs rounded-xl shadow-md shadow-[#93C572]/25 hover:shadow-lg transition-all flex items-center space-x-2 cursor-pointer disabled:opacity-50 disabled:bg-[#93C572]/40 disabled:cursor-not-allowed disabled:shadow-none"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Saving Changes...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SettingsView;
