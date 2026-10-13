import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, FolderPlus, Palette } from 'lucide-react';

export const CreateProjectModal = () => {
  const {
    isCreateProjectModalOpen,
    setIsCreateProjectModalOpen,
    createProject,
    users = [],
    currentUser,
    getUserRoleName
  } = useApp();

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#2563eb');
  const [selectedUserIds, setSelectedUserIds] = useState(() => currentUser?.id ? [currentUser.id] : []);
  const [memberSearch, setMemberSearch] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  if (!isCreateProjectModalOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);
    try {
      const generatedCode = code.trim()
        ? code.trim().toUpperCase()
        : name.trim().substring(0, 4).toUpperCase();

      const assignedUsers = users.filter(u => selectedUserIds.includes(u.id));
      const memberEmails = assignedUsers.map(u => u.email).filter(Boolean).join(',');
      const memberIds = selectedUserIds.join(',');

      await createProject({
        name: name.trim(),
        code: generatedCode,
        description: description.trim(),
        color,
        memberIds,
        memberEmails
      });

      setIsCreateProjectModalOpen(false);
      setName('');
      setCode('');
      setDescription('');
      setSelectedUserIds(currentUser?.id ? [currentUser.id] : []);
    } catch (err) {
      console.error('Failed to create project:', err);
      setError(err.message || 'Failed to save project to company database.');
    } finally {
      setIsSubmitting(false);
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
            <FolderPlus className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900">Create New Project Workspace</h3>
          </div>
          <button onClick={() => setIsCreateProjectModalOpen(false)} className="text-slate-400 hover:text-slate-700">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs font-semibold">
              {error}
            </div>
          )}
          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Project Name *</label>
            <input
              type="text"
              required
              placeholder="Enter project name..."
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
                placeholder="e.g. CORE, MOBL"
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
              placeholder="Key deliverables, timeline, and architectural targets..."
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

          <div className="pt-3 border-t border-slate-200 flex justify-end space-x-2">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => setIsCreateProjectModalOpen(false)}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs transition-colors disabled:opacity-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-lg text-xs shadow-2xs transition-colors flex items-center space-x-1.5 cursor-pointer"
            >
              <FolderPlus className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Creating Project...' : 'Create Project'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
