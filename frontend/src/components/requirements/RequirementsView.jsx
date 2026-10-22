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
  Sparkles,
  ChevronRight,
  X,
  Paperclip,
  Upload,
  Image as ImageIcon,
  File as FileIcon,
  Download,
  Maximize2
} from 'lucide-react';

export const RequirementsView = () => {
  const {
    requirements = [],
    createRequirement,
    updateRequirement,
    deleteRequirement,
    convertRequirementToTask,
    projects = [],
    currentProject,
    sprints = [],
    users = [],
    currentUser,
    isManagerOrEditorOrRoot,
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

  // Form State for Submit / Edit
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [category, setCategory] = useState('Feature');
  const [targetProjectId, setTargetProjectId] = useState(currentProject?.id || '');
  const [editStatus, setEditStatus] = useState('Submitted');

  // Attachment State
  const [attachments, setAttachments] = useState([]);
  const [editAttachments, setEditAttachments] = useState([]);
  const fileInputRef = useRef(null);
  const editFileInputRef = useRef(null);

  // Form State for Assign / Move to Sprint
  const [assignProjectId, setAssignProjectId] = useState(currentProject?.id || '');
  const [assignSprintId, setAssignSprintId] = useState('');
  const [assigneeId, setAssigneeId] = useState('');
  const [storyPoints, setStoryPoints] = useState(3);
  const [taskPriority, setTaskPriority] = useState('Medium');

  // Feedback State
  const [feedbackMessage, setFeedbackMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Permission helpers
  const isPrivileged = isManagerOrEditorOrRoot ? isManagerOrEditorOrRoot(currentUser) : false;

  const canEditOrDelete = (req) => {
    if (!req) return false;
    if (isPrivileged) return true;
    const currentUid = String(currentUser?.id || '');
    const currentName = String(currentUser?.name || currentUser?.fullname || '').toLowerCase();
    const reqCreatorId = String(req.createdByUserId || '');
    const reqCreatorName = String(req.createdByName || '').toLowerCase();
    return (currentUid && currentUid === reqCreatorId) || (currentName && currentName === reqCreatorName);
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
      // 10MB limit check
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

  const openSubmitModal = () => {
    setTitle('');
    setDescription('');
    setPriority('Medium');
    setCategory('Feature');
    setTargetProjectId(currentProject?.id || (projects[0]?.id || ''));
    setAttachments([]);
    setErrorMessage(null);
    setIsSubmitModalOpen(true);
  };

  const openEditModal = (req) => {
    setSelectedReq(req);
    setTitle(req.title || '');
    setDescription(req.description || '');
    setPriority(req.priority || 'Medium');
    setCategory(req.category || 'Feature');
    setTargetProjectId(req.projectId || currentProject?.id || '');
    setEditStatus(req.status || 'Submitted');
    setEditAttachments(Array.isArray(req.attachments) ? [...req.attachments] : []);
    setErrorMessage(null);
    setIsEditModalOpen(true);
  };

  const openAssignModal = (req) => {
    setSelectedReq(req);
    const pId = req.projectId || currentProject?.id || (projects[0]?.id || '');
    setAssignProjectId(pId);
    
    // Pick first sprint of project
    const availableSprints = sprints.filter(s => !pId || s.projectId === pId || String(s.projectId) === String(pId));
    setAssignSprintId(availableSprints[0]?.id || '');

    // Pick first assignee
    setAssigneeId(users[0]?.id || '');
    setStoryPoints(req.priority === 'Critical' ? 8 : req.priority === 'High' ? 5 : 3);
    setTaskPriority(req.priority || 'Medium');
    setErrorMessage(null);
    setIsAssignModalOpen(true);
  };

  const handleSubmitNewRequirement = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMessage('Requirement title is required.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const selectedProj = projects.find(p => p.id === targetProjectId || String(p.id) === String(targetProjectId));
      const newReqData = {
        title: title.trim(),
        description: description.trim(),
        priority,
        category,
        projectId: selectedProj?.id || currentProject?.id || '',
        projectName: selectedProj?.name || currentProject?.name || '',
        status: 'Submitted',
        attachments: attachments,
        createdByUserId: currentUser?.id || 'user-1',
        createdByName: currentUser?.name || currentUser?.fullname || 'Team Member',
        createdByAvatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
        createdByRole: currentUser?.role || 'User'
      };

      await createRequirement(newReqData);
      setIsSubmitModalOpen(false);
      setAttachments([]);
      setFeedbackMessage('Requirement submitted successfully with attachments!');
      setTimeout(() => setFeedbackMessage(null), 3500);
    } catch (err) {
      console.error(err);
      setErrorMessage(err.message || 'Failed to submit requirement.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateRequirement = async (e) => {
    e.preventDefault();
    if (!selectedReq || !title.trim()) {
      setErrorMessage('Requirement title cannot be empty.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const selectedProj = projects.find(p => p.id === targetProjectId || String(p.id) === String(targetProjectId));
      await updateRequirement(selectedReq.id, {
        title: title.trim(),
        description: description.trim(),
        priority,
        category,
        projectId: selectedProj?.id || selectedReq.projectId,
        projectName: selectedProj?.name || selectedReq.projectName,
        status: editStatus,
        attachments: editAttachments
      });

      setIsEditModalOpen(false);
      setSelectedReq(null);
      setFeedbackMessage('Requirement updated successfully!');
      setTimeout(() => setFeedbackMessage(null), 3500);
    } catch (err) {
      console.error(err);
      setErrorMessage(err.message || 'Failed to update requirement.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteRequirement = async (req) => {
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

  const handleConvertAndAssign = async (e) => {
    e.preventDefault();
    if (!selectedReq) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const chosenProject = projects.find(p => p.id === assignProjectId || String(p.id) === String(assignProjectId)) || currentProject;
      const chosenSprint = sprints.find(s => s.id === assignSprintId || String(s.id) === String(assignSprintId));
      const chosenAssignee = users.find(u => String(u.id) === String(assigneeId));

      await convertRequirementToTask(selectedReq.id, {
        title: selectedReq.title,
        description: selectedReq.description || `Converted from requirement ${selectedReq.id}`,
        projectId: chosenProject?.id || 'PRJ-101',
        projectName: chosenProject?.name || 'Default Project',
        sprintId: chosenSprint?.id || '',
        sprintName: chosenSprint?.name || '',
        assigneeId: chosenAssignee?.id || '',
        assigneeName: chosenAssignee?.name || 'Unassigned',
        assigneeAvatar: chosenAssignee?.avatar || '',
        priority: taskPriority,
        storyPoints: parseInt(storyPoints) || 0,
        status: 'Backlog',
        labels: ['Requirement', selectedReq.category || 'Feature']
      });

      setIsAssignModalOpen(false);
      setSelectedReq(null);
      setFeedbackMessage(`Requirement converted and assigned into sprint "${chosenSprint?.name || 'Backlog'}"!`);
      setTimeout(() => setFeedbackMessage(null), 4000);
    } catch (err) {
      console.error(err);
      setErrorMessage(err.message || 'Failed to convert requirement to task.');
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
  const underReviewCount = requirements.filter(r => r.status === 'Under Review').length;
  const convertedCount = requirements.filter(r => r.status === 'Converted to Task' || r.status === 'Moved to Sprint').length;

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
              Submit product requirements, review client requests, and assign them directly into project sprints as actionable tasks.
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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Requirements</div>
            <div className="text-2xl font-bold text-slate-900 mt-1 font-mono">{totalCount}</div>
          </div>
          <div className="p-2 bg-slate-100 text-slate-600 rounded-lg">
            <FileText className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-amber-600 uppercase tracking-wider">Submitted / New</div>
            <div className="text-2xl font-bold text-amber-900 mt-1 font-mono">{submittedCount}</div>
          </div>
          <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Under Review</div>
            <div className="text-2xl font-bold text-blue-900 mt-1 font-mono">{underReviewCount}</div>
          </div>
          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
            <Eye className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Assigned to Sprints</div>
            <div className="text-2xl font-bold text-emerald-900 mt-1 font-mono">{convertedCount}</div>
          </div>
          <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
            <Zap className="w-5 h-5" />
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
            <option value="Under Review">Under Review</option>
            <option value="Moved to Sprint">Moved to Sprint</option>
            <option value="Converted to Task">Converted to Task</option>
            <option value="Completed">Completed</option>
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
            const hasEditPermission = canEditOrDelete(req);
            const isConverted = req.status === 'Converted to Task' || req.status === 'Moved to Sprint';

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
                      className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase border flex items-center space-x-1 ${
                        req.status === 'Converted to Task'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : req.status === 'Moved to Sprint'
                          ? 'bg-purple-50 text-purple-800 border-purple-200'
                          : req.status === 'Under Review'
                          ? 'bg-blue-50 text-blue-800 border-blue-200'
                          : 'bg-amber-50 text-amber-800 border-amber-200'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        req.status === 'Converted to Task' ? 'bg-emerald-500' :
                        req.status === 'Moved to Sprint' ? 'bg-purple-500' :
                        req.status === 'Under Review' ? 'bg-blue-500' : 'bg-amber-500'
                      }`} />
                      <span>{req.status || 'Submitted'}</span>
                    </span>
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

                            {/* Download Action */}
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
                {(req.projectName || req.sprintName || req.convertedTaskId || req.assigneeName) && (
                  <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/80 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex flex-wrap items-center gap-3">
                      {req.projectName && (
                        <div className="flex items-center space-x-1.5 text-slate-700">
                          <Layers className="w-3.5 h-3.5 text-slate-400" />
                          <span className="font-semibold text-[11px]">Project:</span>
                          <span className="font-bold text-[11px] text-slate-900">{req.projectName}</span>
                        </div>
                      )}

                      {req.sprintName && (
                        <div className="flex items-center space-x-1.5 text-purple-700">
                          <Zap className="w-3.5 h-3.5 text-purple-500" />
                          <span className="font-semibold text-[11px]">Sprint:</span>
                          <span className="font-bold text-[11px] text-purple-900">{req.sprintName}</span>
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
                )}

                {/* Footer: Creator & Actions */}
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
                    </div>
                  </div>

                  {/* Permission-Enforced Action Buttons */}
                  <div className="flex items-center space-x-2 shrink-0">
                    {/* MANAGER / EDITOR / ROOT ADMIN ONLY: Move to Sprint & Assign Task */}
                    {isPrivileged && (
                      <button
                        onClick={() => openAssignModal(req)}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-lg shadow-2xs transition-all flex items-center space-x-1.5 cursor-pointer ${
                          isConverted
                            ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                            : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        }`}
                        title={isConverted ? 'Reassign / Update Sprint Assignment' : 'Move to Project Sprint and Assign Task'}
                      >
                        <Zap className="w-3.5 h-3.5" />
                        <span>{isConverted ? 'Reassign Sprint/Task' : 'Move to Sprint & Assign Task'}</span>
                      </button>
                    )}

                    {/* EDIT: Allowed for Manager/Editor/Root Admin OR the creator of the requirement */}
                    {hasEditPermission ? (
                      <button
                        onClick={() => openEditModal(req)}
                        className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg border border-slate-200 transition-colors cursor-pointer"
                        title="Edit Requirement"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <span
                        className="px-2 py-1 bg-slate-50 text-slate-400 text-[10px] font-medium rounded border border-slate-200 flex items-center space-x-1 cursor-not-allowed"
                        title="Only the creator or an Administrator/Editor can modify this requirement."
                      >
                        <Eye className="w-3 h-3 text-slate-400" />
                        <span>View Only</span>
                      </span>
                    )}

                    {/* DELETE: Allowed for Manager/Editor/Root Admin OR the creator of the requirement */}
                    {hasEditPermission && (
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

      {/* 1. SUBMIT NEW REQUIREMENT MODAL */}
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
                  <p className="text-[11px] text-slate-500">Provide requirement specs for manager backlog review and sprint assignment</p>
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

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Target Project</label>
                <select
                  value={targetProjectId}
                  onChange={(e) => setTargetProjectId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-blue-500 font-medium"
                >
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
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
                  className="px-4 py-2 border border-slate-200 rounded-lg font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg font-semibold shadow-xs"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Requirement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. EDIT REQUIREMENT MODAL */}
      {isEditModalOpen && selectedReq && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                  <Edit3 className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="font-bold text-slate-900 text-sm">Edit Requirement</h2>
                  <p className="text-[11px] text-slate-500">Update requirement details, priority, or category</p>
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
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Target Project</label>
                  <select
                    value={targetProjectId}
                    onChange={(e) => setTargetProjectId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-blue-500 font-medium"
                  >
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Status</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-blue-500 font-medium"
                  >
                    <option value="Submitted">Submitted</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Moved to Sprint">Moved to Sprint</option>
                    <option value="Converted to Task">Converted to Task</option>
                    <option value="Completed">Completed</option>
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
                  className="px-4 py-2 border border-slate-200 rounded-lg font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg font-semibold shadow-xs"
                >
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. MOVE TO SPRINT & ASSIGN TASK MODAL (MANAGER / EDITOR / ROOT ADMIN ONLY) */}
      {isAssignModalOpen && selectedReq && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="font-bold text-slate-900 text-sm">Move to Project Sprint & Assign Task</h2>
                  <p className="text-[11px] text-slate-500">Converts requirement into an active development sprint task</p>
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
              {/* Target Project */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Target Project *</label>
                <select
                  value={assignProjectId}
                  onChange={(e) => {
                    const newPId = e.target.value;
                    setAssignProjectId(newPId);
                    const matchingSprints = sprints.filter(s => s.projectId === newPId || String(s.projectId) === String(newPId));
                    setAssignSprintId(matchingSprints[0]?.id || '');
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-emerald-500 font-semibold"
                >
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.code || p.id})</option>
                  ))}
                </select>
              </div>

              {/* Target Sprint */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Target Sprint *</label>
                <select
                  value={assignSprintId}
                  onChange={(e) => setAssignSprintId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-emerald-500 font-semibold"
                >
                  <option value="">-- No Sprint (Direct to Backlog) --</option>
                  {sprints
                    .filter(s => !assignProjectId || s.projectId === assignProjectId || String(s.projectId) === String(assignProjectId))
                    .map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.status || 'Active'})
                      </option>
                    ))}
                </select>
              </div>

              {/* Assignee Developer */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Assign Developer / Engineer *</label>
                <select
                  value={assigneeId}
                  onChange={(e) => setAssigneeId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-emerald-500 font-semibold"
                >
                  <option value="">Unassigned</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.name || u.fullname} ({u.role || 'Member'})
                    </option>
                  ))}
                </select>
              </div>

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
                  className="px-4 py-2 border border-slate-200 rounded-lg font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg font-semibold shadow-xs flex items-center space-x-1.5"
                >
                  <Zap className="w-4 h-4" />
                  <span>{isSubmitting ? 'Creating Task...' : 'Convert to Task & Assign'}</span>
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
