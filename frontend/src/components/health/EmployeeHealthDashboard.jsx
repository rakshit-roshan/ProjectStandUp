import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  HeartPulse,
  Clock,
  CheckCircle2,
  Calendar,
  Layers,
  User,
  ShieldAlert,
  Award,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';

export const EmployeeHealthDashboard = () => {
  const { workSessions, users, projects, navigateTo, currentRole } = useApp();
  const [selectedUser, setSelectedUser] = useState(users[0]);

  const userSessions = workSessions.filter(w => w.userId === selectedUser.id || w.userName === selectedUser.name);
  const activeSession = userSessions[0] || workSessions[0];

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-emerald-50 text-emerald-600 rounded-md">
            <HeartPulse className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900 leading-tight">Employee Work & Attendance Health</h1>
            <p className="text-xs text-slate-500">Transparent work logs, verified session hours, and project workload health</p>
          </div>
        </div>

        {/* User Selector */}
        <div className="flex items-center space-x-2 bg-slate-50 p-1.5 rounded-md border border-slate-200 text-xs">
          <User className="w-3.5 h-3.5 text-slate-400 ml-1" />
          <select
            value={selectedUser.id}
            onChange={(e) => {
              const u = users.find(usr => usr.id === e.target.value);
              if (u) setSelectedUser(u);
            }}
            className="bg-transparent text-xs font-semibold text-slate-800 outline-none pr-2 cursor-pointer"
          >
            {users.map(u => (
              <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Verified Work Sessions & Daily Timeline */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Work Session Record — {activeSession?.date}</h2>
                <p className="text-xs text-slate-500 mt-0.5">Project: {activeSession?.activeProject}</p>
              </div>
              <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-semibold rounded text-xs">
                Verified Productive Log
              </span>
            </div>

            {/* Session Stats Grid */}
            <div className="grid grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-md border border-slate-200 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Login Time</span>
                <span className="font-mono font-bold text-slate-800">{activeSession?.loginTime}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Logout Time</span>
                <span className="font-mono font-bold text-slate-800">{activeSession?.logoutTime}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Total Session</span>
                <span className="font-mono font-bold text-slate-800">{activeSession?.sessionDuration}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Productive Hours</span>
                <span className="font-mono font-bold text-emerald-600">{activeSession?.verifiedProductiveHours}</span>
              </div>
            </div>

            {/* Timeline Stream */}
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Daily Activity Timeline</h3>
              <div className="border-l-2 border-slate-200 pl-4 space-y-3 ml-2">
                {(activeSession?.timeline || []).map((t, idx) => (
                  <div key={idx} className="relative text-xs">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600 absolute -left-[21px] top-1 ring-2 ring-white" />
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-bold text-slate-500 text-[11px]">{t.time}</span>
                      <span className="font-semibold text-slate-800">{t.event}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Work Health Stats & Disclaimer */}
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs space-y-3 text-xs">
            <h3 className="font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
              {selectedUser.name}'s Metrics
            </h3>

            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Logged Hours (This Week):</span>
              <span className="font-mono font-bold text-blue-600">{selectedUser.loggedHoursThisWeek}h</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">On-Time Delivery Rate:</span>
              <span className="font-mono font-bold text-emerald-600">{selectedUser.onTimeDeliveryRate}%</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Reopened Bugs:</span>
              <span className="font-mono font-bold text-slate-800">{selectedUser.reopenedBugsCount}</span>
            </div>
          </div>

          <div className="bg-blue-50/70 p-4 rounded-lg border border-blue-200 text-xs text-blue-900 space-y-1.5">
            <div className="font-bold flex items-center space-x-1">
              <ShieldAlert className="w-4 h-4 text-blue-600" />
              <span>Ethical Workload Notice</span>
            </div>
            <p className="text-[11px] text-blue-800 leading-relaxed">
              StandupFlow separates recorded work activity from estimated duration. Session metrics serve exclusively as supporting context for human manager review, not automated surveillance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
