import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import welcomeBg from '../../assets/WelcomeCardback.png';
import { UnassignedMemberBanner } from '../auth/UnassignedMemberBanner';
import {
  FileText,
  CheckCircle2,
  Zap,
  UserCheck,
  AlertTriangle,
  Calendar,
  Layers,
  ArrowRight,
  MoreVertical,
  ChevronUp,
  ChevronDown,
  Clock,
  RotateCcw,
  Sparkles,
  Lightbulb,
  X,
  Edit3,
  Trash2,
  Flame,
  BarChart3,
  Package,
  Users,
  Activity,
  Shield,
  Plus
} from 'lucide-react';

export const ManagerDashboard = () => {
  const {
    currentUser,
    projects,
    currentProject,
    setCurrentProject,
    sprints,
    currentSprint,
    setCurrentSprint,
    tasks,
    issues,
    users,
    navigateTo,
    setIsCreateTaskModalOpen,
    setIsCreateSprintModalOpen,
    openEditTaskModal,
    deleteTask,
    getProjectMembers
  } = useApp();

  const [isProTipVisible, setIsProTipVisible] = useState(true);
  const [expandedSprintIds, setExpandedSprintIds] = useState(() =>
    sprints.length > 0 ? [sprints[0].id] : []
  );

  const toggleSprintExpanded = (sprintId) => {
    if (expandedSprintIds.includes(sprintId)) {
      setExpandedSprintIds(expandedSprintIds.filter(id => id !== sprintId));
    } else {
      setExpandedSprintIds([...expandedSprintIds, sprintId]);
    }
  };

  // Strict Project Workspace Isolation
  const projectTasks = !currentProject ? [] : tasks.filter(t => t.projectId === currentProject?.id || String(t.projectId) === String(currentProject?.id));
  const projectSprints = !currentProject ? [] : sprints.filter(s => s.projectId === currentProject?.id || String(s.projectId) === String(currentProject?.id));
  const projectIssues = !currentProject ? [] : issues.filter(i => i.projectId === currentProject?.id || String(i.projectId) === String(currentProject?.id));

  // Dynamic Metrics Computation for Active Workspace
  const activeTasks = projectTasks.filter(t => t.status !== 'Completed');
  const completedTasks = projectTasks.filter(t => t.status === 'Completed');
  const inProgressTasks = projectTasks.filter(t => t.status === 'In Progress');
  const inReviewTasks = projectTasks.filter(t => t.status === 'In Review');
  const backlogTasks = projectTasks.filter(t => t.status === 'Backlog');
  const openIssues = projectIssues.filter(i => i.state !== 'Done');

  const activeSprint = projectSprints.length > 0 ? projectSprints[0] : null;
  const totalSprintTasks = projectTasks.filter(t => t.sprintId === activeSprint?.id || t.sprintName === activeSprint?.name);
  const completedSprintTasks = totalSprintTasks.filter(t => t.status === 'Completed');
  const sprintCompletionRate = totalSprintTasks.length > 0
    ? Math.round((completedSprintTasks.length / totalSprintTasks.length) * 100)
    : 0;

  // Total story points computation
  const totalStoryPoints = projectTasks.reduce((acc, t) => acc + (Number(t.storyPoints) || 0), 0);

  // Helper for dynamic relative time calculation
  const getRelativeTimeString = (dateInput) => {
    if (!dateInput) return 'Recently';
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return typeof dateInput === 'string' ? dateInput : 'Recently';

    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    if (diffMs < 0) return 'Just now';

    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;

    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 30) return `${diffDays} days ago`;

    return date.toLocaleDateString();
  };

  // Helper to render multiple assignees avatar stack
  const renderAssigneeStack = (task) => {
    let list = [];
    if (task.assigneeIds && Array.isArray(task.assigneeIds) && task.assigneeIds.length > 0) {
      list = users.filter(u => task.assigneeIds.includes(u.id));
    } else if (task.assigneeId) {
      const ids = String(task.assigneeId).split(',').map(s => s.trim());
      list = users.filter(u => ids.includes(u.id));
    }
    if (list.length === 0) {
      list = [{
        id: '1',
        name: task.assigneeName || 'Unassigned',
        avatar: task.assigneeAvatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80'
      }];
    }

    return (
      <div className="flex items-center -space-x-1.5 overflow-hidden" title={list.map(u => u.name).join(', ')}>
        {list.map((u, i) => (
          <img
            key={u.id || i}
            src={u.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80'}
            alt={u.name}
            className="inline-block h-6 w-6 rounded-full ring-2 ring-white object-cover"
          />
        ))}
      </div>
    );
  };

  // Scope team members strictly to active project workspace members
  const teamMembersList = getProjectMembers(currentProject).filter(u => u.id !== currentUser?.id);

  // Dynamic activity sequence calculated strictly from active project workspace tasks & sprint
  const lastProjectTask = projectTasks.length > 0 ? projectTasks[0] : null;
  const recentActivities = !currentProject || projectTasks.length === 0 ? [] : [
    {
      id: 'act-1',
      user: lastProjectTask?.assigneeName || currentUser?.name || 'Lead',
      action: lastProjectTask ? 'updated task' : 'accessed project workspace',
      taskId: lastProjectTask?.id || null,
      taskStatus: lastProjectTask ? `(${lastProjectTask.status})` : null,
      time: getRelativeTimeString(lastProjectTask?.updatedAt || lastProjectTask?.startDate || new Date().toISOString()),
      isLatest: true,
      color: 'blue'
    },
    {
      id: 'act-2',
      action: activeSprint ? `${activeSprint.name} created` : `Sprint initialized for ${currentProject?.name}`,
      time: getRelativeTimeString(activeSprint?.startDate || new Date().toISOString()),
      isLatest: false,
      color: 'green'
    },
    {
      id: 'act-3',
      action: `${currentProject?.name} initialized`,
      time: getRelativeTimeString(currentProject?.startDate || new Date().toISOString()),
      isLatest: false,
      color: 'green'
    }
  ];

  return (
    <div className="space-y-6 pb-8 max-w-[1600px] mx-auto">
      <UnassignedMemberBanner />
      {/* 1. Welcome Hero Banner matching newdesign.png without emojis */}
      <div
        style={{
          backgroundImage: `url(${welcomeBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
        className="rounded-2xl p-6 md:p-8 relative overflow-hidden border border-blue-100/60 shadow-xs flex items-center justify-between"
      >
        <div className="space-y-3 z-10 max-w-2xl">
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
              Welcome back, {currentUser?.name || 'man'}!
            </h1>
          </div>
          <p className="text-sm text-slate-600 font-medium">
            Here's what's happening with your projects today.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <div className="flex items-center space-x-2 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-200/80 shadow-2xs text-xs font-semibold text-slate-800">
              <Calendar className="w-3.5 h-3.5 text-blue-600" />
              <span>{activeSprint?.name || 'No Active Sprint'}</span>
            </div>

            <div className="flex items-center space-x-2 bg-blue-50/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-blue-200/80 text-xs font-semibold text-blue-700">
              <Shield className="w-3.5 h-3.5 text-blue-600" />
              <span>Engineering Manager</span>
            </div>
          </div>
        </div>

        {/* Right side quote */}
        <div className="hidden lg:flex items-center space-x-6 z-10">
          <div className="text-right" style={{ marginRight: '168px' }}>
            <p className="text-sm font-semibold text-slate-600 italic">
              "Good software builds great teams."
            </p>
          </div>
        </div>
      </div>

      {/* 2. 6 Summary Metric Cards Grid matching newdesign.png */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Card 1: Active Tasks */}
        <div className="bg-gradient-to-br from-blue-50/60 via-white to-white p-4 rounded-xl border border-blue-100 shadow-2xs hover:shadow-xs transition-all">
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-lg bg-blue-100/80 flex items-center justify-center text-blue-600">
              <FileText className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-slate-600">Active Tasks</span>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-bold text-slate-900 tabular-nums">
              {activeTasks.length}
            </span>
            <div className="flex items-center justify-between mt-1 text-[11px]">
              <span className="text-blue-600 font-semibold">{projectTasks.length > 0 ? Math.round((activeTasks.length / projectTasks.length) * 100) : 0}% of total</span>
              <span className="text-emerald-600 font-bold">+0%</span>
            </div>
          </div>
        </div>

        {/* Card 2: Completed */}
        <div className="bg-gradient-to-br from-emerald-50/60 via-white to-white p-4 rounded-xl border border-emerald-100 shadow-2xs hover:shadow-xs transition-all">
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-lg bg-emerald-100/80 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-slate-600">Completed</span>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-bold text-slate-900 tabular-nums">
              {completedTasks.length}
            </span>
            <div className="flex items-center justify-between mt-1 text-[11px]">
              <span className="text-slate-400 font-medium">Done</span>
              <span className="text-emerald-600 font-bold">+0%</span>
            </div>
          </div>
        </div>

        {/* Card 3: In Progress */}
        <div className="bg-gradient-to-br from-purple-50/60 via-white to-white p-4 rounded-xl border border-purple-100 shadow-2xs hover:shadow-xs transition-all">
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-lg bg-purple-100/80 flex items-center justify-center text-purple-600">
              <Zap className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-slate-600">In Progress</span>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-bold text-slate-900 tabular-nums">
              {inProgressTasks.length}
            </span>
            <div className="flex items-center justify-between mt-1 text-[11px]">
              <span className="text-purple-600 font-semibold">On track</span>
            </div>
          </div>
        </div>

        {/* Card 4: Pending Review */}
        <div className="bg-gradient-to-br from-amber-50/60 via-white to-white p-4 rounded-xl border border-amber-100 shadow-2xs hover:shadow-xs transition-all">
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-lg bg-amber-100/80 flex items-center justify-center text-amber-600">
              <UserCheck className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-slate-600">Pending Review</span>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-bold text-slate-900 tabular-nums">
              {inReviewTasks.length}
            </span>
            <div className="flex items-center justify-between mt-1 text-[11px]">
              <span className="text-amber-600 font-semibold">Needs QA</span>
            </div>
          </div>
        </div>

        {/* Card 5: Open Issues */}
        <div className="bg-gradient-to-br from-red-50/60 via-white to-white p-4 rounded-xl border border-red-100 shadow-2xs hover:shadow-xs transition-all">
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-lg bg-red-100/80 flex items-center justify-center text-red-600">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-slate-600">Open Issues</span>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-bold text-slate-900 tabular-nums">
              {openIssues.length}
            </span>
            <div className="flex items-center justify-between mt-1 text-[11px]">
              <span className="text-red-600 font-semibold">0 Critical</span>
            </div>
          </div>
        </div>

        {/* Card 6: Sprint Progress */}
        <div className="bg-gradient-to-br from-blue-50/60 via-white to-white p-4 rounded-xl border border-blue-100 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-lg bg-blue-100/80 flex items-center justify-center text-blue-600">
              <Calendar className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-slate-600">Sprint Progress</span>
          </div>

          <div className="flex items-center space-x-3 mt-2">
            <div className="relative w-11 h-11 flex items-center justify-center shrink-0">
              <svg className="w-11 h-11 transform -rotate-90">
                <circle cx="22" cy="22" r="18" stroke="#e2e8f0" strokeWidth="3.5" fill="transparent" />
                <circle
                  cx="22"
                  cy="22"
                  r="18"
                  stroke="#2563eb"
                  strokeWidth="3.5"
                  fill="transparent"
                  strokeDasharray="113"
                  strokeDashoffset={113 - (113 * sprintCompletionRate) / 100}
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute text-[11px] font-bold text-blue-600">{sprintCompletionRate}%</span>
            </div>
            <div>
              <div className="text-xs font-bold text-slate-800 line-clamp-1">{activeSprint?.name || 'No Active Sprint'}</div>
              <div className="text-[10px] text-slate-500 line-clamp-1">{activeSprint?.goal || 'No Active Goal'}</div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Main Split Section (2 Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN (Wider, ~68% width) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Sprint Overview Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="space-y-1">
                <div className="flex items-center space-x-2.5">
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center space-x-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span>{activeSprint?.status || 'PLANNING'}</span>
                  </span>
                  <h2 className="text-lg font-bold text-slate-900">
                    {activeSprint?.name || 'No Active Sprint'}
                  </h2>
                </div>
                <p className="text-xs text-slate-500">
                  {activeSprint?.goal || 'No active sprint goal set for this project workspace.'}
                </p>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={() => navigateTo('sprints')}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center space-x-1"
                >
                  <span>Sprint Details</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button className="p-1 rounded text-slate-400 hover:text-slate-600">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Sprint Progress Bar */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-2">
                <span className="text-slate-700">Sprint Workload Completion</span>
                <span className="text-blue-600 tabular-nums">
                  {completedSprintTasks.length} of {totalSprintTasks.length} Tasks ({sprintCompletionRate}%)
                </span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden flex">
                <div
                  className="bg-blue-600 h-full transition-all duration-500 rounded-full"
                  style={{ width: `${sprintCompletionRate}%` }}
                />
              </div>
            </div>

            {/* 4 Workflow Stage Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
              {/* BACKLOG */}
              <div
                onClick={() => navigateTo('tasks_kanban')}
                className="bg-slate-50/80 p-3.5 rounded-lg border border-slate-200/80 hover:bg-slate-100/80 cursor-pointer transition-colors"
              >
                <div className="flex items-center space-x-1.5 text-[11px] font-bold text-slate-500 uppercase">
                  <FileText className="w-3.5 h-3.5 text-slate-400" />
                  <span>BACKLOG</span>
                </div>
                <div className="text-2xl font-bold text-slate-900 mt-2 tabular-nums">
                  {backlogTasks.length}
                </div>
              </div>

              {/* IN PROGRESS */}
              <div
                onClick={() => navigateTo('tasks_kanban')}
                className="bg-blue-50/40 p-3.5 rounded-lg border border-blue-100 hover:bg-blue-50/70 cursor-pointer transition-colors"
              >
                <div className="flex items-center space-x-1.5 text-[11px] font-bold text-blue-600 uppercase">
                  <RotateCcw className="w-3.5 h-3.5 text-blue-500" />
                  <span>IN PROGRESS</span>
                </div>
                <div className="text-2xl font-bold text-slate-900 mt-2 tabular-nums">
                  {inProgressTasks.length}
                </div>
              </div>

              {/* IN REVIEW */}
              <div
                onClick={() => navigateTo('tasks_kanban')}
                className="bg-amber-50/40 p-3.5 rounded-lg border border-amber-100 hover:bg-amber-50/70 cursor-pointer transition-colors"
              >
                <div className="flex items-center space-x-1.5 text-[11px] font-bold text-amber-600 uppercase">
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                  <span>IN REVIEW</span>
                </div>
                <div className="text-2xl font-bold text-slate-900 mt-2 tabular-nums">
                  {inReviewTasks.length}
                </div>
              </div>

              {/* COMPLETED */}
              <div
                onClick={() => navigateTo('tasks_kanban')}
                className="bg-emerald-50/40 p-3.5 rounded-lg border border-emerald-100 hover:bg-emerald-50/70 cursor-pointer transition-colors"
              >
                <div className="flex items-center space-x-1.5 text-[11px] font-bold text-emerald-600 uppercase">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>COMPLETED</span>
                </div>
                <div className="text-2xl font-bold text-slate-900 mt-2 tabular-nums">
                  {completedTasks.length}
                </div>
              </div>
            </div>
          </div>

          {/* Top Priority Tasks Table matching newdesign.png without emojis */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <Flame className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-bold text-slate-900">Top Priority Tasks</h3>
              </div>
              <button
                onClick={() => navigateTo('tasks_kanban')}
                className="text-xs text-blue-600 font-semibold hover:underline flex items-center space-x-1"
              >
                <span>View Kanban Board</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                    <th className="py-2.5 px-3">#</th>
                    <th className="py-2.5 px-3">Task</th>
                    <th className="py-2.5 px-3">Priority</th>
                    <th className="py-2.5 px-3">Points</th>
                    <th className="py-2.5 px-3">Assignee</th>
                    <th className="py-2.5 px-3">Assigned By</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {projectTasks.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="py-6 text-center text-slate-400 text-xs">
                        No tasks in project "{currentProject?.name}". Click "+ New Task" to create task for this workspace.
                      </td>
                    </tr>
                  ) : (
                    projectTasks.map((task, index) => (
                      <tr
                        key={task.id}
                        onClick={() => navigateTo('task_details', task.id)}
                        className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                      >
                        <td className="py-3 px-3 text-slate-400 font-mono text-[11px]">{index + 1}</td>
                        <td className="py-3 px-3">
                          <div className="font-bold text-blue-600 font-mono text-[11px] inline-block mr-2">{task.id}</div>
                          <span className="font-semibold text-slate-800">{task.title || 'gvfg'}</span>
                        </td>
                        <td className="py-3 px-3">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                            task.priority === 'Critical' ? 'bg-red-100 text-red-700' :
                            task.priority === 'High' ? 'bg-amber-100 text-amber-700' :
                            'bg-amber-50 text-amber-800 border border-amber-200'
                          }`}>
                            {task.priority || 'Medium'}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[11px] font-mono">
                            {task.storyPoints || 3} pts
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          {renderAssigneeStack(task)}
                        </td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                            {task.reporterName || 'Manager'}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200 flex items-center space-x-1 w-max">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                            <span>{task.status || 'Backlog'}</span>
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end space-x-1">
                            <button
                              title="Edit / Reassign Task"
                              onClick={(e) => {
                                e.stopPropagation();
                                openEditTaskModal(task);
                              }}
                              className="p-1.5 rounded hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              title="Delete Task"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (window.confirm(`Are you sure you want to delete task ${task.id}?`)) {
                                  deleteTask(task.id);
                                }
                              }}
                              className="p-1.5 rounded hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* All Sprints & Task Breakdown Accordion */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <BarChart3 className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">All Sprints & Task Breakdown</h3>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-xs text-slate-500 font-mono">{projectSprints.length} Sprints</span>
              </div>
            </div>

            <div className="space-y-3">
              {projectSprints.length === 0 ? (
                <div className="p-6 text-center text-slate-400 text-xs">
                  No sprints created for "{currentProject?.name}". Click "+ New Task" or create a sprint to get started.
                </div>
              ) : (
                projectSprints.map((sprint) => {
                  const sId = sprint?.id || 'SPR-01';
                  const isExpanded = expandedSprintIds.includes(sId);
                  const sTasks = projectTasks.filter(t => t.sprintId === sId || t.sprintName === sprint?.name);
                const doneCount = sTasks.filter(t => t.status === 'Completed').length;
                const rate = sTasks.length > 0 ? Math.round((doneCount / sTasks.length) * 100) : 0;

                return (
                  <div key={sId} className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
                    <div
                      onClick={() => toggleSprintExpanded(sId)}
                      className="p-4 bg-slate-50/80 hover:bg-slate-100/80 cursor-pointer flex items-center justify-between transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-slate-500" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-slate-500" />
                        )}
                        <div className="flex items-center space-x-2.5">
                          <Package className="w-4 h-4 text-slate-500" />
                          <span className="font-bold text-slate-900 text-xs">
                            {sprint?.name || 'Sprint Cycle'}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-slate-200 text-slate-700">
                            {sprint?.status || 'PLANNING'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4 text-xs">
                        <span className="text-[11px] font-mono text-slate-500 hidden sm:inline">
                          {doneCount}/{sTasks.length} Done ({rate}%)
                        </span>

                        <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden hidden md:block">
                          <div className="bg-blue-600 h-full rounded-full" style={{ width: `${rate}%` }} />
                        </div>

                        <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-[11px] font-semibold border border-blue-100 font-mono">
                          {sTasks.reduce((acc, t) => acc + (Number(t.storyPoints) || 0), 0)} pts
                        </span>

                        <button className="p-1 rounded text-slate-400 hover:text-slate-600">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="divide-y divide-slate-100 bg-white p-2">
                        {sTasks.length === 0 ? (
                          <div className="p-3 text-center text-slate-400 text-xs">
                            No tasks assigned to this sprint yet.
                          </div>
                        ) : (
                          sTasks.map(task => (
                            <div key={task.id} className="p-2.5 hover:bg-slate-50 flex items-center justify-between text-xs rounded-md">
                              <div className="flex items-center space-x-2.5">
                                <span className="font-mono text-[11px] font-bold text-blue-600">{task.id}</span>
                                <span className="font-semibold text-slate-800">{task.title}</span>
                              </div>
                              <div className="flex items-center space-x-3">
                                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                                  {task.status}
                                </span>
                                <span className="text-slate-500 font-mono text-[11px]">{task.storyPoints} pts</span>
                                {renderAssigneeStack(task)}
                                <div className="flex items-center space-x-1 pl-2 border-l border-slate-200">
                                  <button
                                    title="Edit / Reassign Task"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      openEditTaskModal(task);
                                    }}
                                    className="p-1 rounded text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    title="Delete Task"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (window.confirm(`Are you sure you want to delete task ${task.id}?`)) {
                                        deleteTask(task.id);
                                      }
                                    }}
                                    className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                );
              }))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (Narrower, ~32% width) */}
        <div className="space-y-6">
          {/* Team Member Workload Card with Online/Offline Status */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900">Team Member Workload</h3>
              </div>
              <button
                onClick={() => navigateTo('monitor')}
                className="text-xs text-blue-600 font-semibold hover:underline flex items-center space-x-1"
              >
                <span>Workload Monitor</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-4">
              {teamMembersList.length === 0 ? (
                <div className="py-4 text-center text-slate-400 text-xs">
                  No other team members in "{currentProject?.name}". Invite members via Settings or assign tasks to add them to this workspace roster.
                </div>
              ) : (
                teamMembersList.map((member) => {
                  const isMemberOnline = member.id === currentUser?.id || member.isOnline === true;
                  const projectAssignedTasksCount = projectTasks.filter(t => String(t.assigneeId) === String(member.id) || t.assigneeName === member.name).length;
                  return (
                    <div key={member.id} className="flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <img
                            src={member.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80'}
                            alt={member.name}
                            className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200"
                          />
                          {/* Recorded Online / Offline Status Dot */}
                          <span
                            title={isMemberOnline ? "Online" : "Offline"}
                            className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ring-2 ring-white ${
                              isMemberOnline ? 'bg-emerald-500' : 'bg-slate-300'
                            }`}
                          />
                        </div>

                        <div>
                          <div className="font-bold text-slate-900 leading-tight">{member.name}</div>
                          <div className="text-[11px] text-slate-400 capitalize">{member.role}</div>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          {member.workload || 'Balanced'}
                        </span>
                        <div className="text-[10px] text-slate-400 mt-0.5 font-medium">
                          {projectAssignedTasksCount} tasks assigned
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Recent Sprint Activity Card (Sequence Wise Work Done) */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <Activity className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">Recent Sprint Activity</h3>
              </div>
              <button className="text-xs text-blue-600 font-semibold hover:underline flex items-center space-x-1">
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Vertical Connecting Line Timeline Sequence (Pixel-perfect centered at 12px) */}
            <div className="relative pl-6 space-y-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-200">
              {recentActivities.map((act) => (
                <div key={act.id} className="relative text-xs flex items-start justify-between">
                  {/* Timeline Dot Node (Center aligned at 12px) */}
                  <span className={`absolute left-[-18px] top-1 w-3 h-3 rounded-full ring-4 ring-white ${
                    act.isLatest
                      ? 'bg-blue-600 ring-blue-100'
                      : 'bg-emerald-500 ring-emerald-50'
                  }`} />

                  <div className="space-y-0.5 pr-2">
                    <p className="text-slate-800 font-medium leading-snug">
                      {act.user && <strong className="font-bold">{act.user} </strong>}
                      {act.action}{' '}
                      {act.taskId && (
                        <span className="font-mono font-bold text-blue-600 hover:underline">
                          {act.taskId}
                        </span>
                      )}
                      {act.taskStatus && <span className="text-slate-500"> {act.taskStatus}</span>}
                    </p>
                  </div>

                  <span className="text-[10px] text-slate-400 font-medium shrink-0 ml-2">
                    {act.time}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Pro Tip Card */}
          {isProTipVisible && (
            <div className="bg-gradient-to-r from-amber-50/80 via-blue-50/50 to-indigo-50/80 rounded-xl border border-amber-200/60 p-4 shadow-2xs relative">
              <button
                onClick={() => setIsProTipVisible(false)}
                className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                  <Lightbulb className="w-4 h-4" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-amber-900">Pro Tip</h4>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Use keyboard shortcut <kbd className="px-1 py-0.5 bg-white border border-slate-300 rounded text-[10px] font-mono text-slate-800 font-bold">Ctrl + K</kbd> to quickly search anything across projects, tasks and issues.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
