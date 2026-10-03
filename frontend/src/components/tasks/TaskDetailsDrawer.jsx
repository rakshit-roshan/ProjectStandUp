import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  CheckCircle2,
  Clock,
  User,
  Zap,
  Calendar,
  Tag,
  Paperclip,
  MessageSquare,
  Send,
  Plus,
  Trash2,
  Edit2,
  Bug,
  Shield,
  FileText
} from 'lucide-react';

export const TaskDetailsDrawer = () => {
  const {
    isTaskDrawerOpen,
    setIsTaskDrawerOpen,
    selectedTask,
    updateTask,
    updateTaskStatus,
    openEditTaskModal,
    deleteTask,
    users,
    currentUser,
    currentRole,
    sprints,
    currentProject,
    setIsReportBugModalOpen,
    getProjectMembers
  } = useApp();

  const teamMembers = getProjectMembers(currentProject);

  if (!isTaskDrawerOpen || !selectedTask) return null;

  const handleSubtaskToggle = (subtaskId) => {
    const updatedSubtasks = (selectedTask.subtasks || []).map(st => 
      st.id === subtaskId ? { ...st, completed: !st.completed } : st
    );
    updateTask(selectedTask.id, { subtasks: updatedSubtasks });
  };

  const handleAddSubtask = () => {
    if (!newSubtaskTitle.trim()) return;
    const newSt = {
      id: `SUB-${Date.now()}`,
      title: newSubtaskTitle.trim(),
      completed: false
    };
    updateTask(selectedTask.id, {
      subtasks: [...(selectedTask.subtasks || []), newSt]
    });
    setNewSubtaskTitle('');
  };

  const handleAddComment = () => {
    if (!commentText.trim()) return;
    const newComment = {
      id: `CM-${Date.now()}`,
      author: currentUser?.name || 'User',
      avatar: currentUser?.avatar,
      text: commentText.trim(),
      time: 'Just now'
    };
    updateTask(selectedTask.id, {
      comments: [...(selectedTask.comments || []), newComment]
    });
    setCommentText('');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs flex justify-end">
      <div 
        className="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center space-x-3">
            <span className="font-mono text-sm font-bold text-blue-600 px-2 py-0.5 bg-blue-100 rounded">
              {selectedTask.id}
            </span>
            <span className="text-xs text-slate-500 font-semibold">{selectedTask.projectName}</span>
          </div>

          <div className="flex items-center space-x-2">
            {currentRole === 'DEVELOPER' && selectedTask.status === 'In Progress' && (
              <button
                onClick={() => updateTaskStatus(selectedTask.id, 'In Review')}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold shadow-2xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit for Review</span>
              </button>
            )}

            <button
              onClick={() => {
                setIsTaskDrawerOpen(false);
                openEditTaskModal(selectedTask);
              }}
              className="flex items-center space-x-1 px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded text-xs font-semibold border border-blue-200 transition-colors"
              title="Edit / Reassign Task"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>

            <button
              onClick={() => {
                if (window.confirm(`Are you sure you want to delete task ${selectedTask.id}?`)) {
                  deleteTask(selectedTask.id);
                  setIsTaskDrawerOpen(false);
                }
              }}
              className="flex items-center space-x-1 px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded text-xs font-semibold border border-red-200 transition-colors"
              title="Delete Task"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>

            <button
              onClick={() => setIsTaskDrawerOpen(false)}
              className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Drawer Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Title & Description */}
          <div className="space-y-2">
            <input
              type="text"
              value={selectedTask.title}
              onChange={(e) => updateTask(selectedTask.id, { title: e.target.value })}
              className="w-full text-lg font-bold text-slate-900 border-b border-transparent hover:border-slate-300 focus:border-blue-500 outline-none pb-1 transition-all"
            />
            <textarea
              value={selectedTask.description}
              onChange={(e) => updateTask(selectedTask.id, { description: e.target.value })}
              placeholder="Add description..."
              rows={3}
              className="w-full text-xs text-slate-700 border border-slate-200 rounded-md p-2.5 outline-none focus:border-blue-500"
            />
          </div>

          {/* Key Properties Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-lg border border-slate-200 text-xs">
            {/* Status Selector */}
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Status</label>
              <select
                value={selectedTask.status}
                onChange={(e) => updateTaskStatus(selectedTask.id, e.target.value)}
                className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs font-semibold text-slate-800 outline-none"
              >
                <option value="Backlog">Backlog</option>
                <option value="In Progress">In Progress</option>
                <option value="In Review">In Review</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            {/* Priority Selector */}
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Priority</label>
              <select
                value={selectedTask.priority}
                onChange={(e) => updateTask(selectedTask.id, { priority: e.target.value })}
                className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs font-semibold text-slate-800 outline-none"
              >
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            {/* Assignee Selector */}
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Assignee</label>
              <select
                value={selectedTask.assigneeId}
                onChange={(e) => {
                  const u = users.find(usr => usr.id === e.target.value);
                  if (u) {
                    updateTask(selectedTask.id, {
                      assigneeId: u.id,
                      assigneeName: u.name,
                      assigneeAvatar: u.avatar
                    });
                  }
                }}
                className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs font-semibold text-slate-800 outline-none"
              >
                {teamMembers.map(u => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </div>

            {/* Story Points */}
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Story Points</label>
              <input
                type="number"
                value={selectedTask.storyPoints}
                onChange={(e) => updateTask(selectedTask.id, { storyPoints: parseInt(e.target.value) || 0 })}
                className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs font-mono font-semibold text-slate-800 outline-none"
              />
            </div>

            {/* Due Date */}
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Due Date</label>
              <input
                type="date"
                value={selectedTask.dueDate}
                onChange={(e) => updateTask(selectedTask.id, { dueDate: e.target.value })}
                className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs font-mono text-slate-800 outline-none"
              />
            </div>

            {/* Sprint Selector */}
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Target Sprint</label>
              <select
                value={selectedTask.sprintId || ''}
                onChange={(e) => {
                  const spId = e.target.value;
                  const sp = sprints.find(s => String(s.id) === String(spId));
                  updateTask(selectedTask.id, {
                    sprintId: spId,
                    sprintName: sp ? sp.name : 'Backlog'
                  });
                }}
                className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs font-semibold text-slate-800 outline-none"
              >
                <option value="">-- No Sprint (Backlog) --</option>
                {(sprints || [])
                  .filter(s => currentProject && (s.projectId === currentProject?.id || String(s.projectId) === String(currentProject?.id)))
                  .map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
              </select>
            </div>

            {/* QA Testing Status */}
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Testing Status</label>
              <span className="inline-block px-2 py-1 rounded font-bold text-[10px] bg-amber-100 text-amber-800">
                {selectedTask.testingStatus}
              </span>
            </div>
          </div>

          {/* Subtasks Checklist Section */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center justify-between">
              <span>Subtasks & Checklist</span>
              <span className="text-[10px] font-mono text-slate-500">
                {(selectedTask.subtasks || []).filter(s => s.completed).length} / {(selectedTask.subtasks || []).length} Completed
              </span>
            </h3>

            <div className="space-y-1.5">
              {(selectedTask.subtasks || []).map(st => (
                <div
                  key={st.id}
                  onClick={() => handleSubtaskToggle(st.id)}
                  className="flex items-center space-x-2.5 p-2 bg-slate-50 rounded border border-slate-200 cursor-pointer hover:bg-slate-100 text-xs transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={st.completed}
                    onChange={() => {}}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className={`flex-1 ${st.completed ? 'line-through text-slate-400' : 'text-slate-800 font-medium'}`}>
                    {st.title}
                  </span>
                </div>
              ))}
            </div>

            {/* Add Subtask Input */}
            <div className="flex items-center space-x-2">
              <input
                type="text"
                placeholder="Add new subtask item..."
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddSubtask()}
                className="flex-1 bg-white border border-slate-200 rounded px-2.5 py-1.5 text-xs outline-none focus:border-blue-500"
              />
              <button
                onClick={handleAddSubtask}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded transition-colors"
              >
                Add
              </button>
            </div>
          </div>

          {/* Comments & Activity Stream */}
          <div className="space-y-3 pt-3 border-t border-slate-200">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Comments & Activity</h3>

            <div className="space-y-3">
              {(selectedTask.comments || []).map(c => (
                <div key={c.id} className="flex items-start space-x-2.5 text-xs">
                  <img src={c.avatar || currentUser.avatar} alt={c.author} className="w-6 h-6 rounded-full object-cover mt-0.5" />
                  <div className="flex-1 bg-slate-50 p-2.5 rounded border border-slate-200">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-slate-800">{c.author}</span>
                      <span className="text-[10px] text-slate-400">{c.time}</span>
                    </div>
                    <p className="text-slate-700 leading-snug">{c.text}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Post Comment Input */}
            <div className="flex items-center space-x-2 pt-2">
              <input
                type="text"
                placeholder="Write a comment or mention team member..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                className="flex-1 bg-white border border-slate-200 rounded px-3 py-2 text-xs outline-none focus:border-blue-500"
              />
              <button
                onClick={handleAddComment}
                className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded transition-colors"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
