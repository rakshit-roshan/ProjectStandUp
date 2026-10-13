import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Edit3, Trash2 } from 'lucide-react';

export const EditProjectModal = () => {
  const {
    isEditProjectModalOpen,
    setIsEditProjectModalOpen,
    editingProject,
    updateProject,
    deleteProject,
    users = [],
    currentUser,
    getUserRoleName
  } = useApp();

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#2563eb');
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editingProject) {
      setName(editingProject.name || '');
      setCode(editingProject.code || '');
      setDescription(editingProject.description || '');
      setColor(editingProject.color || '#2563eb');

      let mIds = [];
      if (Array.isArray(editingProject.memberIds)) {
        mIds = editingProject.memberIds.map(String);
      } else if (typeof editingProject.memberIds === 'string') {
        mIds = editingProject.memberIds.split(',').map(s => s.trim()).filter(Boolean);
      }
      if (editingProject.leadId && !mIds.includes(String(editingProject.leadId))) {
        mIds.push(String(editingProject.leadId));
      }
      setSelectedUserIds(mIds);
    }
  }, [editingProject]);

  if (!isEditProjectModalOpen || !editingProject) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const assignedUsers = users.filter(u => selectedUserIds.includes(u.id));
      const memberEmails = assignedUsers.map(u => u.email).filter(Boolean).join(',');
      const memberIds = selectedUserIds.join(',');

      await updateProject(editingProject.id, {
        name: name.trim(),
        code: code.trim().toUpperCase() || editingProject.code,
        description: description.trim(),
        color,
        memberIds,
        memberEmails
      });

      setIsEditProjectModalOpen(false);
    } catch (err) {
      console.error('Failed to update project:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete project "${editingProject.name}"? All related data will be unlinked.`)) {
      await deleteProject(editingProject.id);
      setIsEditProjectModalOpen(false);
    }
  };

  const colorOptions = ['#2563eb', '#16a34a', '#9333ea', '#ea580c', '#dc2626', '#0891b2', '#4f46e5'];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="w-full max-w-lg bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={e => e.stopPropagation()}
      >
        <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Edit3 className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900">Edit Project Workspace</h3>
          </div>
          <button onClick={() => setIsEditProjectModalOpen(false)} className="text-slate-400 hover:text-slate-700">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Project Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold outline-none focus:border-blue-600 focus:bg-white transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Project Key Code</label>
              <input
                type="text"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono font-bold uppercase outline-none focus:border-blue-600 focus:bg-white transition-all"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Brand Theme Color</label>
              <div className="flex items-center space-x-2 py-1">
                {colorOptions.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    style={{ backgroundColor: c }}
                    className={`w-6 h-6 rounded-full transition-transform ${
                      color === c ? 'ring-2 ring-offset-2 ring-blue-600 scale-110' : 'hover:scale-105'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Project Overview / Goals</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs outline-none focus:border-blue-600 focus:bg-white transition-all font-sans"
            />
          </div>

          {/* Assign Project Members */}
          <div className="space-y-2 pt-1 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <label className="block font-bold text-slate-700 uppercase tracking-wider">
                Assign Members to Project ({selectedUserIds.length} selected)
              </label>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setSelectedUserIds(users.map(u => u.id))}
                  className="text-[11px] text-blue-600 hover:underline font-semibold cursor-pointer"
                >
                  Select All
                </button>
                <span className="text-slate-300">|</span>
                <button
                  type="button"
                  onClick={() => setSelectedUserIds(currentUser?.id ? [currentUser.id] : [])}
                  className="text-[11px] text-slate-500 hover:underline font-semibold cursor-pointer"
                >
                  Clear
                </button>
              </div>
            </div>

            <div className="max-h-40 overflow-y-auto border border-slate-200 rounded-lg p-1.5 space-y-1 bg-slate-50/60 divide-y divide-slate-100">
              {users.length === 0 ? (
                <div className="text-center py-3 text-slate-400 text-xs">No users registered yet</div>
              ) : (
                users.map(u => {
                  const isChecked = selectedUserIds.includes(u.id);
                  return (
                    <label
                      key={u.id}
                      className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors pt-2 ${
                        isChecked ? 'bg-blue-50/70 text-blue-950 font-semibold' : 'hover:bg-white text-slate-700'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedUserIds(prev => [...prev, u.id]);
                            } else {
                              setSelectedUserIds(prev => prev.filter(id => id !== u.id));
                            }
                          }}
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                        <img
                          src={u.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name || 'User')}&background=2563eb&color=fff`}
                          alt={u.name}
                          className="w-5 h-5 rounded-full object-cover shrink-0"
                        />
                        <div className="text-xs">
                          <span className="font-bold">{u.fullname || u.name}</span>
                          <span className="text-[11px] text-slate-400 ml-1.5">({u.email})</span>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] bg-slate-100 text-slate-600 font-medium">
                        {getUserRoleName ? getUserRoleName(u) : (u.role || 'Member')}
                      </span>
                    </label>
                  );
                })
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
            <button
              type="button"
              onClick={handleDelete}
              className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 font-semibold rounded-lg text-xs flex items-center space-x-1 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Project</span>
            </button>

            <div className="flex space-x-2">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => setIsEditProjectModalOpen(false)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs transition-colors disabled:opacity-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-lg text-xs shadow-2xs transition-colors cursor-pointer"
              >
                {isSubmitting ? 'Saving Changes...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
