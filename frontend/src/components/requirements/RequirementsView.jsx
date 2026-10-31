import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import {
  FileText,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Layers,
  Zap,
  UserCheck,
  Trash2,
  Edit3,
  ArrowRight,
  ExternalLink,
  Shield,
  AlertCircle,
  Eye,
  CheckSquare,
  TestTube2,
  Sparkles,
  ChevronRight,
  X,
  Paperclip,
  Upload,
  Image as ImageIcon,
  File as FileIcon,
  Download,
  Maximize2,
  Lock,
  FolderPlus
} from 'lucide-react';

export const RequirementsView = () => {
  const {
    requirements = [],
    tasks = [],
    createRequirement,
    updateRequirement,
    deleteRequirement,
    convertRequirementToTask,
    updateTask,
    projects = [],
    currentProject,
    sprints = [],
    users = [],
    currentUser,
    isManagerOrEditorOrRoot,
    getUserRoleName,
    setSelectedTaskId,
    setIsTaskDrawerOpen,
    navigateTo
  } = useApp();

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  // Modals
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedReq, setSelectedReq] = useState(null);
  const [previewItem, setPreviewItem] = useState(null);

  // Form State for Submit / Edit (Specifications only - Target Project & Status removed)
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [category, setCategory] = useState('Feature');

  // Attachment State
  const [attachments, setAttachments] = useState([]);
  const [editAttachments, setEditAttachments] = useState([]);
  const fileInputRef = useRef(null);
  const editFileInputRef = useRef(null);

  // Form State for Move to Sprint & Assign Task (Target Project, Dynamic Sprint & Admin Status Decision)
  const [assignProjectId, setAssignProjectId] = useState('');
  const [assignSprintId, setAssignSprintId] = useState('');
  const [assigneeId, setAssigneeId] = useState('');
  const [assignStatus, setAssignStatus] = useState('Moved to Sprint');
  const [storyPoints, setStoryPoints] = useState(3);
  const [taskPriority, setTaskPriority] = useState('Medium');

  // Feedback State
  const [feedbackMessage, setFeedbackMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. Role Access Evaluator: ONLY Admin, Root, and Editor (or Manager) can access 'Move to Sprint & Assign Task'
  const canAccessMoveToSprint = (user = currentUser) => {
    if (!user) return false;
    // Root administrator bypass
    if (Boolean(user.rootadmin === 1 || String(user.rootadmin) === '1')) return true;

    // Role codes: 1 = Admin, 2 = Manager (Engineering Manager/Admin level)
    const code = Number(user.roleCode !== undefined && user.roleCode !== null ? user.roleCode : user.role);
    if (code === 1 || code === 2) return true;

    // String name checks
    const roleName = String(getUserRoleName ? getUserRoleName(user) : (user.roleName || '')).toLowerCase();
    const roleRaw = String(user.role || '').toLowerCase();

    return (
      roleName.includes('admin') ||
      roleName.includes('root') ||
      roleName.includes('editor') ||
      roleName.includes('manager') ||
      roleRaw.includes('admin') ||
      roleRaw.includes('root') ||
      roleRaw.includes('editor') ||
      roleRaw.includes('manager')
    );
  };

  // 2. Creator Ownership Evaluator: ONLY the original creator can edit their requirement
  const isCreatorOfRequirement = (req, user = currentUser) => {
    if (!req || !user) return false;

    const currentUid = String(user.id || '').trim();
    const currentName = String(user.name || user.fullname || '').toLowerCase().trim();
    const currentUsername = String(user.username || '').toLowerCase().trim();
    const currentEmail = String(user.email || user.emailid || '').toLowerCase().trim();

    const reqCreatorId = String(req.createdByUserId || '').trim();
    const reqCreatorName = String(req.createdByName || '').toLowerCase().trim();
    const reqCreatorEmail = String(req.createdByEmail || '').toLowerCase().trim();

    if (currentUid && reqCreatorId && currentUid === reqCreatorId) return true;
    if (currentName && reqCreatorName && currentName === reqCreatorName) return true;
    if (currentUsername && reqCreatorName && currentUsername === reqCreatorName) return true;
    if (currentEmail && reqCreatorEmail && currentEmail === reqCreatorEmail) return true;

    return false;
  };

  const canEditRequirement = (req) => {
    return isCreatorOfRequirement(req);
  };

  const canDeleteRequirement = (req) => {
    const isRoot = Boolean(currentUser?.rootadmin === 1 || String(currentUser?.rootadmin) === '1');
    return isCreatorOfRequirement(req) || isRoot;
  };

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const handleFilesSelect = (fileList, isEdit = false) => {
    if (!fileList || fileList.length === 0) return;
    const files = Array.from(fileList);

    files.forEach(file => {
      if (file.size > 10 * 1024 * 1024) {
        alert(`File "${file.name}" exceeds the 10MB size limit.`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
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
          isPdf
        };

        if (isEdit) {
          setEditAttachments(prev => [...prev, newAttachment]);
        } else {
          setAttachments(prev => [...prev, newAttachment]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveAttachment = (attId, isEdit = false) => {
    if (isEdit) {
      setEditAttachments(prev => prev.filter(a => a.id !== attId));
    } else {
      setAttachments(prev => prev.filter(a => a.id !== attId));
    }
  };

  // Open Submit Modal (Target Project removed)
  const openSubmitModal = () => {
    setTitle('');
    setDescription('');
    setPriority('Medium');
    setCategory('Feature');
    setAttachments([]);
    setErrorMessage(null);
    setIsSubmitModalOpen(true);
  };

  // Open Edit Modal (Strictly Creator Only - Target Project & Status removed)
  const openEditModal = (req) => {
    if (!isCreatorOfRequirement(req)) {
      alert('Access Denied: Only the creator of this requirement can edit it.');
      return;
    }
    setSelectedReq(req);
    setTitle(req.title || '');
    setDescription(req.description || '');
    setPriority(req.priority || 'Medium');
    setCategory(req.category || 'Feature');
    setEditAttachments(Array.isArray(req.attachments) ? [...req.attachments] : []);
    setErrorMessage(null);
    setIsEditModalOpen(true);
  };

  // Open Move to Sprint Modal (Admin / Root / Editor Only)
  const openAssignModal = (req) => {
    if (!canAccessMoveToSprint(currentUser)) {
      alert('Access Denied: Only Admin, Root, or Editor users can move requirements to sprint.');
      return;
    }
    setSelectedReq(req);

    // Initial project: pre-existing req.projectId, or currentProject, or first available project
    const pId = req.projectId || currentProject?.id || (projects[0]?.id || '');
    setAssignProjectId(pId);

    // Load available sprints dynamically for the selected project
    const matchingSprints = sprints.filter(s => pId && String(s.projectId) === String(pId));
    const matchingExisting = matchingSprints.find(s => String(s.id) === String(req.sprintId));
    setAssignSprintId(matchingExisting ? matchingExisting.id : (matchingSprints[0]?.id || ''));

    // Assignee
    setAssigneeId(req.assigneeId || users[0]?.id || '');

    // Status: Decided by Admin! Default to 'Moved to Sprint' if submitted, or preserve current status
    setAssignStatus(req.status && req.status !== 'Submitted' ? req.status : 'Moved to Sprint');

    setStoryPoints(req.priority === 'Critical' ? 8 : req.priority === 'High' ? 5 : 3);
    setTaskPriority(req.priority || 'Medium');
    setErrorMessage(null);
    setIsAssignModalOpen(true);
  };

  // Handle Project Change in Move to Sprint modal -> Dynamically reload sprint options
  const handleAssignProjectChange = (e) => {
    const newPId = e.target.value;
    setAssignProjectId(newPId);
    const matchingSprints = sprints.filter(s => newPId && String(s.projectId) === String(newPId));
    setAssignSprintId(matchingSprints[0]?.id || '');
  };

  // Submit New Requirement (Target Project unassigned; admin assigns later in Move to Sprint)
  const handleSubmitNewRequirement = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMessage('Requirement title is required.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const newReqData = {
        title: title.trim(),
        description: description.trim(),
        priority,
        category,
        projectId: '', // Intentionally unassigned; Admin/Editor assigns target project in Move to Sprint
        projectName: '',
        sprintId: '',
        sprintName: '',
        status: 'Submitted',
        attachments: attachments,
        createdByUserId: String(currentUser?.id || 'user-1'),
        createdByName: currentUser?.name || currentUser?.fullname || currentUser?.username || 'Team Member',
        createdByAvatar: currentUser?.avatar || '',
        createdByRole: getUserRoleName ? getUserRoleName(currentUser) : (currentUser?.role || 'Member')
      };

      await createRequirement(newReqData);
      setIsSubmitModalOpen(false);
      setAttachments([]);
      setFeedbackMessage('Requirement submitted successfully! Awaiting review and sprint assignment.');
      setTimeout(() => setFeedbackMessage(null), 3500);
    } catch (err) {
      console.error(err);
      setErrorMessage(err.message || 'Failed to submit requirement.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Save Edits (Strictly Creator Only - Content specs only, does not touch project or status)
  const handleUpdateRequirement = async (e) => {
    e.preventDefault();
    if (!selectedReq || !title.trim()) {
      setErrorMessage('Requirement title cannot be empty.');
      return;
    }
    if (!isCreatorOfRequirement(selectedReq)) {
      setErrorMessage('Permission denied: Only the creator of this requirement can edit it.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await updateRequirement(selectedReq.id, {
        title: title.trim(),
        description: description.trim(),
        priority,
        category,
        attachments: editAttachments
      });

      setIsEditModalOpen(false);
      setSelectedReq(null);
      setFeedbackMessage('Requirement specifications updated successfully!');
      setTimeout(() => setFeedbackMessage(null), 3500);
    } catch (err) {
      console.error(err);
      setErrorMessage(err.message || 'Failed to update requirement.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteRequirement = async (req) => {
    if (!canDeleteRequirement(req)) {
      alert('Access Denied: Only the creator can delete this requirement.');
      return;
    }
    if (!window.confirm(`Are you sure you want to delete requirement "${req.title}"?`)) {
      return;
    }

    try {
      await deleteRequirement(req.id);
      setFeedbackMessage('Requirement deleted successfully.');
      setTimeout(() => setFeedbackMessage(null), 3500);
    } catch (err) {
      console.error(err);
      alert(err.message || 'Failed to delete requirement.');
    }
  };

  // Admin Move to Sprint & Assign Task (Sets Target Project, Sprint, Assignee & Admin Decided Status)
  const handleConvertAndAssign = async (e) => {
    e.preventDefault();
    if (!selectedReq) return;

    if (!canAccessMoveToSprint(currentUser)) {
      setErrorMessage('Access Denied: Only Admin, Root, or Editor users can perform this action.');
      return;
    }

    if (!assignProjectId) {
      setErrorMessage('Please select a target project.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const chosenProject = projects.find(p => String(p.id) === String(assignProjectId)) || currentProject;
      const chosenSprint = sprints.find(s => String(s.id) === String(assignSprintId));
      const chosenAssignee = users.find(u => String(u.id) === String(assigneeId));

      if (selectedReq.convertedTaskId) {
        // Requirement was already converted to a task: update requirement assignment & status
        await updateRequirement(selectedReq.id, {
          status: assignStatus,
          projectId: chosenProject?.id || '',
          projectName: chosenProject?.name || '',
          sprintId: chosenSprint?.id || '',
          sprintName: chosenSprint?.name || '',
          assigneeId: chosenAssignee?.id || '',
          assigneeName: chosenAssignee?.name || chosenAssignee?.fullname || 'Unassigned',
          assigneeAvatar: chosenAssignee?.avatar || ''
        });

        if (typeof updateTask === 'function') {
          try {
            await updateTask(selectedReq.convertedTaskId, {
              projectId: chosenProject?.id,
              projectName: chosenProject?.name,
              sprintId: chosenSprint?.id || '',
              sprintName: chosenSprint?.name || '',
              assigneeId: chosenAssignee?.id || '',
              assigneeName: chosenAssignee?.name || chosenAssignee?.fullname || 'Unassigned',
              assigneeAvatar: chosenAssignee?.avatar || '',
              priority: taskPriority,
              storyPoints: parseInt(storyPoints) || 0
            });
          } catch (taskErr) {
            console.warn('Could not update linked task:', taskErr);
          }
        }
      } else {
        // Convert to task and link
        await convertRequirementToTask(
          selectedReq.id,
          {
            title: selectedReq.title,
            description: selectedReq.description || `Converted from requirement ${selectedReq.id}`,
            projectId: chosenProject?.id || '',
            projectName: chosenProject?.name || 'Default Project',
            sprintId: chosenSprint?.id || '',
            sprintName: chosenSprint?.name || '',
            assigneeId: chosenAssignee?.id || '',
            assigneeName: chosenAssignee?.name || chosenAssignee?.fullname || 'Unassigned',
            assigneeAvatar: chosenAssignee?.avatar || '',
            priority: taskPriority,
            storyPoints: parseInt(storyPoints) || 0,
            status: 'Backlog',
            labels: ['Requirement', selectedReq.category || 'Feature']
          },
          assignStatus
        );
      }

      setIsAssignModalOpen(false);
      setSelectedReq(null);
      setFeedbackMessage(`Requirement updated: status set to "${assignStatus}" in project "${chosenProject?.name || 'Assigned Project'}"!`);
      setTimeout(() => setFeedbackMessage(null), 4000);
    } catch (err) {
      console.error(err);
      setErrorMessage(err.message || 'Failed to update requirement and assign sprint.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtered Requirements
  const filteredRequirements = requirements.filter(req => {
    const matchesSearch =
      !searchTerm ||
      req.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.createdByName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.id?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || req.status === statusFilter;
    const matchesPriority = priorityFilter === 'ALL' || req.priority === priorityFilter;
    const matchesCategory = categoryFilter === 'ALL' || req.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
  });

  // Analytics Stats
  const totalCount = requirements.length;
  const submittedCount = requirements.filter(r => r.status === 'Submitted').length;
  const inProgressCount = requirements.filter(r => r.status === 'In Progress').length;
  const underReviewCount = requirements.filter(r => r.status === 'Under Review').length;
  const completedCount = requirements.filter(r => r.status === 'Completed').length;
  const inSprintCount = requirements.filter(r => r.status === 'Moved to Sprint' || r.status === 'Converted to Task').length;

  // Available sprints for selected project in Move to Sprint modal
  const availableSprintsForProject = sprints.filter(
    s => assignProjectId && (String(s.projectId) === String(assignProjectId))
  );

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto animate-in fade-in duration-200">
      {/* Header Bar */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-bold text-slate-900 tracking-tight">New Requirement & Feature Pipeline</h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-100 text-blue-800 border border-blue-200">
                Product Backlog
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Submit product requirements, track feature specifications, and assign actionable tasks into project sprints.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {feedbackMessage && (
            <div className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg font-semibold flex items-center space-x-1 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{feedbackMessage}</span>
            </div>
          )}

          {/* Any authenticated role can submit a new requirement */}
          <button
            onClick={openSubmitModal}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-xs rounded-xl shadow-md transition-all flex items-center space-x-2 shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Submit New Requirement</span>
          </button>
        </div>
      </div>

      {/* Analytics KPI Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Total Requirements</div>
            <div className="text-2xl font-bold text-slate-900 mt-1 font-mono">{totalCount}</div>
          </div>
          <div className="p-2 bg-slate-100 text-slate-600 rounded-lg">
            <FileText className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-[10px] font-semibold text-blue-600 uppercase tracking-wider">Submitted / Backlog</div>
            <div className="text-2xl font-bold text-blue-900 mt-1 font-mono">{submittedCount}</div>
          </div>
          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-[10px] font-semibold text-amber-600 uppercase tracking-wider">Active Dev / In Sprint</div>
            <div className="text-2xl font-bold text-amber-900 mt-1 font-mono">{inProgressCount + inSprintCount}</div>
          </div>
          <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
            <Zap className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-[10px] font-semibold text-purple-600 uppercase tracking-wider">Under QA Testing</div>
            <div className="text-2xl font-bold text-purple-900 mt-1 font-mono">{underReviewCount}</div>
          </div>
          <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
            <TestTube2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wider">Completed / QA Passed</div>
            <div className="text-2xl font-bold text-emerald-900 mt-1 font-mono">{completedCount}</div>
          </div>
          <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search requirements by title, description, ID, or creator..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs font-medium outline-none focus:border-blue-500 focus:bg-white transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-xs font-semibold px-2.5 py-1.5 rounded-lg outline-none focus:border-blue-500 cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="Submitted">Submitted (New)</option>
            <option value="Moved to Sprint">Moved to Sprint</option>
            <option value="In Progress">In Progress (Active Dev)</option>
            <option value="Under Review">Under Review (QA Testing)</option>
            <option value="Completed">Completed (QA Passed)</option>
          </select>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-xs font-semibold px-2.5 py-1.5 rounded-lg outline-none focus:border-blue-500 cursor-pointer"
          >
            <option value="ALL">All Priorities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-xs font-semibold px-2.5 py-1.5 rounded-lg outline-none focus:border-blue-500 cursor-pointer"
          >
            <option value="ALL">All Categories</option>
            <option value="Feature">Feature</option>
            <option value="Enhancement">Enhancement</option>
            <option value="Client Request">Client Request</option>
            <option value="Bugfix">Bugfix</option>
            <option value="Security">Security</option>
            <option value="Architecture">Architecture</option>
          </select>
        </div>
      </div>

      {/* Requirements List Container */}
      <div className="space-y-3">
        {filteredRequirements.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-3">
            <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
              <FileText className="w-6 h-6" />
            </div>
            <div className="text-sm font-bold text-slate-800">No Requirements Found</div>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No product requirements match your current search or filter criteria. Click "Submit New Requirement" above to create one.
            </p>
          </div>
        ) : (
          filteredRequirements.map((req) => {
            const isCreator = isCreatorOfRequirement(req);
            const canAssign = canAccessMoveToSprint(currentUser);
            const linkedTask = req.convertedTaskId ? tasks.find(t => String(t.id) === String(req.convertedTaskId)) : null;
            const isConverted = Boolean(req.convertedTaskId || req.status === 'Converted to Task' || req.status === 'Moved to Sprint' || req.status === 'In Progress' || req.status === 'Under Review' || req.status === 'Completed');

            return (
              <div
                key={req.id}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs hover:shadow-xs transition-all space-y-4"
              >
                {/* Top Meta Line */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                      {req.id}
                    </span>

                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-700">
                      {req.category || 'Feature'}
                    </span>

                    {/* Priority Badge */}
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                        req.priority === 'Critical'
                          ? 'bg-red-50 text-red-700 border-red-200'
                          : req.priority === 'High'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : req.priority === 'Medium'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-slate-50 text-slate-600 border-slate-200'
                      }`}
                    >
                      {req.priority || 'Medium'} Priority
                    </span>

                    {/* Status Badge */}
                    <span
                      className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase border flex items-center space-x-1.5 ${
                        req.status === 'Completed'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : req.status === 'Under Review'
                          ? 'bg-purple-50 text-purple-800 border-purple-200'
                          : req.status === 'In Progress'
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : req.status === 'Moved to Sprint' || req.status === 'Converted to Task'
                          ? 'bg-blue-50 text-blue-800 border-blue-200'
                          : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          req.status === 'Completed'
                            ? 'bg-emerald-500'
                            : req.status === 'Under Review'
                            ? 'bg-purple-500'
                            : req.status === 'In Progress'
                            ? 'bg-amber-500'
                            : req.status === 'Moved to Sprint' || req.status === 'Converted to Task'
                            ? 'bg-blue-500'
                            : 'bg-slate-400'
                        }`}
                      />
                      <span>{req.status || 'Submitted'}</span>
                    </span>

                    {/* Live QA Status Indicator Pill */}
                    {linkedTask && linkedTask.testingStatus === 'Passed' && (
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center space-x-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>QA Passed</span>
                      </span>
                    )}
                    {linkedTask && linkedTask.testingStatus === 'Failed' && (
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-red-100 text-red-800 border border-red-300 flex items-center space-x-1 animate-pulse">
                        <AlertCircle className="w-3 h-3 text-red-600" />
                        <span>QA Failed (Defect in Fix)</span>
                      </span>
                    )}
                    {linkedTask && (linkedTask.testingStatus === 'Pending Testing' || linkedTask.testingStatus === 'In Testing') && (
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-purple-100 text-purple-800 border border-purple-300 flex items-center space-x-1">
                        <TestTube2 className="w-3 h-3 text-purple-600" />
                        <span>In QA Testing</span>
                      </span>
                    )}
                  </div>

                  {/* Submission Timestamp */}
                  <div className="text-[11px] font-mono text-slate-400">
                    Submitted: {req.createdAt || 'Recent'}
                  </div>
                </div>

                {/* Requirement Content */}
                <div className="space-y-1.5">
                  <h3 className="text-sm font-bold text-slate-900 leading-snug">
                    {req.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap">
                    {req.description || 'No detailed specifications provided.'}
                  </p>
                </div>

                {/* Attachments Section if present */}
                {req.attachments && req.attachments.length > 0 && (
                  <div className="space-y-2 pt-1 border-t border-slate-100/80">
                    <div className="flex items-center space-x-1.5 text-[11px] font-bold text-slate-700">
                      <Paperclip className="w-3.5 h-3.5 text-blue-600" />
                      <span>Reference Attachments ({req.attachments.length})</span>
                    </div>

                    <div className="flex flex-wrap gap-2.5">
                      {req.attachments.map((att, idx) => {
                        const isImg = att.isImage || att.type?.startsWith('image/');
                        const isPdf = att.isPdf || att.type === 'application/pdf' || att.name?.toLowerCase().endsWith('.pdf');

                        return (
                          <div
                            key={att.id || idx}
                            className="group relative bg-slate-50 hover:bg-slate-100/90 border border-slate-200 rounded-xl overflow-hidden transition-all duration-150 flex items-center p-1.5 pr-2.5 space-x-2.5 max-w-xs text-xs shadow-2xs"
                          >
                            {isImg ? (
                              <div
                                onClick={() => setPreviewItem(att)}
                                className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-slate-200 relative cursor-pointer"
                              >
                                <img
                                  src={att.dataUrl}
                                  alt={att.name}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                />
                                <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                  <Eye className="w-3.5 h-3.5 text-white drop-shadow" />
                                </div>
                              </div>
                            ) : isPdf ? (
                              <div
                                onClick={() => setPreviewItem(att)}
                                className="w-10 h-10 rounded-lg bg-red-50 text-red-600 border border-red-200/60 flex flex-col items-center justify-center shrink-0 cursor-pointer font-bold"
                              >
                                <FileText className="w-4 h-4 text-red-500" />
                                <span className="text-[8px] uppercase tracking-wider font-extrabold text-red-600">PDF</span>
                              </div>
                            ) : (
                              <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 border border-blue-200/60 flex items-center justify-center shrink-0">
                                <FileIcon className="w-5 h-5 text-blue-500" />
                              </div>
                            )}

                            <div className="min-w-0 flex-1">
                              <div
                                onClick={() => setPreviewItem(att)}
                                className="font-semibold text-slate-800 truncate hover:text-blue-600 cursor-pointer text-[11px]"
                                title={att.name}
                              >
                                {att.name}
                              </div>
                              <div className="text-[10px] text-slate-400 font-mono">
                                {formatFileSize(att.size)}
                              </div>
                            </div>

                            <a
                              href={att.dataUrl}
                              download={att.name}
                              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 transition-colors"
                              title="Download Attachment"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Download className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Project / Sprint / Converted Task Integration Box */}
                <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/80 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex flex-wrap items-center gap-3">
                    {/* Project Assignment: Display assigned project or pending notice */}
                    {req.projectName ? (
                      <div className="flex items-center space-x-1.5 text-slate-700">
                        <Layers className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-semibold text-[11px]">Project:</span>
                        <span className="font-bold text-[11px] text-slate-900">{req.projectName}</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-1.5 text-amber-700 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded">
                        <Clock className="w-3 h-3 text-amber-500" />
                        <span className="font-semibold text-[10px]">Pending Project Assignment (Admin Review)</span>
                      </div>
                    )}

                    {(req.sprintName || linkedTask?.sprintName) && (
                      <div className="flex items-center space-x-1.5 text-purple-700">
                        <Zap className="w-3.5 h-3.5 text-purple-500" />
                        <span className="font-semibold text-[11px]">Sprint:</span>
                        <span className="font-bold text-[11px] text-purple-900">{linkedTask?.sprintName || req.sprintName}</span>
                      </div>
                    )}
                    {linkedTask?.testerName && (
                      <div className="flex items-center space-x-1.5 text-purple-700">
                        <UserCheck className="w-3.5 h-3.5 text-purple-500" />
                        <span className="font-semibold text-[11px]">QA Tester:</span>
                        <span className="font-bold text-[11px] text-purple-900">{linkedTask.testerName}</span>
                      </div>
                    )}

                    {req.assigneeName && (
                      <div className="flex items-center space-x-1.5 text-blue-700">
                        {req.assigneeAvatar ? (
                          <img src={req.assigneeAvatar} alt={req.assigneeName} className="w-4 h-4 rounded-full object-cover" />
                        ) : (
                          <UserCheck className="w-3.5 h-3.5 text-blue-500" />
                        )}
                        <span className="font-semibold text-[11px]">Assigned Taskee:</span>
                        <span className="font-bold text-[11px] text-blue-900">{req.assigneeName}</span>
                      </div>
                    )}
                  </div>

                  {req.convertedTaskId && (
                    <button
                      onClick={() => {
                        setSelectedTaskId(req.convertedTaskId);
                        setIsTaskDrawerOpen(true);
                      }}
                      className="px-2.5 py-1 bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg font-mono text-[11px] font-bold flex items-center space-x-1.5 shadow-2xs transition-all cursor-pointer"
                    >
                      <CheckSquare className="w-3 h-3 text-emerald-600" />
                      <span>View Task {req.convertedTaskId}</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {/* Footer: Creator info and RBAC Action Buttons */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
                  {/* Creator Info */}
                  <div className="flex items-center space-x-2.5">
                    <img
                      src={req.createdByAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80'}
                      alt={req.createdByName || 'Creator'}
                      className="w-6 h-6 rounded-full object-cover ring-1 ring-slate-200"
                    />
                    <div>
                      <span className="font-bold text-slate-800">{req.createdByName || 'Team Member'}</span>
                      <span className="text-[11px] text-slate-400 ml-1.5 font-medium">({req.createdByRole || 'User'})</span>
                      {isCreator && (
                        <span className="ml-2 px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                          My Requirement
                        </span>
                      )}
                    </div>
                  </div>

                  {/* RBAC Enforced Action Buttons */}
                  <div className="flex items-center space-x-2 shrink-0">
                    {/* 1. ADMIN / ROOT / EDITOR ONLY: 'Move to Sprint & Assign Task' button */}
                    {canAssign && (
                      <button
                        onClick={() => openAssignModal(req)}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-lg shadow-2xs transition-all flex items-center space-x-1.5 cursor-pointer ${
                          isConverted
                            ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                            : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        }`}
                        title={isConverted ? 'Reassign Project/Sprint & Status' : 'Move to Project Sprint and Assign Task'}
                      >
                        <Zap className="w-3.5 h-3.5" />
                        <span>{isConverted ? 'Reassign Sprint/Task' : 'Move to Sprint & Assign Task'}</span>
                      </button>
                    )}

                    {/* 2. CREATOR ONLY: Edit button (Only the user who created that requirement can edit it) */}
                    {isCreator ? (
                      <button
                        onClick={() => openEditModal(req)}
                        className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg border border-slate-200 transition-colors cursor-pointer"
                        title="Edit My Requirement Specifications"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <span
                        className="px-2 py-1 bg-slate-50 text-slate-400 text-[10px] font-medium rounded border border-slate-200 flex items-center space-x-1 cursor-not-allowed"
                        title="Only the creator of this requirement can edit its specifications."
                      >
                        <Eye className="w-3 h-3 text-slate-400" />
                        <span>View Only</span>
                      </span>
                    )}

                    {/* 3. CREATOR / ROOT ADMIN: Delete button */}
                    {canDeleteRequirement(req) && (
                      <button
                        onClick={() => handleDeleteRequirement(req)}
                        className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg border border-slate-200 transition-colors cursor-pointer"
                        title="Delete Requirement"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 1. SUBMIT NEW REQUIREMENT MODAL (Target Project Removed) */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="font-bold text-slate-900 text-sm">Submit New Requirement</h2>
                  <p className="text-[11px] text-slate-500">
                    Provide requirement specifications for manager review and sprint assignment
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsSubmitModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {errorMessage && (
              <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs font-medium">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmitNewRequirement} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Requirement Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Export Sprint Burndown reports to CSV / PDF"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-blue-500 font-semibold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Detailed Description & Acceptance Criteria</label>
                <textarea
                  rows={4}
                  placeholder="Describe user story, business context, expected functionality, and acceptance criteria..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-blue-500 leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-blue-500 font-medium"
                  >
                    <option value="Feature">Feature</option>
                    <option value="Enhancement">Enhancement</option>
                    <option value="Client Request">Client Request</option>
                    <option value="Bugfix">Bugfix</option>
                    <option value="Security">Security</option>
                    <option value="Architecture">Architecture</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Business Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-blue-500 font-medium"
                  >
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              {/* Attachments Upload (Multiple Images, PDFs, Specs) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block font-semibold text-slate-700">
                    Reference Attachments <span className="font-normal text-slate-400">(Images, PDFs, Specs)</span>
                  </label>
                  <span className="text-[11px] text-slate-400 font-medium">
                    {attachments.length} attached
                  </span>
                </div>

                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (e.dataTransfer.files) handleFilesSelect(e.dataTransfer.files, false);
                  }}
                  className="border-2 border-dashed border-slate-200 hover:border-blue-400 bg-slate-50/60 hover:bg-blue-50/30 rounded-xl p-3.5 text-center cursor-pointer transition-colors"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*,application/pdf,.pdf,.doc,.docx,.txt"
                    className="hidden"
                    onChange={(e) => handleFilesSelect(e.target.files, false)}
                  />
                  <div className="flex flex-col items-center justify-center space-y-1">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-full">
                      <Upload className="w-4 h-4" />
                    </div>
                    <div className="text-xs font-semibold text-slate-700">
                      Click to browse or drag & drop files
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Images (PNG, JPG, WebP), PDFs, or documentation (up to 10MB each)
                    </div>
                  </div>
                </div>

                {attachments.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 max-h-36 overflow-y-auto">
                    {attachments.map((att) => (
                      <div
                        key={att.id}
                        className="flex items-center space-x-2 bg-white border border-slate-200 p-1.5 rounded-lg text-xs shadow-2xs"
                      >
                        {att.isImage ? (
                          <img src={att.dataUrl} alt={att.name} className="w-8 h-8 rounded object-cover shrink-0" />
                        ) : (
                          <div className="w-8 h-8 rounded bg-red-50 text-red-600 flex items-center justify-center font-bold text-[9px] shrink-0">
                            PDF
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="truncate font-semibold text-slate-800 text-[11px]">{att.name}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{formatFileSize(att.size)}</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveAttachment(att.id, false)}
                          className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-3 flex items-center justify-end space-x-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsSubmitModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg font-semibold shadow-xs cursor-pointer"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Requirement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. EDIT REQUIREMENT MODAL (Creator Only - Target Project and Status Removed) */}
      {isEditModalOpen && selectedReq && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                  <Edit3 className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="font-bold text-slate-900 text-sm">Edit Requirement Specifications</h2>
                  <p className="text-[11px] text-slate-500">
                    Only the creator can edit specifications. Project assignment and status are decided by administrator.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {errorMessage && (
              <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs font-medium">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleUpdateRequirement} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Requirement Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-blue-500 font-semibold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description & Acceptance Criteria</label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-blue-500 leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-blue-500 font-medium"
                  >
                    <option value="Feature">Feature</option>
                    <option value="Enhancement">Enhancement</option>
                    <option value="Client Request">Client Request</option>
                    <option value="Bugfix">Bugfix</option>
                    <option value="Security">Security</option>
                    <option value="Architecture">Architecture</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-blue-500 font-medium"
                  >
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              {/* Attachments Section in Edit Modal */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block font-semibold text-slate-700">
                    Attachments <span className="font-normal text-slate-400">(Images, PDFs, Specs)</span>
                  </label>
                  <span className="text-[11px] text-slate-400 font-medium">
                    {editAttachments.length} attached
                  </span>
                </div>

                <div
                  onClick={() => editFileInputRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (e.dataTransfer.files) handleFilesSelect(e.dataTransfer.files, true);
                  }}
                  className="border-2 border-dashed border-slate-200 hover:border-blue-400 bg-slate-50/60 hover:bg-blue-50/30 rounded-xl p-3.5 text-center cursor-pointer transition-colors"
                >
                  <input
                    ref={editFileInputRef}
                    type="file"
                    multiple
                    accept="image/*,application/pdf,.pdf,.doc,.docx,.txt"
                    className="hidden"
                    onChange={(e) => handleFilesSelect(e.target.files, true)}
                  />
                  <div className="flex flex-col items-center justify-center space-y-1">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-full">
                      <Upload className="w-4 h-4" />
                    </div>
                    <div className="text-xs font-semibold text-slate-700">
                      Click to browse or drag & drop files
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Images (PNG, JPG, WebP), PDFs, or documentation (up to 10MB each)
                    </div>
                  </div>
                </div>

                {editAttachments.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 max-h-36 overflow-y-auto">
                    {editAttachments.map((att) => (
                      <div
                        key={att.id}
                        className="flex items-center space-x-2 bg-white border border-slate-200 p-1.5 rounded-lg text-xs shadow-2xs"
                      >
                        {att.isImage ? (
                          <img src={att.dataUrl} alt={att.name} className="w-8 h-8 rounded object-cover shrink-0" />
                        ) : (
                          <div className="w-8 h-8 rounded bg-red-50 text-red-600 flex items-center justify-center font-bold text-[9px] shrink-0">
                            PDF
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="truncate font-semibold text-slate-800 text-[11px]">{att.name}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{formatFileSize(att.size)}</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveAttachment(att.id, true)}
                          className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-3 flex items-center justify-end space-x-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg font-semibold shadow-xs cursor-pointer"
                >
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. MOVE TO SPRINT & ASSIGN TASK MODAL (ADMIN / ROOT / EDITOR ONLY) */}
      {isAssignModalOpen && selectedReq && canAccessMoveToSprint(currentUser) && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="font-bold text-slate-900 text-sm">Move to Project Sprint & Assign Task</h2>
                  <p className="text-[11px] text-slate-500">
                    Administrator/Editor workflow: Assign project, target sprint, developer, and decide status.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAssignModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Requirement Preview Card */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1 text-xs">
              <div className="font-bold text-slate-900 flex items-center space-x-2">
                <span className="font-mono text-blue-600 font-bold">{selectedReq.id}:</span>
                <span>{selectedReq.title}</span>
              </div>
              <p className="text-[11px] text-slate-600 line-clamp-2">{selectedReq.description}</p>
            </div>

            {errorMessage && (
              <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs font-medium">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleConvertAndAssign} className="space-y-3.5 text-xs">
              {/* 1. Target Project (Triggers dynamic loading of project sprints) */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Target Project *</label>
                <select
                  value={assignProjectId}
                  onChange={handleAssignProjectChange}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-emerald-500 font-semibold"
                >
                  <option value="">-- Select Target Project --</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.code || p.id})
                    </option>
                  ))}
                </select>
              </div>

              {/* 2. Target Sprint (Dynamically filtered by selected project) */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Target Sprint</label>
                <select
                  value={assignSprintId}
                  onChange={(e) => setAssignSprintId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-emerald-500 font-semibold"
                >
                  <option value="">-- No Sprint (Direct to Backlog) --</option>
                  {availableSprintsForProject.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.status || 'Active'})
                    </option>
                  ))}
                </select>
                {assignProjectId && availableSprintsForProject.length === 0 && (
                  <p className="text-[10px] text-amber-600 mt-1 font-medium flex items-center space-x-1">
                    <AlertCircle className="w-3 h-3 text-amber-500 shrink-0" />
                    <span>No active sprints found for this project. Task will be placed in Project Backlog.</span>
                  </p>
                )}
                {!assignProjectId && (
                  <p className="text-[10px] text-slate-400 mt-1 font-medium">
                    Select a target project above to load available sprints.
                  </p>
                )}
              </div>

              {/* 3. Requirement Status (Decided Exclusively by Admin) */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Requirement Status (Admin Decision) *</label>
                <select
                  value={assignStatus}
                  onChange={(e) => setAssignStatus(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-emerald-500 font-semibold text-slate-800"
                >
                  <option value="Moved to Sprint">Moved to Sprint</option>
                  <option value="Converted to Task">Converted to Task</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Submitted">Submitted (Keep in Review)</option>
                  <option value="Completed">Completed</option>
                </select>
                <p className="text-[10px] text-slate-500 mt-1">
                  Administrators, Root, and Editors have exclusive authority to assign and transition requirement status.
                </p>
              </div>

              {/* 4. Assign Developer / Engineer */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Assign Developer / Engineer</label>
                <select
                  value={assigneeId}
                  onChange={(e) => setAssigneeId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-emerald-500 font-semibold"
                >
                  <option value="">-- Unassigned --</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.name || u.fullname} ({getUserRoleName ? getUserRoleName(u) : (u.role || 'Member')})
                    </option>
                  ))}
                </select>
              </div>

              {/* 5. Story Points & Task Priority */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Story Points</label>
                  <input
                    type="number"
                    min="1"
                    max="40"
                    value={storyPoints}
                    onChange={(e) => setStoryPoints(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-emerald-500 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Task Priority</label>
                  <select
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-emerald-500 font-medium"
                  >
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end space-x-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAssignModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg font-semibold shadow-xs flex items-center space-x-1.5 cursor-pointer"
                >
                  <Zap className="w-4 h-4" />
                  <span>{isSubmitting ? 'Processing...' : 'Save Assignment & Status'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. ATTACHMENT PREVIEW LIGHTBOX MODAL */}
      {previewItem && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center space-x-2.5 min-w-0">
                <div className={`p-2 rounded-lg ${previewItem.isImage ? 'bg-blue-50 text-blue-600' : 'bg-red-50 text-red-600'}`}>
                  {previewItem.isImage ? <ImageIcon className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                </div>
                <div className="min-w-0">
                  <h3 className="text-xs font-bold text-slate-900 truncate">{previewItem.name}</h3>
                  <p className="text-[10px] text-slate-400 font-mono">{formatFileSize(previewItem.size)}</p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <a
                  href={previewItem.dataUrl}
                  download={previewItem.name}
                  className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg text-xs font-semibold flex items-center space-x-1 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </a>
                <button
                  onClick={() => setPreviewItem(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Preview Body */}
            <div className="flex-1 overflow-auto bg-slate-900/5 p-4 flex items-center justify-center min-h-[350px]">
              {previewItem.isImage ? (
                <img
                  src={previewItem.dataUrl}
                  alt={previewItem.name}
                  className="max-h-[70vh] max-w-full rounded-lg shadow-md object-contain"
                />
              ) : previewItem.isPdf ? (
                <iframe
                  src={previewItem.dataUrl}
                  title={previewItem.name}
                  className="w-full h-[70vh] rounded-lg border border-slate-200 bg-white"
                />
              ) : (
                <div className="text-center space-y-2">
                  <FileIcon className="w-12 h-12 text-slate-400 mx-auto" />
                  <p className="text-xs text-slate-600 font-medium">Document preview not supported for this file format.</p>
                  <a
                    href={previewItem.dataUrl}
                    download={previewItem.name}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold"
                  >
                    <Download className="w-3.5 h-3.5" />
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
