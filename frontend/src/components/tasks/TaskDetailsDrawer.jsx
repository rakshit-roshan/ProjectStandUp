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
  FileText,
  Eye,
  ChevronDown,
  TestTube2,
  Check,
  AlertTriangle
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
    getProjectMembers,
    isViewer,
    openSendToTestingModal,
    getUserRoleName,
    canManageTaskAssignment,
    canEditTaskScope,
    canUpdateTaskStatus,
    canSendTaskToTesting
  } = useApp();

  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [commentText, setCommentText] = useState('');
  const [isAssigneeDropdownOpen, setIsAssigneeDropdownOpen] = useState(false);

  const viewerMode = isViewer ? isViewer() : false;
  const canAssign = canManageTaskAssignment ? canManageTaskAssignment(currentUser) : false;
  const canEditScope = canEditTaskScope ? canEditTaskScope(currentUser) : false;
  const canChangeStatus = canUpdateTaskStatus ? canUpdateTaskStatus(selectedTask, currentUser) : false;
  const canSendTesting = canSendTaskToTesting ? canSendTaskToTesting(selectedTask, currentUser) : false;

  const teamMembers = getProjectMembers(currentProject);
  const allAvailableUsers = [
    ...teamMembers,
    ...users.filter(u => !teamMembers.some(tm => String(tm.id) === String(u.id)))
  ];

  const getSelectedAssigneeIds = () => {
    if (selectedTask?.assigneeIds && Array.isArray(selectedTask.assigneeIds)) {
      return selectedTask.assigneeIds.map(String);
    }
    if (selectedTask?.assigneeId) {
      return String(selectedTask.assigneeId).split(',').map(s => s.trim()).filter(Boolean);
    }
    return [];
  };

  const assignedUserIds = getSelectedAssigneeIds();
  const assignedUsersList = allAvailableUsers.filter(u => assignedUserIds.includes(String(u.id)));

  const handleToggleAssignee = (uId) => {
    const sId = String(uId);
    const currentIds = getSelectedAssigneeIds();
    const newIds = currentIds.includes(sId)
      ? currentIds.filter(id => id !== sId)
      : [...currentIds, sId];

    const assignedUsers = allAvailableUsers.filter(u => newIds.includes(String(u.id)));
    const assigneeIdsStr = assignedUsers.map(u => u.id).join(',');
    const assigneeNamesStr = assignedUsers.length > 0 
      ? assignedUsers.map(u => u.name).join(', ') 
      : 'Unassigned';

    updateTask(selectedTask.id, {
      assigneeId: assigneeIdsStr,
      assigneeIds: assignedUsers.map(u => u.id),
      assigneeName: assigneeNamesStr,
      assigneeAvatar: assignedUsers[0]?.avatar || ''
    });
  };

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
            {canSendTesting && (
              <button
                type="button"
                onClick={() => openSendToTestingModal(selectedTask)}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white rounded text-xs font-bold shadow-2xs transition-colors cursor-pointer animate-in fade-in duration-150"
                title="Send Completed Task to QA Testing"
              >
                <TestTube2 className="w-3.5 h-3.5" />
                <span>Send to Testing</span>
              </button>
            )}

            {viewerMode ? (
              <span className="flex items-center space-x-1 px-2.5 py-1.5 bg-slate-100 text-slate-600 rounded text-xs font-semibold border border-slate-200">
                <Eye className="w-3.5 h-3.5 text-slate-500" />
                <span>Viewer (Read-Only)</span>
              </span>
            ) : canEditScope ? (
              <>
                <button
                  onClick={() => {
                    setIsTaskDrawerOpen(false);
                    openEditTaskModal(selectedTask);
                  }}
                  className="flex items-center space-x-1 px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded text-xs font-semibold border border-blue-200 transition-colors cursor-pointer"
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
                  className="flex items-center space-x-1 px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded text-xs font-semibold border border-red-200 transition-colors cursor-pointer"
                  title="Delete Task"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </>
            ) : (
              <span className="flex items-center space-x-1 px-2.5 py-1 bg-slate-100 text-slate-600 rounded text-xs font-semibold border border-slate-200">
                <Shield className="w-3.5 h-3.5 text-slate-400" />
                <span>Contributor Access</span>
              </span>
            )}

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
          {/* QA Status Alert Banners (Failed vs Passed vs In Review) */}
          {(selectedTask.testingStatus === 'Failed' || (selectedTask.hasIssue && selectedTask.testingStatus !== 'Passed' && selectedTask.status !== 'Completed')) ? (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between text-xs text-red-900 animate-in fade-in duration-150">
              <div className="flex items-center space-x-2.5">
                <div className="w-7 h-7 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                  <Bug className="w-4 h-4 text-red-600" />
                </div>
                <div>
                  <span className="font-bold block">QA Defect Reported (Testing Failed)</span>
                  <span className="text-[11px] text-red-700">This task was rejected by QA. Assign developer(s) below to fix the defect.</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  const linkedIssue = (issues || []).find(i => String(i.linkedTaskId) === String(selectedTask.id));
                  if (linkedIssue) {
                    setSelectedIssueId(linkedIssue.id);
                  } else if (selectedTask.activeBugId) {
                    setSelectedIssueId(selectedTask.activeBugId);
                  }
                  setIsTaskDrawerOpen(false);
                  setIsIssueDrawerOpen(true);
                }}
                className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-[10px] font-bold shrink-0 cursor-pointer transition-colors shadow-2xs"
              >
                Inspect Defect →
              </button>
            </div>
          ) : selectedTask.testingStatus === 'Passed' ? (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between text-xs text-emerald-900 animate-in fade-in duration-150">
              <div className="flex items-center space-x-2.5">
                <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <span className="font-bold block">QA Testing Passed & Verified</span>
                  <span className="text-[11px] text-emerald-700">
                    This task successfully passed QA testing and is verified{selectedTask.testerName ? ` by ${selectedTask.testerName}` : ''}.
                  </span>
                </div>
              </div>
              <span className="px-2.5 py-1 bg-emerald-600 text-white rounded text-[10px] font-bold shrink-0 shadow-2xs">
                Passed ✓
              </span>
            </div>
          ) : (selectedTask.testingStatus === 'Pending Testing' || (selectedTask.status === 'In Review' && selectedTask.testingStatus !== 'Failed')) ? (
            <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg flex items-center justify-between text-xs text-purple-900 animate-in fade-in duration-150">
              <div className="flex items-center space-x-2.5">
                <div className="w-7 h-7 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
                  <TestTube2 className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <span className="font-bold block">Awaiting QA Testing & Verification</span>
                  <span className="text-[11px] text-purple-700">
                    Task is in the QA testing queue{selectedTask.testerName ? ` (Assigned Tester: ${selectedTask.testerName})` : ''}.
                  </span>
                </div>
              </div>
              <span className="px-2.5 py-1 bg-purple-100 text-purple-800 border border-purple-200 rounded text-[10px] font-bold shrink-0">
                In QA Review
              </span>
            </div>
          ) : null}

          {/* Completed Task Hand-off Alert for Assigner */}
          {selectedTask.status === 'Completed' && selectedTask.testingStatus !== 'Passed' && (
            canSendTesting ? (
              <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg flex items-center justify-between text-xs text-purple-900 animate-in fade-in duration-150">
                <div className="flex items-center space-x-2.5">
                  <div className="w-7 h-7 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
                    <TestTube2 className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <span className="font-bold block">Development Complete — Ready for QA Verification</span>
                    <span className="text-[11px] text-purple-700">Developer completed work. Click to choose QA tester(s) and route to testing.</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => openSendToTestingModal(selectedTask)}
                  className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white rounded text-xs font-bold shrink-0 cursor-pointer transition-colors shadow-2xs"
                >
                  Send to Testing →
                </button>
              </div>
            ) : (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between text-xs text-emerald-900 animate-in fade-in duration-150">
                <div className="flex items-center space-x-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <span className="font-bold block">Task Completed by Developer</span>
                    <span className="text-[11px] text-emerald-700">Awaiting assigner or manager review to route to QA testing.</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded text-[10px]">
                  Ready for QA Handoff
                </span>
              </div>
            )
          )}

          {/* Title & Description */}
          <div className="space-y-2">
            {canEditScope ? (
              <>
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
              </>
            ) : (
              <div className="space-y-2">
                <h2 className="text-lg font-bold text-slate-900 leading-snug">{selectedTask.title}</h2>
                <div className="text-xs text-slate-700 bg-slate-50 p-3 rounded-md border border-slate-200/80 whitespace-pre-wrap leading-relaxed">
                  {selectedTask.description || <span className="text-slate-400 italic">No description provided for this task.</span>}
                </div>
              </div>
            )}
          </div>

          {/* Key Properties Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-lg border border-slate-200 text-xs">
            {/* Status Selector (Editable by assigned contributor or manager) */}
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Status</label>
              {canChangeStatus ? (
                <select
                  value={selectedTask.status}
                  onChange={(e) => updateTaskStatus(selectedTask.id, e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs font-semibold text-slate-800 outline-none cursor-pointer focus:border-blue-500 shadow-2xs"
                >
                  <option value="Backlog">Backlog</option>
                  <option value="In Progress">In Progress</option>
                  <option value="In Review">In Review</option>
                  <option value="Completed">Completed</option>
                </select>
              ) : (
                <div className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs font-semibold text-slate-800">
                  {selectedTask.status}
                </div>
              )}
            </div>

            {/* Priority Selector (Editable by Manager/Editor) */}
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Priority</label>
              {canEditScope ? (
                <select
                  value={selectedTask.priority}
                  onChange={(e) => updateTask(selectedTask.id, { priority: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs font-semibold text-slate-800 outline-none cursor-pointer focus:border-blue-500"
                >
                  <option value="Critical">Critical</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              ) : (
                <div className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs font-semibold text-slate-800">
                  {selectedTask.priority}
                </div>
              )}
            </div>

            {/* Assignees (Editable ONLY by Admin / Manager / Editor) */}
            <div className="relative">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Assignees ({assignedUserIds.length})
              </label>

              {!canAssign ? (
                <div className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs font-semibold text-slate-800 min-h-[28px] flex items-center">
                  {assignedUsersList.length === 0 ? (
                    <span className="text-slate-400 italic text-[11px]">Unassigned</span>
                  ) : (
                    <div className="flex items-center space-x-1 truncate">
                      <div className="flex -space-x-1 shrink-0">
                        {assignedUsersList.slice(0, 2).map(u => (
                          u.avatar ? (
                            <img key={u.id} src={u.avatar} alt={u.name} className="w-4 h-4 rounded-full object-cover ring-1 ring-white" />
                          ) : (
                            <div key={u.id} className="w-4 h-4 rounded-full bg-blue-600 text-white font-bold text-[7px] flex items-center justify-center ring-1 ring-white">
                              {u.name?.charAt(0).toUpperCase()}
                            </div>
                          )
                        ))}
                      </div>
                      <span className="truncate text-slate-800 text-[11px] font-semibold">
                        {assignedUsersList.map(u => u.name).join(', ')}
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsAssigneeDropdownOpen(!isAssigneeDropdownOpen)}
                    className="w-full bg-white border border-slate-200 hover:border-slate-300 rounded px-2 py-1 text-xs font-semibold text-slate-800 outline-none flex items-center justify-between transition-colors cursor-pointer text-left shadow-2xs"
                  >
                    <div className="flex items-center space-x-1.5 truncate flex-1 min-w-0">
                      {assignedUsersList.length === 0 ? (
                        <span className="text-slate-400">Unassigned</span>
                      ) : (
                        <div className="flex items-center space-x-1 truncate">
                          <div className="flex -space-x-1 shrink-0">
                            {assignedUsersList.slice(0, 2).map(u => (
                              u.avatar ? (
                                <img key={u.id} src={u.avatar} alt={u.name} className="w-4 h-4 rounded-full object-cover ring-1 ring-white" />
                              ) : (
                                <div key={u.id} className="w-4 h-4 rounded-full bg-blue-600 text-white font-bold text-[7px] flex items-center justify-center ring-1 ring-white">
                                  {u.name?.charAt(0).toUpperCase()}
                                </div>
                              )
                            ))}
                          </div>
                          <span className="truncate text-slate-800 text-[11px] font-semibold">
                            {assignedUsersList.map(u => u.name).join(', ')}
                          </span>
                        </div>
                      )}
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
                  </button>

                  {/* Multi-Select Dropdown Menu with Checkboxes */}
                  {isAssigneeDropdownOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsAssigneeDropdownOpen(false)}
                      />
                      <div className="absolute top-full right-0 mt-1 w-72 max-w-[calc(100vw-2rem)] bg-white border border-slate-200 rounded-lg shadow-xl z-50 p-2 space-y-1 animate-in fade-in zoom-in-95 duration-100 max-h-60 overflow-y-auto">
                        <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between border-b border-slate-100 mb-1">
                          <span>Select Assignees</span>
                          <span className="font-mono text-blue-600 font-bold">{assignedUserIds.length} Selected</span>
                        </div>

                        {allAvailableUsers.map(u => {
                          const isAssigned = assignedUserIds.includes(String(u.id));
                          const roleLabel = getUserRoleName ? getUserRoleName(u) : (u.role || 'Member');
                          return (
                            <div
                              key={u.id}
                              onClick={() => handleToggleAssignee(u.id)}
                              className={`flex items-center justify-between p-2 rounded-md cursor-pointer transition-colors text-xs ${
                                isAssigned ? 'bg-blue-50 text-blue-900 font-semibold' : 'hover:bg-slate-50 text-slate-700'
                              }`}
                            >
                              <div className="flex items-center space-x-2 min-w-0">
                                {u.avatar ? (
                                  <img src={u.avatar} alt={u.name} className="w-5 h-5 rounded-full object-cover shrink-0" />
                                ) : (
                                  <div className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-[8px] flex items-center justify-center shrink-0">
                                    {u.name?.charAt(0).toUpperCase()}
                                  </div>
                                )}
                                <div className="truncate">
                                  <div className="truncate text-xs">{u.name}</div>
                                  <div className="text-[9px] text-slate-400 truncate">{roleLabel}</div>
                                </div>
                              </div>
                              <input
                                type="checkbox"
                                checked={isAssigned}
                                onChange={() => {}}
                                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 shrink-0 pointer-events-none"
                              />
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Story Points */}
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Story Points</label>
              {canEditScope ? (
                <input
                  type="number"
                  value={selectedTask.storyPoints}
                  onChange={(e) => updateTask(selectedTask.id, { storyPoints: parseInt(e.target.value) || 0 })}
                  className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs font-mono font-semibold text-slate-800 outline-none focus:border-blue-500"
                />
              ) : (
                <div className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs font-mono font-semibold text-slate-800">
                  {selectedTask.storyPoints} pts
                </div>
              )}
            </div>

            {/* Due Date */}
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Due Date</label>
              {canEditScope ? (
                <input
                  type="date"
                  value={selectedTask.dueDate}
                  onChange={(e) => updateTask(selectedTask.id, { dueDate: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs font-mono text-slate-800 outline-none focus:border-blue-500"
                />
              ) : (
                <div className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs font-mono text-slate-800">
                  {selectedTask.dueDate || '—'}
                </div>
              )}
            </div>

            {/* Target Sprint */}
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Target Sprint</label>
              {canEditScope ? (
                <select
                  value={selectedTask.sprintId || ''}
                  onChange={(e) => {
                    const spId = e.target.value;
                    const sp = sprints.find(s => String(s.id) === String(spId));
                    updateTask(selectedTask.id, {
                      sprintId: spId,
                      sprintName: sp ? sp.name : '',
                      projectId: sp?.projectId || selectedTask.projectId,
                      projectName: sp?.projectName || selectedTask.projectName
                    });
                  }}
                  className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs font-semibold text-slate-800 outline-none cursor-pointer focus:border-blue-500"
                >
                  <option value="">-- No Sprint (Backlog) --</option>
                  {((sprints || []).filter(s => !currentProject || !s.projectId || s.projectId === currentProject?.id || String(s.projectId) === String(currentProject?.id)).length > 0
                    ? (sprints || []).filter(s => !currentProject || !s.projectId || s.projectId === currentProject?.id || String(s.projectId) === String(currentProject?.id))
                    : (sprints || [])
                  ).map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              ) : (
                <div className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs font-semibold text-slate-800 truncate">
                  {selectedTask.sprintName || 'No Sprint (Backlog)'}
                </div>
              )}
            </div>

            {/* QA Testing Status & Assigned Tester */}
            <div className="col-span-2 sm:col-span-3 pt-1 border-t border-slate-200/60 flex flex-wrap items-center justify-between gap-2">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">QA Testing Status</label>
                <div className="flex items-center space-x-2">
                  <span className={`inline-block px-2 py-0.5 rounded font-bold text-[10px] ${
                    selectedTask.testingStatus === 'Passed' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                    selectedTask.testingStatus === 'Failed' ? 'bg-red-100 text-red-800 border border-red-200' :
                    selectedTask.testingStatus === 'In Testing' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                    'bg-amber-100 text-amber-800 border border-amber-200'
                  }`}>
                    {selectedTask.testingStatus || 'Pending Testing'}
                  </span>
                  {selectedTask.testerName ? (
                    <span className="text-[11px] text-slate-600 font-medium">
                      Assigned Tester(s): <strong className="text-purple-700 font-bold">{selectedTask.testerName}</strong>
                    </span>
                  ) : (
                    <span className="text-[11px] text-slate-400 italic">No tester assigned yet</span>
                  )}
                </div>
              </div>

              {(canAssign || canSendTesting) && (
                <button
                  type="button"
                  onClick={() => openSendToTestingModal(selectedTask)}
                  className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-[11px] rounded-lg border border-purple-200 transition-colors flex items-center space-x-1 cursor-pointer shrink-0"
                >
                  <TestTube2 className="w-3.5 h-3.5" />
                  <span>{selectedTask.testerId ? 'Change QA Tester(s)' : 'Assign to QA Tester(s)'}</span>
                </button>
              )}
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
