import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Plus, CheckCircle2, ChevronDown, Users, AlertTriangle } from 'lucide-react';

export const CreateTaskModal = () => {
  const {
    currentUser,
    isCreateTaskModalOpen,
    setIsCreateTaskModalOpen,
    createTask,
    sprints,
    projects,
    users,
    currentSprint,
    currentProject,
    getProjectMembers
  } = useApp();

  const hasNoProjects = !projects || projects.length === 0 || !currentProject;
  const projectSprints = sprints.filter(s => s.projectId === currentProject?.id || String(s.projectId) === String(currentProject?.id));
  const teamMembers = getProjectMembers(currentProject);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [storyPoints, setStoryPoints] = useState(3);
  const [selectedAssigneeIds, setSelectedAssigneeIds] = useState([]);
  const [isAssigneeDropdownOpen, setIsAssigneeDropdownOpen] = useState(false);
  const [sprintId, setSprintId] = useState(projectSprints[0]?.id || currentSprint?.id || '');

  useEffect(() => {
    if (isCreateTaskModalOpen) {
      if (projectSprints.length > 0 && !sprintId) {
        setSprintId(projectSprints[0]?.id);
      }
    } else {
      setIsAssigneeDropdownOpen(false);
    }
  }, [isCreateTaskModalOpen, projectSprints]);

  if (!isCreateTaskModalOpen) return null;

  const toggleAssignee = (uId) => {
    if (selectedAssigneeIds.includes(uId)) {
      setSelectedAssigneeIds(selectedAssigneeIds.filter(id => id !== uId));
    } else {
      setSelectedAssigneeIds([...selectedAssigneeIds, uId]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (hasNoProjects) return;
    if (!title.trim()) return;

    const assignedUsers = teamMembers.filter(u => selectedAssigneeIds.includes(u.id));
    const assigneeIdsStr = assignedUsers.map(u => u.id).join(',');
    const assigneeNamesStr = assignedUsers.length > 0 
      ? assignedUsers.map(u => u.name).join(', ') 
      : 'Unassigned';

    await createTask({
      title,
      description,
      priority,
      storyPoints,
      assigneeId: assigneeIdsStr,
      assigneeIds: assignedUsers.map(u => u.id),
      assigneeName: assigneeNamesStr,
      assigneeAvatar: assignedUsers[0]?.avatar || '',
      sprintId,
      projectId: currentProject?.id || 'PRJ-101'
    });

    setIsCreateTaskModalOpen(false);
    setTitle('');
    setDescription('');
    setSelectedAssigneeIds([]);
    setIsAssigneeDropdownOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="w-full max-w-lg bg-white rounded-lg shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={e => e.stopPropagation()}
      >
        <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">Create New Sprint Task</h3>
          <button onClick={() => setIsCreateTaskModalOpen(false)} className="text-slate-400 hover:text-slate-700">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {hasNoProjects && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-xs font-semibold flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>No project workspace exists. Please create a project workspace first before creating tasks.</span>
            </div>
          )}
          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Task Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Implement User Authentication API"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-xs font-semibold outline-none focus:border-blue-600"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Description</label>
            <textarea
              rows={3}
              placeholder="Detailed task instructions..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded p-2.5 text-xs outline-none focus:border-blue-600 font-sans"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs font-semibold outline-none"
              >
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Story Points</label>
              <input
                type="number"
                value={storyPoints}
                onChange={(e) => setStoryPoints(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs font-mono font-semibold outline-none"
              />
            </div>
          </div>

          {/* Assignees Optional Multi-Select Dropdown */}
          <div className="relative">
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
              Assignees <span className="text-slate-400 font-normal lowercase">(Optional)</span>
            </label>
            <button
              type="button"
              onClick={() => setIsAssigneeDropdownOpen(!isAssigneeDropdownOpen)}
              className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 flex items-center justify-between transition-all outline-none focus:border-blue-600"
            >
              <div className="flex items-center space-x-2 truncate">
                <Users className="w-4 h-4 text-blue-600 shrink-0" />
                <span className="truncate font-medium">
                  {selectedAssigneeIds.length === 0
                    ? 'Unassigned (No team members selected)'
                    : selectedAssigneeIds.length === 1
                    ? teamMembers.find(u => u.id === selectedAssigneeIds[0])?.name || '1 Assignee'
                    : `${selectedAssigneeIds.length} Assignees Selected`}
                </span>
              </div>
              <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 ml-2 transition-transform duration-150 ${isAssigneeDropdownOpen ? 'rotate-180 text-blue-600' : ''}`} />
            </button>

            {isAssigneeDropdownOpen && (
              <div className="absolute left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-2xl p-2 z-[100] max-h-48 overflow-y-auto space-y-1 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between px-2 py-1 border-b border-slate-100 text-[10px] text-slate-400 uppercase font-bold sticky top-0 bg-white z-10">
                  <span>Select Team Members</span>
                  {selectedAssigneeIds.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setSelectedAssigneeIds([])}
                      className="text-blue-600 hover:underline capitalize"
                    >
                      Clear All (Unassign)
                    </button>
                  )}
                </div>

                {teamMembers.length === 0 ? (
                  <div className="p-2 text-slate-400 text-xs">No team members available</div>
                ) : (
                  teamMembers.map(u => {
                    const isSelected = selectedAssigneeIds.includes(u.id);
                    return (
                      <div
                        key={u.id}
                        onClick={() => toggleAssignee(u.id)}
                        className={`flex items-center justify-between p-2 rounded cursor-pointer transition-colors text-xs ${
                          isSelected ? 'bg-blue-50 text-blue-700 font-semibold' : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center space-x-2.5">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}}
                            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                          />
                          <img src={u.avatar} alt={u.name} className="w-5 h-5 rounded-full object-cover" />
                          <span>{u.name}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 capitalize font-mono">{u.role}</span>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Target Sprint</label>
            <select
              value={sprintId}
              onChange={(e) => setSprintId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs font-semibold outline-none"
            >
              {projectSprints.length === 0 ? (
                <option value="">No sprints in this project</option>
              ) : (
                projectSprints.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))
              )}
            </select>
          </div>

          <div className="pt-3 border-t border-slate-200 flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setIsCreateTaskModalOpen(false)}
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
                  : 'bg-blue-600 hover:bg-blue-700 shadow-2xs'
              }`}
            >
              Create Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

