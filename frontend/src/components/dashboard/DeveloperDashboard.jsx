import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UnassignedMemberBanner } from '../auth/UnassignedMemberBanner';
import {
  Code,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Send,
  Kanban,
  List,
  Play,
  FileText,
  MessageSquare,
  Bug,
  Zap,
  ArrowRight,
  Sparkles
} from 'lucide-react';

export const DeveloperDashboard = () => {
  const {
    currentUser,
    tasks,
    issues,
    currentSprint,
    currentProject,
    updateTaskStatus,
    navigateTo,
    setIsTaskDrawerOpen,
    setSelectedTaskId,
    isTaskAssignedToUser
  } = useApp();

  const [viewMode, setViewMode] = useState('kanban'); // kanban | list

  // Tasks assigned to current developer strictly within the active project workspace
  const myTasks = !currentProject ? [] : tasks.filter(t => 
    (t.projectId === currentProject?.id || String(t.projectId) === String(currentProject?.id)) && 
    isTaskAssignedToUser(t, currentUser)
  );
  const myActiveTasks = myTasks.filter(t => t.status === 'In Progress');
  const myInReviewTasks = myTasks.filter(t => t.status === 'In Review');
  const myCompletedTasks = myTasks.filter(t => t.status === 'Completed');
  const myAssignedBugs = !currentProject ? [] : issues.filter(i => (i.projectId === currentProject?.id || String(i.projectId) === String(currentProject?.id)) && (i.assigneeId === currentUser?.id || i.assigneeName === currentUser?.name));

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Unassigned Team Member Banner */}
      <UnassignedMemberBanner />

      {/* Top Welcome Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white p-5 rounded-lg shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold tracking-tight">Developer Workspace</h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
              {currentUser?.name}
            </span>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            Assigned Sprint: <strong className="text-white">{currentSprint?.name}</strong> • Focus: Auth API & Payment Security
          </p>
        </div>

        {/* View Switcher Controls */}
        <div className="flex items-center space-x-2">
          <div className="bg-white/10 p-1 rounded-md flex items-center space-x-1 border border-white/10 text-xs">
            <button
              onClick={() => setViewMode('kanban')}
              className={`px-2.5 py-1 rounded transition-colors flex items-center space-x-1 ${
                viewMode === 'kanban' ? 'bg-white text-slate-900 font-semibold' : 'text-slate-300 hover:text-white'
              }`}
            >
              <Kanban className="w-3.5 h-3.5" />
              <span>Kanban</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-2.5 py-1 rounded transition-colors flex items-center space-x-1 ${
                viewMode === 'list' ? 'bg-white text-slate-900 font-semibold' : 'text-slate-300 hover:text-white'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>List View</span>
            </button>
          </div>
        </div>
      </div>

      {/* Developer KPI Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs">
          <div className="text-xs text-slate-500 font-medium">My Active Tasks</div>
          <div className="text-2xl font-bold text-slate-900 mt-1 tabular-nums">{myActiveTasks.length}</div>
        </div>
        <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs">
          <div className="text-xs text-slate-500 font-medium">In Code Review</div>
          <div className="text-2xl font-bold text-amber-600 mt-1 tabular-nums">{myInReviewTasks.length}</div>
        </div>
        <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs">
          <div className="text-xs text-slate-500 font-medium">Completed</div>
          <div className="text-2xl font-bold text-emerald-600 mt-1 tabular-nums">{myCompletedTasks.length}</div>
        </div>
        <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs">
          <div className="text-xs text-slate-500 font-medium">Open Bugs Assigned</div>
          <div className="text-2xl font-bold text-red-600 mt-1 tabular-nums">{myAssignedBugs.length}</div>
        </div>
        <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs">
          <div className="text-xs text-slate-500 font-medium">Logged Hours</div>
          <div className="text-2xl font-bold text-indigo-600 mt-1 tabular-nums">{currentUser?.loggedHoursThisWeek ? `${currentUser.loggedHoursThisWeek}h` : '0h'}</div>
        </div>
      </div>

      {/* Main Developer Workspace Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Task Stream / Kanban */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs">
            <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <Code className="w-4 h-4 text-indigo-600" />
              <span>Assigned Development Queue</span>
            </h2>
            <span className="text-xs text-slate-500 font-mono">{myTasks.length} Total Items</span>
          </div>

          {viewMode === 'kanban' ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Backlog Column */}
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-2">
                <div className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span>Backlog</span>
                  <span className="text-[10px] bg-slate-200 px-1.5 py-0.5 rounded text-slate-700">
                    {myTasks.filter(t => t.status === 'Backlog').length}
                  </span>
                </div>
                {myTasks.filter(t => t.status === 'Backlog').map(task => (
                  <div
                    key={task.id}
                    onClick={() => {
                      setSelectedTaskId(task.id);
                      setIsTaskDrawerOpen(true);
                    }}
                    className="p-3 bg-white rounded border border-slate-200 shadow-2xs hover:border-blue-400 cursor-pointer transition-all space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] font-bold text-slate-500">{task.id}</span>
                      <span className="px-1.5 py-0.5 text-[9px] font-semibold bg-slate-100 text-slate-700 rounded">
                        {task.storyPoints} pts
                      </span>
                    </div>
                    <div className="text-xs font-semibold text-slate-800 leading-snug">{task.title}</div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        updateTaskStatus(task.id, 'In Progress');
                      }}
                      className="w-full mt-2 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-[11px] rounded flex items-center justify-center space-x-1 transition-colors"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>Start Working</span>
                    </button>
                  </div>
                ))}
              </div>

              {/* In Progress Column */}
              <div className="bg-blue-50/50 p-3 rounded-lg border border-blue-100 space-y-2">
                <div className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span>In Progress</span>
                  <span className="text-[10px] bg-blue-100 px-1.5 py-0.5 rounded text-blue-800">
                    {myActiveTasks.length}
                  </span>
                </div>
                {myActiveTasks.map(task => (
                  <div
                    key={task.id}
                    onClick={() => {
                      setSelectedTaskId(task.id);
                      setIsTaskDrawerOpen(true);
                    }}
                    className="p-3 bg-white rounded border border-blue-200 shadow-2xs hover:border-blue-500 cursor-pointer transition-all space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] font-bold text-blue-600">{task.id}</span>
                      {task.hasIssue && (
                        <span className="px-1.5 py-0.5 text-[9px] font-bold bg-red-100 text-red-700 rounded flex items-center space-x-1">
                          <Bug className="w-2.5 h-2.5" />
                          <span>Has Bug</span>
                        </span>
                      )}
                    </div>
                    <div className="text-xs font-semibold text-slate-900 leading-snug">{task.title}</div>
                    <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                      <span>Due: {task.dueDate}</span>
                      <span className="font-semibold text-amber-600">{task.priority}</span>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        updateTaskStatus(task.id, 'In Review');
                      }}
                      className="w-full mt-2 py-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-[11px] rounded flex items-center justify-center space-x-1 transition-colors shadow-2xs"
                    >
                      <Send className="w-3 h-3" />
                      <span>Submit for Review</span>
                    </button>
                  </div>
                ))}
              </div>

              {/* In Review Column */}
              <div className="bg-amber-50/50 p-3 rounded-lg border border-amber-100 space-y-2">
                <div className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span>In Review / Testing</span>
                  <span className="text-[10px] bg-amber-100 px-1.5 py-0.5 rounded text-amber-800">
                    {myInReviewTasks.length}
                  </span>
                </div>
                {myInReviewTasks.map(task => (
                  <div
                    key={task.id}
                    onClick={() => {
                      setSelectedTaskId(task.id);
                      setIsTaskDrawerOpen(true);
                    }}
                    className="p-3 bg-white rounded border border-amber-200 shadow-2xs hover:border-amber-400 cursor-pointer transition-all space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] font-bold text-amber-600">{task.id}</span>
                      <span className="px-1.5 py-0.5 text-[9px] font-semibold bg-amber-100 text-amber-800 rounded">
                        {task.testingStatus}
                      </span>
                    </div>
                    <div className="text-xs font-semibold text-slate-800 leading-snug">{task.title}</div>
                    <p className="text-[10px] text-slate-500 italic">Awaiting QA sign-off by {task.testerName}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-2xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3">Task ID</th>
                    <th className="p-3">Title</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Priority</th>
                    <th className="p-3">Assignee</th>
                    <th className="p-3">Assigned By</th>
                    <th className="p-3">Story Pts</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {myTasks.map(task => (
                    <tr
                      key={task.id}
                      onClick={() => {
                        setSelectedTaskId(task.id);
                        setIsTaskDrawerOpen(true);
                      }}
                      className="hover:bg-slate-50 cursor-pointer"
                    >
                      <td className="p-3 font-mono font-semibold text-blue-600">{task.id}</td>
                      <td className="p-3 font-semibold text-slate-800">{task.title}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                          {task.status}
                        </span>
                      </td>
                      <td className="p-3">{task.priority}</td>
                      <td className="p-3">
                        <div className="flex items-center space-x-1.5">
                          <img src={task.assigneeAvatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80'} alt={task.assigneeName} className="w-5 h-5 rounded-full object-cover ring-1 ring-slate-200" />
                          <span className="text-slate-800 font-semibold">{task.assigneeName || 'Unassigned'}</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                          {task.reporterName || 'Manager'}
                        </span>
                      </td>
                      <td className="p-3 font-mono">{task.storyPoints}</td>
                      <td className="p-3 text-right">
                        {task.status === 'In Progress' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              updateTaskStatus(task.id, 'In Review');
                            }}
                            className="px-2 py-1 bg-blue-600 text-white rounded text-[10px] font-semibold hover:bg-blue-700"
                          >
                            Submit Review
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right 1 Column: Bugs Assigned to Me & Tester Feedback */}
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2.5 mb-3 flex items-center justify-between">
              <span className="flex items-center space-x-1.5 text-red-600">
                <Bug className="w-4 h-4" />
                <span>Bugs Assigned to Me</span>
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 bg-red-100 text-red-700 rounded font-bold">
                {myAssignedBugs.length}
              </span>
            </h3>

            <div className="space-y-3">
              {myAssignedBugs.length === 0 ? (
                <div className="p-4 text-center text-slate-400 text-xs bg-slate-50 rounded border border-slate-200">
                  No open bugs assigned
                </div>
              ) : (
                myAssignedBugs.map(bug => (
                  <div
                    key={bug.id}
                    onClick={() => navigateTo('issue_details', bug.id)}
                    className="p-3 bg-red-50/40 rounded border border-red-200 hover:bg-red-50 cursor-pointer transition-colors space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[11px] font-bold text-red-700">{bug.id}</span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-600 text-white">
                        {bug.priority}
                      </span>
                    </div>
                    <div className="font-bold text-slate-900 leading-snug">{bug.title}</div>
                    <p className="text-[11px] text-slate-600 line-clamp-2">{bug.description}</p>
                    <div className="flex items-center justify-between pt-1 border-t border-red-100 text-[10px] text-slate-500">
                      <span>Linked: {bug.linkedTaskId}</span>
                      <span className="text-red-700 font-semibold hover:underline">Fix Bug →</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
