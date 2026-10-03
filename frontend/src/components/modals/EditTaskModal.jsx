import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Edit3, Trash2, ChevronDown, Users } from 'lucide-react';

export const EditTaskModal = () => {
  const {
    currentUser,
    isEditTaskModalOpen,
    setIsEditTaskModalOpen,
    editingTask,
    updateTask,
    deleteTask,
    sprints,
    projects,
    users,
    currentProject,
    getProjectMembers
  } = useApp();

  const teamMembers = getProjectMembers(currentProject);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [status, setStatus] = useState('Backlog');
  const [storyPoints, setStoryPoints] = useState(3);
  const [selectedAssigneeIds, setSelectedAssigneeIds] = useState([]);
  const [isAssigneeDropdownOpen, setIsAssigneeDropdownOpen] = useState(false);
  const [sprintId, setSprintId] = useState('');

  const targetProjectId = editingTask?.projectId || currentProject?.id;
  const projectSprints = (sprints || []).filter(s => 
    !targetProjectId || s.projectId === targetProjectId || String(s.projectId) === String(targetProjectId)
  );

  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title || '');
      setDescription(editingTask.description || '');
      setPriority(editingTask.priority || 'Medium');
      setStatus(editingTask.status || 'Backlog');
      setStoryPoints(editingTask.storyPoints || 3);
      setSprintId(editingTask.sprintId || '');
      setIsAssigneeDropdownOpen(false);

      if (editingTask.assigneeIds && Array.isArray(editingTask.assigneeIds)) {
        setSelectedAssigneeIds(editingTask.assigneeIds.map(String));
      } else if (editingTask.assigneeId) {
        const ids = String(editingTask.assigneeId).split(',').map(s => s.trim()).filter(Boolean);
        setSelectedAssigneeIds(ids);
      } else {
        setSelectedAssigneeIds([]);
      }
    }
  }, [editingTask]);

  if (!isEditTaskModalOpen || !editingTask) return null;

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
    if (!title.trim()) return;

    const selectedSprint = sprints.find(s => String(s.id) === String(sprintId));
    const allAvailableUsers = [...teamMembers, ...users.filter(u => !teamMembers.some(tm => String(tm.id) === String(u.id)))];
    const assignedUsers = allAvailableUsers.filter(u => selectedAssigneeIds.map(String).includes(String(u.id)));
    const assigneeIdsStr = assignedUsers.map(u => u.id).join(',');
    const assigneeNamesStr = assignedUsers.length > 0 
      ? assignedUsers.map(u => u.name).join(', ') 
      : 'Unassigned';

    await updateTask(editingTask.id, {
      title,
      description,
      priority,
      status,
      storyPoints: parseInt(storyPoints) || 0,
      sprintId: sprintId || '',
      sprintName: selectedSprint ? selectedSprint.name : (sprintId ? editingTask.sprintName : 'Backlog'),
      assigneeId: assigneeIdsStr,
      assigneeIds: assignedUsers.map(u => u.id),
      assigneeName: assigneeNamesStr,
      assigneeAvatar: assignedUsers[0]?.avatar || ''
    });

    setIsEditTaskModalOpen(false);
    setIsAssigneeDropdownOpen(false);
  };

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete task ${editingTask.id}?`)) {
      await deleteTask(editingTask.id);
      setIsEditTaskModalOpen(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="w-full max-w-lg bg-white rounded-lg shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={e => e.stopPropagation()}
      >
        <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Edit3 className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900">
              Edit Task <span className="font-mono text-blue-600">({editingTask.id})</span>
            </h3>
          </div>
          <button onClick={() => setIsEditTaskModalOpen(false)} className="text-slate-400 hover:text-slate-700">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Task Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-xs font-semibold outline-none focus:border-blue-600"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded p-2.5 text-xs outline-none focus:border-blue-600 font-sans"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs font-semibold outline-none"
              >
                <option value="Backlog">Backlog</option>
                <option value="In Progress">In Progress</option>
                <option value="In Review">In Review</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

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

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Target Sprint</label>
              <select
                value={sprintId}
                onChange={(e) => setSprintId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs font-semibold outline-none"
              >
                <option value="">-- No Sprint (Backlog) --</option>
                {projectSprints.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
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

          <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
            <button
              type="button"
              onClick={handleDelete}
              className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 font-semibold rounded text-xs flex items-center space-x-1 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Task</span>
            </button>

            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => setIsEditTaskModalOpen(false)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded text-xs shadow-2xs"
              >
                Save Changes
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
