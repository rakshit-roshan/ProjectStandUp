import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  Bug,
  AlertTriangle,
  CheckCircle2,
  Image as ImageIcon,
  MessageSquare,
  User,
  Calendar,
  Send,
  ExternalLink
} from 'lucide-react';

export const IssueDetailsDrawer = () => {
  const {
    isIssueDrawerOpen,
    setIsIssueDrawerOpen,
    selectedIssue,
    updateIssueState,
    navigateTo,
    currentUser
  } = useApp();

  const [commentText, setCommentText] = useState('');

  if (!isIssueDrawerOpen || !selectedIssue) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs flex justify-end">
      <div 
        className="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-red-50/50">
          <div className="flex items-center space-x-2.5">
            <span className="font-mono text-sm font-bold text-red-700 px-2.5 py-0.5 bg-red-100 rounded border border-red-200">
              {selectedIssue.id}
            </span>
            <span className="text-xs font-semibold text-slate-700">{selectedIssue.module}</span>
          </div>

          <button
            onClick={() => setIsIssueDrawerOpen(false)}
            className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Title & Priority */}
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                selectedIssue.priority === 'Critical' ? 'bg-red-600 text-white' : 'bg-amber-100 text-amber-800'
              }`}>
                {selectedIssue.priority} Priority
              </span>
              <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-mono rounded">
                Severity: {selectedIssue.severity}
              </span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 leading-snug">{selectedIssue.title}</h2>
          </div>

          {/* Issue State Selector Toolbar */}
          <div className="flex items-center justify-between bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
            <span className="font-bold text-slate-700">Lifecycle State:</span>
            <div className="flex items-center space-x-2">
              {['Pending', 'In Progress', 'Done'].map(state => (
                <button
                  key={state}
                  onClick={() => updateIssueState(selectedIssue.id, state)}
                  className={`px-3 py-1 rounded font-semibold transition-all ${
                    selectedIssue.state === state
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {state}
                </button>
              ))}
            </div>
          </div>

          {/* Description & Reproduction Steps */}
          <div className="space-y-3 bg-slate-50 p-4 rounded-lg border border-slate-200 text-xs text-slate-800">
            <div>
              <span className="font-bold text-slate-500 uppercase tracking-wider block mb-1">Description</span>
              <p className="leading-relaxed">{selectedIssue.description}</p>
            </div>

            {selectedIssue.stepsToReproduce && (
              <div>
                <span className="font-bold text-slate-500 uppercase tracking-wider block mb-1">Steps to Reproduce</span>
                <pre className="whitespace-pre-wrap font-sans text-slate-700 bg-white p-2.5 rounded border border-slate-200">
                  {selectedIssue.stepsToReproduce}
                </pre>
              </div>
            )}
          </div>

          {/* Screenshots & Attachments */}
          {selectedIssue.screenshots && selectedIssue.screenshots.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-1.5">
                <ImageIcon className="w-4 h-4 text-indigo-600" />
                <span>Screenshot Evidence ({selectedIssue.screenshots.length})</span>
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {selectedIssue.screenshots.map(sc => (
                  <div key={sc.id} className="border border-slate-200 rounded-md overflow-hidden bg-slate-50">
                    <img src={sc.url} alt={sc.title} className="w-full h-32 object-cover" />
                    <div className="p-2 text-[10px] font-mono text-slate-600 truncate">{sc.title}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Meta Information */}
          <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-lg border border-slate-200">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Assignee</span>
              <span className="font-semibold text-slate-800">{selectedIssue.assigneeName}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Reporter</span>
              <span className="font-semibold text-slate-800">{selectedIssue.reporterName}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Linked Task</span>
              <span
                onClick={() => {
                  setIsIssueDrawerOpen(false);
                  navigateTo('task_details', selectedIssue.linkedTaskId);
                }}
                className="font-mono font-bold text-blue-600 hover:underline cursor-pointer flex items-center space-x-1"
              >
                <span>{selectedIssue.linkedTaskId}</span>
                <ExternalLink className="w-3 h-3" />
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Due Date</span>
              <span className="font-mono text-red-600 font-bold">{selectedIssue.dueDate}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
