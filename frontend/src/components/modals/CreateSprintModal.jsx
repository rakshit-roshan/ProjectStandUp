import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Zap, AlertTriangle } from 'lucide-react';

export const CreateSprintModal = () => {
  const {
    isCreateSprintModalOpen,
    setIsCreateSprintModalOpen,
    createSprint,
    projects,
    sprints,
    currentProject
  } = useApp();

  const hasNoProjects = !projects || projects.length === 0 || !currentProject;
  const projectSprints = (sprints || []).filter(s => s.projectId === currentProject?.id || String(s.projectId) === String(currentProject?.id));
  const nextSprintNumber = projectSprints.length + 1;

  const [name, setName] = useState('');
  const [goal, setGoal] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    if (isCreateSprintModalOpen) {
      setName(`Sprint ${String(nextSprintNumber).padStart(2, '0')}`);
      setGoal('');
      const today = new Date().toISOString().split('T')[0];
      const twoWeeksLater = new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0];
      setStartDate(today);
      setEndDate(twoWeeksLater);
    }
  }, [isCreateSprintModalOpen, nextSprintNumber]);

  if (!isCreateSprintModalOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (hasNoProjects) return;
    await createSprint({
      name,
      goal,
      startDate,
      endDate,
      projectId: currentProject?.id
    });
    setIsCreateSprintModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="w-full max-w-lg bg-white rounded-lg shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={e => e.stopPropagation()}
      >
        <div className="px-5 py-4 bg-amber-50 border-b border-amber-100 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Zap className="w-4 h-4 text-amber-600" />
            <h3 className="text-sm font-bold text-amber-950">Create New Sprint Cycle</h3>
          </div>
          <button onClick={() => setIsCreateSprintModalOpen(false)} className="text-slate-400 hover:text-slate-700">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {hasNoProjects && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-xs font-semibold flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>No project workspace exists. Please create a project workspace first before creating sprints.</span>
            </div>
          )}
          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Sprint Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-xs font-semibold outline-none focus:border-blue-600"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Sprint Goal</label>
            <textarea
              rows={3}
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded p-2.5 text-xs outline-none focus:border-blue-600 font-sans"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs font-mono outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs font-mono outline-none"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setIsCreateSprintModalOpen(false)}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={hasNoProjects}
              className={`px-4 py-1.5 text-white font-semibold rounded text-xs transition-colors ${
                hasNoProjects
                  ? 'bg-slate-300 cursor-not-allowed opacity-60'
                  : 'bg-amber-600 hover:bg-amber-700 shadow-2xs'
              }`}
            >
              Create Sprint
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
