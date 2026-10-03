import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  Bug,
  Upload,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Image as ImageIcon
} from 'lucide-react';

export const BugReportModal = () => {
  const {
    currentUser,
    isReportBugModalOpen,
    setIsReportBugModalOpen,
    createIssue,
    tasks,
    users,
    currentProject,
    getProjectMembers
  } = useApp();

  const teamMembers = getProjectMembers(currentProject);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [stepsToReproduce, setStepsToReproduce] = useState('');
  const [expectedResult, setExpectedResult] = useState('');
  const [actualResult, setActualResult] = useState('');
  const [severity, setSeverity] = useState('High');
  const [priority, setPriority] = useState('High');
  const [module, setModule] = useState('Auth API');
  const [linkedTaskId, setLinkedTaskId] = useState(tasks[0]?.id || '');
  const [assigneeId, setAssigneeId] = useState(teamMembers[0]?.id || '');
  const [environment, setEnvironment] = useState('Staging / Chrome 124');
  const [screenshots, setScreenshots] = useState([]);
  const [successMessage, setSuccessMessage] = useState(null);

  if (!isReportBugModalOpen) return null;

  const handleSimulateScreenshot = () => {
    const newScreenshot = {
      id: `SC-${Date.now()}`,
      title: `bug_evidence_${screenshots.length + 1}.png`,
      url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=600&q=80'
    };
    setScreenshots([...screenshots, newScreenshot]);
  };

  const handleRemoveScreenshot = (id) => {
    setScreenshots(screenshots.filter(s => s.id !== id));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    const effectiveLinkedTaskId = linkedTaskId || tasks[0]?.id || '';
    const effectiveAssigneeId = assigneeId || teamMembers[0]?.id || '';

    const newBug = await createIssue({
      title,
      description,
      stepsToReproduce,
      expectedResult,
      actualResult,
      severity,
      priority,
      module,
      projectId: currentProject?.id,
      projectName: currentProject?.name,
      linkedTaskId: effectiveLinkedTaskId,
      assigneeId: effectiveAssigneeId,
      environment,
      screenshots
    });

    setSuccessMessage(`Bug ${newBug?.id || 'Defect'} successfully created and linked to task ${effectiveLinkedTaskId || 'workspace'}!`);
    setTimeout(() => {
      setSuccessMessage(null);
      setIsReportBugModalOpen(false);
      // Reset
      setTitle('');
      setDescription('');
      setStepsToReproduce('');
      setExpectedResult('');
      setActualResult('');
      setScreenshots([]);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="w-full max-w-2xl bg-white rounded-lg shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-red-50 border-b border-red-100 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-red-600 text-white rounded">
              <Bug className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-red-950">Report Project Bug / Defect</h2>
          </div>
          <button
            onClick={() => setIsReportBugModalOpen(false)}
            className="text-slate-400 hover:text-slate-700 p-1 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Content */}
        {successMessage ? (
          <div className="p-8 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto animate-bounce" />
            <div className="text-base font-bold text-slate-900">{successMessage}</div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto text-xs">
            {/* Title */}
            <div>
              <label className="block font-bold text-slate-800 uppercase tracking-wider mb-1">
                Bug Title <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Login fails after password reset token is issued"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-xs text-slate-900 font-semibold outline-none focus:border-blue-500"
              />
            </div>

            {/* Grid 2 Cols: Severity & Priority */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-800 uppercase tracking-wider mb-1">Severity</label>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs font-semibold outline-none"
                >
                  <option value="Critical">Critical</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-800 uppercase tracking-wider mb-1">Priority</label>
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

            {/* Linked Task & Assignee */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-800 uppercase tracking-wider mb-1">Linked Task</label>
                <select
                  value={linkedTaskId}
                  onChange={(e) => setLinkedTaskId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs font-semibold outline-none"
                >
                  {tasks.map(t => (
                    <option key={t.id} value={t.id}>{t.id} — {t.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-800 uppercase tracking-wider mb-1">Developer / Assignee</label>
                <select
                  value={assigneeId}
                  onChange={(e) => setAssigneeId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs font-semibold outline-none"
                >
                  {teamMembers.length === 0 ? (
                    <option value="">No linked team members available</option>
                  ) : (
                    teamMembers.map(u => (
                      <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                    ))
                  )}
                </select>
              </div>
            </div>

            {/* Steps to Reproduce */}
            <div>
              <label className="block font-bold text-slate-800 uppercase tracking-wider mb-1">Steps to Reproduce</label>
              <textarea
                rows={3}
                placeholder="1. Navigate to auth page&#10;2. Input credentials&#10;3. Click submit"
                value={stepsToReproduce}
                onChange={(e) => setStepsToReproduce(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded p-2.5 text-xs outline-none focus:border-blue-500 font-sans"
              />
            </div>

            {/* Screenshot Upload Dropzone Simulation */}
            <div>
              <label className="block font-bold text-slate-800 uppercase tracking-wider mb-1">
                Screenshot / Evidence Upload
              </label>
              <div 
                onClick={handleSimulateScreenshot}
                className="border-2 border-dashed border-slate-200 rounded-lg p-4 text-center hover:bg-slate-50 cursor-pointer transition-colors"
              >
                <Upload className="w-5 h-5 text-slate-400 mx-auto mb-1" />
                <span className="text-xs text-blue-600 font-semibold">Click to attach screenshot evidence</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Supports PNG, JPG up to 10MB</span>
              </div>

              {/* Uploaded Files Preview List */}
              {screenshots.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {screenshots.map(s => (
                    <div key={s.id} className="flex items-center space-x-1.5 bg-slate-100 px-2 py-1 rounded border border-slate-200 text-[11px]">
                      <ImageIcon className="w-3.5 h-3.5 text-slate-500" />
                      <span className="font-mono text-slate-700">{s.title}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveScreenshot(s.id)}
                        className="text-red-500 hover:text-red-700 ml-1"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Bar */}
            <div className="pt-3 border-t border-slate-200 flex items-center justify-end space-x-2">
              <button
                type="button"
                onClick={() => setIsReportBugModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded text-xs transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded text-xs shadow-2xs transition-colors"
              >
                Submit Bug Report
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
