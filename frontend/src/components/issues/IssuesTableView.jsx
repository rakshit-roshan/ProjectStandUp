import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  AlertCircle,
  Bug,
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  MessageSquare,
  Clock,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

export const IssuesTableView = () => {
  const {
    issues,
    searchQuery,
    setSearchQuery,
    setIsReportBugModalOpen,
    setSelectedIssueId,
    setIsIssueDrawerOpen,
    users,
    currentProject
  } = useApp();

  const [stateFilter, setStateFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');

  const filteredIssues = (issues || []).filter(issue => {
    const isCurrentProj = !currentProject || !issue.projectId || issue.projectId === currentProject?.id || String(issue.projectId) === String(currentProject?.id);
    const matchesSearch = !searchQuery ||
      (issue.id && issue.id.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (issue.title && issue.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (issue.module && issue.module.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesState = stateFilter === 'ALL' || (issue.state && String(issue.state).toLowerCase() === String(stateFilter).toLowerCase());
    const matchesPriority = priorityFilter === 'ALL' || (issue.priority && String(issue.priority).toLowerCase() === String(priorityFilter).toLowerCase());
    return isCurrentProj && matchesSearch && matchesState && matchesPriority;
  });

  return (
    <div className="p-6 space-y-4 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-4 rounded-lg border border-slate-200 shadow-2xs">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-red-50 text-red-600 rounded-md">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900 leading-tight">Issues & Bug Registry</h1>
            <p className="text-xs text-slate-500">Centralized defect tracking, severity triage, and resolution lifecycle</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* State Filter */}
          <select
            value={stateFilter}
            onChange={(e) => setStateFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-xs font-semibold px-2.5 py-1.5 rounded-md outline-none focus:border-blue-500"
          >
            <option value="ALL">All States</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Done">Done / Resolved</option>
          </select>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-xs font-semibold px-2.5 py-1.5 rounded-md outline-none focus:border-blue-500"
          >
            <option value="ALL">All Priorities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          <button
            onClick={() => setIsReportBugModalOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-semibold text-xs rounded-md shadow-2xs transition-colors"
          >
            <Bug className="w-4 h-4" />
            <span>Report Bug</span>
          </button>
        </div>
      </div>

      {/* Issues Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold border-b border-slate-200">
              <tr>
                <th className="p-3">Issue ID / Title</th>
                <th className="p-3">State</th>
                <th className="p-3">Priority</th>
                <th className="p-3">Assignee</th>
                <th className="p-3">Module</th>
                <th className="p-3">Linked Task</th>
                <th className="p-3">Start Date</th>
                <th className="p-3">Due Date</th>
                <th className="p-3 text-center">Comments</th>
                <th className="p-3 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredIssues.length === 0 ? (
                <tr>
                  <td colSpan="10" className="p-8 text-center text-slate-400">
                    No issues found matching criteria
                  </td>
                </tr>
              ) : (
                filteredIssues.map(issue => (
                  <tr
                    key={issue.id}
                    onClick={() => {
                      setSelectedIssueId(issue.id);
                      setIsIssueDrawerOpen(true);
                    }}
                    className="hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <td className="p-3">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-bold text-red-600">{issue.id}</span>
                        <span className="font-semibold text-slate-900">{issue.title}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        issue.state === 'Done' ? 'bg-emerald-100 text-emerald-800' :
                        issue.state === 'In Progress' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {issue.state}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        issue.priority === 'Critical' ? 'bg-red-600 text-white' :
                        issue.priority === 'High' ? 'bg-amber-100 text-amber-800' : 'text-slate-700'
                      }`}>
                        {issue.priority}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center space-x-1.5">
                        <img src={issue.assigneeAvatar} alt={issue.assigneeName} className="w-5 h-5 rounded-full object-cover" />
                        <span className="text-slate-700 font-medium">{issue.assigneeName}</span>
                      </div>
                    </td>
                    <td className="p-3 font-medium text-slate-600">{issue.module}</td>
                    <td className="p-3 font-mono text-slate-500">{issue.linkedTaskId || '—'}</td>
                    <td className="p-3 text-slate-500 font-mono text-[11px]">{issue.startDate}</td>
                    <td className="p-3 font-mono text-[11px] text-red-600 font-semibold">{issue.dueDate}</td>
                    <td className="p-3 text-center font-mono">{issue.commentsCount || 0}</td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => {
                          setSelectedIssueId(issue.id);
                          setIsIssueDrawerOpen(true);
                        }}
                        className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[10px] font-semibold"
                      >
                        Inspect →
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
