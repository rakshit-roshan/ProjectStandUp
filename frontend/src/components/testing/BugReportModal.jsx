import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  Bug,
  Upload,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Image as ImageIcon,
  ChevronDown,
  Check,
  Search
} from 'lucide-react';

export const BugReportModal = () => {
  const {
    currentUser,
    isReportBugModalOpen,
    setIsReportBugModalOpen,
    createIssue,
    updateTask,
    selectedTaskId,
    tasks,
    users,
    currentProject,
    getProjectMembers,
    getUserRoleName
  } = useApp();

  const teamMembers = getProjectMembers(currentProject);
  const allAvailableUsers = [
    ...teamMembers,
    ...users.filter(u => !teamMembers.some(tm => String(tm.id) === String(u.id)))
  ];

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [stepsToReproduce, setStepsToReproduce] = useState('');
  const [expectedResult, setExpectedResult] = useState('');
  const [actualResult, setActualResult] = useState('');
  const [severity, setSeverity] = useState('High');
  const [priority, setPriority] = useState('High');
  const [module, setModule] = useState('Auth API');
  const [linkedTaskId, setLinkedTaskId] = useState('');
  const [selectedAssigneeIds, setSelectedAssigneeIds] = useState([]);
  const [isAssigneeDropdownOpen, setIsAssigneeDropdownOpen] = useState(false);
  const [assigneeSearchFilter, setAssigneeSearchFilter] = useState('');
  const [environment, setEnvironment] = useState('Staging / Chrome 124');
  const [screenshots, setScreenshots] = useState([]);
  const [successMessage, setSuccessMessage] = useState(null);

  const filteredAssignees = allAvailableUsers.filter(u => {
    if (!assigneeSearchFilter.trim()) return true;
    const term = assigneeSearchFilter.toLowerCase();
    const role = getUserRoleName ? getUserRoleName(u).toLowerCase() : (u.role || '').toLowerCase();
    return (
      (u.name && u.name.toLowerCase().includes(term)) ||
      (u.email && u.email.toLowerCase().includes(term)) ||
      role.includes(term)
    );
  });

  useEffect(() => {
    if (isReportBugModalOpen) {
      const activeTaskId = selectedTaskId || tasks[0]?.id || '';
      setLinkedTaskId(activeTaskId);
      const t = tasks.find(x => String(x.id) === String(activeTaskId));
      if (t) {
        if (t.assigneeIds && Array.isArray(t.assigneeIds) && t.assigneeIds.length > 0) {
          setSelectedAssigneeIds(t.assigneeIds.map(String));
        } else if (t.assigneeId) {
          const parsed = String(t.assigneeId).split(',').map(s => s.trim()).filter(Boolean);
          setSelectedAssigneeIds(parsed);
        } else if (teamMembers[0]) {
          setSelectedAssigneeIds([String(teamMembers[0].id)]);
        }
        setTitle(`QA Defect in ${t.id}: ${t.title}`);
      } else if (teamMembers[0]) {
        setSelectedAssigneeIds([String(teamMembers[0].id)]);
      }
      setIsAssigneeDropdownOpen(false);
      setAssigneeSearchFilter('');
    }
  }, [isReportBugModalOpen, selectedTaskId]);

  if (!isReportBugModalOpen) return null;

  const handleToggleAssignee = (uId) => {
    const sId = String(uId);
    setSelectedAssigneeIds(prev =>
      prev.includes(sId) ? prev.filter(x => x !== sId) : [...prev, sId]
    );
  };

  const handleSelectAllAssignees = () => {
    if (selectedAssigneeIds.length === allAvailableUsers.length) {
      setSelectedAssigneeIds([]);
    } else {
      setSelectedAssigneeIds(allAvailableUsers.map(u => String(u.id)));
    }
  };

  const handleSimulateScreenshot = () => {
    const newScreenshot = {
      id: `SC-${Date.now()}`,
      title: `bug_evidence_${screenshots.length + 1}.png`,
      url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=600&q=80'
    };
    setScreenshots([...screenshots, newScreenshot]);
  };

  const handleRemoveScreenshot = (id) => {
    setScreenshots(screenshots.filter(s => s.id !== id));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    const effectiveLinkedTaskId = linkedTaskId || tasks[0]?.id || '';
    const effectiveAssigneeIds = selectedAssigneeIds.length > 0
      ? selectedAssigneeIds
      : (teamMembers[0] ? [String(teamMembers[0].id)] : ['USR-102']);

    const newBug = await createIssue({
      title,
      description,
      stepsToReproduce,
      expectedResult,
      actualResult,
      severity,
      priority,
      module,
      projectId: currentProject?.id,
      projectName: currentProject?.name,
      linkedTaskId: effectiveLinkedTaskId,
      assigneeIds: effectiveAssigneeIds,
      assigneeId: effectiveAssigneeIds.join(','),
      environment,
      screenshots
    });

    if (effectiveLinkedTaskId) {
      await updateTask(effectiveLinkedTaskId, {
        testingStatus: 'Failed',
        hasIssue: true,
        status: 'In Progress',
        activeBugId: newBug?.id
      }).catch(() => {});
    }

    setSuccessMessage(`Bug ${newBug?.id || 'Defect'} successfully created and linked to task ${effectiveLinkedTaskId || 'workspace'}!`);
    setTimeout(() => {
      setSuccessMessage(null);
      setIsReportBugModalOpen(false);
      // Reset
      setTitle('');
      setDescription('');
      setStepsToReproduce('');
      setExpectedResult('');
      setActualResult('');
      setScreenshots([]);
    }, 2000);
  };

  const assignedUsersList = allAvailableUsers.filter(u => selectedAssigneeIds.includes(String(u.id)));

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="w-full max-w-2xl bg-white rounded-lg shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-red-50 border-b border-red-100 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-red-600 text-white rounded">
              <Bug className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-red-950">Report Project Bug / Defect</h2>
          </div>
          <button
            onClick={() => setIsReportBugModalOpen(false)}
            className="text-slate-400 hover:text-slate-700 p-1 rounded cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Content */}
        {successMessage ? (
          <div className="p-8 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto animate-bounce" />
            <div className="text-base font-bold text-slate-900">{successMessage}</div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto text-xs">
            {/* Title */}
            <div>
              <label className="block font-bold text-slate-800 uppercase tracking-wider mb-1">
                Bug Title <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Login fails after password reset token is issued"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-xs text-slate-900 font-semibold outline-none focus:border-blue-500"
              />
            </div>

            {/* Grid 2 Cols: Severity & Priority */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-800 uppercase tracking-wider mb-1">Severity</label>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs font-semibold outline-none cursor-pointer"
                >
                  <option value="Critical">Critical</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-800 uppercase tracking-wider mb-1">Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs font-semibold outline-none cursor-pointer"
                >
                  <option value="Critical">Critical</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
            </div>

            {/* Linked Task & Multi-Select Assignee */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-800 uppercase tracking-wider mb-1">Linked Task</label>
                <select
                  value={linkedTaskId}
                  onChange={(e) => setLinkedTaskId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs font-semibold outline-none cursor-pointer"
                >
                  {tasks.map(t => (
                    <option key={t.id} value={t.id}>{t.id} — {t.title}</option>
                  ))}
                </select>
              </div>

              {/* Multi-Select Assignee Dropdown */}
              <div className="relative">
                <label className="block font-bold text-slate-800 uppercase tracking-wider mb-1 flex items-center justify-between">
                  <span>Developer / Assignee(s)</span>
                  <span className="text-[10px] text-blue-600 font-mono">({selectedAssigneeIds.length} selected)</span>
                </label>

                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsAssigneeDropdownOpen(!isAssigneeDropdownOpen)}
                    className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 rounded px-2.5 py-1.5 text-xs font-semibold text-slate-800 outline-none flex items-center justify-between transition-colors cursor-pointer text-left"
                  >
                    <div className="flex items-center space-x-1.5 truncate flex-1 min-w-0">
                      {assignedUsersList.length === 0 ? (
                        <span className="text-slate-400">Select assignees...</span>
                      ) : (
                        <div className="flex items-center space-x-1 truncate">
                          <div className="flex -space-x-1 shrink-0">
                            {assignedUsersList.slice(0, 3).map(u => (
                              u.avatar ? (
                                <img key={u.id} src={u.avatar} alt={u.name} className="w-4 h-4 rounded-full object-cover ring-1 ring-white" />
                              ) : (
                                <div key={u.id} className="w-4 h-4 rounded-full bg-red-600 text-white font-bold text-[7px] flex items-center justify-center ring-1 ring-white">
                                  {u.name?.charAt(0).toUpperCase()}
                                </div>
                              )
                            ))}
                          </div>
                          <span className="truncate text-slate-800 text-xs font-semibold">
                            {assignedUsersList.map(u => u.name).join(', ')}
                          </span>
                        </div>
                      )}
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
                  </button>

                  {/* Multi-Select Menu Popup */}
                  {isAssigneeDropdownOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsAssigneeDropdownOpen(false)}
                      />
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-2xl z-50 p-2 space-y-1 animate-in fade-in zoom-in-95 duration-100 max-h-56 overflow-y-auto">
                        {/* Sticky Header with Search & Select All */}
                        <div className="sticky top-0 bg-white pb-1.5 pt-0.5 border-b border-slate-100 space-y-1.5 z-10">
                          <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase font-bold px-1">
                            <span>Select Assignees for Defect</span>
                            <button
                              type="button"
                              onClick={handleSelectAllAssignees}
                              className="text-red-600 hover:text-red-800 underline font-semibold lowercase cursor-pointer"
                            >
                              {selectedAssigneeIds.length === allAvailableUsers.length ? 'deselect all' : 'select all'}
                            </button>
                          </div>

                          {allAvailableUsers.length > 4 && (
                            <div className="relative">
                              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2" />
                              <input
                                type="text"
                                value={assigneeSearchFilter}
                                onChange={(e) => setAssigneeSearchFilter(e.target.value)}
                                placeholder="Filter team members by name or role..."
                                className="w-full bg-slate-50 border border-slate-200 rounded-md pl-7 pr-2 py-1 text-xs outline-none focus:border-red-500"
                              />
                            </div>
                          )}
                        </div>

                        {filteredAssignees.length === 0 ? (
                          <div className="p-3 text-center text-slate-400 text-xs">No team members match filter</div>
                        ) : (
                          filteredAssignees.map(u => {
                            const isAssigned = selectedAssigneeIds.includes(String(u.id));
                            const roleLabel = getUserRoleName ? getUserRoleName(u) : (u.role || 'Member');
                            return (
                              <div
                                key={u.id}
                                onClick={() => handleToggleAssignee(u.id)}
                                className={`flex items-center justify-between p-2 rounded-md cursor-pointer transition-colors text-xs ${
                                  isAssigned ? 'bg-red-50 text-red-900 font-semibold' : 'hover:bg-slate-50 text-slate-700'
                                }`}
                              >
                                <div className="flex items-center space-x-2.5 min-w-0">
                                  <input
                                    type="checkbox"
                                    checked={isAssigned}
                                    onChange={() => {}}
                                    className="rounded border-slate-300 text-red-600 focus:ring-red-500 shrink-0 pointer-events-none cursor-pointer"
                                  />
                                  {u.avatar ? (
                                    <img src={u.avatar} alt={u.name} className="w-5 h-5 rounded-full object-cover shrink-0" />
                                  ) : (
                                    <div className="w-5 h-5 rounded-full bg-red-600 text-white font-bold text-[8px] flex items-center justify-center shrink-0">
                                      {u.name?.charAt(0).toUpperCase()}
                                    </div>
                                  )}
                                  <div className="truncate">
                                    <div className="text-slate-900 text-xs truncate">{u.name}</div>
                                    <div className="text-[9px] text-slate-400 truncate">{roleLabel}</div>
                                  </div>
                                </div>
                                <div className={`w-3.5 h-3.5 rounded-md border flex items-center justify-center transition-colors ${
                                  isAssigned ? 'border-red-600 bg-red-600 text-white' : 'border-slate-300'
                                }`}>
                                  {isAssigned && <Check className="w-2 h-2 stroke-[3]" />}
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Steps to Reproduce */}
            <div>
              <label className="block font-bold text-slate-800 uppercase tracking-wider mb-1">Steps to Reproduce</label>
              <textarea
                rows={3}
                placeholder="1. Navigate to auth page&#10;2. Input credentials&#10;3. Click submit"
                value={stepsToReproduce}
                onChange={(e) => setStepsToReproduce(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded p-2.5 text-xs outline-none focus:border-blue-500 font-sans"
              />
            </div>

            {/* Screenshot / Evidence Upload */}
            <div>
              <label className="block font-bold text-slate-800 uppercase tracking-wider mb-1">
                Screenshot / Evidence Upload
              </label>
              <div 
                onClick={handleSimulateScreenshot}
                className="border-2 border-dashed border-slate-200 rounded-lg p-4 text-center hover:bg-slate-50 cursor-pointer transition-colors"
              >
                <Upload className="w-5 h-5 text-slate-400 mx-auto mb-1" />
                <span className="text-slate-600 font-semibold block">Attach Screenshot</span>
                <span className="text-[10px] text-slate-400">Click to attach reproduction screenshot evidence</span>
              </div>

              {screenshots.length > 0 && (
                <div className="grid grid-cols-2 gap-2 mt-3">
                  {screenshots.map(s => (
                    <div key={s.id} className="relative group border border-slate-200 rounded overflow-hidden">
                      <img src={s.url} alt={s.title} className="w-full h-20 object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemoveScreenshot(s.id)}
                        className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Actions */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-end space-x-2">
              <button
                type="button"
                onClick={() => setIsReportBugModalOpen(false)}
                className="px-3.5 py-2 rounded border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded shadow-sm transition-colors flex items-center space-x-1.5 cursor-pointer"
              >
                <Bug className="w-3.5 h-3.5" />
                <span>Submit Defect Report</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
