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
  AlertTriangle,
  Activity,
  CheckSquare,
  Zap
} from 'lucide-react';

export const EmployeeHealthDashboard = () => {
  const { workSessions = [], users = [], currentUser } = useApp();

  // Populate users strictly from database records or current authenticated user
  const displayUsers = (users && users.length > 0) ? users : (currentUser ? [currentUser] : []);
  const [selectedUserId, setSelectedUserId] = useState(displayUsers[0]?.id || currentUser?.id || '');

  const selectedUser = displayUsers.find(u => String(u.id) === String(selectedUserId)) || displayUsers[0] || currentUser;

  // Filter actual work sessions from state
  const safeWorkSessions = workSessions || [];
  const userSessions = safeWorkSessions.filter(w => 
    w && (String(w.userId) === String(selectedUser?.id) || w.userName === selectedUser?.name || w.userName === selectedUser?.fullname)
  );

  const displayName = selectedUser?.fullname || selectedUser?.name || selectedUser?.username || 'User';
  const displayRole = selectedUser?.role || 'Member';
  const displayDepartment = selectedUser?.department || 'Engineering';

  // Compute real metrics directly from selectedUser object
  const loggedHours = selectedUser?.loggedHoursThisWeek ?? 0;
  const onTimeRate = selectedUser?.onTimeDeliveryRate ?? 100;
  const reopenedBugs = selectedUser?.reopenedBugsCount ?? 0;
  const assignedTasks = selectedUser?.assignedTasksCount ?? 0;
  const completedTasks = selectedUser?.completedTasksCount ?? 0;
  const workloadStatus = selectedUser?.workload || 'Balanced';
  const isOnline = Boolean(selectedUser?.isOnline);

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
            <p className="text-xs text-slate-500">Real-time database performance metrics, task velocity, and attendance logs</p>
          </div>
        </div>

        {/* User Selector Dropdown (Populated strictly from DB Users) */}
        {displayUsers.length > 0 && (
          <div className="flex items-center space-x-2 bg-slate-50 p-1.5 rounded-md border border-slate-200 text-xs">
            <User className="w-3.5 h-3.5 text-slate-400 ml-1" />
            <select
              value={selectedUser?.id || ''}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-800 outline-none pr-2 cursor-pointer"
            >
              {displayUsers.map(u => (
                <option key={u.id} value={u.id}>
                  {u.fullname || u.name || u.username} ({u.role || 'Member'})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Real Recorded Work Sessions or Empty State */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-sm font-bold text-slate-900">{displayName}'s Recorded Work Log</h2>
                <p className="text-xs text-slate-500 mt-0.5">Department: {displayDepartment} • Role: {displayRole}</p>
              </div>
              <span className={`px-2.5 py-1 font-semibold rounded text-xs border ${
                isOnline 
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                  : 'bg-slate-100 text-slate-600 border-slate-200'
              }`}>
                {isOnline ? '● Online Active' : 'Offline'}
              </span>
            </div>

            {userSessions.length > 0 ? (
              <div className="space-y-4">
                {userSessions.map((session, sIdx) => (
                  <div key={sIdx} className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-3 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">Session Date: {session.date || 'Today'}</span>
                      <span className="text-slate-500 font-mono">Project: {session.activeProject || 'Core Project'}</span>
                    </div>

                    <div className="grid grid-cols-4 gap-2 bg-white p-3 rounded border border-slate-200 font-mono text-center">
                      <div>
                        <span className="text-slate-400 block text-[9px] uppercase font-bold">Login</span>
                        <span className="font-bold text-slate-800">{session.loginTime || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[9px] uppercase font-bold">Logout</span>
                        <span className="font-bold text-slate-800">{session.logoutTime || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[9px] uppercase font-bold">Duration</span>
                        <span className="font-bold text-slate-800">{session.sessionDuration || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[9px] uppercase font-bold">Productive</span>
                        <span className="font-bold text-emerald-600">{session.verifiedProductiveHours || 'N/A'}</span>
                      </div>
                    </div>

                    {session.timeline && session.timeline.length > 0 && (
                      <div className="space-y-2 pt-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Session Activity Stream</span>
                        <div className="border-l-2 border-slate-200 pl-3 space-y-2 ml-1">
                          {session.timeline.map((t, idx) => (
                            <div key={idx} className="flex items-center space-x-2 text-xs">
                              <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                              <span className="font-mono text-slate-500 text-[11px]">{t.time}</span>
                              <span className="text-slate-800 font-medium">{t.event}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 px-4 text-center border-2 border-dashed border-slate-200 rounded-lg bg-slate-50/50 space-y-3">
                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">No Work Session Logs Recorded</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    There are no recorded attendance or work session logs for <strong>{displayName}</strong> in this tenant database yet.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Real Database Metrics for Selected User */}
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-2xs space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 uppercase tracking-wider text-xs">
                {displayName}'s Real Metrics
              </h3>
              <span className="text-[10px] font-mono text-slate-400">DB Tenant Record</span>
            </div>

            <div className="space-y-2.5">
              <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                <span className="text-slate-500 flex items-center space-x-1.5">
                  <Clock className="w-3.5 h-3.5 text-blue-500" />
                  <span>Logged Hours (This Week):</span>
                </span>
                <span className="font-mono font-bold text-blue-600 text-sm">{loggedHours}h</span>
              </div>

              <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                <span className="text-slate-500 flex items-center space-x-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                  <span>On-Time Delivery Rate:</span>
                </span>
                <span className="font-mono font-bold text-emerald-600 text-sm">{onTimeRate}%</span>
              </div>

              <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                <span className="text-slate-500 flex items-center space-x-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                  <span>Reopened Bugs Count:</span>
                </span>
                <span className="font-mono font-bold text-slate-800 text-sm">{reopenedBugs}</span>
              </div>

              <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                <span className="text-slate-500 flex items-center space-x-1.5">
                  <CheckSquare className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Assigned Tasks:</span>
                </span>
                <span className="font-mono font-bold text-slate-800 text-sm">{assignedTasks}</span>
              </div>

              <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                <span className="text-slate-500 flex items-center space-x-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Completed Tasks:</span>
                </span>
                <span className="font-mono font-bold text-slate-800 text-sm">{completedTasks}</span>
              </div>

              <div className="flex justify-between items-center py-1.5">
                <span className="text-slate-500 flex items-center space-x-1.5">
                  <Activity className="w-3.5 h-3.5 text-cyan-500" />
                  <span>Current Workload:</span>
                </span>
                <span className="font-semibold text-slate-800 px-2 py-0.5 bg-slate-100 rounded text-[11px] border border-slate-200">
                  {workloadStatus}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-xs text-slate-600 space-y-1">
            <div className="font-bold text-slate-800 flex items-center space-x-1.5">
              <ShieldAlert className="w-4 h-4 text-blue-600" />
              <span>Database Telemetry Notice</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              All metrics above are populated from the active tenant database (<code className="font-mono text-slate-700">tblUser_metrics</code>).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
