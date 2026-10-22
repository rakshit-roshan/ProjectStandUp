import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Clock,
  Shield,
  Building,
  User,
  Mail,
  RefreshCw,
  LogOut,
  CheckCircle2,
  AlertCircle,
  FolderLock,
  Layers,
  Sparkles
} from 'lucide-react';

export const ProjectAssignmentPendingView = () => {
  const {
    currentUser,
    getUserRoleName,
    logout,
    refreshData
  } = useApp();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState(null);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setFeedbackMsg(null);
    try {
      if (refreshData) {
        await refreshData();
      }
      setTimeout(() => {
        setIsRefreshing(false);
        setFeedbackMsg("Status checked: No project assignment detected yet. Please ensure your administrator adds your account to a project in the Team Members tab.");
      }, 700);
    } catch (e) {
      setIsRefreshing(false);
      setFeedbackMsg("Connection refreshed. Waiting for administrator assignment.");
    }
  };

  const roleName = getUserRoleName ? getUserRoleName(currentUser) : 'User';
  const companyId = currentUser?.companyId || localStorage.getItem('standupflow_company_id') || 'Master';

  return (
    <div className="min-h-full flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-200">
      <div className="max-w-2xl w-full bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200 shadow-xl overflow-hidden space-y-0">
        {/* Top Header Bar */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 p-6 text-white relative overflow-hidden">
          <div className="absolute -right-8 -top-8 w-40 h-40 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center space-x-3">
              <div className="w-11 h-11 rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-400 flex items-center justify-center shadow-inner shrink-0">
                <Clock className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-extrabold tracking-widest uppercase px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                    Assignment Pending
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">ORG-{companyId}</span>
                </div>
                <h1 className="text-lg font-bold text-white tracking-tight mt-1">
                  Project Workspace Assignment Required
                </h1>
              </div>
            </div>

            <button
              onClick={logout}
              className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer shrink-0"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>

        {/* Main Body */}
        <div className="p-6 md:p-8 space-y-6">
          {/* Welcome Message */}
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center mx-auto shadow-2xs">
              <FolderLock className="w-7 h-7" />
            </div>
            <h2 className="text-base font-bold text-slate-900">
              Welcome to StandupFlow, {currentUser?.fullname || currentUser?.name || 'Team Member'}!
            </h2>
            <p className="text-xs text-slate-600 max-w-lg mx-auto leading-relaxed">
              Your user account has been successfully created and verified. However, an organization administrator or project manager has not assigned you to any active project workspace yet.
            </p>
          </div>

          {/* User Account Verification Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs space-y-3">
            <div className="font-bold text-slate-800 text-[11px] uppercase tracking-wider flex items-center justify-between border-b border-slate-200/80 pb-2">
              <div className="flex items-center space-x-1.5">
                <Shield className="w-3.5 h-3.5 text-blue-600" />
                <span>Account Profile Details</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold flex items-center space-x-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>Verified Account</span>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-600">
              <div className="flex items-center space-x-2">
                <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-400 block">Full Name & Handle</span>
                  <span className="font-bold text-slate-900">{currentUser?.fullname || currentUser?.name || 'User'}</span>
                  <span className="text-slate-400 font-mono ml-1">(@{currentUser?.username || 'user'})</span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <div className="min-w-0">
                  <span className="text-[10px] text-slate-400 block">Work Email</span>
                  <span className="font-semibold text-slate-800 truncate block">{currentUser?.emailid || currentUser?.email || 'N/A'}</span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-400 block">Department & Role</span>
                  <span className="font-semibold text-slate-800">{currentUser?.department || 'Engineering'} • </span>
                  <span className="font-bold text-blue-700">{roleName}</span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Layers className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-400 block">Project Workspace Status</span>
                  <span className="font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 text-[10px]">
                    Waiting for Team Assignment
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Explanatory Steps */}
          <div className="border border-blue-100 bg-blue-50/50 rounded-xl p-4 text-xs space-y-2">
            <h3 className="font-bold text-blue-900 flex items-center space-x-1.5 text-xs">
              <AlertCircle className="w-4 h-4 text-blue-600" />
              <span>What should you do next?</span>
            </h3>
            <ol className="list-decimal list-inside space-y-1.5 text-slate-700 text-[11px] leading-relaxed pl-1">
              <li>
                <strong className="text-slate-900 font-semibold">Contact your administrator or manager:</strong> Let them know your account is active and you are ready to be assigned to your team's project.
              </li>
              <li>
                <strong className="text-slate-900 font-semibold">Administrator assigns you:</strong> Your administrator can add you directly to the project roster under the <span className="font-bold text-blue-700">Team Members</span> menu.
              </li>
              <li>
                <strong className="text-slate-900 font-semibold">Immediate access:</strong> Once assigned, all navigation items (Kanban, Sprints, Backlog, Issues, and Chats) will automatically unlock for you.
              </li>
            </ol>
          </div>

          {/* Feedback Toast if any */}
          {feedbackMsg && (
            <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-xs font-medium animate-in fade-in flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>{feedbackMsg}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <span className="text-[11px] text-slate-400 italic text-center sm:text-left">
              The workspace updates automatically once you are assigned.
            </span>

            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? 'Checking Assignments...' : 'Check Assignment Status'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
