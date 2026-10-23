import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UnassignedMemberBanner } from '../auth/UnassignedMemberBanner';
import {
  CheckSquare,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Bug,
  Plus,
  Play,
  FileText,
  Upload,
  UserCheck,
  ChevronRight,
  Filter
} from 'lucide-react';

export const TesterDashboard = () => {
  const {
    currentUser,
    currentRole,
    isUserAdmin,
    tasks,
    issues,
    updateTaskStatus,
    updateTask,
    updateIssueState,
    setIsReportBugModalOpen,
    navigateTo,
    setIsTaskDrawerOpen,
    setSelectedTaskId,
    currentProject,
    projects = [],
    canUserManageProjects,
    openSendToTestingModal
  } = useApp();

  const canManageProjects = canUserManageProjects ? canUserManageProjects(currentUser) : false;
  const isSubUserUnassigned = !canManageProjects && (!projects || projects.length === 0);

  const [testingFilter, setTestingFilter] = useState('ALL'); // ALL | Pending Testing | In Testing | Passed | Failed

  const isAdminOrManager = (isUserAdmin && isUserAdmin()) || 
    currentRole === 'ADMIN' || 
    currentRole === 'MANAGER' || 
    currentUser?.role === 'ADMIN' || 
    currentUser?.role === 1 || 
    currentUser?.role === 2;

  // Filter tasks strictly by currentProject
  const projectTasks = !currentProject ? [] : tasks.filter(t => t.projectId === currentProject?.id || String(t.projectId) === String(currentProject?.id));
  const projectIssues = !currentProject ? [] : issues.filter(i => i.projectId === currentProject?.id || String(i.projectId) === String(currentProject?.id));

  // Testing tasks queue: only tasks that are in review or have testing workflow status
  const candidateTestingTasks = projectTasks.filter(t => 
    t.status === 'In Review' || 
    t.testingStatus === 'In Testing' || 
    t.testingStatus === 'Pending Testing' || 
    t.testingStatus === 'Failed' ||
    (t.status === 'Completed' && t.testingStatus === 'Passed')
  );

  // If Admin/Manager: see all tasks in testing process across the workspace.
  // If Tester: see only tasks assigned to this specific tester (or unassigned tasks available for testing)
  const testingTasks = candidateTestingTasks.filter(t => {
    if (isAdminOrManager) return true;
    const myId = currentUser?.id ? String(currentUser.id) : '';
    const myEmail = currentUser?.email ? currentUser.email.toLowerCase() : '';
    const myName = currentUser?.name ? currentUser.name.toLowerCase() : '';

    const assignedTesterIds = Array.isArray(t.testerIds)
      ? t.testerIds.map(String)
      : (t.testerId ? String(t.testerId).split(',').map(s => s.trim()) : []);

    const isAssignedToMe = (myId && assignedTesterIds.includes(myId)) ||
      (myEmail && t.testerEmail && t.testerEmail.toLowerCase().includes(myEmail)) ||
      (myName && t.testerName && t.testerName.toLowerCase().includes(myName));

    return isAssignedToMe || (!t.testerId && !t.testerEmail && !t.testerName);
  });
  
  const pendingTesting = testingTasks.filter(t => t.testingStatus === 'Pending Testing' || (t.status === 'In Review' && t.testingStatus !== 'Passed'));
  const inTesting = testingTasks.filter(t => t.testingStatus === 'In Testing');
  const passedTesting = testingTasks.filter(t => t.testingStatus === 'Passed');
  const failedTesting = testingTasks.filter(t => t.testingStatus === 'Failed');
  const bugsReportedCount = projectIssues.length;

  const filteredTasks = testingFilter === 'ALL'
    ? testingTasks
    : testingTasks.filter(t => t.testingStatus === testingFilter);

  const handleStatusChange = (taskId, newTestingStatus) => {
    updateTask(taskId, {
      testingStatus: newTestingStatus,
      hasIssue: newTestingStatus === 'Failed',
      status: newTestingStatus === 'Passed' ? 'Completed' : (newTestingStatus === 'Failed' ? 'In Progress' : 'In Review')
    });
    if (newTestingStatus === 'Passed') {
      updateTaskStatus(taskId, 'Completed');
      // If linked issues exist, mark them Done
      const linked = issues.filter(i => String(i.linkedTaskId) === String(taskId));
      linked.forEach(i => {
        if (updateIssueState) updateIssueState(i.id, 'Done');
      });
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Unassigned Team Member Banner */}
      <UnassignedMemberBanner />

      <div className={isSubUserUnassigned ? "space-y-6 pointer-events-none opacity-40 select-none" : "space-y-6"}>
      {/* Top Header Bar */}
      <div className="bg-gradient-to-r from-fuchsia-900 via-purple-900 to-slate-900 text-white p-5 rounded-lg shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold tracking-tight">QA / Tester Workspace</h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-fuchsia-500/30 text-fuchsia-200 border border-fuchsia-400/30">
              {currentUser?.name}
            </span>
          </div>
          <p className="text-xs text-fuchsia-200 mt-1">
            Review completed development items, validate acceptance criteria, and raise issue reports.
          </p>
        </div>

        <button
          onClick={() => setIsReportBugModalOpen(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold text-xs rounded-md shadow-xs transition-colors self-start md:self-auto"
        >
          <Bug className="w-4 h-4" />
          <span>Report New Bug</span>
        </button>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs">
          <div className="text-xs font-medium text-slate-500">Testing Tasks</div>
          <div className="text-2xl font-bold text-slate-900 mt-1 tabular-nums">{testingTasks.length}</div>
        </div>
        <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs">
          <div className="text-xs font-medium text-slate-500">Pending Testing</div>
          <div className="text-2xl font-bold text-amber-600 mt-1 tabular-nums">{pendingTesting.length}</div>
        </div>
        <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs">
          <div className="text-xs font-medium text-slate-500">In Testing</div>
          <div className="text-2xl font-bold text-blue-600 mt-1 tabular-nums">{inTesting.length}</div>
        </div>
        <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs">
          <div className="text-xs font-medium text-slate-500">Passed QA</div>
          <div className="text-2xl font-bold text-emerald-600 mt-1 tabular-nums">{passedTesting.length}</div>
        </div>
        <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs">
          <div className="text-xs font-medium text-slate-500">Failed / Blocked</div>
          <div className="text-2xl font-bold text-red-600 mt-1 tabular-nums">{failedTesting.length}</div>
        </div>
        <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs">
          <div className="text-xs font-medium text-slate-500">Bugs Reported</div>
          <div className="text-2xl font-bold text-fuchsia-600 mt-1 tabular-nums">{bugsReportedCount}</div>
        </div>
      </div>

      {/* Main Testing Tasks Table Workspace */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden space-y-3">
        {/* Table Filter Bar */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <h2 className="text-sm font-bold text-slate-900">Testing Work Items Queue</h2>
            <span className="text-xs font-mono text-slate-500">({filteredTasks.length} items)</span>
          </div>

          <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-md border border-slate-200 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400 ml-1" />
            <button
              onClick={() => setTestingFilter('ALL')}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                testingFilter === 'ALL' ? 'bg-white text-slate-900 font-semibold shadow-2xs' : 'text-slate-600'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setTestingFilter('Pending Testing')}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                testingFilter === 'Pending Testing' ? 'bg-white text-amber-700 font-semibold shadow-2xs' : 'text-slate-600'
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setTestingFilter('In Testing')}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                testingFilter === 'In Testing' ? 'bg-white text-blue-700 font-semibold shadow-2xs' : 'text-slate-600'
              }`}
            >
              In Testing
            </button>
            <button
              onClick={() => setTestingFilter('Passed')}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                testingFilter === 'Passed' ? 'bg-white text-emerald-700 font-semibold shadow-2xs' : 'text-slate-600'
              }`}
            >
              Passed
            </button>
            <button
              onClick={() => setTestingFilter('Failed')}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                testingFilter === 'Failed' ? 'bg-white text-red-700 font-semibold shadow-2xs' : 'text-slate-600'
              }`}
            >
              Failed
            </button>
          </div>
        </div>

        {/* Detailed Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold border-b border-slate-200">
              <tr>
                <th className="p-3">Task ID</th>
                <th className="p-3">Task Title</th>
                <th className="p-3">Developer</th>
                <th className="p-3">Project & Sprint</th>
                <th className="p-3">Dev Status</th>
                <th className="p-3">Testing Status</th>
                <th className="p-3">Assigned Tester</th>
                <th className="p-3">Priority</th>
                <th className="p-3 text-right">QA Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTasks.map(task => (
                <tr
                  key={task.id}
                  onClick={() => {
                    setSelectedTaskId(task.id);
                    setIsTaskDrawerOpen(true);
                  }}
                  className="hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <td className="p-3 font-mono font-semibold text-blue-600">{task.id}</td>
                  <td className="p-3">
                    <div className="font-semibold text-slate-900 hover:text-blue-600">{task.title}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{task.description}</div>
                  </td>
                  <td className="p-3">
                    {(!task.assigneeId || !String(task.assigneeId).trim() || task.assigneeName === 'Unassigned') ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-500 border border-slate-200" title="Unassigned">
                        Unassigned
                      </span>
                    ) : (
                      <div className="flex items-center space-x-1.5">
                        {task.assigneeAvatar ? (
                          <img src={task.assigneeAvatar} alt={task.assigneeName} className="w-5 h-5 rounded-full object-cover ring-1 ring-slate-200" />
                        ) : (
                          <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold text-[10px] flex items-center justify-center shrink-0">
                            {task.assigneeName?.charAt(0).toUpperCase()}
                          </span>
                        )}
                        <span className="font-medium text-slate-700">{task.assigneeName}</span>
                      </div>
                    )}
                  </td>
                  <td className="p-3">
                    <div className="text-slate-700">{task.projectName}</div>
                    <div className="text-[10px] text-slate-400">{task.sprintName}</div>
                  </td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                      {task.status}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      task.testingStatus === 'Passed' ? 'bg-emerald-100 text-emerald-800' :
                      task.testingStatus === 'Failed' ? 'bg-red-100 text-red-800' :
                      task.testingStatus === 'In Testing' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {task.testingStatus}
                    </span>
                  </td>
                  <td className="p-3">
                    {task.testerName ? (
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
                        <UserCheck className="w-3 h-3 text-purple-600" />
                        <span>{task.testerName}</span>
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400 italic">Unassigned</span>
                    )}
                    {isAdminOrManager && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openSendToTestingModal(task);
                        }}
                        className="ml-2 text-[10px] text-purple-600 hover:text-purple-800 font-semibold underline cursor-pointer"
                      >
                        {task.testerId ? 'Change' : 'Assign'}
                      </button>
                    )}
                  </td>
                  <td className="p-3 font-semibold text-slate-700">{task.priority}</td>
                  <td className="p-3 text-right space-x-1.5" onClick={e => e.stopPropagation()}>
                    <button
                      onClick={() => handleStatusChange(task.id, 'Passed')}
                      className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold rounded text-[10px] transition-colors cursor-pointer"
                    >
                      Pass QA
                    </button>
                    <button
                      onClick={() => {
                        setSelectedTaskId(task.id);
                        setIsReportBugModalOpen(true);
                      }}
                      className="px-2 py-1 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-semibold rounded text-[10px] transition-colors cursor-pointer"
                    >
                      Fail & Report
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      </div>
    </div>
  );
};
