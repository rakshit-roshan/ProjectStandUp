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
    getProjectMembers,
    getUserRoleName
  } = useApp();

  const activeProject = currentProject || (projects && projects.length > 0 ? projects[0] : null);
  const hasNoProjects = !activeProject;
  const projectSprints = (sprints || []).filter(s => !activeProject || !s.projectId || s.projectId === activeProject?.id || String(s.projectId) === String(activeProject?.id));
  const availableSprints = projectSprints.length > 0 ? projectSprints : (sprints || []);
  const teamMembers = getProjectMembers(activeProject);
  const availableAssignees = [...teamMembers, ...(users || []).filter(u => !teamMembers.some(tm => String(tm.id) === String(u.id)))];

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [storyPoints, setStoryPoints] = useState(3);
  const [selectedAssigneeIds, setSelectedAssigneeIds] = useState([]);
  const [isAssigneeDropdownOpen, setIsAssigneeDropdownOpen] = useState(false);
  const [sprintId, setSprintId] = useState(availableSprints[0]?.id || currentSprint?.id || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    if (isCreateTaskModalOpen) {
      setErrorMessage(null);
      if (availableSprints.length > 0 && !sprintId) {
        setSprintId(availableSprints[0]?.id);
      }
    } else {
      setIsAssigneeDropdownOpen(false);
    }
  }, [isCreateTaskModalOpen, availableSprints]);

  if (!isCreateTaskModalOpen) return null;

  const toggleAssignee = (uId) => {
    const sId = String(uId);
    if (selectedAssigneeIds.map(String).includes(sId)) {
      setSelectedAssigneeIds(selectedAssigneeIds.filter(id => String(id) !== sId));
    } else {
      setSelectedAssigneeIds([...selectedAssigneeIds, sId]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (hasNoProjects) return;
    if (!title.trim()) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    const assignedUsers = availableAssignees.filter(u => selectedAssigneeIds.map(String).includes(String(u.id)));
    const assigneeIdsStr = assignedUsers.map(u => u.id).join(',');
    const assigneeNamesStr = assignedUsers.length > 0 
      ? assignedUsers.map(u => u.name).join(', ') 
      : 'Unassigned';

    try {
      await createTask({
        title: title.trim(),
        description: description.trim(),
        priority,
        storyPoints,
        assigneeId: assigneeIdsStr,
        assigneeIds: assignedUsers.map(u => u.id),
        assigneeName: assigneeNamesStr,
        assigneeAvatar: assignedUsers[0]?.avatar || '',
        sprintId,
        projectId: activeProject?.id || 'PRJ-101',
        projectName: activeProject?.name || 'Default Project'
      });

      setIsCreateTaskModalOpen(false);
      setTitle('');
      setDescription('');
      setSelectedAssigneeIds([]);
      setIsAssigneeDropdownOpen(false);
    } catch (err) {
      console.error('Failed to create task:', err);
      setErrorMessage(err.message || 'Failed to create task. Please check database connectivity.');
    } finally {
      setIsSubmitting(false);
    }
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
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-900 text-xs font-semibold flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {hasNoProjects && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-xs font-semibold flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>No project workspace exists. Please create a project workspace first before creating tasks.</span>
            </div>
          )}

          {activeProject && (
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-slate-700">
              <span className="font-medium">Project Workspace:</span>
              <span className="font-bold text-blue-600 font-mono">{activeProject.name} ({activeProject.code || activeProject.id})</span>
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
                    ? availableAssignees.find(u => String(u.id) === String(selectedAssigneeIds[0]))?.name || '1 Assignee'
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

                {availableAssignees.length === 0 ? (
                  <div className="p-2 text-slate-400 text-xs">No team members available</div>
                ) : (
                  availableAssignees.map(u => {
                    const isSelected = selectedAssigneeIds.map(String).includes(String(u.id));
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
                        <span className="text-[10px] text-slate-400 font-medium">{getUserRoleName ? getUserRoleName(u) : u.role}</span>
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
              <option value="">-- No Sprint (Backlog) --</option>
              {availableSprints.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div className="pt-3 border-t border-slate-200 flex justify-end space-x-2">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => setIsCreateTaskModalOpen(false)}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={hasNoProjects || isSubmitting}
              className={`px-4 py-1.5 text-white font-semibold rounded text-xs transition-colors flex items-center space-x-1.5 ${
                hasNoProjects || isSubmitting
                  ? 'bg-slate-300 cursor-not-allowed opacity-60'
                  : 'bg-blue-600 hover:bg-blue-700 shadow-2xs'
              }`}
            >
              {isSubmitting ? (
                <>
                  <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block"></span>
                  <span>Saving...</span>
                </>
              ) : (
                <span>Create Task</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

