import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  Bug,
  AlertTriangle,
  CheckCircle2,
  Image as ImageIcon,
  MessageSquare,
  User,
  Calendar,
  Send,
  ExternalLink,
  Clock,
  RotateCcw,
  Check,
  UserCheck,
  TestTube2,
  Wrench,
  ChevronDown,
  Search
} from 'lucide-react';

export const IssueDetailsDrawer = () => {
  const {
    isIssueDrawerOpen,
    setIsIssueDrawerOpen,
    selectedIssue,
    updateIssueState,
    updateIssue,
    reassignTaskToDeveloper,
    openSendToTestingModal,
    tasks,
    allTasks,
    users,
    currentProject,
    getProjectMembers,
    getUserRoleName,
    navigateTo,
    currentUser
  } = useApp();

  const [selectedDevIds, setSelectedDevIds] = useState([]);
  const [isDevDropdownOpen, setIsDevDropdownOpen] = useState(false);
  const [devSearchFilter, setDevSearchFilter] = useState('');
  const [reworkNotes, setReworkNotes] = useState('');
  const [isReassigning, setIsReassigning] = useState(false);
  const [reassignFeedback, setReassignFeedback] = useState(null);

  const teamMembers = getProjectMembers ? getProjectMembers(currentProject) : (users || []);
  const allAvailableUsers = [
    ...teamMembers,
    ...(users || []).filter(u => !teamMembers.some(tm => String(tm.id) === String(u.id)))
  ];

  const isDeveloper = (u) => {
    if (!u) return false;
    const code = Number(u.roleCode !== undefined && u.roleCode !== null ? u.roleCode : u.role);
    const roleName = String(u.roleName || u.role || '').toUpperCase();
    return code === 3 || roleName.includes('DEV') || roleName.includes('ENGINEER') || roleName.includes('DEVELOPER');
  };

  const dedicatedDevs = allAvailableUsers.filter(isDeveloper);
  const devOptions = dedicatedDevs.length > 0 ? dedicatedDevs : allAvailableUsers;

  const filteredDevs = devOptions.filter(u => {
    if (!devSearchFilter.trim()) return true;
    const term = devSearchFilter.toLowerCase();
    const role = getUserRoleName ? getUserRoleName(u).toLowerCase() : (u.role || '').toLowerCase();
    return (
      (u.name && u.name.toLowerCase().includes(term)) ||
      (u.email && u.email.toLowerCase().includes(term)) ||
      role.includes(term)
    );
  });

  const linkedTask = selectedIssue?.linkedTaskId
    ? (tasks || []).find(t => String(t.id) === String(selectedIssue.linkedTaskId)) ||
      (allTasks || []).find(t => String(t.id) === String(selectedIssue.linkedTaskId)) || null
    : null;

  useEffect(() => {
    if (selectedIssue && isIssueDrawerOpen) {
      if (selectedIssue.assigneeIds && Array.isArray(selectedIssue.assigneeIds) && selectedIssue.assigneeIds.length > 0) {
        setSelectedDevIds(selectedIssue.assigneeIds.map(String));
      } else if (selectedIssue.assigneeId) {
        setSelectedDevIds(String(selectedIssue.assigneeId).split(',').map(s => s.trim()).filter(Boolean));
      } else if (linkedTask?.assigneeIds && Array.isArray(linkedTask.assigneeIds) && linkedTask.assigneeIds.length > 0) {
        setSelectedDevIds(linkedTask.assigneeIds.map(String));
      } else if (linkedTask?.assigneeId) {
        setSelectedDevIds(String(linkedTask.assigneeId).split(',').map(s => s.trim()).filter(Boolean));
      } else if (dedicatedDevs.length > 0) {
        setSelectedDevIds([String(dedicatedDevs[0].id)]);
      } else if (devOptions.length > 0) {
        setSelectedDevIds([String(devOptions[0].id)]);
      } else {
        setSelectedDevIds([]);
      }
      setIsDevDropdownOpen(false);
      setDevSearchFilter('');
      setReworkNotes('');
      setReassignFeedback(null);
    }
  }, [selectedIssue, isIssueDrawerOpen]);

  if (!isIssueDrawerOpen || !selectedIssue) return null;

  const handleToggleDev = (uId) => {
    const sId = String(uId);
    setSelectedDevIds(prev =>
      prev.includes(sId) ? prev.filter(x => x !== sId) : [...prev, sId]
    );
  };

  const handleSelectAllDevs = () => {
    if (selectedDevIds.length === devOptions.length) {
      setSelectedDevIds([]);
    } else {
      setSelectedDevIds(devOptions.map(u => String(u.id)));
    }
  };

  const handleReassign = async (e) => {
    e?.preventDefault();
    if (selectedDevIds.length === 0) {
      setReassignFeedback({ type: 'error', text: 'Please select at least one developer to reassign this defect to.' });
      return;
    }

    setIsReassigning(true);
    setReassignFeedback(null);

    try {
      const assignedUsers = allAvailableUsers.filter(u => selectedDevIds.includes(String(u.id)));
      const namesStr = assignedUsers.map(u => u.name).join(', ') || 'Developer(s)';
      await reassignTaskToDeveloper(
        selectedIssue.linkedTaskId,
        selectedDevIds,
        reworkNotes,
        selectedIssue.id
      );

      setReassignFeedback({
        type: 'success',
        text: `Defect ${selectedIssue.id}${selectedIssue.linkedTaskId ? ` and task ${selectedIssue.linkedTaskId}` : ''} reassigned to ${namesStr} in "In Progress" status!`
      });
      setReworkNotes('');
    } catch (err) {
      console.error(err);
      setReassignFeedback({ type: 'error', text: err.message || 'Failed to reassign defect.' });
    } finally {
      setIsReassigning(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs flex justify-end">
      <div 
        className="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-red-50/70 via-rose-50/50 to-white">
          <div className="flex items-center space-x-2.5">
            <span className="font-mono text-xs font-bold text-red-700 px-2.5 py-1 bg-red-100 rounded-md border border-red-200 flex items-center space-x-1.5">
              <Bug className="w-3.5 h-3.5" />
              <span>{selectedIssue.id}</span>
            </span>
            <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
              {selectedIssue.module || 'System Defect'}
            </span>
          </div>

          <button
            onClick={() => setIsIssueDrawerOpen(false)}
            className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Lifecycle Status Banner */}
          {selectedIssue.state === 'Pending' && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3.5 flex items-start space-x-3">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs">
                <span className="font-bold text-amber-900 block">Defect Needs Developer Rework</span>
                <span className="text-amber-700">
                  This task failed QA verification. Use the reassignment pipeline below to assign a developer, provide fix instructions, and move it back to &ldquo;In Progress&rdquo;.
                </span>
              </div>
            </div>
          )}

          {selectedIssue.state === 'In Progress' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3.5 flex items-start space-x-3">
              <Clock className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div className="text-xs flex-1">
                <span className="font-bold text-blue-900 block">Defect Rework In Progress</span>
                <span className="text-blue-700">
                  Currently assigned to <span className="font-semibold">{selectedIssue.assigneeName}</span>. Once code fixes are committed, send it back for QA testing.
                </span>
              </div>
              {linkedTask && (
                <button
                  type="button"
                  onClick={() => openSendToTestingModal(linkedTask)}
                  className="px-2.5 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-[11px] font-semibold flex items-center space-x-1 shrink-0 cursor-pointer shadow-2xs"
                >
                  <TestTube2 className="w-3 h-3" />
                  <span>Send to Testing</span>
                </button>
              )}
            </div>
          )}

          {selectedIssue.state === 'Done' && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3.5 flex items-start space-x-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div className="text-xs">
                <span className="font-bold text-emerald-900 block">Defect Resolved & Verified</span>
                <span className="text-emerald-700">
                  This defect has been verified by QA and marked as completed.
                </span>
              </div>
            </div>
          )}

          {/* Title & Priority Header */}
          <div>
            <div className="flex items-center space-x-2 mb-1.5 flex-wrap gap-y-1">
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                selectedIssue.priority === 'Critical' ? 'bg-red-600 text-white' : 'bg-amber-100 text-amber-800'
              }`}>
                {selectedIssue.priority} Priority
              </span>
              <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-mono rounded">
                Severity: {selectedIssue.severity || 'High'}
              </span>
              {selectedIssue.environment && (
                <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] rounded">
                  Env: {selectedIssue.environment}
                </span>
              )}
            </div>
            <h2 className="text-lg font-bold text-slate-900 leading-snug">{selectedIssue.title}</h2>
          </div>

          {/* State Selector Toolbar */}
          <div className="flex items-center justify-between bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
            <span className="font-bold text-slate-700">Lifecycle State:</span>
            <div className="flex items-center space-x-2">
              {['Pending', 'In Progress', 'Done'].map(state => (
                <button
                  key={state}
                  onClick={() => updateIssueState(selectedIssue.id, state)}
                  className={`px-3 py-1 rounded font-semibold transition-all cursor-pointer ${
                    selectedIssue.state === state
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {state}
                </button>
              ))}
            </div>
          </div>

          {/* Reassignment Pipeline Section */}
          <div className="bg-gradient-to-br from-indigo-50/60 via-purple-50/40 to-slate-50 p-4 rounded-xl border border-indigo-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-2xs">
                  <Wrench className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900">Developer Reassignment Pipeline</h3>
                  <p className="text-[11px] text-slate-500">Route failed task & defect back to developer with fix notes</p>
                </div>
              </div>

              {selectedIssue.linkedTaskId && (
                <span
                  onClick={() => {
                    setIsIssueDrawerOpen(false);
                    navigateTo('task_details', selectedIssue.linkedTaskId);
                  }}
                  className="font-mono text-[11px] font-bold text-blue-600 hover:underline cursor-pointer flex items-center space-x-1"
                >
                  <span>{selectedIssue.linkedTaskId}</span>
                  <ExternalLink className="w-3 h-3" />
                </span>
              )}
            </div>

            {/* Linked Task Context Card */}
            {linkedTask ? (
              <div className="p-3 bg-white rounded-lg border border-indigo-100 flex items-center justify-between text-xs">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-blue-600 text-[11px]">{linkedTask.id}</span>
                    <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                      linkedTask.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' :
                      linkedTask.status === 'In Progress' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {linkedTask.status}
                    </span>
                    {linkedTask.testingStatus && (
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-red-100 text-red-700">
                        {linkedTask.testingStatus}
                      </span>
                    )}
                  </div>
                  <h4 className="font-semibold text-slate-900 text-xs truncate mt-0.5">{linkedTask.title}</h4>
                </div>
              </div>
            ) : selectedIssue.linkedTaskId ? (
              <div className="p-2.5 bg-white/70 rounded-lg border border-slate-200 text-[11px] text-slate-600">
                Linked Task ID: <span className="font-mono font-bold text-blue-600">{selectedIssue.linkedTaskId}</span>
              </div>
            ) : null}

            {/* Choose Developers with Dropdown Multi-Select Checkboxes */}
            <div className="relative">
              <div className="flex items-center justify-between mb-1">
                <label className="font-bold text-slate-700 uppercase tracking-wider text-[10px] flex items-center space-x-1.5">
                  <span>Assign Developer(s) for Rework</span>
                  <span className="text-indigo-600 font-mono">({selectedDevIds.length} selected)</span>
                  <span className="text-red-500">*</span>
                </label>
                <span className="text-[10px] text-slate-400 font-medium">
                  {dedicatedDevs.length > 0 ? `${dedicatedDevs.length} dedicated dev(s)` : 'Project team members'}
                </span>
              </div>

              {/* Compact Dropdown Trigger Button */}
              <button
                type="button"
                onClick={() => setIsDevDropdownOpen(!isDevDropdownOpen)}
                className="w-full bg-white hover:bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 outline-none flex items-center justify-between transition-colors cursor-pointer text-left shadow-2xs"
              >
                <div className="flex items-center space-x-2 truncate flex-1 min-w-0">
                  {allAvailableUsers.filter(u => selectedDevIds.includes(String(u.id))).length === 0 ? (
                    <span className="text-slate-400">Select developers to fix defect...</span>
                  ) : (
                    <div className="flex items-center space-x-1.5 truncate">
                      <div className="flex -space-x-1.5 shrink-0">
                        {allAvailableUsers.filter(u => selectedDevIds.includes(String(u.id))).slice(0, 3).map(u => (
                          u.avatar ? (
                            <img key={u.id} src={u.avatar} alt={u.name} className="w-5 h-5 rounded-full object-cover ring-1 ring-white" />
                          ) : (
                            <div key={u.id} className="w-5 h-5 rounded-full bg-indigo-600 text-white font-bold text-[8px] flex items-center justify-center ring-1 ring-white">
                              {u.name?.charAt(0).toUpperCase()}
                            </div>
                          )
                        ))}
                      </div>
                      <span className="truncate text-slate-800 text-xs font-semibold">
                        {allAvailableUsers.filter(u => selectedDevIds.includes(String(u.id))).map(u => u.name).join(', ')}
                      </span>
                    </div>
                  )}
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 ml-1.5 transition-transform duration-150 ${isDevDropdownOpen ? 'rotate-180 text-indigo-600' : ''}`} />
              </button>

              {/* Floating Dropdown Overlay with Vertical Scroll */}
              {isDevDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsDevDropdownOpen(false)}
                  />
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-2xl z-50 p-2 space-y-1 animate-in fade-in zoom-in-95 duration-100 max-h-56 overflow-y-auto">
                    {/* Sticky Header with Search & Select All */}
                    <div className="sticky top-0 bg-white pb-1.5 pt-0.5 border-b border-slate-100 space-y-1.5 z-10">
                      <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase font-bold px-1">
                        <span>Available Developers</span>
                        <button
                          type="button"
                          onClick={handleSelectAllDevs}
                          className="text-indigo-600 hover:text-indigo-800 underline font-semibold lowercase cursor-pointer"
                        >
                          {selectedDevIds.length === devOptions.length ? 'deselect all' : 'select all'}
                        </button>
                      </div>

                      {devOptions.length > 4 && (
                        <div className="relative">
                          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2" />
                          <input
                            type="text"
                            value={devSearchFilter}
                            onChange={(e) => setDevSearchFilter(e.target.value)}
                            placeholder="Filter developers by name or role..."
                            className="w-full bg-slate-50 border border-slate-200 rounded-md pl-7 pr-2 py-1 text-xs outline-none focus:border-indigo-500"
                          />
                        </div>
                      )}
                    </div>

                    {/* Scrollable List of Developers with Checkboxes */}
                    {filteredDevs.length === 0 ? (
                      <div className="p-3 text-center text-slate-400 text-xs">No developers match filter</div>
                    ) : (
                      filteredDevs.map(u => {
                        const isSelected = selectedDevIds.includes(String(u.id));
                        const roleName = getUserRoleName ? getUserRoleName(u) : (u.role || 'Developer');
                        const isDedicated = isDeveloper(u);

                        return (
                          <div
                            key={u.id}
                            onClick={() => handleToggleDev(u.id)}
                            className={`p-2 rounded-lg flex items-center justify-between cursor-pointer transition-colors ${
                              isSelected ? 'bg-indigo-50 text-indigo-900 font-semibold' : 'hover:bg-slate-50 text-slate-700'
                            }`}
                          >
                            <div className="flex items-center space-x-2.5 min-w-0">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => {}}
                                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 shrink-0 pointer-events-none cursor-pointer"
                              />
                              {u.avatar ? (
                                <img src={u.avatar} alt={u.name} className="w-5 h-5 rounded-full object-cover shrink-0" />
                              ) : (
                                <div className="w-5 h-5 rounded-full bg-indigo-600 text-white font-bold text-[8px] flex items-center justify-center shrink-0">
                                  {u.name?.charAt(0).toUpperCase()}
                                </div>
                              )}
                              <div className="truncate">
                                <span className="text-slate-900 text-xs truncate">{u.name}</span>
                                <span className="text-[10px] text-slate-400 ml-1.5">{u.email}</span>
                              </div>
                            </div>

                            <div className="flex items-center space-x-1.5 shrink-0 ml-2">
                              <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                                isDedicated ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600'
                              }`}>
                                {roleName}
                              </span>
                              <div className={`w-3.5 h-3.5 rounded-md border flex items-center justify-center transition-colors ${
                                isSelected ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-300'
                              }`}>
                                {isSelected && <Check className="w-2 h-2 stroke-[3]" />}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Fix Notes Textarea */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700 uppercase tracking-wider text-[10px] block">
                Fix / Rework Notes for Developer
              </label>
              <textarea
                rows={2}
                value={reworkNotes}
                onChange={(e) => setReworkNotes(e.target.value)}
                placeholder="e.g. Please verify token refresh logic on 401 response and re-submit for testing."
                className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 outline-none focus:border-indigo-500 transition-all resize-none"
              />
            </div>

            {/* Reassignment Feedback */}
            {reassignFeedback && (
              <div className={`p-2.5 rounded-lg text-xs flex items-center space-x-2 ${
                reassignFeedback.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}>
                {reassignFeedback.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                )}
                <span className="font-medium">{reassignFeedback.text}</span>
              </div>
            )}

            {/* Reassign Button */}
            <div className="flex items-center justify-end space-x-2 pt-1">
              <button
                type="button"
                onClick={handleReassign}
                disabled={isReassigning || selectedDevIds.length === 0}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs rounded-lg shadow-sm transition-all flex items-center space-x-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{isReassigning ? 'Reassigning...' : `Reassign Task & Defect (${selectedDevIds.length})`}</span>
              </button>
            </div>
          </div>

          {/* Description & Reproduction Steps */}
          <div className="space-y-3 bg-slate-50 p-4 rounded-lg border border-slate-200 text-xs text-slate-800">
            <div>
              <span className="font-bold text-slate-500 uppercase tracking-wider block mb-1">Description</span>
              <p className="leading-relaxed">{selectedIssue.description || 'No description provided.'}</p>
            </div>

            {selectedIssue.stepsToReproduce && (
              <div>
                <span className="font-bold text-slate-500 uppercase tracking-wider block mb-1">Steps to Reproduce</span>
                <pre className="whitespace-pre-wrap font-sans text-slate-700 bg-white p-2.5 rounded border border-slate-200">
                  {selectedIssue.stepsToReproduce}
                </pre>
              </div>
            )}

            {selectedIssue.expectedResult && (
              <div>
                <span className="font-bold text-slate-500 uppercase tracking-wider block mb-0.5">Expected Result</span>
                <p className="text-slate-700 bg-white p-2 rounded border border-slate-200">{selectedIssue.expectedResult}</p>
              </div>
            )}

            {selectedIssue.actualResult && (
              <div>
                <span className="font-bold text-slate-500 uppercase tracking-wider block mb-0.5">Actual Result</span>
                <p className="text-slate-700 bg-white p-2 rounded border border-slate-200">{selectedIssue.actualResult}</p>
              </div>
            )}
          </div>

          {/* Screenshots & Attachments */}
          {selectedIssue.screenshots && selectedIssue.screenshots.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-1.5">
                <ImageIcon className="w-4 h-4 text-indigo-600" />
                <span>Screenshot Evidence ({selectedIssue.screenshots.length})</span>
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {selectedIssue.screenshots.map(sc => (
                  <div key={sc.id || sc.url} className="border border-slate-200 rounded-md overflow-hidden bg-slate-50">
                    <img src={sc.url} alt={sc.title || 'Screenshot'} className="w-full h-32 object-cover" />
                    <div className="p-2 text-[10px] font-mono text-slate-600 truncate">{sc.title || 'Screenshot'}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Meta Information */}
          <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-lg border border-slate-200">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Assigned Fixer</span>
              <span className="font-semibold text-slate-800">{selectedIssue.assigneeName || 'Unassigned'}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Reporter</span>
              <span className="font-semibold text-slate-800">{selectedIssue.reporterName || 'QA Tester'}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Linked Task</span>
              {selectedIssue.linkedTaskId ? (
                <span
                  onClick={() => {
                    setIsIssueDrawerOpen(false);
                    navigateTo('task_details', selectedIssue.linkedTaskId);
                  }}
                  className="font-mono font-bold text-blue-600 hover:underline cursor-pointer flex items-center space-x-1"
                >
                  <span>{selectedIssue.linkedTaskId}</span>
                  <ExternalLink className="w-3 h-3" />
                </span>
              ) : (
                <span className="text-slate-500 italic">None</span>
              )}
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Due Date</span>
              <span className="font-mono text-red-600 font-bold">{selectedIssue.dueDate || '—'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
