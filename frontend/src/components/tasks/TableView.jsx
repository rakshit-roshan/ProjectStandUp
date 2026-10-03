import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Table as TableIcon,
  Search,
  Filter,
  ArrowUpDown,
  Plus,
  CheckSquare,
  Square,
  MoreHorizontal,
  ChevronRight,
  Download,
  Trash2,
  Tag
} from 'lucide-react';

export const TableView = () => {
  const {
    tasks,
    searchQuery,
    setSearchQuery,
    setIsCreateTaskModalOpen,
    setSelectedTaskId,
    setIsTaskDrawerOpen,
    updateTaskStatus,
    users,
    currentProject
  } = useApp();

  const [selectedTaskIds, setSelectedTaskIds] = useState([]);
  const [sortField, setSortField] = useState('id');
  const [sortDirection, setSortDirection] = useState('asc');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Filter tasks
  let processedTasks = !currentProject ? [] : tasks.filter(t => {
    const isCurrentProj = t.projectId === currentProject?.id || String(t.projectId) === String(currentProject?.id);
    const matchesSearch = !searchQuery || 
      t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
    return isCurrentProj && matchesSearch && matchesStatus;
  });

  // Sort tasks
  processedTasks.sort((a, b) => {
    let valA = a[sortField] || '';
    let valB = b[sortField] || '';
    if (typeof valA === 'string') valA = valA.toLowerCase();
    if (typeof valB === 'string') valB = valB.toLowerCase();

    if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
    if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const toggleSelectAll = () => {
    if (selectedTaskIds.length === processedTasks.length) {
      setSelectedTaskIds([]);
    } else {
      setSelectedTaskIds(processedTasks.map(t => t.id));
    }
  };

  const toggleSelectTask = (id) => {
    if (selectedTaskIds.includes(id)) {
      setSelectedTaskIds(selectedTaskIds.filter(i => i !== id));
    } else {
      setSelectedTaskIds([...selectedTaskIds, id]);
    }
  };

  return (
    <div className="p-6 space-y-4 max-w-[1600px] mx-auto">
      {/* Top Header Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-4 rounded-lg border border-slate-200 shadow-2xs">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-md">
            <TableIcon className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900 leading-tight">Task Master List</h1>
            <p className="text-xs text-slate-500">Enterprise spreadsheet table with bulk actions and multi-column sorting</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-xs font-semibold px-2.5 py-1.5 rounded-md outline-none focus:border-blue-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="Backlog">Backlog</option>
            <option value="In Progress">In Progress</option>
            <option value="In Review">In Review</option>
            <option value="Completed">Completed</option>
          </select>

          {/* Bulk actions banner if items selected */}
          {selectedTaskIds.length > 0 && (
            <div className="flex items-center space-x-1.5 bg-blue-50 px-2.5 py-1 rounded border border-blue-200 text-xs">
              <span className="font-bold text-blue-700">{selectedTaskIds.length} selected</span>
              <button
                onClick={() => {
                  selectedTaskIds.forEach(id => updateTaskStatus(id, 'Completed'));
                  setSelectedTaskIds([]);
                }}
                className="px-2 py-0.5 bg-emerald-600 text-white rounded text-[10px] font-semibold hover:bg-emerald-700"
              >
                Mark Completed
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold border-b border-slate-200 select-none">
              <tr>
                <th className="p-3 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={selectedTaskIds.length === processedTasks.length && processedTasks.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="p-3 cursor-pointer hover:text-slate-800" onClick={() => toggleSort('id')}>
                  <div className="flex items-center space-x-1">
                    <span>Task ID</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="p-3 cursor-pointer hover:text-slate-800" onClick={() => toggleSort('title')}>
                  <div className="flex items-center space-x-1">
                    <span>Title</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="p-3">Status</th>
                <th className="p-3 cursor-pointer hover:text-slate-800" onClick={() => toggleSort('priority')}>
                  <div className="flex items-center space-x-1">
                    <span>Priority</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="p-3">Assignee (Assigned To)</th>
                <th className="p-3">Assigned By</th>
                <th className="p-3">Sprint</th>
                <th className="p-3 text-center">Story Pts</th>
                <th className="p-3">Due Date</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {processedTasks.length === 0 ? (
                <tr>
                  <td colSpan="11" className="p-8 text-center text-slate-400">
                    No tasks found matching criteria
                  </td>
                </tr>
              ) : (
                processedTasks.map(task => {
                  const isSelected = selectedTaskIds.includes(task.id);
                  const assignedBy = task.reporterName || 'Manager';
                  return (
                    <tr
                      key={task.id}
                      onClick={() => {
                        setSelectedTaskId(task.id);
                        setIsTaskDrawerOpen(true);
                      }}
                      className={`hover:bg-slate-50/80 cursor-pointer transition-colors ${
                        isSelected ? 'bg-blue-50/40' : ''
                      }`}
                    >
                      <td className="p-3 text-center" onClick={e => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectTask(task.id)}
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="p-3 font-mono font-bold text-blue-600">{task.id}</td>
                      <td className="p-3 font-semibold text-slate-900 max-w-xs truncate">
                        {task.title}
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          task.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' :
                          task.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                          task.status === 'In Review' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {task.status}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                          task.priority === 'Critical' ? 'bg-red-100 text-red-700 font-bold' :
                          task.priority === 'High' ? 'bg-amber-100 text-amber-700' : 'text-slate-600'
                        }`}>
                          {task.priority}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center space-x-1.5">
                          <img src={task.assigneeAvatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80'} alt={task.assigneeName} className="w-5 h-5 rounded-full object-cover ring-1 ring-slate-200" />
                          <span className="text-slate-800 font-semibold">{task.assigneeName || 'Unassigned'}</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                          {assignedBy}
                        </span>
                      </td>
                      <td className="p-3 text-slate-600 font-medium">{task.sprintName}</td>
                      <td className="p-3 text-center font-mono font-semibold">{task.storyPoints}</td>
                      <td className="p-3 text-slate-500 font-mono text-[11px]">{task.dueDate}</td>
                      <td className="p-3 text-right" onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => {
                            setSelectedTaskId(task.id);
                            setIsTaskDrawerOpen(true);
                          }}
                          className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[10px] font-semibold transition-colors"
                        >
                          Details →
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
