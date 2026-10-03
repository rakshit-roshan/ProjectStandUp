import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, FolderPlus, Palette } from 'lucide-react';

export const CreateProjectModal = () => {
  const {
    isCreateProjectModalOpen,
    setIsCreateProjectModalOpen,
    createProject
  } = useApp();

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#2563eb');

  if (!isCreateProjectModalOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    const generatedCode = code.trim()
      ? code.trim().toUpperCase()
      : name.trim().substring(0, 4).toUpperCase();

    await createProject({
      name: name.trim(),
      code: generatedCode,
      description: description.trim(),
      color
    });

    setIsCreateProjectModalOpen(false);
    setName('');
    setCode('');
    setDescription('');
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
              rows={3}
              placeholder="Key deliverables, timeline, and architectural targets..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs outline-none focus:border-blue-600 focus:bg-white transition-all font-sans"
            />
          </div>

          <div className="pt-3 border-t border-slate-200 flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setIsCreateProjectModalOpen(false)}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-xs shadow-2xs transition-colors flex items-center space-x-1.5"
            >
              <FolderPlus className="w-3.5 h-3.5" />
              <span>Create Project</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
