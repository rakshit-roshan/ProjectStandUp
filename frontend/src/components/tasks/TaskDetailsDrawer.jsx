import React, { useState, useEffect, useRef } from 'react';
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
  Plus,
  Trash2,
  Bug,
  Shield,
  FileText,
  Eye,
  ChevronDown,
  TestTube2,
  Check,
  AlertTriangle,
  Copy,
  Download,
  Upload,
  Image as ImageIcon,
  File as FileIcon,
  Maximize2
} from 'lucide-react';

const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

export const TaskDetailsDrawer = () => {
  const {
    isTaskDrawerOpen,
    setIsTaskDrawerOpen,
    selectedTask,
    updateTask,
    updateTaskStatus,
    deleteTask,
    users = [],
    currentUser,
    currentRole,
    sprints = [],
    currentProject,
    projects = [],
    getProjectMembers,
    isViewer,
    openSendToTestingModal,
    getUserRoleName,
    canManageTaskAssignment,
    canEditTaskScope,
    canUpdateTaskStatus,
    canSendTaskToTesting,
    issues = [],
    setSelectedIssueId,
    setIsIssueDrawerOpen
  } = useApp();

  // Local editable draft state to ensure zero input lag
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [status, setStatus] = useState('Backlog');
  const [storyPoints, setStoryPoints] = useState(3);
  const [dueDate, setDueDate] = useState('');
  const [sprintId, setSprintId] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [subtasks, setSubtasks] = useState([]);

  // UI States
  const [isAssigneeDropdownOpen, setIsAssigneeDropdownOpen] = useState(false);
  const [assigneeSearchQuery, setAssigneeSearchQuery] = useState('');
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [previewAttachment, setPreviewAttachment] = useState(null);
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const fileInputRef = useRef(null);

  const viewerMode = isViewer ? isViewer() : false;
  const canAssign = canManageTaskAssignment ? canManageTaskAssignment(currentUser) : false;
  const canEditScope = canEditTaskScope ? canEditTaskScope(currentUser) : false;
  const canChangeStatus = canUpdateTaskStatus ? canUpdateTaskStatus(selectedTask, currentUser) : false;
  const canSendTesting = canSendTaskToTesting ? canSendTaskToTesting(selectedTask, currentUser) : false;

  const teamMembers = getProjectMembers ? getProjectMembers(currentProject) : [];
  const allAvailableUsers = [
    ...teamMembers,
    ...users.filter(u => !teamMembers.some(tm => String(tm.id) === String(u.id)))
  ];

  // Sync draft state with selectedTask whenever drawer opens or selectedTask changes
  useEffect(() => {
    if (selectedTask && isTaskDrawerOpen) {
      setTitle(selectedTask.title || '');
      setDescription(selectedTask.description || '');
      setPriority(selectedTask.priority || 'Medium');
      setStatus(selectedTask.status || 'Backlog');
      setStoryPoints(selectedTask.storyPoints ?? 3);
      setDueDate(selectedTask.dueDate || '');
      setSprintId(selectedTask.sprintId || '');
      setAttachments(Array.isArray(selectedTask.attachments) ? selectedTask.attachments : []);
      setSubtasks(Array.isArray(selectedTask.subtasks) ? selectedTask.subtasks : []);
      setSaveSuccess(false);
      setErrorMessage(null);
      setIsAssigneeDropdownOpen(false);
      setAssigneeSearchQuery('');
    }
  }, [isTaskDrawerOpen, selectedTask?.id]);

  // Auto-save title on blur
  const handleTitleBlur = async () => {
    const trimmed = title.trim();
    if (selectedTask && trimmed && trimmed !== (selectedTask.title || '')) {
      setIsSaving(true);
      try {
        await updateTask(selectedTask.id, { title: trimmed });
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2000);
      } catch (err) {
        console.error('Failed to auto-save task title:', err);
        setErrorMessage(err.message || 'Failed to save title');
      } finally {
        setIsSaving(false);
      }
    }
  };

  // Auto-save description on blur
  const handleDescriptionBlur = async () => {
    const trimmed = description.trim();
    if (selectedTask && trimmed !== (selectedTask.description || '')) {
      setIsSaving(true);
      try {
        await updateTask(selectedTask.id, { description: trimmed });
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2000);
      } catch (err) {
        console.error('Failed to auto-save task description:', err);
        setErrorMessage(err.message || 'Failed to save description');
      } finally {
        setIsSaving(false);
      }
    }
  };

  // Keyboard shortcut: Escape to close, Ctrl+S / Cmd+S to save
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isTaskDrawerOpen) return;
      if (e.key === 'Escape') {
        if (previewAttachment) {
          setPreviewAttachment(null);
        } else if (isAssigneeDropdownOpen) {
          setIsAssigneeDropdownOpen(false);
        } else {
          setIsTaskDrawerOpen(false);
        }
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isTaskDrawerOpen, previewAttachment, isAssigneeDropdownOpen, title, description, storyPoints, dueDate, priority, sprintId]);

  if (!isTaskDrawerOpen || !selectedTask) return null;

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

  const handleCopyId = () => {
    navigator.clipboard.writeText(selectedTask.id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  // Immediate toggle for assignees with auto-persist
  const handleToggleAssignee = async (uId) => {
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

    try {
      await updateTask(selectedTask.id, {
        assigneeId: assigneeIdsStr,
        assigneeIds: assignedUsers.map(u => u.id),
        assigneeName: assigneeNamesStr,
        assigneeAvatar: assignedUsers[0]?.avatar || ''
      });
    } catch (err) {
      console.error('Failed to update task assignees:', err);
    }
  };

  // Status Change with auto-persist
  const handleStatusChange = async (newStatus) => {
    setStatus(newStatus);
    try {
      await updateTaskStatus(selectedTask.id, newStatus);
    } catch (err) {
      console.error('Failed to update task status:', err);
    }
  };

  // Priority Change with auto-persist
  const handlePriorityChange = async (newPriority) => {
    setPriority(newPriority);
    try {
      await updateTask(selectedTask.id, { priority: newPriority });
    } catch (err) {
      console.error('Failed to update task priority:', err);
    }
  };

  // Sprint Change with auto-persist
  const handleSprintChange = async (newSprintId) => {
    setSprintId(newSprintId);
    const sp = sprints.find(s => String(s.id) === String(newSprintId));
    try {
      await updateTask(selectedTask.id, {
        sprintId: newSprintId,
        sprintName: sp ? sp.name : '',
        projectId: sp?.projectId || selectedTask.projectId,
        projectName: sp?.projectName || selectedTask.projectName
      });
    } catch (err) {
      console.error('Failed to update task sprint:', err);
    }
  };

  // Subtask management
  const handleSubtaskToggle = async (subtaskId) => {
    const updatedSubtasks = (subtasks || []).map(st => 
      st.id === subtaskId ? { ...st, completed: !st.completed } : st
    );
    setSubtasks(updatedSubtasks);
    try {
      await updateTask(selectedTask.id, { subtasks: updatedSubtasks });
    } catch (err) {
      console.error('Failed to update subtask:', err);
    }
  };

  const handleAddSubtask = async () => {
    if (!newSubtaskTitle.trim()) return;
    const newSt = {
      id: `SUB-${Date.now()}`,
      title: newSubtaskTitle.trim(),
      completed: false
    };
    const updatedSubtasks = [...(subtasks || []), newSt];
    setSubtasks(updatedSubtasks);
    setNewSubtaskTitle('');
    try {
      await updateTask(selectedTask.id, { subtasks: updatedSubtasks });
    } catch (err) {
      console.error('Failed to add subtask:', err);
    }
  };

  const handleDeleteSubtask = async (subtaskId) => {
    const updatedSubtasks = (subtasks || []).filter(st => st.id !== subtaskId);
    setSubtasks(updatedSubtasks);
    try {
      await updateTask(selectedTask.id, { subtasks: updatedSubtasks });
    } catch (err) {
      console.error('Failed to delete subtask:', err);
    }
  };

  // File Attachments Handling
  const processFiles = (fileList) => {
    if (!fileList || fileList.length === 0) return;

    const validFiles = Array.from(fileList).filter(file => {
      if (file.size > 10 * 1024 * 1024) {
        alert(`File "${file.name}" exceeds the 10MB size limit.`);
        return false;
      }
      return true;
    });

    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const dataUrl = e.target.result;
        const isImage = file.type.startsWith('image/');
        const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');

        const newAttachment = {
          id: 'att_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
          name: file.name,
          size: file.size,
          type: file.type || (isPdf ? 'application/pdf' : 'application/octet-stream'),
          dataUrl,
          isImage,
          isPdf,
          uploadedAt: new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
        };

        const updatedAttachments = [...attachments, newAttachment];
        setAttachments(updatedAttachments);
        try {
          await updateTask(selectedTask.id, { attachments: updatedAttachments });
        } catch (err) {
          console.error('Failed to save attachment:', err);
        }
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleFileUpload = (e) => {
    processFiles(e.target.files);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDraggingFile(false);
    if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleRemoveAttachment = async (attId) => {
    const updatedAttachments = attachments.filter(a => a.id !== attId);
    setAttachments(updatedAttachments);
    try {
      await updateTask(selectedTask.id, { attachments: updatedAttachments });
    } catch (err) {
      console.error('Failed to remove attachment:', err);
    }
  };

  // Explicit Save Changes button action - ALWAYS AVAILABLE
  const handleSave = async () => {
    if (!title.trim()) {
      setErrorMessage('Task title cannot be empty.');
      return;
    }
    setIsSaving(true);
    setSaveSuccess(false);
    setErrorMessage(null);

    const selectedSprint = sprints.find(s => String(s.id) === String(sprintId));

    try {
      await updateTask(selectedTask.id, {
        title: title.trim(),
        description: description.trim(),
        priority,
        status,
        storyPoints: parseInt(storyPoints) || 0,
        dueDate,
        sprintId,
        sprintName: selectedSprint ? selectedSprint.name : (sprintId ? selectedTask.sprintName : ''),
        projectId: selectedSprint?.projectId || selectedTask.projectId,
        projectName: selectedSprint?.projectName || selectedTask.projectName,
        attachments,
        subtasks
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to save task:', err);
      setErrorMessage(err.message || 'Failed to save changes. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const hasUnsavedChanges = 
    title !== (selectedTask.title || '') ||
    description !== (selectedTask.description || '') ||
    (parseInt(storyPoints) || 0) !== (selectedTask.storyPoints ?? 0) ||
    dueDate !== (selectedTask.dueDate || '');

  const completedSubtasksCount = (subtasks || []).filter(s => s.completed).length;
  const totalSubtasksCount = (subtasks || []).length;
  const subtasksPercent = totalSubtasksCount > 0 ? Math.round((completedSubtasksCount / totalSubtasksCount) * 100) : 0;

  // Filtered assignees for search
  const filteredUsers = allAvailableUsers.filter(u => 
    !assigneeSearchQuery.trim() || 
    u.name?.toLowerCase().includes(assigneeSearchQuery.toLowerCase()) ||
    u.email?.toLowerCase().includes(assigneeSearchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs flex justify-end animate-in fade-in duration-150">
      <div 
        className="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50/90 backdrop-blur-sm sticky top-0 z-20">
          <div className="flex items-center space-x-2.5 min-w-0">
            {/* Task ID Pill with Click-to-Copy */}
            <button
              type="button"
              onClick={handleCopyId}
              title="Click to copy Task ID"
              className="flex items-center space-x-1.5 font-mono text-xs font-bold text-blue-700 px-2.5 py-1 bg-blue-100/80 hover:bg-blue-200/80 rounded-md border border-blue-200 transition-colors cursor-pointer"
            >
              <span>{selectedTask.id}</span>
              {copiedId ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-blue-500" />}
            </button>

            {/* Project Name Breadcrumb */}
            <span className="text-xs text-slate-500 font-semibold truncate max-w-[200px]" title={selectedTask.projectName}>
              {selectedTask.projectName || 'Project Workspace'}
            </span>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            {/* QA Testing Hand-off Button */}
            {canSendTesting && (
              <button
                type="button"
                onClick={() => openSendToTestingModal(selectedTask)}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white rounded-lg text-xs font-bold shadow-2xs transition-colors cursor-pointer"
                title="Send Completed Task to QA Testing"
              >
                <TestTube2 className="w-3.5 h-3.5" />
                <span>Send to Testing</span>
              </button>
            )}

            {/* Viewer Badge or Contributor Badge */}
            {viewerMode ? (
              <span className="flex items-center space-x-1 px-2.5 py-1 bg-slate-100 text-slate-600 rounded-md text-xs font-semibold border border-slate-200">
                <Eye className="w-3.5 h-3.5 text-slate-500" />
                <span>Read-Only</span>
              </span>
            ) : !canEditScope && (
              <span className="flex items-center space-x-1 px-2.5 py-1 bg-slate-100 text-slate-600 rounded-md text-xs font-semibold border border-slate-200">
                <Shield className="w-3.5 h-3.5 text-slate-400" />
                <span>Contributor Access</span>
              </span>
            )}

            {/* Delete Button */}
            {canEditScope && (
              <button
                type="button"
                onClick={() => {
                  if (window.confirm(`Are you sure you want to delete task "${selectedTask.title}" (${selectedTask.id})?`)) {
                    deleteTask(selectedTask.id);
                    setIsTaskDrawerOpen(false);
                  }
                }}
                className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg border border-red-200 transition-colors cursor-pointer"
                title="Delete Task"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}

            {/* Close Drawer Button */}
            <button
              type="button"
              onClick={() => setIsTaskDrawerOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors ml-1"
              title="Close panel (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Drawer Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2 text-xs text-red-800">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* QA Status Alert Banners */}
          {(selectedTask.testingStatus === 'Failed' || (selectedTask.hasIssue && selectedTask.testingStatus !== 'Passed' && selectedTask.status !== 'Completed')) ? (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-center justify-between text-xs text-red-900 animate-in fade-in duration-150 shadow-2xs">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                  <Bug className="w-4 h-4 text-red-600" />
                </div>
                <div>
                  <span className="font-bold block">QA Defect Reported (Testing Failed)</span>
                  <span className="text-[11px] text-red-700">This task was rejected during QA verification. Assign team members below to resolve defects.</span>
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
                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold shrink-0 cursor-pointer transition-colors shadow-2xs"
              >
                Inspect Defect →
              </button>
            </div>
          ) : selectedTask.testingStatus === 'Passed' ? (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-900 animate-in fade-in duration-150 shadow-2xs">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <span className="font-bold block">QA Testing Passed & Verified</span>
                  <span className="text-[11px] text-emerald-700">
                    This task has passed all QA test cases successfully{selectedTask.testerName ? ` (Verified by ${selectedTask.testerName})` : ''}.
                  </span>
                </div>
              </div>
              <span className="px-2.5 py-1 bg-emerald-600 text-white rounded-md text-xs font-bold shrink-0 shadow-2xs">
                Verified ✓
              </span>
            </div>
          ) : (selectedTask.testingStatus === 'Pending Testing' || (selectedTask.status === 'In Review' && selectedTask.testingStatus !== 'Failed')) ? (
            <div className="p-3.5 bg-purple-50 border border-purple-200 rounded-xl flex items-center justify-between text-xs text-purple-900 animate-in fade-in duration-150 shadow-2xs">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
                  <TestTube2 className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <span className="font-bold block">In QA Verification Queue</span>
                  <span className="text-[11px] text-purple-700">
                    Task is ready for quality assurance testing{selectedTask.testerName ? ` (Assigned Tester: ${selectedTask.testerName})` : ''}.
                  </span>
                </div>
              </div>
              <span className="px-2.5 py-1 bg-purple-100 text-purple-800 border border-purple-200 rounded-md text-xs font-bold shrink-0">
                In Review
              </span>
            </div>
          ) : null}

          {/* Development Complete Alert for Assigner */}
          {selectedTask.status === 'Completed' && selectedTask.testingStatus !== 'Passed' && (
            canSendTesting ? (
              <div className="p-3.5 bg-purple-50 border border-purple-200 rounded-xl flex items-center justify-between text-xs text-purple-900 animate-in fade-in duration-150 shadow-2xs">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
                    <TestTube2 className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <span className="font-bold block">Development Complete — Ready for QA</span>
                    <span className="text-[11px] text-purple-700">Work is finished. Route to QA tester(s) to verify acceptance criteria.</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => openSendToTestingModal(selectedTask)}
                  className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white rounded-lg text-xs font-bold shrink-0 cursor-pointer transition-colors shadow-2xs"
                >
                  Send to QA →
                </button>
              </div>
            ) : (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-900">
                <div className="flex items-center space-x-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <span className="font-bold block">Completed by Developer</span>
                    <span className="text-[11px] text-emerald-700">Awaiting manager or assigner review to hand off to QA testing.</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded text-[10px]">
                  Ready for QA
                </span>
              </div>
            )
          )}

          {/* Title & Description Workspace */}
          <div className="space-y-3">
            {canEditScope ? (
              <div className="space-y-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Task Title *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    onBlur={handleTitleBlur}
                    placeholder="Task title..."
                    className="w-full text-lg font-bold text-slate-900 bg-white border border-slate-200 hover:border-slate-300 focus:border-blue-500 rounded-lg px-3 py-2 outline-none transition-all shadow-2xs"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Description & Specifications
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    onBlur={handleDescriptionBlur}
                    placeholder="Add detailed task description, acceptance criteria, or technical notes..."
                    rows={4}
                    className="w-full text-xs text-slate-700 bg-white border border-slate-200 hover:border-slate-300 focus:border-blue-500 rounded-lg p-3 outline-none transition-all resize-y shadow-2xs leading-relaxed"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <h2 className="text-lg font-bold text-slate-900 leading-snug">{selectedTask.title}</h2>
                <div className="text-xs text-slate-700 bg-slate-50 p-3.5 rounded-lg border border-slate-200 whitespace-pre-wrap leading-relaxed">
                  {selectedTask.description || <span className="text-slate-400 italic">No description provided for this task.</span>}
                </div>
              </div>
            )}
          </div>

          {/* Key Properties Grid */}
          <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200 space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 text-xs">
              {/* Status Selector */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Status</label>
                {canChangeStatus ? (
                  <select
                    value={status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    className="w-full bg-white border border-slate-200 hover:border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-800 outline-none cursor-pointer focus:border-blue-500 shadow-2xs transition-colors"
                  >
                    <option value="Backlog">Backlog</option>
                    <option value="In Progress">In Progress</option>
                    <option value="In Review">In Review</option>
                    <option value="Completed">Completed</option>
                  </select>
                ) : (
                  <div className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-800">
                    {selectedTask.status}
                  </div>
                )}
              </div>

              {/* Priority Selector */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Priority</label>
                {canEditScope ? (
                  <select
                    value={priority}
                    onChange={(e) => handlePriorityChange(e.target.value)}
                    className="w-full bg-white border border-slate-200 hover:border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-800 outline-none cursor-pointer focus:border-blue-500 shadow-2xs transition-colors"
                  >
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                ) : (
                  <div className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-800">
                    {selectedTask.priority}
                  </div>
                )}
              </div>

              {/* Target Sprint Selector */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Target Sprint</label>
                {canEditScope ? (
                  <select
                    value={sprintId}
                    onChange={(e) => handleSprintChange(e.target.value)}
                    className="w-full bg-white border border-slate-200 hover:border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-800 outline-none cursor-pointer focus:border-blue-500 shadow-2xs transition-colors truncate"
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
                  <div className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-800 truncate">
                    {selectedTask.sprintName || 'No Sprint (Backlog)'}
                  </div>
                )}
              </div>

              {/* Story Points */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Story Points</label>
                {canEditScope ? (
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={storyPoints}
                    onChange={(e) => setStoryPoints(e.target.value)}
                    className="w-full bg-white border border-slate-200 hover:border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-mono font-semibold text-slate-800 outline-none focus:border-blue-500 shadow-2xs"
                  />
                ) : (
                  <div className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-mono font-semibold text-slate-800">
                    {selectedTask.storyPoints ?? 0} pts
                  </div>
                )}
              </div>

              {/* Due Date */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Due Date</label>
                {canEditScope ? (
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full bg-white border border-slate-200 hover:border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-mono text-slate-800 outline-none focus:border-blue-500 shadow-2xs"
                  />
                ) : (
                  <div className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-mono text-slate-800">
                    {selectedTask.dueDate || '—'}
                  </div>
                )}
              </div>

              {/* Assignees Selector */}
              <div className="relative">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Assignees ({assignedUserIds.length})
                </label>

                {!canAssign ? (
                  <div className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-800 min-h-[32px] flex items-center">
                    {assignedUsersList.length === 0 ? (
                      <span className="text-slate-400 italic text-[11px]">Unassigned</span>
                    ) : (
                      <div className="flex items-center space-x-1 truncate">
                        <div className="flex -space-x-1 shrink-0">
                          {assignedUsersList.slice(0, 3).map(u => (
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
                      className="w-full bg-white border border-slate-200 hover:border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-800 outline-none flex items-center justify-between transition-colors cursor-pointer text-left shadow-2xs"
                    >
                      <div className="flex items-center space-x-1.5 truncate flex-1 min-w-0">
                        {assignedUsersList.length === 0 ? (
                          <span className="text-slate-400 italic text-[11px]">Unassigned</span>
                        ) : (
                          <div className="flex items-center space-x-1 truncate">
                            <div className="flex -space-x-1 shrink-0">
                              {assignedUsersList.slice(0, 3).map(u => (
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
                              {assignedUsersList.length === 1 ? assignedUsersList[0].name : `${assignedUsersList.length} Assigned`}
                            </span>
                          </div>
                        )}
                      </div>
                      <ChevronDown className={`w-3.5 h-3.5 text-slate-400 shrink-0 ml-1 transition-transform ${isAssigneeDropdownOpen ? 'rotate-180 text-blue-600' : ''}`} />
                    </button>

                    {/* Multi-Select Dropdown Menu */}
                    {isAssigneeDropdownOpen && (
                      <>
                        <div
                          className="fixed inset-0 z-40"
                          onClick={() => setIsAssigneeDropdownOpen(false)}
                        />
                        <div className="absolute top-full right-0 mt-1 w-72 max-w-[calc(100vw-2rem)] bg-white border border-slate-200 rounded-xl shadow-2xl z-50 p-2.5 space-y-2 animate-in fade-in zoom-in-95 duration-100 max-h-72 flex flex-col">
                          <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Select Team Assignees</span>
                            <span className="font-mono text-[11px] text-blue-600 font-bold">{assignedUserIds.length} Selected</span>
                          </div>

                          {/* Quick Filter */}
                          <input
                            type="text"
                            placeholder="Filter members..."
                            value={assigneeSearchQuery}
                            onChange={(e) => setAssigneeSearchQuery(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs outline-none focus:border-blue-500"
                          />

                          <div className="overflow-y-auto space-y-1 flex-1 pr-0.5">
                            {filteredUsers.length === 0 ? (
                              <div className="p-2 text-center text-slate-400 text-xs">No team members found</div>
                            ) : (
                              filteredUsers.map(u => {
                                const isAssigned = assignedUserIds.includes(String(u.id));
                                const roleLabel = getUserRoleName ? getUserRoleName(u) : (u.role || 'Member');
                                return (
                                  <div
                                    key={u.id}
                                    onClick={() => handleToggleAssignee(u.id)}
                                    className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors text-xs ${
                                      isAssigned ? 'bg-blue-50 text-blue-900 font-semibold' : 'hover:bg-slate-50 text-slate-700'
                                    }`}
                                  >
                                    <div className="flex items-center space-x-2 min-w-0">
                                      {u.avatar ? (
                                        <img src={u.avatar} alt={u.name} className="w-5 h-5 rounded-full object-cover shrink-0 ring-1 ring-slate-200" />
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
                              })
                            )}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* QA Testing Status & Assigned Tester Footer */}
            <div className="pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">QA Testing Verification</label>
                <div className="flex items-center space-x-2">
                  <span className={`inline-block px-2 py-0.5 rounded-md font-bold text-[10px] ${
                    selectedTask.testingStatus === 'Passed' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                    selectedTask.testingStatus === 'Failed' ? 'bg-red-100 text-red-800 border border-red-200' :
                    selectedTask.testingStatus === 'In Testing' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                    'bg-amber-100 text-amber-800 border border-amber-200'
                  }`}>
                    {selectedTask.testingStatus || 'Pending Testing'}
                  </span>
                  {selectedTask.testerName ? (
                    <span className="text-[11px] text-slate-600 font-medium">
                      QA Tester: <strong className="text-purple-700 font-bold">{selectedTask.testerName}</strong>
                    </span>
                  ) : (
                    <span className="text-[11px] text-slate-400 italic">No QA tester assigned</span>
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
                  <span>{selectedTask.testerId ? 'Change QA Tester' : 'Assign QA Tester'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Subtasks & Checklist Section */}
          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-2">
                <span>Subtasks & Checklist</span>
                <span className="text-[10px] font-mono px-2 py-0.5 bg-slate-100 text-slate-600 rounded font-semibold">
                  {completedSubtasksCount} / {totalSubtasksCount}
                </span>
              </h3>
              {totalSubtasksCount > 0 && (
                <span className="text-[10px] font-mono font-bold text-slate-500">
                  {subtasksPercent}% done
                </span>
              )}
            </div>

            {/* Visual Progress Bar */}
            {totalSubtasksCount > 0 && (
              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div 
                  className={`h-full transition-all duration-300 rounded-full ${subtasksPercent === 100 ? 'bg-emerald-500' : 'bg-blue-600'}`}
                  style={{ width: `${subtasksPercent}%` }}
                />
              </div>
            )}

            {/* Subtask Items */}
            <div className="space-y-1.5">
              {(subtasks || []).map(st => (
                <div
                  key={st.id}
                  className="group flex items-center space-x-2.5 p-2 bg-slate-50/80 hover:bg-slate-100 rounded-lg border border-slate-200 text-xs transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={st.completed}
                    onChange={() => handleSubtaskToggle(st.id)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <span 
                    onClick={() => handleSubtaskToggle(st.id)}
                    className={`flex-1 cursor-pointer select-none ${st.completed ? 'line-through text-slate-400' : 'text-slate-800 font-medium'}`}
                  >
                    {st.title}
                  </span>
                  {canEditScope && (
                    <button
                      type="button"
                      onClick={() => handleDeleteSubtask(st.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-600 rounded transition-opacity"
                      title="Delete subtask item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Add Subtask Input */}
            {canEditScope && (
              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="text"
                  placeholder="Add a new checklist or subtask item..."
                  value={newSubtaskTitle}
                  onChange={(e) => setNewSubtaskTitle(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddSubtask()}
                  className="flex-1 bg-white border border-slate-200 hover:border-slate-300 focus:border-blue-500 rounded-lg px-3 py-1.5 text-xs outline-none shadow-2xs transition-all"
                />
                <button
                  type="button"
                  onClick={handleAddSubtask}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg transition-colors cursor-pointer shrink-0"
                >
                  <Plus className="w-3.5 h-3.5 inline mr-1" />
                  <span>Add</span>
                </button>
              </div>
            )}
          </div>

          {/* Attachments & Files Section */}
          <div className="space-y-3 pt-3 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-1.5">
                <Paperclip className="w-3.5 h-3.5 text-blue-600" />
                <span>Attachments & Documentation</span>
                <span className="text-[10px] font-mono px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full font-bold ml-1">
                  {attachments.length}
                </span>
              </h3>

              {canEditScope && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center space-x-1 px-2.5 py-1 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload File</span>
                </button>
              )}
            </div>

            {/* Hidden File Input */}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileUpload}
              className="hidden"
            />

            {/* Drag & Drop Upload Zone */}
            {canEditScope && (
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDraggingFile(true); }}
                onDragLeave={() => setIsDraggingFile(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
                  isDraggingFile 
                    ? 'border-blue-500 bg-blue-50/50 scale-[1.01]' 
                    : 'border-slate-200 hover:border-blue-400 bg-slate-50/50 hover:bg-slate-50'
                }`}
              >
                <div className="flex flex-col items-center justify-center space-y-1">
                  <Upload className={`w-6 h-6 ${isDraggingFile ? 'text-blue-600 animate-bounce' : 'text-slate-400'}`} />
                  <p className="text-xs font-semibold text-slate-700">
                    <span className="text-blue-600 hover:underline">Click to upload</span> or drag and drop files here
                  </p>
                  <p className="text-[10px] text-slate-400">
                    Images, PDFs, Specs, Architecture diagrams (Max 10MB each)
                  </p>
                </div>
              </div>
            )}

            {/* Attachments List */}
            {attachments.length === 0 ? (
              <div className="text-center py-4 bg-slate-50/50 rounded-xl border border-slate-100 text-xs text-slate-400">
                No files or specifications attached to this task.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {attachments.map((att, idx) => {
                  const isImg = att.isImage || att.type?.startsWith('image/');
                  const isPdf = att.isPdf || att.type === 'application/pdf' || att.name?.toLowerCase().endsWith('.pdf');

                  return (
                    <div
                      key={att.id || idx}
                      className="group bg-white hover:bg-slate-50/80 border border-slate-200 rounded-xl p-2.5 flex items-center space-x-3 transition-all shadow-2xs relative"
                    >
                      {/* Thumbnail or File Icon */}
                      {isImg ? (
                        <div
                          onClick={() => setPreviewAttachment(att)}
                          className="w-11 h-11 rounded-lg overflow-hidden shrink-0 bg-slate-100 relative cursor-pointer ring-1 ring-slate-200"
                        >
                          <img
                            src={att.dataUrl}
                            alt={att.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                          <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <Maximize2 className="w-3.5 h-3.5 text-white drop-shadow" />
                          </div>
                        </div>
                      ) : isPdf ? (
                        <div
                          onClick={() => setPreviewAttachment(att)}
                          className="w-11 h-11 rounded-lg bg-red-50 text-red-600 border border-red-200 flex flex-col items-center justify-center shrink-0 cursor-pointer font-bold"
                        >
                          <FileText className="w-4 h-4 text-red-500" />
                          <span className="text-[8px] uppercase tracking-wider font-extrabold text-red-600">PDF</span>
                        </div>
                      ) : (
                        <div className="w-11 h-11 rounded-lg bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center shrink-0">
                          <FileIcon className="w-5 h-5 text-blue-500" />
                        </div>
                      )}

                      {/* File Info */}
                      <div className="min-w-0 flex-1">
                        <div
                          onClick={() => setPreviewAttachment(att)}
                          className="font-semibold text-slate-800 truncate hover:text-blue-600 cursor-pointer text-xs"
                          title={att.name}
                        >
                          {att.name}
                        </div>
                        <div className="flex items-center space-x-2 text-[10px] text-slate-400 font-mono mt-0.5">
                          <span>{formatFileSize(att.size)}</span>
                          {att.uploadedAt && <span>• {att.uploadedAt}</span>}
                        </div>
                      </div>

                      {/* Actions: Download & Delete */}
                      <div className="flex items-center space-x-1 shrink-0">
                        <a
                          href={att.dataUrl}
                          download={att.name}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          title="Download attachment"
                          onClick={e => e.stopPropagation()}
                        >
                          <Download className="w-3.5 h-3.5" />
                        </a>
                        {canEditScope && (
                          <button
                            type="button"
                            onClick={() => handleRemoveAttachment(att.id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="Remove attachment"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Drawer Sticky Footer: Save Controls & Feedback */}
        <div className="px-5 py-3 border-t border-slate-200 bg-slate-50/95 backdrop-blur-sm flex items-center justify-between sticky bottom-0 z-20">
          <div className="flex items-center space-x-2 text-xs">
            {isSaving ? (
              <span className="flex items-center space-x-1.5 text-blue-600 font-semibold">
                <span className="w-3.5 h-3.5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin inline-block" />
                <span>Saving updates...</span>
              </span>
            ) : saveSuccess ? (
              <span className="flex items-center space-x-1.5 text-emerald-600 font-bold animate-in fade-in duration-150">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Saved successfully!</span>
              </span>
            ) : (
              <span className="flex items-center space-x-1.5 text-slate-500 font-medium">
                <Check className="w-3.5 h-3.5 text-slate-400" />
                <span>Ready to save • Press Ctrl+S</span>
              </span>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              disabled={isSaving}
              onClick={handleSave}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-lg text-xs font-bold shadow-md shadow-blue-500/20 transition-all flex items-center space-x-1.5 cursor-pointer disabled:opacity-60"
              title="Save all changes to this task (Ctrl+S)"
            >
              {isSaving ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Attachment Fullscreen Preview Modal */}
      {previewAttachment && (
        <div 
          className="fixed inset-0 z-60 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setPreviewAttachment(null)}
        >
          <div 
            className="max-w-4xl max-h-[90vh] bg-white rounded-2xl overflow-hidden shadow-2xl flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            <div className="px-5 py-3 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2 truncate">
                <Paperclip className="w-4 h-4 text-blue-400" />
                <span className="font-semibold text-sm truncate">{previewAttachment.name}</span>
                <span className="text-xs text-slate-400 font-mono">({formatFileSize(previewAttachment.size)})</span>
              </div>
              <div className="flex items-center space-x-2">
                <a
                  href={previewAttachment.dataUrl}
                  download={previewAttachment.name}
                  className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                  title="Download File"
                >
                  <Download className="w-4 h-4" />
                </a>
                <button
                  type="button"
                  onClick={() => setPreviewAttachment(null)}
                  className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-4 overflow-auto flex items-center justify-center bg-slate-950/95 max-h-[calc(90vh-60px)]">
              {previewAttachment.isImage || previewAttachment.type?.startsWith('image/') ? (
                <img
                  src={previewAttachment.dataUrl}
                  alt={previewAttachment.name}
                  className="max-h-[75vh] max-w-full object-contain rounded-lg shadow-lg"
                />
              ) : previewAttachment.isPdf ? (
                <iframe
                  src={previewAttachment.dataUrl}
                  title={previewAttachment.name}
                  className="w-[80vw] max-w-3xl h-[70vh] rounded border-0"
                />
              ) : (
                <div className="text-center py-12 text-slate-300 space-y-3">
                  <FileIcon className="w-16 h-16 mx-auto text-slate-500" />
                  <p className="text-sm font-semibold">{previewAttachment.name}</p>
                  <a
                    href={previewAttachment.dataUrl}
                    download={previewAttachment.name}
                    className="inline-flex items-center space-x-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download to View</span>
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
