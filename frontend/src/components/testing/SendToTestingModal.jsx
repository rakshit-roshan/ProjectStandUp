import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { X, TestTube2, Check, User, AlertCircle, Send, CheckCircle2, ChevronDown, Search } from 'lucide-react';

export const SendToTestingModal = () => {
  const {
    currentUser,
    isSendToTestingModalOpen,
    setIsSendToTestingModalOpen,
    testingTargetTask,
    sendTaskToTesting,
    users,
    currentProject,
    getProjectMembers,
    getUserRoleName,
    canSendTaskToTesting
  } = useApp();

  const [selectedTesterIds, setSelectedTesterIds] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');
  const [testNotes, setTestNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  const teamMembers = getProjectMembers(currentProject);
  const allAvailableUsers = [
    ...teamMembers,
    ...users.filter(u => !teamMembers.some(tm => String(tm.id) === String(u.id)))
  ];

  // Helper to determine if a user has a QA/Tester role
  const isTester = (u) => {
    if (!u) return false;
    const code = Number(u.roleCode !== undefined && u.roleCode !== null ? u.roleCode : u.role);
    const roleName = String(u.roleName || u.role || '').toUpperCase();
    return code === 4 || roleName === 'TESTER' || roleName === 'QA' || roleName.includes('TESTER') || roleName.includes('QA');
  };

  // Prioritize dedicated testers; fallback to all available project members if none exist
  const dedicatedTesters = allAvailableUsers.filter(isTester);
  const testerOptions = dedicatedTesters.length > 0 ? dedicatedTesters : allAvailableUsers;

  const filteredTesters = testerOptions.filter(u => {
    if (!searchFilter.trim()) return true;
    const term = searchFilter.toLowerCase();
    const role = getUserRoleName ? getUserRoleName(u).toLowerCase() : (u.role || '').toLowerCase();
    return (
      (u.name && u.name.toLowerCase().includes(term)) ||
      (u.email && u.email.toLowerCase().includes(term)) ||
      role.includes(term)
    );
  });

  useEffect(() => {
    if (testingTargetTask && isSendToTestingModalOpen) {
      if (testingTargetTask.testerIds && Array.isArray(testingTargetTask.testerIds) && testingTargetTask.testerIds.length > 0) {
        setSelectedTesterIds(testingTargetTask.testerIds.map(String));
      } else if (testingTargetTask.testerId) {
        const parsed = String(testingTargetTask.testerId).split(',').map(s => s.trim()).filter(Boolean);
        setSelectedTesterIds(parsed);
      } else if (dedicatedTesters.length > 0) {
        setSelectedTesterIds([String(dedicatedTesters[0].id)]);
      } else if (testerOptions.length > 0) {
        setSelectedTesterIds([String(testerOptions[0].id)]);
      } else {
        setSelectedTesterIds([]);
      }
      setIsDropdownOpen(false);
      setSearchFilter('');
      setTestNotes('');
      setStatusMessage(null);
    }
  }, [testingTargetTask, isSendToTestingModalOpen]);

  const canSend = canSendTaskToTesting ? canSendTaskToTesting(testingTargetTask, currentUser) : true;
  if (!isSendToTestingModalOpen || !testingTargetTask || !canSend) return null;

  const handleToggleTester = (uId) => {
    const sId = String(uId);
    setSelectedTesterIds(prev =>
      prev.includes(sId) ? prev.filter(x => x !== sId) : [...prev, sId]
    );
  };

  const handleSelectAllTesters = () => {
    if (selectedTesterIds.length === testerOptions.length) {
      setSelectedTesterIds([]);
    } else {
      setSelectedTesterIds(testerOptions.map(u => String(u.id)));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedTesterIds.length === 0) {
      setStatusMessage({ type: 'error', text: 'Please select at least one tester to assign this task to.' });
      return;
    }

    setIsSubmitting(true);
    try {
      await sendTaskToTesting(testingTargetTask.id, selectedTesterIds, testNotes);
      const chosenTesters = allAvailableUsers.filter(u => selectedTesterIds.includes(String(u.id)));
      const namesStr = chosenTesters.map(u => u.name).join(', ') || 'Selected Tester(s)';
      setStatusMessage({
        type: 'success',
        text: `Task ${testingTargetTask.id} successfully sent to ${namesStr} for QA!`
      });
      setTimeout(() => {
        setIsSendToTestingModalOpen(false);
        setIsSubmitting(false);
        setStatusMessage(null);
      }, 1200);
    } catch (err) {
      console.error(err);
      setStatusMessage({ type: 'error', text: err.message || 'Failed to send task to testing.' });
      setIsSubmitting(false);
    }
  };

  const selectedTestersList = allAvailableUsers.filter(u => selectedTesterIds.includes(String(u.id)));

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="w-full max-w-lg bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 border border-purple-400/30 flex items-center justify-center">
              <TestTube2 className="w-4 h-4 text-purple-300" />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-tight">Send to QA Testing</h3>
              <p className="text-[11px] text-purple-200/80">Select one or more QA testers for verification</p>
            </div>
          </div>
          <button
            onClick={() => setIsSendToTestingModalOpen(false)}
            className="p-1 rounded-lg text-purple-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {/* Target Task Summary Card */}
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <span className="font-mono text-[11px] font-bold text-blue-600 block">{testingTargetTask.id}</span>
              <h4 className="font-semibold text-slate-800 text-xs truncate mt-0.5">{testingTargetTask.title}</h4>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 shrink-0 ml-2">
              {testingTargetTask.priority}
            </span>
          </div>

          {/* Compact Multi-Select Dropdown with Vertical Scroll */}
          <div className="relative">
            <div className="flex items-center justify-between mb-1">
              <label className="font-bold text-slate-700 uppercase tracking-wider text-[10px] flex items-center space-x-1.5">
                <span>Choose QA Tester(s)</span>
                <span className="text-purple-600 font-mono">({selectedTesterIds.length} selected)</span>
                <span className="text-red-500">*</span>
              </label>
              <span className="text-[10px] text-slate-400 font-medium">
                {dedicatedTesters.length > 0 ? `${dedicatedTesters.length} dedicated tester(s)` : 'Project team members'}
              </span>
            </div>

            {/* Dropdown Trigger Button */}
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 outline-none flex items-center justify-between transition-colors cursor-pointer text-left shadow-2xs"
            >
              <div className="flex items-center space-x-2 truncate flex-1 min-w-0">
                {selectedTestersList.length === 0 ? (
                  <span className="text-slate-400">Select QA testers...</span>
                ) : (
                  <div className="flex items-center space-x-1.5 truncate">
                    <div className="flex -space-x-1.5 shrink-0">
                      {selectedTestersList.slice(0, 3).map(u => (
                        u.avatar ? (
                          <img key={u.id} src={u.avatar} alt={u.name} className="w-5 h-5 rounded-full object-cover ring-1 ring-white" />
                        ) : (
                          <div key={u.id} className="w-5 h-5 rounded-full bg-purple-600 text-white font-bold text-[8px] flex items-center justify-center ring-1 ring-white">
                            {u.name?.charAt(0).toUpperCase()}
                          </div>
                        )
                      ))}
                    </div>
                    <span className="truncate text-slate-800 text-xs font-semibold">
                      {selectedTestersList.map(u => u.name).join(', ')}
                    </span>
                  </div>
                )}
              </div>
              <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 ml-1.5 transition-transform duration-150 ${isDropdownOpen ? 'rotate-180 text-purple-600' : ''}`} />
            </button>

            {/* Floating Dropdown Overlay with Vertical Scroll */}
            {isDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsDropdownOpen(false)}
                />
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-2xl z-50 p-2 space-y-1 animate-in fade-in zoom-in-95 duration-100 max-h-56 overflow-y-auto">
                  {/* Sticky Header with Search & Select All */}
                  <div className="sticky top-0 bg-white pb-1.5 pt-0.5 border-b border-slate-100 space-y-1.5 z-10">
                    <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase font-bold px-1">
                      <span>Available QA Testers</span>
                      <button
                        type="button"
                        onClick={handleSelectAllTesters}
                        className="text-purple-600 hover:text-purple-800 underline font-semibold lowercase cursor-pointer"
                      >
                        {selectedTesterIds.length === testerOptions.length ? 'deselect all' : 'select all'}
                      </button>
                    </div>

                    {testerOptions.length > 4 && (
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2" />
                        <input
                          type="text"
                          value={searchFilter}
                          onChange={(e) => setSearchFilter(e.target.value)}
                          placeholder="Filter testers by name or role..."
                          className="w-full bg-slate-50 border border-slate-200 rounded-md pl-7 pr-2 py-1 text-xs outline-none focus:border-purple-500"
                        />
                      </div>
                    )}
                  </div>

                  {/* Scrollable List of Testers with Checkboxes */}
                  {filteredTesters.length === 0 ? (
                    <div className="p-3 text-center text-slate-400 text-xs">No testers match filter</div>
                  ) : (
                    filteredTesters.map(u => {
                      const isSelected = selectedTesterIds.includes(String(u.id));
                      const roleName = getUserRoleName ? getUserRoleName(u) : (u.role || 'Member');
                      const isDedicatedTester = isTester(u);

                      return (
                        <div
                          key={u.id}
                          onClick={() => handleToggleTester(u.id)}
                          className={`p-2 rounded-lg flex items-center justify-between cursor-pointer transition-colors ${
                            isSelected ? 'bg-purple-50 text-purple-900 font-semibold' : 'hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <div className="flex items-center space-x-2.5 min-w-0">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {}}
                              className="rounded border-slate-300 text-purple-600 focus:ring-purple-500 shrink-0 pointer-events-none cursor-pointer"
                            />
                            {u.avatar ? (
                              <img src={u.avatar} alt={u.name} className="w-5 h-5 rounded-full object-cover shrink-0" />
                            ) : (
                              <div className="w-5 h-5 rounded-full bg-purple-600 text-white font-bold text-[8px] flex items-center justify-center shrink-0">
                                {u.name?.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <div className="truncate">
                              <div className="text-slate-900 text-xs truncate">{u.name}</div>
                              <div className="text-[10px] text-slate-400 truncate">{u.email}</div>
                            </div>
                          </div>

                          <div className="flex items-center space-x-1.5 shrink-0 ml-2">
                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                              isDedicatedTester
                                ? 'bg-purple-100 text-purple-700 border border-purple-200'
                                : 'bg-slate-100 text-slate-600'
                            }`}>
                              {roleName}
                            </span>
                            <div className={`w-3.5 h-3.5 rounded-md border flex items-center justify-center transition-colors ${
                              isSelected ? 'border-purple-600 bg-purple-600 text-white' : 'border-slate-300'
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

          {/* Test Instructions / Notes */}
          <div className="space-y-1">
            <label className="font-bold text-slate-700 uppercase tracking-wider text-[10px] block">
              Testing Instructions / Release Notes <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <textarea
              rows={3}
              value={testNotes}
              onChange={(e) => setTestNotes(e.target.value)}
              placeholder="e.g. Implemented JWT expiration handling. Please test with expired tokens and verify redirect to login."
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 outline-none focus:border-purple-500 focus:bg-white transition-all resize-none"
            />
          </div>

          {/* Status feedback */}
          {statusMessage && (
            <div className={`p-2.5 rounded-lg text-xs flex items-center space-x-2 ${
              statusMessage.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              )}
              <span className="font-medium">{statusMessage.text}</span>
            </div>
          )}

          {/* Footer buttons */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-end space-x-2">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => setIsSendToTestingModalOpen(false)}
              className="px-3.5 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || selectedTesterIds.length === 0}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 active:bg-purple-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-lg shadow-sm transition-all flex items-center space-x-1.5 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Sending...' : `Send to Testing (${selectedTesterIds.length})`}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
