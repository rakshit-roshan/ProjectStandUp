import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Layers,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowUpRight,
  Shield,
  Zap
} from 'lucide-react';

export const ProjectHealthDashboard = () => {
  const { projects, setCurrentProject, navigateTo } = useApp();

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-md">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900 leading-tight">Project Health Console</h1>
            <p className="text-xs text-slate-500">Portfolio status, sprint completion percentages, open issue risks, and deadlines</p>
          </div>
        </div>
      </div>

      {/* Project Health Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {projects.map(proj => (
          <div
            key={proj.id}
            onClick={() => {
              setCurrentProject(proj);
              navigateTo('dashboard');
            }}
            className="bg-white p-5 rounded-lg border border-slate-200 shadow-2xs hover:border-blue-400 cursor-pointer transition-all space-y-4"
          >
            {/* Top Bar */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2.5">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: proj.color }} />
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{proj.name}</h3>
                  <span className="text-[10px] font-mono text-slate-400">{proj.code} • Lead: {proj.lead}</span>
                </div>
              </div>

              <span className={`px-2.5 py-1 rounded text-xs font-bold ${
                proj.status === 'On Track' ? 'bg-emerald-100 text-emerald-800' :
                proj.status === 'At Risk' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
              }`}>
                {proj.status}
              </span>
            </div>

            <p className="text-xs text-slate-600 line-clamp-2">{proj.description}</p>

            {/* Metrics */}
            <div className="grid grid-cols-4 gap-2 bg-slate-50 p-3 rounded border border-slate-200 text-xs text-center">
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Sprint Progress</span>
                <span className="font-mono font-bold text-blue-600">{proj.sprintCompletion}%</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Tasks Done</span>
                <span className="font-mono font-bold text-emerald-600">{proj.completedTasks}/{proj.totalTasks}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Open Issues</span>
                <span className="font-mono font-bold text-red-600">{proj.openIssues}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Overdue</span>
                <span className="font-mono font-bold text-slate-700">{proj.overdueTasks}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
