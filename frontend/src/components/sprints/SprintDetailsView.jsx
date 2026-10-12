import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Zap,
  Calendar,
  CheckCircle2,
  Clock,
  TrendingDown,
  Users,
  Plus,
  Play,
  Check
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export const SprintDetailsView = () => {
  const {
    currentSprint,
    setCurrentSprint,
    sprints,
    tasks,
    currentProject,
    setIsCreateSprintModalOpen,
    navigateTo
  } = useApp();

  const sprintTasks = tasks.filter(t => t.sprintId === currentSprint?.id);

  // Mock burndown data for 14 days sprint
  const burndownData = [
    { day: 'Day 1', ideal: 45, actual: 45 },
    { day: 'Day 2', ideal: 42, actual: 45 },
    { day: 'Day 3', ideal: 38, actual: 43 },
    { day: 'Day 4', ideal: 35, actual: 40 },
    { day: 'Day 5', ideal: 31, actual: 36 },
    { day: 'Day 6', ideal: 28, actual: 32 },
    { day: 'Day 7', ideal: 24, actual: 28 },
    { day: 'Day 8', ideal: 21, actual: 25 },
    { day: 'Day 9', ideal: 18, actual: 20 },
    { day: 'Day 10', ideal: 14, actual: 16 },
    { day: 'Day 11', ideal: 11, actual: 13 },
    { day: 'Day 12', ideal: 7, actual: 13 },
    { day: 'Day 13', ideal: 3, actual: 13 },
    { day: 'Day 14', ideal: 0, actual: 13 }
  ];

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Top Header Controls */}
      <div id="sprint-details-header" className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-lg border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 border border-emerald-200">
              {currentSprint?.status || 'Active'}
            </span>
            <h1 className="text-xl font-bold text-slate-900">{currentSprint?.name || 'Sprint Details'}</h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">{currentSprint?.goal || 'Sprint Goals & Execution'}</p>
        </div>

        {sprints && sprints.length > 0 && (
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-slate-500">Active Sprint:</span>
            <select
              value={currentSprint?.id || ''}
              onChange={(e) => {
                const sp = sprints.find(s => String(s.id) === String(e.target.value));
                if (sp) setCurrentSprint(sp);
              }}
              className="bg-slate-50 border border-slate-200 text-xs font-semibold px-2.5 py-1.5 rounded-md outline-none focus:border-blue-500"
            >
              {sprints.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Main Grid: Burndown Chart & Sprint Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Burndown Chart (2 Columns) */}
        <div id="sprint-burndown-chart" className="lg:col-span-2 bg-white rounded-lg border border-slate-200 p-5 space-y-4 shadow-2xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <TrendingDown className="w-4 h-4 text-blue-600" />
                <span>Sprint Burndown Chart (Story Points Remaining)</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Compares ideal story point velocity against actual completed work</p>
            </div>
            <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded border border-blue-200">
              45 Initial Pts
            </span>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={burndownData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="day" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff', borderRadius: '6px', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
                <Line type="monotone" dataKey="ideal" name="Ideal Burndown" stroke="#94a3b8" strokeDasharray="5 5" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="actual" name="Actual Story Pts" stroke="#2563eb" strokeWidth={3} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sprint Summary & Team Allocation */}
        <div className="space-y-4">
          <div id="sprint-metrics-card" className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs space-y-3 text-xs">
            <h3 className="font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
              Sprint Metrics
            </h3>

            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Total Tasks:</span>
              <span className="font-mono font-bold text-slate-800">{sprintTasks.length}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Completed Tasks:</span>
              <span className="font-mono font-bold text-emerald-600">{sprintTasks.filter(t => t.status === 'Completed').length}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">In Progress / Review:</span>
              <span className="font-mono font-bold text-blue-600">{sprintTasks.filter(t => t.status !== 'Completed' && t.status !== 'Backlog').length}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Sprint Goal Completion:</span>
              <span className="font-mono font-bold text-blue-600">71%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
