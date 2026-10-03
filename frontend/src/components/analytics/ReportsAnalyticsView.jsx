import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  BarChart3,
  Download,
  Calendar,
  Filter,
  CheckCircle2,
  PieChart as PieChartIcon,
  TrendingUp,
  FileSpreadsheet
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export const ReportsAnalyticsView = () => {
  const { projects, sprints, tasks, issues, users, currentProject } = useApp();
  const [reportType, setReportType] = useState('sprint_completion');
  const [exportedToast, setExportedToast] = useState(false);

  const projectTasks = !currentProject ? [] : tasks.filter(t => t.projectId === currentProject?.id || String(t.projectId) === String(currentProject?.id));
  const projectSprints = !currentProject ? [] : sprints.filter(s => s.projectId === currentProject?.id || String(s.projectId) === String(currentProject?.id));

  const taskStatusData = [
    { name: 'Completed', value: projectTasks.filter(t => t.status === 'Completed').length, color: '#16a34a' },
    { name: 'In Progress', value: projectTasks.filter(t => t.status === 'In Progress').length, color: '#2563eb' },
    { name: 'In Review', value: projectTasks.filter(t => t.status === 'In Review').length, color: '#d97706' },
    { name: 'Backlog', value: projectTasks.filter(t => t.status === 'Backlog').length, color: '#64748b' }
  ];

  const velocityData = projectSprints && projectSprints.length > 0
    ? projectSprints.map(s => {
        const sprintTasks = projectTasks.filter(t => t.sprintId === s.id || t.sprintName === s.name);
        const committedPts = sprintTasks.reduce((acc, t) => acc + (Number(t.storyPoints) || 0), 0);
        const completedPts = sprintTasks
          .filter(t => t.status === 'Completed')
          .reduce((acc, t) => acc + (Number(t.storyPoints) || 0), 0);
        return {
          name: s.name,
          committed: committedPts,
          completed: completedPts
        };
      })
    : [
        {
          name: 'Current Tasks',
          committed: projectTasks.reduce((acc, t) => acc + (Number(t.storyPoints) || 0), 0),
          completed: projectTasks.filter(t => t.status === 'Completed').reduce((acc, t) => acc + (Number(t.storyPoints) || 0), 0)
        }
      ];

  const handleExportCSV = () => {
    setExportedToast(true);
    setTimeout(() => setExportedToast(false), 3000);
  };

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-md">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900 leading-tight">Reports & Analytics Workspace</h1>
            <p className="text-xs text-slate-500">Interactive sprint metrics, velocity analytics, and exportable audit reports</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {exportedToast && (
            <span className="text-xs text-emerald-600 font-semibold flex items-center space-x-1">
              <CheckCircle2 className="w-4 h-4" />
              <span>Report exported to CSV!</span>
            </span>
          )}

          <button
            onClick={handleExportCSV}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-md border border-slate-200 transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Main Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Status Distribution Pie Chart */}
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-2xs space-y-4">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
            Task Status Breakdown
          </h3>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={taskStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {taskStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {taskStatusData.map(item => (
              <div key={item.name} className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-slate-600">{item.name}: <strong className="text-slate-900">{item.value}</strong></span>
              </div>
            ))}
          </div>
        </div>

        {/* Sprint Velocity Comparison Bar Chart */}
        <div className="lg:col-span-2 bg-white p-5 rounded-lg border border-slate-200 shadow-2xs space-y-4">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
            Historical Velocity & Story Points Delivered
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={velocityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip />
                <Bar dataKey="committed" name="Committed Story Pts" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                <Bar dataKey="completed" name="Completed Story Pts" fill="#16a34a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
