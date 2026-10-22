import React from 'react';
import { useApp } from '../../context/AppContext';
import { UnassignedMemberBanner } from '../auth/UnassignedMemberBanner';
import {
  Layers,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowUpRight,
  Shield,
  Zap,
  FolderPlus,
  Edit3
} from 'lucide-react';

export const ProjectHealthDashboard = () => {
  const {
    projects = [],
    setCurrentProject,
    navigateTo,
    setIsCreateProjectModalOpen,
    openEditProjectModal,
    currentRole,
    tasks,
    isUserAdmin,
    canUserManageProjects,
    currentUser
  } = useApp();

  const canCreate = canUserManageProjects ? canUserManageProjects(currentUser) : false;
  const isSubUserUnassigned = !canCreate && (!projects || projects.length === 0);

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      <UnassignedMemberBanner />

      <div className={isSubUserUnassigned ? "space-y-6 pointer-events-none opacity-40 select-none" : "space-y-6"}>
      {/* Enterprise Workspace Initialization Prompt when 0 projects */}
      {projects.length === 0 && canCreate && (
        <div className="bg-gradient-to-r from-amber-50 via-blue-50 to-indigo-50 border border-amber-300/80 p-5 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 animate-in fade-in">
          <div className="flex items-start space-x-3.5">
            <div className="p-2.5 bg-amber-500 text-white rounded-xl shadow-xs shrink-0 mt-0.5">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-sm font-bold text-slate-900 tracking-tight">Organization Workspace Setup Required</h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-amber-400 text-slate-950 tracking-wider">
                  Action Required
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
                Welcome to StandupFlow! To unlock sprint management, team task queues, issue tracking, and launch your interactive console tour from Home, please create your first project.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsCreateProjectModalOpen(true)}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center space-x-2 shrink-0 cursor-pointer self-start md:self-auto"
          >
            <FolderPlus className="w-4 h-4" />
            <span>+ Create First Project</span>
          </button>
        </div>
      )}

      {/* Header */}
      <div id="projects-header" className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-md">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900 leading-tight">Project Health Console</h1>
            <p className="text-xs text-slate-500">Portfolio status, sprint completion percentages, open issue risks, and deadlines</p>
          </div>
        </div>

        {canCreate && (
          <button
            onClick={() => setIsCreateProjectModalOpen(true)}
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-xs shadow-2xs transition-colors flex items-center space-x-1.5 cursor-pointer self-start md:self-auto"
          >
            <FolderPlus className="w-4 h-4" />
            <span>Create Project</span>
          </button>
        )}
      </div>

      {/* Project Health Cards Grid */}
      <div id="projects-grid">
        {projects.length === 0 ? (
          <div className="bg-white p-12 rounded-xl border border-dashed border-amber-300 text-center space-y-4">
            <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto border border-amber-200 shadow-2xs">
              <FolderPlus className="w-7 h-7" />
            </div>
            <div className="max-w-md mx-auto">
              <h3 className="text-base font-bold text-slate-900">Initialize Your First Project Workspace</h3>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                StandupFlow requires at least one active project workspace to organize sprints, assign work items to team members, and unlock the navigation rail.
              </p>
            </div>
            {canCreate && (
              <button
                onClick={() => setIsCreateProjectModalOpen(true)}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-colors shadow-md inline-flex items-center space-x-2 cursor-pointer"
              >
                <FolderPlus className="w-4 h-4" />
                <span>Initialize Project Workspace</span>
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {projects.map(proj => (
          <div
            key={proj.id}
            onClick={() => {
              setCurrentProject(proj);
              if (currentRole === 'DEVELOPER') {
                navigateTo('developer_workspace');
              } else if (currentRole === 'TESTER') {
                navigateTo('tester_workspace');
              } else {
                navigateTo('dashboard');
              }
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

              <div className="flex items-center space-x-2">
                <span className={`px-2.5 py-1 rounded text-xs font-bold ${
                  proj.status === 'On Track' ? 'bg-emerald-100 text-emerald-800' :
                  proj.status === 'At Risk' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                }`}>
                  {proj.status}
                </span>
                {canCreate && (
                  <button
                    title="Edit Project Settings"
                    onClick={(e) => {
                      e.stopPropagation();
                      openEditProjectModal(proj);
                    }}
                    className="p-1 rounded text-slate-400 hover:text-blue-600 hover:bg-blue-50 border border-transparent hover:border-blue-200 transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
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
                <span className="font-mono font-bold text-emerald-600">
                  {(() => {
                    const projTasks = (tasks || []).filter(t => t.projectId === proj.id || String(t.projectId) === String(proj.id));
                    const totalCount = isUserAdmin() ? (proj.totalTasks || projTasks.length) : projTasks.length;
                    const doneCount = isUserAdmin() ? (proj.completedTasks || 0) : projTasks.filter(t => t.status === 'Completed').length;
                    return `${doneCount}/${totalCount}`;
                  })()}
                </span>
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
        )}
      </div>
      </div>
    </div>
  );
};
