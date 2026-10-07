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
  Shield
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
    hasPermission
  } = useApp();

  const [activeAccordion, setActiveAccordion] = useState(null); // 'tasks' | 'management' | 'testing' | 'admin' | null

  const toggleAccordion = (key) => {
    setActiveAccordion(prev => (prev === key ? null : key));
  };

  const isTasksSubmenuOpen = activeAccordion === 'tasks';
  const isManagementSubmenuOpen = activeAccordion === 'management';
  const isTestingSubmenuOpen = activeAccordion === 'testing';
  const isAdminSubmenuOpen = activeAccordion === 'admin';

  const userNotifications = (notifications || []).filter(n => 
    !n.userId || 
    String(n.userId) === String(currentUser?.id) || 
    (n.userEmail && currentUser?.email && n.userEmail.toLowerCase() === currentUser.email.toLowerCase())
  );
  const unreadCount = userNotifications.filter(n => !n.read).length;
  const openIssuesCount = issues.filter(i => i.state !== 'Done').length;

  const normRole = (currentRole === 'MANAGER' || currentRole === 'DEVELOPER') ? 'ENGINEER' : currentRole;
  const isAdmin = currentRole === 'ADMIN' || currentRole === 'ROOT' || currentRole === 1 || currentRole === '1' || currentUser?.rootadmin === 1 || currentUser?.role === 'ADMIN' || currentUser?.role === 1 || currentUser?.role === '1';
  const isEngineer = normRole === 'ENGINEER' || isAdmin;
  const isTester = currentRole === 'TESTER' || isAdmin;
  const isAssigned = true; // Every user has full active workspace access
  const disabledClass = '';

  const isActive = (viewName) => currentView === viewName;

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
        {/* WORKSPACE SECTION */}
        <div>
          {!sidebarCollapsed && (
            <div className="px-2.5 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Workspace
            </div>
          )}
          <nav className="space-y-1 mt-1">
            {/* Home */}
            <button
              onClick={() => {
                setActiveAccordion(null);
                if (currentRole === 'DEVELOPER') navigateTo('developer_workspace');
                else if (currentRole === 'TESTER') navigateTo('tester_workspace');
                else navigateTo('dashboard');
              }}
              disabled={!isAssigned}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${disabledClass} ${
                isActive('dashboard') || (currentRole === 'DEVELOPER' && isActive('developer_workspace'))
                  ? 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-900/40'
                  : 'text-slate-300 hover:bg-white/10 hover:text-white'
              }`}
              title="Home"
            >
              <Home className="w-4 h-4 shrink-0" />
              {!sidebarCollapsed && <span>Home</span>}
            </button>

            {/* Projects */}
            {hasPermission('projects') && (
              <button
                onClick={() => {
                  setActiveAccordion(null);
                  navigateTo('project_health');
                }}
                disabled={!isAssigned}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${disabledClass} ${
                  isActive('project_health')
                    ? 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-900/40'
                    : 'text-slate-300 hover:bg-white/10 hover:text-white'
                }`}
                title="Projects"
              >
                <Layers className="w-4 h-4 shrink-0" />
                {!sidebarCollapsed && <span>Projects</span>}
              </button>
            )}

            {/* Team Members */}
            {hasPermission('team_members') && (
              <button
                onClick={() => {
                  setActiveAccordion(null);
                  navigateTo('team_members');
                }}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  isActive('team_members')
                    ? 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-900/40'
                    : 'text-slate-300 hover:bg-white/10 hover:text-white'
                }`}
                title="Team Members"
              >
                <Users className="w-4 h-4 shrink-0 text-indigo-400" />
                {!sidebarCollapsed && <span>Team Members</span>}
              </button>
            )}

            {/* Chats */}
            {hasPermission('chat') && (
              <button
                onClick={() => {
                  setActiveAccordion(null);
                  navigateTo('chat');
                }}
                disabled={!isAssigned}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${disabledClass} ${
                  isActive('chat')
                    ? 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-900/40'
                    : 'text-slate-300 hover:bg-white/10 hover:text-white'
                }`}
                title="Chats"
              >
                <MessageSquare className="w-4 h-4 shrink-0 text-cyan-400" />
                {!sidebarCollapsed && <span>Chats</span>}
              </button>
            )}

            {/* Issues Registry */}
            {hasPermission('issues') && (
              <button
                onClick={() => {
                  setActiveAccordion(null);
                  navigateTo('issues');
                }}
                disabled={!isAssigned}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${disabledClass} ${
                  isActive('issues')
                    ? 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-900/40'
                    : 'text-slate-300 hover:bg-white/10 hover:text-white'
                }`}
                title="Issues Registry"
              >
                <div className="flex items-center space-x-3">
                  <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
                  {!sidebarCollapsed && <span>Issues Registry</span>}
                </div>
                {!sidebarCollapsed && openIssuesCount > 0 && (
                  <span className="px-1.5 py-0.2 bg-red-500/20 text-red-300 border border-red-500/40 text-[10px] font-bold rounded-full font-mono">
                    {openIssuesCount}
                  </span>
                )}
              </button>
            )}

            {/* Team Monitor */}
            {hasPermission('monitor') && (
              <button
                onClick={() => {
                  setActiveAccordion(null);
                  navigateTo('monitor');
                }}
                disabled={!isAssigned}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${disabledClass} ${
                  isActive('monitor')
                    ? 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-900/40'
                    : 'text-slate-300 hover:bg-white/10 hover:text-white'
                }`}
                title="Team Monitor"
              >
                <Activity className="w-4 h-4 shrink-0 text-cyan-400" />
                {!sidebarCollapsed && <span>Team Monitor</span>}
              </button>
            )}

            {/* Work Health */}
            {hasPermission('employee_health') && (
              <button
                onClick={() => {
                  setActiveAccordion(null);
                  navigateTo('employee_health');
                }}
                disabled={!isAssigned}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${disabledClass} ${
                  isActive('employee_health')
                    ? 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-900/40'
                    : 'text-slate-300 hover:bg-white/10 hover:text-white'
                }`}
                title="Work Health"
              >
                <HeartPulse className="w-4 h-4 shrink-0 text-emerald-400" />
                {!sidebarCollapsed && <span>Work Health</span>}
              </button>
            )}

            {/* Tasks Queue */}
            {(hasPermission('tasks_kanban') || hasPermission('tasks_table')) && (
              <div>
                <button
                  onClick={() => {
                    if (!sidebarCollapsed) {
                      toggleAccordion('tasks');
                    } else {
                      navigateTo('tasks_kanban');
                    }
                  }}
                  disabled={!isAssigned}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${disabledClass} ${
                    isActive('tasks_kanban') || isActive('tasks_table')
                      ? 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-900/40'
                      : 'text-slate-300 hover:bg-white/10 hover:text-white'
                  }`}
                  title="Tasks Queue"
                >
                  <div className="flex items-center space-x-3">
                    <Kanban className="w-4 h-4 shrink-0 text-blue-400" />
                    {!sidebarCollapsed && <span>Tasks Queue</span>}
                  </div>
                  {!sidebarCollapsed && (
                    isTasksSubmenuOpen ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  )}
                </button>

                {/* Submenu */}
                {!sidebarCollapsed && isTasksSubmenuOpen && (
                  <div className={`pl-7 pr-1 space-y-1 mt-1 border-l border-slate-700/50 ml-4 ${disabledClass}`}>
                    {hasPermission('tasks_kanban') && (
                      <button
                        onClick={() => navigateTo('tasks_kanban')}
                        disabled={!isAssigned}
                        className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs transition-colors ${
                          isActive('tasks_kanban') ? 'text-blue-400 font-semibold bg-white/10' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Kanban Board
                      </button>
                    )}
                    {hasPermission('tasks_table') && (
                      <button
                        onClick={() => navigateTo('tasks_table')}
                        disabled={!isAssigned}
                        className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs transition-colors ${
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
                onClick={() => {
                  if (!sidebarCollapsed) {
                    toggleAccordion('management');
                  } else {
                    navigateTo('sprints');
                  }
                }}
                disabled={!isAssigned}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${disabledClass} ${
                  isActive('sprints') || isActive('sprint_details') || isActive('reports') || isActive('performance_review')
                    ? 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-900/40'
                    : 'text-slate-300 hover:bg-white/10 hover:text-white'
                }`}
                title="Management Console"
              >
                <div className="flex items-center space-x-3">
                  <BarChart3 className="w-4 h-4 shrink-0 text-indigo-400" />
                  {!sidebarCollapsed && <span>Management Console</span>}
                </div>
                {!sidebarCollapsed && (
                  isManagementSubmenuOpen ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                )}
              </button>

              {/* Submenu */}
              {!sidebarCollapsed && isManagementSubmenuOpen && (
                <div className={`pl-7 pr-1 space-y-1 mt-1 border-l border-slate-700/50 ml-4 ${disabledClass}`}>
                  {hasPermission('sprints') && (
                    <button
                      onClick={() => navigateTo('sprints')}
                      disabled={!isAssigned}
                      className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs transition-colors ${
                        isActive('sprints') || isActive('sprint_details') ? 'text-blue-400 font-semibold bg-white/10' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Sprints & Burndown
                    </button>
                  )}
                  {hasPermission('reports') && (
                    <button
                      onClick={() => navigateTo('reports')}
                      disabled={!isAssigned}
                      className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs transition-colors ${
                        isActive('reports') ? 'text-blue-400 font-semibold bg-white/10' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Reports & Analytics
                    </button>
                  )}
                  {hasPermission('performance_review') && (
                    <button
                      onClick={() => navigateTo('performance_review')}
                      disabled={!isAssigned}
                      className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs transition-colors ${
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
                onClick={() => {
                  if (!sidebarCollapsed) {
                    toggleAccordion('testing');
                  } else {
                    navigateTo('tester_workspace');
                  }
                }}
                disabled={!isAssigned}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${disabledClass} ${
                  isActive('tester_workspace')
                    ? 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-900/40'
                    : 'text-slate-300 hover:bg-white/10 hover:text-white'
                }`}
                title="Testing Module"
              >
                <div className="flex items-center space-x-3">
                  <CheckSquare className="w-4 h-4 shrink-0 text-fuchsia-400" />
                  {!sidebarCollapsed && <span>Testing Module</span>}
                </div>
                {!sidebarCollapsed && (
                  isTestingSubmenuOpen ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                )}
              </button>

              {/* Submenu */}
              {!sidebarCollapsed && isTestingSubmenuOpen && (
                <div className={`pl-7 pr-1 space-y-1 mt-1 border-l border-slate-700/50 ml-4 ${disabledClass}`}>
                  {hasPermission('tester_workspace') && (
                    <button
                      onClick={() => navigateTo('tester_workspace')}
                      disabled={!isAssigned}
                      className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs transition-colors ${
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
        {(hasPermission('user_accounts') || hasPermission('user_roles') || isAdmin) && (
          <div>
            <nav className="space-y-1">
              <button
                onClick={() => {
                  if (!sidebarCollapsed) {
                    toggleAccordion('admin');
                  } else {
                    navigateTo('user_accounts');
                  }
                }}
                disabled={!isAssigned}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${disabledClass} ${
                  isActive('user_accounts') || isActive('user_roles')
                    ? 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-900/40'
                    : 'text-slate-300 hover:bg-white/10 hover:text-white'
                }`}
                title="Administrator Controls"
              >
                <div className="flex items-center space-x-3">
                  <Shield className="w-4 h-4 shrink-0 text-amber-400" />
                  {!sidebarCollapsed && <span>Administrator</span>}
                </div>
                {!sidebarCollapsed && (
                  isAdminSubmenuOpen ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                )}
              </button>

              {/* Submenu */}
              {!sidebarCollapsed && isAdminSubmenuOpen && (
                <div className={`pl-7 pr-1 space-y-1 mt-1 border-l border-slate-700/50 ml-4 ${disabledClass}`}>
                  {(hasPermission('user_accounts') || isAdmin) && (
                    <button
                      onClick={() => navigateTo('user_accounts')}
                      disabled={!isAssigned}
                      className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs transition-colors ${
                        isActive('user_accounts') ? 'text-blue-400 font-semibold bg-white/10' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      User Accounts
                    </button>
                  )}
                  {(hasPermission('user_roles') || isAdmin) && (
                    <button
                      onClick={() => navigateTo('user_roles')}
                      disabled={!isAssigned}
                      className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs transition-colors ${
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
              onClick={() => {
                setActiveAccordion(null);
                navigateTo('notifications');
              }}
              disabled={!isAssigned}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${disabledClass} ${
                isActive('notifications')
                  ? 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-900/40'
                  : 'text-slate-300 hover:bg-white/10 hover:text-white'
              }`}
              title="Notifications"
            >
              <div className="flex items-center space-x-3">
                <Bell className="w-4 h-4 shrink-0" />
                {!sidebarCollapsed && <span>Notifications</span>}
              </div>
              {!sidebarCollapsed && unreadCount > 0 && (
                <span className="px-1.5 py-0.2 bg-blue-500 text-white text-[10px] font-bold rounded-full">
                  {unreadCount}
                </span>
              )}
            </button>

            <button
              onClick={() => {
                setActiveAccordion(null);
                navigateTo('settings');
              }}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                isActive('settings')
                  ? 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-900/40'
                  : 'text-slate-300 hover:bg-white/10 hover:text-white'
              }`}
              title="Workspace Settings"
            >
              <Settings className="w-4 h-4 shrink-0 text-slate-300" />
              {!sidebarCollapsed && <span>Workspace Settings</span>}
            </button>

            <button
              onClick={() => setIsOnboardingOpen(true)}
              disabled={!isAssigned}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-xs font-medium text-slate-300 hover:bg-white/10 hover:text-white transition-all ${disabledClass}`}
              title="Console Tour"
            >
              <HelpCircle className="w-4 h-4 shrink-0 text-slate-300" />
              {!sidebarCollapsed && <span>Console Tour</span>}
            </button>
          </nav>
        </div>
      </div>

      {/* Sidebar Footer Status Card */}
      {!sidebarCollapsed && (
        <div className="shrink-0 p-3 border-t border-slate-800/80 bg-slate-900/80 backdrop-blur-md">
          <div className="flex items-center space-x-2.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <div className="truncate">
              <div className="text-[11px] font-bold text-white truncate">{isAdmin ? 'Admin Console' : currentRole === 'MANAGER' ? 'Manager Console' : `${currentRole} Console`}</div>
              <div className="text-[10px] text-emerald-400 font-medium">Connected</div>
              <div className="text-[9px] text-slate-400 font-mono truncate">MariaDB: {currentUser?.companyId ? `standupflow_db_${currentUser.companyId}` : 'standupflow_db'}</div>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
