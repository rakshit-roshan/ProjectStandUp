import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import leftMenuBg from '../../assets/leftmenuback.png';
import {
  Home,
  Kanban,
  Table,
  Layers,
  AlertCircle,
  Activity,
  HeartPulse,
  Zap,
  Users,
  BarChart3,
  Award,
  CheckSquare,
  Bug,
  TestTube2,
  Bell,
  Settings,
  HelpCircle,
  ChevronDown,
  ChevronRight,
  MessageSquare,
  UserCheck,
  Shield,
  FileText,
  Sparkles,
  Lock,
  AlertTriangle,
  X
} from 'lucide-react';

export const Sidebar = () => {
  const {
    currentUser,
    currentView,
    navigateTo,
    currentRole,
    sidebarCollapsed,
    issues,
    notifications,
    userNotifications: contextUserNotifs,
    hasPermission,
    getUserRoleName,
    setIsOnboardingOpen,
    isUserAdmin,
    canUserManageProjects,
    projects = [],
    setIsCreateProjectModalOpen
  } = useApp();

  const [activeAccordion, setActiveAccordion] = useState(null); // 'tasks' | 'management' | 'testing' | 'admin' | null
  const [disabledPrompt, setDisabledPrompt] = useState(null);

  const hasProjects = Boolean(projects && projects.length > 0);
  const canManageProjects = canUserManageProjects ? canUserManageProjects(currentUser) : false;

  const toggleAccordion = (key) => {
    setActiveAccordion(prev => (prev === key ? null : key));
  };

  const isTasksSubmenuOpen = activeAccordion === 'tasks';
  const isManagementSubmenuOpen = activeAccordion === 'management';
  const isTestingSubmenuOpen = activeAccordion === 'testing';
  const isAdminSubmenuOpen = activeAccordion === 'admin';

  const userNotifications = contextUserNotifs || (notifications || []).filter(n => {
    if (!currentUser || !n) return false;
    const uid = String(currentUser.id || '');
    const email = (currentUser.email || '').toLowerCase().trim();
    const nUid = n.userId !== undefined && n.userId !== null ? String(n.userId).trim() : '';
    const nEmail = n.userEmail ? String(n.userEmail).toLowerCase().trim() : '';
    return (uid && nUid && (nUid === uid || nUid.split(',').map(s => s.trim()).includes(uid))) ||
           (email && nEmail && (nEmail === email || nEmail.split(',').map(s => s.trim()).includes(email)));
  });
  const unreadCount = userNotifications.filter(n => !n.read).length;
  const openIssuesCount = issues.filter(i => i.state !== 'Done').length;

  const isActive = (viewName) => currentView === viewName;

  const handleDisabledClick = (moduleName) => {
    if (canManageProjects) {
      setDisabledPrompt(
        `Project Setup Required: Please create a project first before accessing ${moduleName}.`
      );
    } else {
      setDisabledPrompt(
        `Project Assignment Pending: Your administrator has not assigned you to any project workspace yet. Once an administrator or manager adds you to a team project, ${moduleName} will be unlocked.`
      );
    }
  };

  const handleNavClick = (targetView, moduleName, roleSpecific = false) => {
    if (!hasProjects) {
      handleDisabledClick(moduleName);
      return;
    }
    setActiveAccordion(null);
    if (roleSpecific) {
      if (currentRole === 'DEVELOPER') navigateTo('developer_workspace');
      else if (currentRole === 'TESTER') navigateTo('tester_workspace');
      else navigateTo('dashboard');
    } else {
      navigateTo(targetView);
    }
  };

  const handleAccordionClick = (key, moduleName) => {
    if (!hasProjects) {
      handleDisabledClick(moduleName);
      return;
    }
    if (!sidebarCollapsed) {
      toggleAccordion(key);
    } else {
      if (key === 'tasks') navigateTo('tasks_kanban');
      else if (key === 'management') navigateTo('sprints');
      else if (key === 'testing') navigateTo('tester_workspace');
      else if (key === 'admin') navigateTo('user_accounts');
    }
  };

  const disabledBtnClass = !hasProjects ? 'opacity-40 hover:bg-transparent cursor-not-allowed' : 'cursor-pointer';

  return (
    <aside
      id="sidebar-nav"
      style={{
        backgroundImage: `url(${leftMenuBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
      className={`h-full bg-slate-950 text-white border-r border-slate-800/60 flex flex-col justify-between transition-all duration-200 z-20 select-none shrink-0 ${
        sidebarCollapsed ? 'w-14' : 'w-60'
      }`}
    >
      {/* Upper Navigation Content */}
      <div className="flex-1 overflow-y-auto min-h-0 py-3 px-2 space-y-4 custom-scrollbar">
        {/* Enterprise Setup Card if 0 projects */}
        {!hasProjects && !sidebarCollapsed && (
          canManageProjects ? (
            <div className="mx-1 mb-2 p-3 rounded-xl bg-gradient-to-br from-amber-500/20 via-slate-900/60 to-blue-500/15 border border-amber-400/40 shadow-lg text-xs space-y-2 animate-in fade-in">
              <div className="flex items-center space-x-1.5 text-amber-300 font-bold text-[11px] tracking-wide uppercase">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping shrink-0" />
                <span>Workspace Setup</span>
              </div>
              <p className="text-[11px] text-slate-200 leading-snug">
                Create your initial project to configure sprint cycles and unlock the entire workspace.
              </p>
              <button
                onClick={() => {
                  navigateTo('project_health');
                  setIsCreateProjectModalOpen(true);
                }}
                className="w-full py-1.5 px-2.5 bg-amber-400 hover:bg-amber-300 active:bg-amber-500 text-slate-950 font-bold text-[11px] rounded-lg shadow transition-all flex items-center justify-center space-x-1 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>+ Create First Project</span>
              </button>
            </div>
          ) : (
            <div className="mx-1 mb-2 p-3 rounded-xl bg-slate-900/90 border border-slate-700/80 shadow-lg text-xs space-y-2 animate-in fade-in">
              <div className="flex items-center space-x-1.5 text-blue-400 font-bold text-[11px] tracking-wide uppercase">
                <Lock className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>Assignment Pending</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-snug">
                Your administrator has not assigned you to any project workspace yet.
              </p>
            </div>
          )
        )}

        {/* WORKSPACE SECTION */}
        <div>
          {!sidebarCollapsed && (
            <div className="px-2.5 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Workspace
            </div>
          )}
          <nav className="space-y-1 mt-1">
            {/* Home */}
            {hasPermission('dashboard') && (
              <button
                id="nav-home"
                onClick={() => handleNavClick('dashboard', 'Home', true)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${disabledBtnClass} ${
                  hasProjects && (isActive('dashboard') || (currentRole === 'DEVELOPER' && isActive('developer_workspace')))
                    ? 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-900/40'
                    : 'text-slate-300 hover:bg-white/10 hover:text-white'
                }`}
                title={!hasProjects ? "Action Required: Create a project first to access Home" : "Home"}
              >
                <div className="flex items-center space-x-3">
                  <Home className="w-4 h-4 shrink-0" />
                  {!sidebarCollapsed && <span>Home</span>}
                </div>
                {!sidebarCollapsed && !hasProjects && (
                  <Lock className="w-3 h-3 text-slate-500 shrink-0" />
                )}
              </button>
            )}

            {/* Projects */}
            {hasPermission('projects') && (
              canManageProjects ? (
                <button
                  id="nav-projects"
                  onClick={() => {
                    setActiveAccordion(null);
                    navigateTo('project_health');
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    isActive('project_health')
                      ? 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-900/40'
                      : !hasProjects
                      ? 'bg-amber-500/25 text-amber-200 border border-amber-400/60 hover:bg-amber-500/35 shadow-sm'
                      : 'text-slate-300 hover:bg-white/10 hover:text-white'
                  }`}
                  title="Projects"
                >
                  <div className="flex items-center space-x-3">
                    <Layers className={`w-4 h-4 shrink-0 ${!hasProjects ? 'text-amber-400 animate-pulse' : ''}`} />
                    {!sidebarCollapsed && <span className={!hasProjects ? 'font-bold text-amber-200' : ''}>Projects</span>}
                  </div>
                  {!sidebarCollapsed && !hasProjects && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase bg-amber-400 text-slate-950 tracking-wider animate-pulse">
                      Required
                    </span>
                  )}
                </button>
              ) : (
                <button
                  id="nav-projects"
                  onClick={() => handleNavClick('project_health', 'Projects')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${disabledBtnClass} ${
                    hasProjects && isActive('project_health')
                      ? 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-900/40'
                      : 'text-slate-300 hover:bg-white/10 hover:text-white'
                  }`}
                  title={!hasProjects ? "Assignment Pending: Your administrator has not assigned you to any project yet" : "Projects"}
                >
                  <div className="flex items-center space-x-3">
                    <Layers className="w-4 h-4 shrink-0 text-slate-400" />
                    {!sidebarCollapsed && <span>Projects</span>}
                  </div>
                  {!sidebarCollapsed && !hasProjects && (
                    <Lock className="w-3 h-3 text-slate-500 shrink-0" />
                  )}
                </button>
              )
            )}

            {/* Team Members */}
            {hasPermission('team_members') && (
              <button
                id="nav-team-members"
                onClick={() => handleNavClick('team_members', 'Team Members')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${disabledBtnClass} ${
                  hasProjects && isActive('team_members')
                    ? 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-900/40'
                    : 'text-slate-300 hover:bg-white/10 hover:text-white'
                }`}
                title={!hasProjects ? "Action Required: Create a project first to access Team Members" : "Team Members"}
              >
                <div className="flex items-center space-x-3">
                  <Users className="w-4 h-4 shrink-0 text-indigo-400" />
                  {!sidebarCollapsed && <span>Team Members</span>}
                </div>
                {!sidebarCollapsed && !hasProjects && (
                  <Lock className="w-3 h-3 text-slate-500 shrink-0" />
                )}
              </button>
            )}

            {/* Chats */}
            {hasPermission('chat') && (
              <button
                id="nav-chat"
                onClick={() => handleNavClick('chat', 'Chats')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${disabledBtnClass} ${
                  hasProjects && isActive('chat')
                    ? 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-900/40'
                    : 'text-slate-300 hover:bg-white/10 hover:text-white'
                }`}
                title={!hasProjects ? "Action Required: Create a project first to access Chats" : "Chats"}
              >
                <div className="flex items-center space-x-3">
                  <MessageSquare className="w-4 h-4 shrink-0 text-cyan-400" />
                  {!sidebarCollapsed && <span>Chats</span>}
                </div>
                {!sidebarCollapsed && !hasProjects && (
                  <Lock className="w-3 h-3 text-slate-500 shrink-0" />
                )}
              </button>
            )}

            {/* Issues Registry */}
            {hasPermission('issues') && (
              <button
                id="nav-issues"
                onClick={() => handleNavClick('issues', 'Issues Registry')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${disabledBtnClass} ${
                  hasProjects && isActive('issues')
                    ? 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-900/40'
                    : 'text-slate-300 hover:bg-white/10 hover:text-white'
                }`}
                title={!hasProjects ? "Action Required: Create a project first to access Issues Registry" : "Issues Registry"}
              >
                <div className="flex items-center space-x-3">
                  <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
                  {!sidebarCollapsed && <span>Issues Registry</span>}
                </div>
                {!sidebarCollapsed && (!hasProjects ? (
                  <Lock className="w-3 h-3 text-slate-500 shrink-0" />
                ) : openIssuesCount > 0 ? (
                  <span className="px-1.5 py-0.2 bg-red-500/20 text-red-300 border border-red-500/40 text-[10px] font-bold rounded-full font-mono">
                    {openIssuesCount}
                  </span>
                ) : null)}
              </button>
            )}

            {/* New Requirement */}
            {hasPermission('new_requirements') && (
              <button
                id="nav-new-requirements"
                onClick={() => handleNavClick('new_requirements', 'New Requirement')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${disabledBtnClass} ${
                  hasProjects && isActive('new_requirements')
                    ? 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-900/40'
                    : 'text-slate-300 hover:bg-white/10 hover:text-white'
                }`}
                title={!hasProjects ? "Action Required: Create a project first to submit requirements" : "New Requirement"}
              >
                <div className="flex items-center space-x-3">
                  <FileText className="w-4 h-4 shrink-0 text-emerald-400" />
                  {!sidebarCollapsed && <span>New Requirement</span>}
                </div>
                {!sidebarCollapsed && !hasProjects && (
                  <Lock className="w-3 h-3 text-slate-500 shrink-0" />
                )}
              </button>
            )}

            {/* Team Monitor */}
            {hasPermission('monitor') && (
              <button
                id="nav-monitor"
                onClick={() => handleNavClick('monitor', 'Team Monitor')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${disabledBtnClass} ${
                  hasProjects && isActive('monitor')
                    ? 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-900/40'
                    : 'text-slate-300 hover:bg-white/10 hover:text-white'
                }`}
                title={!hasProjects ? "Action Required: Create a project first to view Team Monitor" : "Team Monitor"}
              >
                <div className="flex items-center space-x-3">
                  <Activity className="w-4 h-4 shrink-0 text-cyan-400" />
                  {!sidebarCollapsed && <span>Team Monitor</span>}
                </div>
                {!sidebarCollapsed && !hasProjects && (
                  <Lock className="w-3 h-3 text-slate-500 shrink-0" />
                )}
              </button>
            )}

            {/* Work Health */}
            {hasPermission('employee_health') && (
              <button
                id="nav-employee-health"
                onClick={() => handleNavClick('employee_health', 'Work Health')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${disabledBtnClass} ${
                  hasProjects && isActive('employee_health')
                    ? 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-900/40'
                    : 'text-slate-300 hover:bg-white/10 hover:text-white'
                }`}
                title={!hasProjects ? "Action Required: Create a project first to view Work Health" : "Work Health"}
              >
                <div className="flex items-center space-x-3">
                  <HeartPulse className="w-4 h-4 shrink-0 text-emerald-400" />
                  {!sidebarCollapsed && <span>Work Health</span>}
                </div>
                {!sidebarCollapsed && !hasProjects && (
                  <Lock className="w-3 h-3 text-slate-500 shrink-0" />
                )}
              </button>
            )}

            {/* Tasks Queue */}
            {(hasPermission('tasks_kanban') || hasPermission('tasks_table')) && (
              <div>
                <button
                  id="nav-tasks-queue"
                  onClick={() => handleAccordionClick('tasks', 'Tasks Queue')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${disabledBtnClass} ${
                    hasProjects && (isActive('tasks_kanban') || isActive('tasks_table'))
                      ? 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-900/40'
                      : 'text-slate-300 hover:bg-white/10 hover:text-white'
                  }`}
                  title={!hasProjects ? "Action Required: Create a project first to view Tasks Queue" : "Tasks Queue"}
                >
                  <div className="flex items-center space-x-3">
                    <Kanban className="w-4 h-4 shrink-0 text-blue-400" />
                    {!sidebarCollapsed && <span>Tasks Queue</span>}
                  </div>
                  {!sidebarCollapsed && (
                    !hasProjects ? (
                      <Lock className="w-3 h-3 text-slate-500 shrink-0" />
                    ) : isTasksSubmenuOpen ? (
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    )
                  )}
                </button>

                {/* Submenu */}
                {!sidebarCollapsed && isTasksSubmenuOpen && hasProjects && (
                  <div className="pl-7 pr-1 space-y-1 mt-1 border-l border-slate-700/50 ml-4">
                    {hasPermission('tasks_kanban') && (
                      <button
                        onClick={() => navigateTo('tasks_kanban')}
                        className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs transition-colors cursor-pointer ${
                          isActive('tasks_kanban') ? 'text-blue-400 font-semibold bg-white/10' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Kanban Board
                      </button>
                    )}
                    {hasPermission('tasks_table') && (
                      <button
                        onClick={() => navigateTo('tasks_table')}
                        className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs transition-colors cursor-pointer ${
                          isActive('tasks_table') ? 'text-blue-400 font-semibold bg-white/10' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Table List View
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </nav>
        </div>

        {/* MANAGEMENT CONSOLE SECTION */}
        {(hasPermission('sprints') || hasPermission('reports') || hasPermission('performance_review')) && (
          <div>
            <nav className="space-y-1">
              <button
                id="nav-management-console"
                onClick={() => handleAccordionClick('management', 'Management Console')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${disabledBtnClass} ${
                  hasProjects && (isActive('sprints') || isActive('sprint_details') || isActive('reports') || isActive('performance_review'))
                    ? 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-900/40'
                    : 'text-slate-300 hover:bg-white/10 hover:text-white'
                }`}
                title={!hasProjects ? "Action Required: Create a project first to access Management Console" : "Management Console"}
              >
                <div className="flex items-center space-x-3">
                  <BarChart3 className="w-4 h-4 shrink-0 text-indigo-400" />
                  {!sidebarCollapsed && <span>Management Console</span>}
                </div>
                {!sidebarCollapsed && (
                  !hasProjects ? (
                    <Lock className="w-3 h-3 text-slate-500 shrink-0" />
                  ) : isManagementSubmenuOpen ? (
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  )
                )}
              </button>

              {/* Submenu */}
              {!sidebarCollapsed && isManagementSubmenuOpen && hasProjects && (
                <div className="pl-7 pr-1 space-y-1 mt-1 border-l border-slate-700/50 ml-4">
                  {hasPermission('sprints') && (
                    <button
                      onClick={() => navigateTo('sprints')}
                      className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs transition-colors cursor-pointer ${
                        isActive('sprints') || isActive('sprint_details') ? 'text-blue-400 font-semibold bg-white/10' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Sprints & Burndown
                    </button>
                  )}
                  {hasPermission('reports') && (
                    <button
                      onClick={() => navigateTo('reports')}
                      className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs transition-colors cursor-pointer ${
                        isActive('reports') ? 'text-blue-400 font-semibold bg-white/10' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Reports & Analytics
                    </button>
                  )}
                  {hasPermission('performance_review') && (
                    <button
                      onClick={() => navigateTo('performance_review')}
                      className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs transition-colors cursor-pointer ${
                        isActive('performance_review') ? 'text-blue-400 font-semibold bg-white/10' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Appraisal Reviews
                    </button>
                  )}
                </div>
              )}
            </nav>
          </div>
        )}

        {/* TESTING SECTION */}
        {hasPermission('tester_workspace') && (
          <div>
            <nav className="space-y-1">
              <button
                id="nav-testing"
                onClick={() => handleAccordionClick('testing', 'Testing Module')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${disabledBtnClass} ${
                  hasProjects && isActive('tester_workspace')
                    ? 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-900/40'
                    : 'text-slate-300 hover:bg-white/10 hover:text-white'
                }`}
                title={!hasProjects ? "Action Required: Create a project first to access Testing Module" : "Testing Module"}
              >
                <div className="flex items-center space-x-3">
                  <CheckSquare className="w-4 h-4 shrink-0 text-fuchsia-400" />
                  {!sidebarCollapsed && <span>Testing Module</span>}
                </div>
                {!sidebarCollapsed && (
                  !hasProjects ? (
                    <Lock className="w-3 h-3 text-slate-500 shrink-0" />
                  ) : isTestingSubmenuOpen ? (
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  )
                )}
              </button>

              {/* Submenu */}
              {!sidebarCollapsed && isTestingSubmenuOpen && hasProjects && (
                <div className="pl-7 pr-1 space-y-1 mt-1 border-l border-slate-700/50 ml-4">
                  {hasPermission('tester_workspace') && (
                    <button
                      onClick={() => navigateTo('tester_workspace')}
                      className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs transition-colors cursor-pointer ${
                        isActive('tester_workspace') ? 'text-blue-400 font-semibold bg-white/10' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Testing Queue
                    </button>
                  )}
                </div>
              )}
            </nav>
          </div>
        )}

        {/* ADMINISTRATION SECTION */}
        {(hasPermission('user_accounts') || hasPermission('user_roles')) && (
          <div>
            <nav className="space-y-1">
              <button
                id="nav-admin"
                onClick={() => handleAccordionClick('admin', 'Administrator Controls')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${disabledBtnClass} ${
                  hasProjects && (isActive('user_accounts') || isActive('user_roles'))
                    ? 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-900/40'
                    : 'text-slate-300 hover:bg-white/10 hover:text-white'
                }`}
                title={!hasProjects ? "Action Required: Create a project first to access Administration" : "Administrator Controls"}
              >
                <div className="flex items-center space-x-3">
                  <Shield className="w-4 h-4 shrink-0 text-amber-400" />
                  {!sidebarCollapsed && <span>Administrator</span>}
                </div>
                {!sidebarCollapsed && (
                  !hasProjects ? (
                    <Lock className="w-3 h-3 text-slate-500 shrink-0" />
                  ) : isAdminSubmenuOpen ? (
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  )
                )}
              </button>

              {/* Submenu */}
              {!sidebarCollapsed && isAdminSubmenuOpen && hasProjects && (
                <div className="pl-7 pr-1 space-y-1 mt-1 border-l border-slate-700/50 ml-4">
                  {hasPermission('user_accounts') && (
                    <button
                      onClick={() => navigateTo('user_accounts')}
                      className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs transition-colors cursor-pointer ${
                        isActive('user_accounts') ? 'text-blue-400 font-semibold bg-white/10' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      User Accounts
                    </button>
                  )}
                  {hasPermission('user_roles') && (
                    <button
                      onClick={() => navigateTo('user_roles')}
                      className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs transition-colors cursor-pointer ${
                        isActive('user_roles') ? 'text-blue-400 font-semibold bg-white/10' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      User Roles
                    </button>
                  )}
                </div>
              )}
            </nav>
          </div>
        )}

        {/* GENERAL SECTION */}
        <div>
          {!sidebarCollapsed && (
            <div className="px-2.5 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              General
            </div>
          )}
          <nav className="space-y-1 mt-1">
            <button
              id="nav-notifications"
              onClick={() => handleNavClick('notifications', 'Notifications')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${disabledBtnClass} ${
                hasProjects && isActive('notifications')
                  ? 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-900/40'
                  : 'text-slate-300 hover:bg-white/10 hover:text-white'
              }`}
              title={!hasProjects ? "Action Required: Create a project first to access Notifications" : "Notifications"}
            >
              <div className="flex items-center space-x-3">
                <Bell className="w-4 h-4 shrink-0" />
                {!sidebarCollapsed && <span>Notifications</span>}
              </div>
              {!sidebarCollapsed && (!hasProjects ? (
                <Lock className="w-3 h-3 text-slate-500 shrink-0" />
              ) : unreadCount > 0 ? (
                <span className="px-1.5 py-0.2 bg-blue-500 text-white text-[10px] font-bold rounded-full">
                  {unreadCount}
                </span>
              ) : null)}
            </button>

            <button
              id="nav-settings"
              onClick={() => handleNavClick('settings', 'Settings')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${disabledBtnClass} ${
                hasProjects && isActive('settings')
                  ? 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-900/40'
                  : 'text-slate-300 hover:bg-white/10 hover:text-white'
              }`}
              title={!hasProjects ? "Action Required: Create a project first to access Settings" : "Settings"}
            >
              <div className="flex items-center space-x-3">
                <Settings className="w-4 h-4 shrink-0 text-slate-300" />
                {!sidebarCollapsed && <span>Settings</span>}
              </div>
              {!sidebarCollapsed && !hasProjects && (
                <Lock className="w-3 h-3 text-slate-500 shrink-0" />
              )}
            </button>

            <button
              id="nav-console-tour"
              onClick={() => {
                if (!hasProjects) {
                  handleDisabledClick('Console Tour');
                  return;
                }
                setIsOnboardingOpen(true);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-slate-300 hover:bg-white/10 hover:text-white transition-all ${disabledBtnClass}`}
              title={!hasProjects ? "Action Required: Create a project first to begin Console Tour" : "Console Tour"}
            >
              <div className="flex items-center space-x-3">
                <HelpCircle className="w-4 h-4 shrink-0 text-slate-300" />
                {!sidebarCollapsed && <span>Console Tour</span>}
              </div>
              {!sidebarCollapsed && !hasProjects && (
                <Lock className="w-3 h-3 text-slate-500 shrink-0" />
              )}
            </button>
          </nav>
        </div>
      </div>

      {/* Enterprise Disabled Action Prompt Toast */}
      {disabledPrompt && (
        <div className="fixed bottom-6 left-6 z-50 max-w-sm bg-slate-900/95 backdrop-blur-md border border-amber-500/50 text-white p-3.5 rounded-xl shadow-2xl flex items-start space-x-3 animate-in fade-in slide-in-from-bottom-2">
          <div className="p-1.5 bg-amber-500/20 rounded-lg text-amber-400 shrink-0 mt-0.5">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div className="flex-1 text-xs">
            <div className="font-bold text-amber-300 flex items-center space-x-1">
              <span>{canManageProjects ? 'Setup Required' : 'Assignment Pending'}</span>
            </div>
            <p className="text-slate-300 mt-1 text-[11px] leading-relaxed">{disabledPrompt}</p>
            {canManageProjects ? (
              <button
                onClick={() => {
                  setDisabledPrompt(null);
                  navigateTo('project_health');
                  setIsCreateProjectModalOpen(true);
                }}
                className="mt-2 px-2.5 py-1 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-[10px] rounded-md transition-colors inline-flex items-center space-x-1 cursor-pointer"
              >
                <Sparkles className="w-3 h-3" />
                <span>Create Project Now</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            ) : (
              <button
                onClick={() => setDisabledPrompt(null)}
                className="mt-2 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-semibold rounded-md transition-colors inline-flex items-center space-x-1 cursor-pointer"
              >
                <span>Dismiss</span>
              </button>
            )}
          </div>
          <button
            onClick={() => setDisabledPrompt(null)}
            className="text-slate-400 hover:text-white p-1 rounded-md cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Sidebar Footer Status Card */}
      {!sidebarCollapsed && (
        <div className="shrink-0 p-3 border-t border-slate-800/80 bg-slate-900/80 backdrop-blur-md">
          <div className="flex items-center space-x-2.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <div className="truncate">
              <div className="text-[11px] font-bold text-white truncate">{getUserRoleName ? `${getUserRoleName(currentUser)} Console` : 'Console'}</div>
              <div className="text-[10px] text-emerald-400 font-medium">{hasProjects ? 'Workspace Active' : 'Setup Required'}</div>
              <div className="text-[9px] text-slate-400 font-mono truncate">MariaDB: {currentUser?.companyId ? `standupflow_db_${currentUser.companyId}` : 'standupflow_db'}</div>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
