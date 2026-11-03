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
  Filter,
  ListFilter,
  ClipboardList
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
    syncRequirementWithTask,
    updateIssueState,
    setIsReportBugModalOpen,
    navigateTo,
    setIsTaskDrawerOpen,
    setSelectedTaskId,
    setSelectedIssueId,
    currentProject,
    projects = [],
    canUserManageProjects,
    openSendToTestingModal
  } = useApp();

  const canManageProjects = canUserManageProjects ? canUserManageProjects(currentUser) : false;
  const isSubUserUnassigned = !canManageProjects && (!projects || projects.length === 0);

  const [testingFilter, setTestingFilter] = useState('ALL'); // ALL | Pending Testing | In Testing | Passed | Failed
  const [activeTab, setActiveTab] = useState('queue'); // 'queue' | 'mybugs'
  const [bugStateFilter, setBugStateFilter] = useState('ALL'); // ALL | Open | In Progress | Done

  const isAdminOrManager = (isUserAdmin && isUserAdmin()) || 
    currentRole === 'ADMIN' || 
    currentRole === 'MANAGER' || 
    currentUser?.role === 'ADMIN' || 
    currentUser?.role === 1 || 
    currentUser?.role === 2;

  // Filter tasks strictly by currentProject
  const projectTasks = !currentProject ? [] : tasks.filter(t => t.projectId === currentProject?.id || String(t.projectId) === String(currentProject?.id));
  const projectIssues = !currentProject ? [] : issues.filter(i => i.projectId === currentProject?.id || String(i.projectId) === String(currentProject?.id));

    // Testing tasks queue: ONLY tasks that have explicitly been sent to QA Testing (have an active testing status and an assigned tester)
  const candidateTestingTasks = projectTasks.filter(t => {
    const hasTestingStatus = t.testingStatus === 'Pending Testing' || 
      t.testingStatus === 'In Testing' || 
      t.testingStatus === 'Passed' || 
      t.testingStatus === 'Failed';

    const hasAssignedTester = Boolean(
      (Array.isArray(t.testerIds) && t.testerIds.length > 0) ||
      (t.testerId && String(t.testerId).trim()) ||
      (t.testerEmail && String(t.testerEmail).trim()) ||
      (t.testerName && String(t.testerName).trim() && !t.testerName.toLowerCase().includes('unassigned'))
    );

    return hasTestingStatus && hasAssignedTester;
  });

  // If Admin/Manager: see all tasks currently in QA testing for this project.
  // If Tester: see ONLY tasks assigned to this specific tester selected at time of sending!
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

    return isAssignedToMe;
  });
  
  const pendingTesting = testingTasks.filter(t => t.testingStatus === 'Pending Testing' || (t.status === 'In Review' && t.testingStatus !== 'Passed'));
  const inTesting = testingTasks.filter(t => t.testingStatus === 'In Testing');
  const passedTesting = testingTasks.filter(t => t.testingStatus === 'Passed');
  const failedTesting = testingTasks.filter(t => t.testingStatus === 'Failed');
  const bugsReportedCount = projectIssues.length;

  // My bugs: issues reported by the current logged-in user
  const myBugs = projectIssues.filter(issue => {
    const myId = currentUser?.id ? String(currentUser.id) : '';
    const myName = currentUser?.name ? currentUser.name.toLowerCase() : '';
    return (
      (myId && String(issue.reporterId) === myId) ||
      (myName && issue.reporterName && issue.reporterName.toLowerCase() === myName)
    );
  });

  const filteredMyBugs = bugStateFilter === 'ALL'
    ? myBugs
    : myBugs.filter(b => b.state && b.state.toLowerCase() === bugStateFilter.toLowerCase());

  const filteredTasks = testingFilter === 'ALL'
    ? testingTasks
    : testingTasks.filter(t => t.testingStatus === testingFilter);

    const handleStatusChange = async (taskId, newTestingStatus) => {
    const newStatus = newTestingStatus === 'Passed' ? 'Completed' : (newTestingStatus === 'Failed' ? 'In Progress' : 'In Review');
    await updateTask(taskId, {
      testingStatus: newTestingStatus,
      hasIssue: newTestingStatus === 'Failed',
      status: newStatus
    });
    if (newTestingStatus === 'Passed') {
      await updateTaskStatus(taskId, 'Completed');
      // If linked issues exist, mark them Done
      const linked = issues.filter(i => String(i.linkedTaskId) === String(taskId));
      linked.forEach(i => {
        if (updateIssueState) updateIssueState(i.id, 'Done');
      });
    }
    if (typeof syncRequirementWithTask === 'function') {
      await syncRequirementWithTask(taskId, {
        testingStatus: newTestingStatus,
        hasIssue: newTestingStatus === 'Failed',
        status: newStatus
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
          <div className="text-xs font-medium text-slate-500">My Bug Reports</div>
          <div className="text-2xl font-bold text-fuchsia-600 mt-1 tabular-nums">{myBugs.length}</div>
        </div>
      </div>

      {/* Tab Bar */}
      <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1 shadow-2xs w-fit">
        <button
          onClick={() => setActiveTab('queue')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'queue'
              ? 'bg-fuchsia-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <ClipboardList className="w-3.5 h-3.5" />
          Testing Queue
          <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
            activeTab === 'queue' ? 'bg-white/20 text-white' : 'bg-fuchsia-100 text-fuchsia-700'
          }`}>
            {testingTasks.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('mybugs')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'mybugs'
              ? 'bg-red-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Bug className="w-3.5 h-3.5" />
          My Bug Reports
          {myBugs.length > 0 && (
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
              activeTab === 'mybugs' ? 'bg-white/20 text-white' : 'bg-red-100 text-red-700'
            }`}>
              {myBugs.length}
            </span>
          )}
        </button>
      </div>

      {/* TAB 1 — Testing Work Items Queue */}
      {activeTab === 'queue' && (
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
                <th className="p-3">Project &amp; Sprint</th>
                <th className="p-3">Dev Status</th>
                <th className="p-3">Testing Status</th>
                <th className="p-3">Assigned Tester</th>
                <th className="p-3">Priority</th>
                <th className="p-3 text-right">QA Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan="9" className="p-8 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <CheckCircle2 className="w-8 h-8 text-slate-300" />
                      <div className="font-semibold text-slate-600">No QA Tasks in Testing Queue</div>
                      <p className="text-[11px] text-slate-400 max-w-sm">
                        Tasks appear here when developers complete work and click "Send to QA Testing" assigning them to you.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredTasks.map(task => (
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
                      Fail &amp; Report
                    </button>
                  </td>
                </tr>
              ))
            )}</tbody>
          </table>
        </div>
      </div>
      )}

      {/* TAB 2 — My Bug Reports */}
      {activeTab === 'mybugs' && (
      <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
        {/* Header Bar */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <Bug className="w-4 h-4 text-red-500" />
            <h2 className="text-sm font-bold text-slate-900">My Bug Reports</h2>
            <span className="text-xs font-mono text-slate-500">({filteredMyBugs.length} bugs)</span>
          </div>

          {/* State filter */}
          <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-md border border-slate-200 text-xs">
            <ListFilter className="w-3.5 h-3.5 text-slate-400 ml-1" />
            {['ALL', 'Open', 'In Progress', 'Done'].map(s => (
              <button
                key={s}
                onClick={() => setBugStateFilter(s)}
                className={`px-2.5 py-1 rounded font-medium transition-colors ${
                  bugStateFilter === s
                    ? `bg-white font-semibold shadow-2xs ${
                        s === 'Done' ? 'text-emerald-700' :
                        s === 'In Progress' ? 'text-blue-700' :
                        s === 'Open' ? 'text-red-700' : 'text-slate-900'
                      }`
                    : 'text-slate-600'
                }`}
              >
                {s === 'ALL' ? 'All' : s}
              </button>
            ))}
          </div>
        </div>

        {/* Bugs Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold border-b border-slate-200">
              <tr>
                <th className="p-3">Bug ID</th>
                <th className="p-3">Title</th>
                <th className="p-3">Severity</th>
                <th className="p-3">Priority</th>
                <th className="p-3">State</th>
                <th className="p-3">Module</th>
                <th className="p-3">Linked Task</th>
                <th className="p-3">Assigned To</th>
                <th className="p-3">Due Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMyBugs.length === 0 ? (
                <tr>
                  <td colSpan="9" className="p-10 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <Bug className="w-8 h-8 text-slate-300" />
                      <div className="font-semibold text-slate-600">
                        {bugStateFilter === 'ALL' ? "You haven't raised any bug reports yet" : `No bugs with state "${bugStateFilter}"`}
                      </div>
                      <p className="text-[11px] text-slate-400 max-w-sm">
                        Use the "Fail &amp; Report" button on a testing task or "Report New Bug" to raise a defect.
                      </p>
                      <button
                        onClick={() => setIsReportBugModalOpen(true)}
                        className="mt-2 flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-[11px] font-semibold rounded-md transition-colors cursor-pointer"
                      >
                        <Bug className="w-3.5 h-3.5" />
                        Report New Bug
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredMyBugs.map(bug => (
                  <tr
                    key={bug.id}
                    className="hover:bg-slate-50 cursor-pointer transition-colors"
                    onClick={() => {
                      if (typeof setSelectedIssueId === 'function') setSelectedIssueId(bug.id);
                      if (typeof navigateTo === 'function') navigateTo('issue_registry');
                    }}
                  >
                    <td className="p-3 font-mono font-bold text-red-600">{bug.id}</td>
                    <td className="p-3">
                      <div className="font-semibold text-slate-900 max-w-[240px] truncate">{bug.title}</div>
                      {bug.description && (
                        <div className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{bug.description}</div>
                      )}
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        bug.severity === 'Critical' ? 'bg-red-600 text-white' :
                        bug.severity === 'High' ? 'bg-red-100 text-red-800' :
                        bug.severity === 'Medium' ? 'bg-amber-100 text-amber-800' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {bug.severity || '-'}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        bug.priority === 'Critical' ? 'bg-red-600 text-white' :
                        bug.priority === 'High' ? 'bg-amber-100 text-amber-800' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {bug.priority || '-'}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        bug.state === 'Done' ? 'bg-emerald-100 text-emerald-800' :
                        bug.state === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {bug.state || 'Open'}
                      </span>
                    </td>
                    <td className="p-3 text-slate-600">{bug.module || '-'}</td>
                    <td className="p-3 font-mono text-slate-500">{bug.linkedTaskId || '-'}</td>
                    <td className="p-3">
                      {bug.assigneeName ? (
                        <div className="flex items-center space-x-1.5">
                          {bug.assigneeAvatar ? (
                            <img src={bug.assigneeAvatar} alt={bug.assigneeName} className="w-5 h-5 rounded-full object-cover ring-1 ring-slate-200" />
                          ) : (
                            <span className="w-5 h-5 rounded-full bg-fuchsia-100 text-fuchsia-700 font-bold text-[10px] flex items-center justify-center shrink-0">
                              {bug.assigneeName.charAt(0).toUpperCase()}
                            </span>
                          )}
                          <span className="font-medium text-slate-700">{bug.assigneeName}</span>
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-400 italic">Unassigned</span>
                      )}
                    </td>
                    <td className={`p-3 font-mono text-[11px] font-semibold ${bug.dueDate ? 'text-red-600' : 'text-slate-400'}`}>
                      {bug.dueDate || '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      )}
      </div>
    </div>
  );
};
