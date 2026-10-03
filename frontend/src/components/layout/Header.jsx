import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Search,
  Bell,
  Plus,
  ChevronDown,
  Shield,
  Code,
  CheckSquare,
  LogOut,
  Calendar,
  AlertTriangle,
  HelpCircle,
  PanelLeftClose,
  PanelLeftOpen,
  Edit3,
  Zap
} from 'lucide-react';

export const Header = () => {
  const {
    currentUser,
    currentRole,
    projects,
    currentProject,
    setCurrentProject,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    setIsCreateTaskModalOpen,
    setIsCreateSprintModalOpen,
    setIsCreateProjectModalOpen,
    openEditProjectModal,
    setIsReportBugModalOpen,
    setIsOnboardingOpen,
    searchQuery,
    setSearchQuery,
    navigateTo,
    logout,
    sidebarCollapsed,
    setSidebarCollapsed
  } = useApp();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);

  const userNotifications = (notifications || []).filter(n => 
    !n.userId || 
    String(n.userId) === String(currentUser?.id) || 
    (n.userEmail && currentUser?.email && n.userEmail.toLowerCase() === currentUser.email.toLowerCase())
  );
  const unreadNotifs = userNotifications.filter(n => !n.read);
  const hasNoProjects = !projects || projects.length === 0 || !currentProject;
  const isAssigned = currentRole === 'MANAGER' || Boolean(currentUser?.managerCode);
  const disabledClass = (!isAssigned || hasNoProjects) ? 'opacity-40 cursor-not-allowed pointer-events-none' : '';

  const roleBadges = {
    ENGINEER: { bg: 'bg-blue-50 text-blue-700 border-blue-200/80', label: 'Software Engineer / Lead', icon: Code },
    TESTER: { bg: 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200/80', label: 'QA / Tester Workspace', icon: CheckSquare }
  };

  const normRole = (currentRole === 'MANAGER' || currentRole === 'DEVELOPER') ? 'ENGINEER' : currentRole;
  const currentRoleInfo = roleBadges[normRole] || roleBadges.ENGINEER;
  const RoleIcon = currentRoleInfo.icon;

  return (
    <header className="h-14 shrink-0 bg-white border-b border-slate-200 px-4 md:px-6 flex items-center justify-between gap-8 md:gap-12 z-30 shadow-2xs w-full">
      {/* Left Block: Toggle Button -> Logo -> Company Name -> Wide Search Bar */}
      <div className="flex items-center space-x-4 flex-1 min-w-0 mr-8 md:mr-12">
        <div className="flex items-center space-x-2.5 shrink-0">
          {/* 1. Expand/Collapse Toggle Button (Fixed 25px x 25px) */}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="w-[25px] h-[25px] flex items-center justify-center p-0.5 rounded-md text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors shrink-0"
            title={sidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {sidebarCollapsed ? (
              <PanelLeftOpen className="w-full h-full" />
            ) : (
              <PanelLeftClose className="w-full h-full" />
            )}
          </button>

          {/* 2. Logo & 3. Company Name (Always Visible) */}
          <div
            id="brand-logo"
            onClick={() => {
              if (currentRole === 'DEVELOPER') navigateTo('developer_workspace');
              else if (currentRole === 'TESTER') navigateTo('tester_workspace');
              else navigateTo('dashboard');
            }}
            className="flex items-center space-x-2 cursor-pointer group shrink-0"
          >
            <img src="/logo.png" alt="StandupFlow Logo" className="w-8 h-8 rounded-md object-contain shadow-2xs shrink-0" />
            <div>
              <span className="font-bold text-slate-900 text-sm tracking-tight leading-none block">
                Standup<span className="text-blue-600">Flow</span>
              </span>
              <span className="text-[9px] text-slate-400 font-mono tracking-widest uppercase block mt-0.5">
                ENTERPRISE v2.4
              </span>
            </div>
          </div>
        </div>

        {/* Vertical Divider */}
        <div className="h-6 w-[1px] bg-slate-200 shrink-0 mx-1" />

        {/* Global Search Bar (Expanded Width: max-w-2xl with margin gap) */}
        <div className="relative flex-1 max-w-2xl min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search tasks, issues, sprints..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50/80 hover:bg-slate-100/80 focus:bg-white text-xs pl-10 pr-14 py-2 rounded-lg border border-slate-200/80 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-400 font-medium"
          />
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center space-x-1 bg-white px-1.5 py-0.5 rounded border border-slate-200 text-[10px] font-mono text-slate-400 shadow-2xs">
            <span>Ctrl</span>
            <span>K</span>
          </div>
        </div>
      </div>

      {/* Right: Controls, Project Switcher, Role Badge & Actions (Shrink 0 with explicit gap) */}
      <div className="flex items-center space-x-3 shrink-0">
        {/* Project Switcher Dropdown */}
        <div className="relative">
          <button
            id="project-switcher"
            onClick={() => setIsProjectDropdownOpen(!isProjectDropdownOpen)}
            className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 transition-all"
          >
            <Calendar className="w-3.5 h-3.5 text-blue-600" />
            <span className="max-w-[130px] truncate">{currentProject?.name || 'StandupFlow Core'}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {isProjectDropdownOpen && (
            <div className="absolute right-0 mt-1 w-72 bg-white rounded-xl shadow-2xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span>Active Project Workspaces</span>
                <span className="font-mono text-slate-400">{projects.length} Total</span>
              </div>
              <div className="max-h-56 overflow-y-auto divide-y divide-slate-100">
                {projects.map((proj) => (
                  <div
                    key={proj.id}
                    onClick={() => {
                      setCurrentProject(proj);
                      setIsProjectDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors ${
                      currentProject?.id === proj.id ? 'bg-blue-50/80 text-blue-700 font-semibold' : 'text-slate-700'
                    }`}
                  >
                    <div className="flex items-center space-x-2 truncate pr-1">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: proj.color || '#2563eb' }} />
                      <span className="truncate">{proj.name}</span>
                    </div>

                    <div className="flex items-center space-x-1.5 shrink-0">
                      <span className="text-[10px] text-slate-400 font-mono px-1.5 py-0.5 bg-slate-100 rounded">{proj.code}</span>
                      <button
                        title="Edit Project Settings"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsProjectDropdownOpen(false);
                          openEditProjectModal(proj);
                        }}
                        className="p-1 rounded text-slate-400 hover:text-blue-600 hover:bg-blue-100/60 transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2 mt-1 border-t border-slate-100 px-2">
                <button
                  onClick={() => {
                    setIsProjectDropdownOpen(false);
                    setIsCreateProjectModalOpen(true);
                  }}
                  className="w-full text-left px-3 py-2 text-xs font-semibold text-blue-600 hover:bg-blue-50 rounded-lg flex items-center space-x-2 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5 text-blue-600" />
                  <span>+ Create New Project</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Console Role Badge */}
        <div className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center space-x-1.5 ${currentRoleInfo.bg}`}>
          <RoleIcon className="w-3.5 h-3.5" />
          <span>{currentRoleInfo.label}</span>
        </div>

        {/* Quick Action Button: + New Task / + New Sprint */}
        {currentRole === 'TESTER' ? (
          <button
            onClick={() => setIsReportBugModalOpen(true)}
            className="flex items-center space-x-1.5 bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow-xs transition-all"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Report Bug</span>
          </button>
        ) : (
          <div className="flex items-center space-x-2">
            <button
              onClick={() => !hasNoProjects && setIsCreateSprintModalOpen(true)}
              disabled={hasNoProjects}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                hasNoProjects
                  ? 'bg-slate-200 text-slate-400 opacity-60 cursor-not-allowed border border-slate-300'
                  : 'bg-amber-500 hover:bg-amber-600 text-white shadow-xs'
              }`}
              title={hasNoProjects ? "Create a project workspace first before creating sprints" : "Create New Sprint Cycle"}
            >
              <Zap className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">New Sprint</span>
            </button>
            <button
              onClick={() => !hasNoProjects && setIsCreateTaskModalOpen(true)}
              disabled={hasNoProjects}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                hasNoProjects
                  ? 'bg-slate-200 text-slate-400 opacity-60 cursor-not-allowed border border-slate-300'
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs'
              }`}
              title={hasNoProjects ? "Create a project workspace first before creating tasks" : "Create New Task"}
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">New Task</span>
            </button>
          </div>
        )}

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 relative transition-colors"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadNotifs.length > 0 ? (
              <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 rounded-full bg-red-600 text-white font-bold text-[9px] flex items-center justify-center ring-2 ring-white animate-pulse">
                {unreadNotifs.length}
              </span>
            ) : (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-slate-300 ring-2 ring-white" />
            )}
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-1.5 border-b border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">Notifications ({userNotifications.length})</span>
                <button onClick={markAllNotificationsRead} className="text-[11px] text-blue-600 hover:underline font-medium">
                  Mark all as read
                </button>
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                {userNotifications.length === 0 ? (
                  <div className="p-4 text-center text-slate-400 text-xs">No notifications</div>
                ) : (
                  userNotifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => {
                        markNotificationRead(notif.id);
                        if (notif.linkTaskId) navigateTo('task_details', notif.linkTaskId);
                        setIsNotifOpen(false);
                      }}
                      className={`p-3 text-xs cursor-pointer hover:bg-slate-50 transition-colors ${
                        !notif.read ? 'bg-blue-50/50 border-l-2 border-blue-600' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-slate-800">{notif.title}</span>
                        <span className="text-[10px] text-slate-400">{notif.timestamp}</span>
                      </div>
                      <p className="text-slate-600 text-[11px] leading-snug">{notif.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Dropdown */}
        <div className="relative pl-1">
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center space-x-2 p-1 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <img
              src={currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80'}
              alt={currentUser?.name || 'User'}
              className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200"
            />
            <div className="text-left hidden md:block">
              <div className="text-xs font-bold text-slate-800 leading-none">{currentUser?.name || 'man'}</div>
              <div className="text-[10px] text-slate-400 leading-tight capitalize mt-0.5">{currentRole.toLowerCase()}</div>
            </div>
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50">
              <div className="px-3 py-2 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-900">{currentUser?.name || 'man'}</p>
                <p className="text-[11px] text-slate-500 truncate">{currentUser?.email || 'manager@standupflow.com'}</p>
              </div>

              <button
                onClick={() => {
                  setIsOnboardingOpen(true);
                  setIsProfileOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center space-x-2"
              >
                <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
                <span>Restart Console Tutorial</span>
              </button>

              <button
                onClick={() => {
                  logout();
                  setIsProfileOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center space-x-2 border-t border-slate-100"
              >
                <LogOut className="w-3.5 h-3.5 text-red-500" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
