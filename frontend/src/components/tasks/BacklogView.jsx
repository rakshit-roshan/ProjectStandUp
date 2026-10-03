import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Layers,
  Plus,
  ArrowRight,
  Zap,
  Clock,
  Filter,
  Search,
  CheckSquare
} from 'lucide-react';

export const BacklogView = () => {
  const {
    tasks,
    sprints,
    currentSprint,
    currentProject,
    updateTask,
    setIsCreateTaskModalOpen,
    setSelectedTaskId,
    setIsTaskDrawerOpen
  } = useApp();

  const projectSprints = !currentProject ? [] : sprints.filter(s => s.projectId === currentProject?.id || String(s.projectId) === String(currentProject?.id));
  const backlogTasks = !currentProject ? [] : tasks.filter(t => t.status === 'Backlog' && (t.projectId === currentProject?.id || String(t.projectId) === String(currentProject?.id)));
  const [selectedSprintTarget, setSelectedSprintTarget] = useState(projectSprints[0]?.id || currentSprint?.id || '');

  const moveTaskToSprint = (taskId) => {
    const targetSprint = sprints.find(s => s.id === selectedSprintTarget);
    if (targetSprint) {
      updateTask(taskId, {
        sprintId: targetSprint.id,
        sprintName: targetSprint.name,
        status: 'In Progress'
      });
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-lg border border-slate-200 shadow-2xs">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-md">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900 leading-tight">Product Backlog Workspace</h1>
            <p className="text-xs text-slate-500">Groom backlog user stories, estimate story points, and commit items into sprints</p>
          </div>
        </div>
      </div>

      {/* Main Grid: Active Backlog Queue & Sprint Assignment Target */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Backlog Item Stream */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between bg-white p-3.5 rounded-lg border border-slate-200">
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Unassigned Backlog Items ({backlogTasks.length})
            </h2>
            <div className="flex items-center space-x-2 text-xs">
              <span className="text-slate-500">Target Sprint:</span>
              <select
                value={selectedSprintTarget}
                onChange={(e) => setSelectedSprintTarget(e.target.value)}
                className="bg-slate-50 border border-slate-200 font-semibold px-2 py-1 rounded outline-none"
              >
                {projectSprints.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            {backlogTasks.length === 0 ? (
              <div className="bg-white p-8 rounded-lg border border-slate-200 text-center text-slate-400 text-xs">
                Backlog is clear! All items have been assigned to sprints.
              </div>
            ) : (
              backlogTasks.map(task => (
                <div
                  key={task.id}
                  onClick={() => {
                    setSelectedTaskId(task.id);
                    setIsTaskDrawerOpen(true);
                  }}
                  className="p-3.5 bg-white rounded-lg border border-slate-200 shadow-2xs hover:border-blue-400 cursor-pointer transition-all flex items-center justify-between text-xs space-x-3"
                >
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <span className="font-mono font-bold text-slate-500 shrink-0">{task.id}</span>
                    <span className="font-semibold text-slate-900 truncate hover:text-blue-600">{task.title}</span>
                  </div>

                  <div className="flex items-center space-x-3 shrink-0" onClick={e => e.stopPropagation()}>
                    <span className="font-mono text-[10px] px-2 py-0.5 bg-slate-100 font-bold text-slate-700 rounded">
                      {task.storyPoints} pts
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                      task.priority === 'High' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {task.priority}
                    </span>
                    <button
                      onClick={() => moveTaskToSprint(task.id)}
                      className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-[11px] rounded flex items-center space-x-1 transition-colors"
                    >
                      <span>Move to Sprint</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right 1 Column: Sprint Goal & Capacity Summary */}
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs space-y-4">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center space-x-1.5">
            <Zap className="w-4 h-4 text-amber-500" />
            <span>Active Sprint Target</span>
          </h3>

          <div className="space-y-2 text-xs">
            <div className="font-bold text-slate-800 text-sm">{currentSprint?.name}</div>
            <p className="text-slate-600">{currentSprint?.goal}</p>
            <div className="p-3 bg-slate-50 rounded border border-slate-200 space-y-1 mt-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Dates:</span>
                <span className="font-mono font-medium">{currentSprint?.startDate} to {currentSprint?.endDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Total Story Points:</span>
                <span className="font-mono font-bold text-blue-600">{currentSprint?.storyPoints} pts</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
