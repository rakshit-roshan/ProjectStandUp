import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Kanban as KanbanIcon,
  Plus,
  Filter,
  Search,
  Bug,
  Calendar,
  User,
  MoreHorizontal,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const KanbanView = () => {
  const {
    currentUser,
    tasks,
    updateTaskStatus,
    setIsCreateTaskModalOpen,
    setSelectedTaskId,
    setIsTaskDrawerOpen,
    searchQuery,
    setSearchQuery,
    sprints,
    users,
    currentProject
  } = useApp();

  const teamMembers = !currentProject ? [] : users.filter(u => {
    if (currentProject.memberEmails && currentProject.memberEmails.includes(u.email)) return true;
    if (currentProject.memberIds && currentProject.memberIds.includes(u.id)) return true;
    if (currentProject.ownerEmail && u.email === currentProject.ownerEmail) return true;
    if (currentProject.leadId && u.id === currentProject.leadId) return true;
    return false;
  });

  const [selectedPriority, setSelectedPriority] = useState('ALL');
  const [selectedAssignee, setSelectedAssignee] = useState('ALL');

  const columns = [
    { id: 'Backlog', label: 'Backlog', color: 'border-slate-300 text-slate-700 bg-slate-100' },
    { id: 'In Progress', label: 'In Progress', color: 'border-blue-400 text-blue-700 bg-blue-50' },
    { id: 'In Review', label: 'In Review', color: 'border-amber-400 text-amber-700 bg-amber-50' },
    { id: 'Completed', label: 'Completed', color: 'border-emerald-400 text-emerald-700 bg-emerald-50' }
  ];

  const filteredTasks = !currentProject ? [] : tasks.filter(task => {
    const isCurrentProj = task.projectId === currentProject?.id || String(task.projectId) === String(currentProject?.id);
    const matchesSearch = !searchQuery || 
      task.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority = selectedPriority === 'ALL' || task.priority === selectedPriority;
    const matchesAssignee = selectedAssignee === 'ALL' || task.assigneeId === selectedAssignee;
    return isCurrentProj && matchesSearch && matchesPriority && matchesAssignee;
  });

  return (
    <div className="p-6 space-y-4 max-w-[1600px] mx-auto h-[calc(100vh-3.5rem)] flex flex-col">
      {/* Top Filter & Actions Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-md">
            <KanbanIcon className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900 leading-tight">Sprint Kanban Board</h1>
            <p className="text-xs text-slate-500">Drag & drop or update task status across columns</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Priority Filter */}
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-xs font-semibold px-2.5 py-1.5 rounded-md outline-none focus:border-blue-500"
          >
            <option value="ALL">All Priorities</option>
            <option value="Critical">Critical Priority</option>
            <option value="High">High Priority</option>
            <option value="Medium">Medium Priority</option>
            <option value="Low">Low Priority</option>
          </select>

          {/* Assignee Filter */}
          <select
            value={selectedAssignee}
            onChange={(e) => setSelectedAssignee(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-xs font-semibold px-2.5 py-1.5 rounded-md outline-none focus:border-blue-500"
          >
            <option value="ALL">All Assignees</option>
            {teamMembers.map(u => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 4 Column Kanban Canvas */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 overflow-hidden pb-2">
        {columns.map(col => {
          const colTasks = filteredTasks.filter(t => t.status === col.id);
          return (
            <div
              key={col.id}
              className="bg-slate-50/80 rounded-lg border border-slate-200 flex flex-col h-full overflow-hidden"
            >
              {/* Column Header */}
              <div className="p-3 border-b border-slate-200 bg-white flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase tracking-wider border ${col.color}`}>
                    {col.label}
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-500">({colTasks.length})</span>
                </div>
              </div>

              {/* Column Cards Dropzone */}
              <div className="flex-1 overflow-y-auto p-2.5 space-y-2.5">
                {colTasks.length === 0 ? (
                  <div className="h-32 border-2 border-dashed border-slate-200 rounded-md flex items-center justify-center text-slate-400 text-xs">
                    No items in {col.label}
                  </div>
                ) : (
                  colTasks.map(task => {
                    const assignerName = task.reporterName || (task.reporterId ? users.find(u => String(u.id) === String(task.reporterId))?.name : null) || 'Manager';
                    const assigneeName = task.assigneeName || 'Unassigned';

                    return (
                      <div
                        key={task.id}
                        onClick={() => {
                          setSelectedTaskId(task.id);
                          setIsTaskDrawerOpen(true);
                        }}
                        className="p-3.5 bg-white rounded-md border border-slate-200 shadow-2xs hover:shadow-xs hover:border-blue-400 cursor-pointer transition-all space-y-2.5 group"
                      >
                        {/* Top Meta Line */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="font-mono text-[11px] font-bold text-blue-600">{task.id}</span>
                            {task.hasIssue && (
                              <span className="px-1.5 py-0.2 bg-red-100 text-red-700 text-[9px] font-bold rounded flex items-center space-x-0.5">
                                <Bug className="w-2.5 h-2.5" />
                                <span>Bug</span>
                              </span>
                            )}
                          </div>
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                            task.priority === 'Critical' ? 'bg-red-100 text-red-700 border border-red-200' :
                            task.priority === 'High' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                            'bg-slate-100 text-slate-700'
                          }`}>
                            {task.priority}
                          </span>
                        </div>

                        {/* Task Title */}
                        <h4 className="text-xs font-semibold text-slate-900 leading-snug group-hover:text-blue-600 transition-colors">
                          {task.title}
                        </h4>

                        {/* Labels */}
                        {task.labels && task.labels.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {task.labels.map(lbl => (
                              <span key={lbl} className="px-1.5 py-0.2 bg-slate-100 text-slate-600 text-[9px] font-mono rounded">
                                {lbl}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Footer Info: Assignee & Assigned By with Circular DPs and Hover Tooltips */}
                        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                          <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
                            {/* Assignee Circular DP */}
                            <div 
                              className="flex items-center space-x-1 bg-slate-100/80 px-1.5 py-0.5 rounded-full border border-slate-200/60"
                              title={`Assigned To: ${assigneeName}`}
                            >
                              <img
                                src={task.assigneeAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(assigneeName)}&background=3b82f6&color=fff`}
                                alt={assigneeName}
                                className="w-4 h-4 rounded-full object-cover shrink-0"
                              />
                              <span className="text-[10px] font-semibold text-slate-700 truncate max-w-[60px]">
                                {assigneeName.split(' ')[0]}
                              </span>
                            </div>

                            <span className="text-[9px] text-slate-400 font-semibold">by</span>

                            {/* Assigned By Circular DP */}
                            <div 
                              className="flex items-center space-x-1 bg-purple-50/80 px-1.5 py-0.5 rounded-full border border-purple-200/60"
                              title={`Assigned By: ${assignerName}`}
                            >
                              <div className="w-4 h-4 rounded-full bg-purple-600 text-white font-bold text-[8px] flex items-center justify-center shrink-0">
                                {assignerName.charAt(0).toUpperCase()}
                              </div>
                              <span className="text-[10px] font-semibold text-purple-900 truncate max-w-[60px]">
                                {assignerName.split(' ')[0]}
                              </span>
                            </div>
                          </div>

                          {/* Story Points */}
                          <div className="shrink-0 ml-1">
                            <span className="font-mono text-[10px] px-1.5 py-0.5 bg-slate-100 font-bold rounded text-slate-700">
                              {task.storyPoints} pts
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
