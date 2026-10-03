import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Activity,
  Users,
  CheckCircle2,
  Clock,
  AlertTriangle,
  UserCheck,
  TrendingUp,
  Filter
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const TeamMonitorDashboard = () => {
  const { currentUser, users, tasks, workSessions, currentProject, getProjectMembers } = useApp();

  const teamMembers = currentProject
    ? getProjectMembers(currentProject)
    : (currentUser?.managerCode ? users.filter(u => u.managerCode === currentUser.managerCode) : users);

  const completedTodayCount = tasks.filter(t => t.status === 'Completed').length;

  const workloadChartData = teamMembers.map(u => ({
    name: u.name ? u.name.split(' ')[0] : 'User',
    assigned: u.assignedTasksCount || tasks.filter(t => t.assigneeId === u.id || t.assigneeName === u.name).length,
    completed: u.completedTasksCount || tasks.filter(t => (t.assigneeId === u.id || t.assigneeName === u.name) && t.status === 'Completed').length
  }));

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-md">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900 leading-tight">Team Activity & Workload Monitor</h1>
            <p className="text-xs text-slate-500">Real-time team distribution, workload balancing, and live operational activity log</p>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs">
          <div className="text-xs text-slate-500 font-medium">Total Team</div>
          <div className="text-2xl font-bold text-slate-900 mt-1 tabular-nums">{teamMembers.length}</div>
        </div>
        <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs">
          <div className="text-xs text-slate-500 font-medium">Active Today</div>
          <div className="text-2xl font-bold text-emerald-600 mt-1 tabular-nums">{teamMembers.length}</div>
        </div>
        <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs">
          <div className="text-xs text-slate-500 font-medium">Assigned Tasks</div>
          <div className="text-2xl font-bold text-blue-600 mt-1 tabular-nums">{tasks.length}</div>
        </div>
        <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs">
          <div className="text-xs text-slate-500 font-medium">Completed Today</div>
          <div className="text-2xl font-bold text-emerald-600 mt-1 tabular-nums">{completedTodayCount}</div>
        </div>
        <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs">
          <div className="text-xs text-slate-500 font-medium">In Progress</div>
          <div className="text-2xl font-bold text-indigo-600 mt-1 tabular-nums">{tasks.filter(t => t.status === 'In Progress').length}</div>
        </div>
        <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs">
          <div className="text-xs text-slate-500 font-medium">Awaiting Review</div>
          <div className="text-2xl font-bold text-amber-600 mt-1 tabular-nums">{tasks.filter(t => t.status === 'In Review').length}</div>
        </div>
      </div>

      {/* Main Grid: Workload Table & Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Team Workload Table (2 Columns) */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Team Member Workload Metrics</h2>
            <span className="text-xs text-slate-400">Sorted by workload status</span>
          </div>

          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold border-b border-slate-200">
              <tr>
                <th className="p-3">Employee</th>
                <th className="p-3">Role</th>
                <th className="p-3 text-center">Assigned</th>
                <th className="p-3 text-center">Completed</th>
                <th className="p-3 text-center">In Review</th>
                <th className="p-3 text-center">Workload State</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {teamMembers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-4 text-center text-slate-400 text-xs">
                    No team members joined yet. Invite members by email in Settings.
                  </td>
                </tr>
              ) : (
                teamMembers.map(user => (
                  <tr key={user.id} className="hover:bg-slate-50">
                    <td className="p-3">
                      <div className="flex items-center space-x-2">
                        <img src={user.avatar} alt={user.name} className="w-6 h-6 rounded-full object-cover" />
                        <span className="font-semibold text-slate-900">{user.name}</span>
                      </div>
                    </td>
                    <td className="p-3 font-medium text-slate-600 capitalize">{user.role ? user.role.toLowerCase() : 'member'}</td>
                    <td className="p-3 text-center font-mono font-semibold">{user.assignedTasksCount || tasks.filter(t => t.assigneeId === user.id || t.assigneeName === user.name).length}</td>
                    <td className="p-3 text-center font-mono text-emerald-600 font-semibold">{user.completedTasksCount || tasks.filter(t => (t.assigneeId === user.id || t.assigneeName === user.name) && t.status === 'Completed').length}</td>
                    <td className="p-3 text-center font-mono text-amber-600 font-semibold">{user.pendingReviewsCount || tasks.filter(t => (t.assigneeId === user.id || t.assigneeName === user.name) && t.status === 'In Review').length}</td>
                    <td className="p-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        user.workload === 'Overloaded' ? 'bg-red-100 text-red-700' :
                        user.workload === 'High' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {user.workload || 'Balanced'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Work Distribution Bar Chart */}
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs space-y-3">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
            Task Allocation by Member
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={workloadChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={10} />
                <YAxis stroke="#64748b" fontSize={10} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', color: '#fff', fontSize: '11px' }} />
                <Bar dataKey="assigned" name="Assigned Tasks" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
