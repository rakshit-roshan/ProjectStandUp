import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Lock, Users, ArrowRight, CheckCircle2, ShieldAlert, Sparkles, MailCheck, X } from 'lucide-react';

export const UnassignedMemberBanner = () => {
  const { currentUser, joinTeamCode, invitations, acceptInvitation, declineInvitation } = useApp();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Pending invitation sent to this user's email
  const pendingInvites = invitations.filter(
    i => i.inviteeEmail && i.inviteeEmail.toLowerCase() === currentUser?.email?.toLowerCase() && i.status === 'PENDING'
  );
  const currentInvite = pendingInvites[0];

  if (!currentInvite && (currentUser?.role === 'MANAGER' || currentUser?.managerCode)) {
    return null;
  }

  const handleJoin = (e) => {
    e.preventDefault();
    if (!code.trim()) {
      setError('Please enter a valid Manager Team Code');
      return;
    }
    const result = joinTeamCode(code.trim().toUpperCase());
    if (result?.success) {
      setSuccess(true);
      setError('');
    } else {
      setError(result?.message || 'Invalid Manager Code. Please check with your project lead.');
    }
  };

  return (
    <div className="space-y-4 mb-6">
      {/* Pending Invitation Alert Banner if received */}
      {currentInvite && (
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-5 rounded-xl shadow-xl border-2 border-blue-400 flex flex-col md:flex-row md:items-center justify-between gap-4 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-start space-x-3.5">
            <div className="p-3 bg-blue-600 rounded-xl text-white shrink-0 shadow-md">
              <MailCheck className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-500/30 text-blue-200 border border-blue-400/30">
                  Team Invitation Received
                </span>
                <span className="text-xs text-blue-300 font-mono">From: {currentInvite.managerName}</span>
              </div>
              <h3 className="text-base font-bold text-white mt-1">
                You're Invited to Join {currentInvite.managerName}'s Team Group!
              </h3>
              <p className="text-xs text-blue-100 mt-1">
                Manager Code: <span className="font-mono font-bold text-amber-300">{currentInvite.managerCode}</span>. Click Accept to activate your workspace instantly.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={() => acceptInvitation(currentInvite.id)}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-lg shadow-md transition-colors flex items-center space-x-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Accept Invitation</span>
            </button>
            <button
              onClick={() => declineInvitation(currentInvite.id)}
              className="px-3 py-2 bg-white/10 hover:bg-white/20 text-slate-300 text-xs font-semibold rounded-lg transition-colors flex items-center space-x-1"
            >
              <X className="w-3.5 h-3.5" />
              <span>Decline</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Unassigned Hash Code Form Banner */}
      <div className="bg-amber-500/10 border-2 border-dashed border-amber-400 p-6 rounded-xl shadow-lg text-slate-900 animate-in fade-in duration-300">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-amber-500 text-white rounded-xl shadow-md shrink-0">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-amber-200 text-amber-900 border border-amber-300">
                  Workspace Unassigned
                </span>
                <span className="text-xs text-amber-800 font-mono">Hash Table Group Pending</span>
              </div>
              <h2 className="text-base font-bold text-slate-900 mt-1">
                Welcome to StandupFlow, {currentUser?.name}!
              </h2>
              <p className="text-xs text-slate-600 mt-1 max-w-xl leading-relaxed">
                Your profile is currently unassigned. Ask your Manager to invite your email address (<span className="font-semibold text-slate-900">{currentUser?.email}</span>) or enter your Manager's unique Team Hash Code (e.g. <span className="font-mono font-bold text-slate-900">MGR-8F2D</span>) below to activate your developer/tester workspace.
              </p>
            </div>
          </div>

          {/* Join Manager Code Form */}
          <form onSubmit={handleJoin} className="bg-white p-4 rounded-xl border border-slate-200 shadow-md min-w-[320px] space-y-3">
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
              Enter Manager Hash Code
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="e.g. MGR-8F2D"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value);
                  setError('');
                }}
                className="w-full pl-3 pr-24 py-2 border border-slate-300 rounded-lg text-xs font-mono font-bold uppercase focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
              <button
                type="submit"
                className="absolute right-1 top-1 bottom-1 px-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-md shadow-2xs transition-colors flex items-center space-x-1"
              >
                <span>Activate</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {error && (
              <p className="text-[11px] text-red-600 font-semibold flex items-center space-x-1">
                <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                <span>{error}</span>
              </p>
            )}

            {success && (
              <p className="text-[11px] text-emerald-600 font-semibold flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>Successfully joined Manager Team!</span>
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};
