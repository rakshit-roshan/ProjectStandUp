import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Search,
  Bell,
  BellOff,
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
  Zap,
  CheckCheck,
  Clock,
  ExternalLink
} from 'lucide-react';

export const Header = () => {
  const {
    currentUser,
    getUserRoleName,
    currentRole,
    projects,
    currentProject,
    setCurrentProject,
    notifications,
    userNotifications: contextUserNotifs,
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
    setSidebarCollapsed,
    isUserAdmin,
    canUserManageProjects,
    hasPermission
  } = useApp();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);
  const [notifFilter, setNotifFilter] = useState('all');

  const notifRef = useRef(null);
  const profileRef = useRef(null);
  const projectSwitcherRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setIsNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
      if (projectSwitcherRef.current && !projectSwitcherRef.current.contains(event.target)) {
        setIsProjectDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const userNotifications = contextUserNotifs || (notifications || []).filter(n => {
    if (!currentUser || !n) return false;
    const uid = String(currentUser.id || '');
    const email = (currentUser.email || '').toLowerCase().trim();
    const nUid = n.userId !== undefined && n.userId !== null ? String(n.userId).trim() : '';
    const nEmail = n.userEmail ? String(n.userEmail).toLowerCase().trim() : '';
    return (uid && nUid && (nUid === uid || nUid.split(',').map(s => s.trim()).includes(uid))) ||
           (email && nEmail && (nEmail === email || nEmail.split(',').map(s => s.trim()).includes(email)));
  });
  const unreadNotifs = userNotifications.filter(n => !(n.read || n.isRead));
  const displayedNotifs = notifFilter === 'unread' ? unreadNotifs : userNotifications;
  const hasNoProjects = !projects || projects.length === 0 || !currentProject;
  const isAdmin = isUserAdmin ? isUserAdmin() : Boolean(currentUser?.rootadmin === 1);
  const canManageProjects = canUserManageProjects ? canUserManageProjects(currentUser) : (isAdmin || currentRole === 'MANAGER');
  const canCreateQuick = canManageProjects;
  const isAssigned = isAdmin || currentRole === 'MANAGER' || Boolean(currentUser?.managerCode);
  const disabledClass = (!isAssigned || hasNoProjects) ? 'opacity-40 cursor-not-allowed pointer-events-none' : '';

  const displayRoleName = getUserRoleName ? getUserRoleName(currentUser) : 'User';
  const userRoleCode = currentUser?.roleCode !== undefined && currentUser?.roleCode !== null
    ? Number(currentUser.roleCode)
    : (currentUser?.role === 'ADMIN' || currentUser?.role === 1 ? 1 : Number(currentUser?.role || 1));

  let badgeStyle = 'bg-purple-50 text-purple-700 border-purple-200/80';
  let RoleIcon = Shield;
  if (isAdmin) {
    badgeStyle = 'bg-amber-50 text-amber-700 border-amber-200/80';
    RoleIcon = Shield;
  } else if (userRoleCode === 2) {
    badgeStyle = 'bg-indigo-50 text-indigo-700 border-indigo-200/80';
    RoleIcon = Shield;
  } else if (userRoleCode === 3) {
    badgeStyle = 'bg-blue-50 text-blue-700 border-blue-200/80';
    RoleIcon = Code;
  } else if (userRoleCode === 4) {
    badgeStyle = 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200/80';
    RoleIcon = CheckSquare;
  }

  return (
    <header className="h-14 shrink-0 bg-white border-b border-slate-200 px-4 md:px-6 flex items-center justify-between gap-8 md:gap-12 z-30 shadow-2xs w-full">
      {/* Left Block: Toggle Button -> Logo -> Company Name -> Wide Search Bar */}
      <div className="flex items-center space-x-4 flex-1 min-w-0 mr-8 md:mr-12">
        <div className="flex items-center space-x-2.5 shrink-0">
          {/* 1. Expand/Collapse Toggle Button (Fixed 25px x 25px) */}
          <button
            id="sidebar-toggle-btn"
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
        <div id="global-search-bar" className="relative flex-1 max-w-2xl min-w-[240px]">
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
        <div className="relative" ref={projectSwitcherRef}>
          <button
            id="project-switcher"
            onClick={() => setIsProjectDropdownOpen(!isProjectDropdownOpen)}
            className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 transition-all"
          >
            <Calendar className="w-3.5 h-3.5 text-blue-600" />
            <span className="max-w-[130px] truncate">{currentProject?.name || 'No Project Assigned'}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {isProjectDropdownOpen && (
            <div className="absolute right-0 mt-1 w-72 bg-white rounded-xl shadow-2xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span>Active Project Workspaces</span>
                <span className="font-mono text-slate-400">{projects.length} Total</span>
              </div>
              <div className="max-h-56 overflow-y-auto divide-y divide-slate-100">
                {projects.length === 0 ? (
                  <div className="px-3 py-4 text-center text-xs text-slate-400">
                    No project workspaces assigned.
                  </div>
                ) : (
                  projects.map((proj) => (
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
                      {canCreateQuick && (
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
                      )}
                    </div>
                  </div>
                )))}
              </div>

              {canCreateQuick && (
                <div className="pt-2 mt-1 border-t border-slate-100 px-2">
                  <button
                    onClick={() => {
                      setIsProjectDropdownOpen(false);
                      setIsCreateProjectModalOpen(true);
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-semibold text-blue-600 hover:bg-blue-50 rounded-lg flex items-center space-x-2 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5 text-blue-600" />
                    <span>Create New Project</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Console Role Badge */}
        <div id="role-badge" className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center space-x-1.5 ${badgeStyle}`}>
          <RoleIcon className="w-3.5 h-3.5" />
          <span>{displayRoleName}</span>
        </div>

        {/* Quick Action Button: + New Task / + New Sprint */}
        <div id="quick-actions-bar" className="flex items-center space-x-2">
          {currentRole === 'TESTER' ? (
            <button
              id="quick-report-bug-btn"
              onClick={() => setIsReportBugModalOpen(true)}
              className="flex items-center space-x-1.5 bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow-xs transition-all"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Report Bug</span>
            </button>
          ) : canCreateQuick ? (
            <div className="flex items-center space-x-2">
              <button
                id="quick-new-sprint-btn"
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
                id="quick-new-task-btn"
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
          ) : null}
        </div>

        {/* Notifications Popover with Glassmorphic Backdrop */}
        <div className="relative" ref={notifRef}>
          <button
            id="notifications-btn"
            onClick={() => {
              setIsNotifOpen(!isNotifOpen);
              setIsProfileOpen(false);
              setIsProjectDropdownOpen(false);
            }}
            className={`p-2 rounded-xl transition-all duration-200 relative cursor-pointer ${
              isNotifOpen
                ? 'bg-blue-50/90 text-blue-600 ring-2 ring-blue-500/25 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
            }`}
            title="Notifications"
          >
            <Bell className={`w-4 h-4 transition-transform duration-200 ${isNotifOpen ? 'rotate-12 scale-105' : ''}`} />
            {unreadNotifs.length > 0 ? (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-gradient-to-r from-red-500 to-rose-600 text-white font-bold text-[9px] flex items-center justify-center ring-2 ring-white shadow-xs animate-pulse">
                {unreadNotifs.length}
              </span>
            ) : (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-slate-300 ring-2 ring-white" />
            )}
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 mt-2.5 w-[390px] max-w-[94vw] bg-white/70 backdrop-blur-3xl backdrop-saturate-150 rounded-2xl shadow-[0_22px_55px_-10px_rgba(37,99,235,0.14),0_12px_28px_-6px_rgba(15,23,42,0.08),inset_0_1px_1px_0_rgba(255,255,255,0.95)] border border-white/90 ring-1 ring-slate-900/[0.07] overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
              {/* Dynamic Glass Refraction Orbs (Soft Pastel Colors for Light Glass Effect) */}
              <div className="pointer-events-none absolute -top-16 -right-16 w-48 h-48 bg-gradient-to-br from-blue-400/20 to-indigo-400/10 rounded-full blur-2xl" />
              <div className="pointer-events-none absolute -bottom-16 -left-16 w-48 h-48 bg-gradient-to-tr from-cyan-400/20 to-sky-300/15 rounded-full blur-2xl" />
              <div className="pointer-events-none absolute top-1/3 left-1/4 w-32 h-32 bg-violet-300/15 rounded-full blur-xl" />

              {/* Frosted Glass Header */}
              <div className="relative px-4 py-3 bg-white/50 backdrop-blur-md border-b border-slate-200/50 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-slate-800 tracking-tight flex items-center gap-1.5">
                    <Bell className="w-3.5 h-3.5 text-blue-600" />
                    <span>Notifications</span>
                  </span>
                  {unreadNotifs.length > 0 ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-600 border border-blue-200/80 shadow-2xs">
                      {unreadNotifs.length} new
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100/70 text-slate-500 border border-slate-200/50">
                      All caught up
                    </span>
                  )}
                </div>

                {unreadNotifs.length > 0 && (
                  <button
                    onClick={markAllNotificationsRead}
                    className="group text-[11px] font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-blue-50/70 transition-all cursor-pointer"
                  >
                    <CheckCheck className="w-3.5 h-3.5 transition-transform group-hover:scale-110" />
                    <span>Mark all read</span>
                  </button>
                )}
              </div>

              {/* Segmented Filter Control */}
              <div className="relative mx-3.5 my-2 p-1 bg-slate-200/40 backdrop-blur-md rounded-xl flex items-center gap-1 border border-white/70">
                <button
                  onClick={() => setNotifFilter('all')}
                  className={`flex-1 py-1 rounded-lg text-[11px] transition-all cursor-pointer text-center ${
                    notifFilter === 'all'
                      ? 'bg-white/95 text-blue-600 font-bold shadow-xs border border-white/90'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/40 font-medium'
                  }`}
                >
                  All ({userNotifications.length})
                </button>
                <button
                  onClick={() => setNotifFilter('unread')}
                  className={`flex-1 py-1 rounded-lg text-[11px] transition-all cursor-pointer text-center ${
                    notifFilter === 'unread'
                      ? 'bg-white/95 text-blue-600 font-bold shadow-xs border border-white/90'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/40 font-medium'
                  }`}
                >
                  Unread ({unreadNotifs.length})
                </button>
              </div>

              {/* Notification Items List */}
              <div className="relative max-h-[310px] overflow-y-auto divide-y divide-slate-100/60 glass-scroll">
                {displayedNotifs.length === 0 ? (
                  <div className="py-10 px-4 text-center">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-50 to-indigo-50 border border-blue-200/60 text-blue-500 flex items-center justify-center mx-auto mb-2.5 shadow-2xs">
                      <BellOff className="w-5 h-5 opacity-70" />
                    </div>
                    <p className="text-xs font-bold text-slate-800">
                      {notifFilter === 'unread' ? "You're all caught up!" : "No notifications yet"}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5 max-w-[220px] mx-auto leading-relaxed">
                      {notifFilter === 'unread' ? "No unread alerts in this workspace." : "Alerts and updates from your team will appear here."}
                    </p>
                  </div>
                ) : (
                  displayedNotifs.map((notif) => {
                    const isUnread = !(notif.read || notif.isRead);
                    return (
                      <div
                        key={notif.id}
                        onClick={() => {
                          markNotificationRead(notif.id);
                          if (notif.linkTaskId) navigateTo('task_details', notif.linkTaskId);
                          setIsNotifOpen(false);
                        }}
                        className={`p-3.5 text-xs cursor-pointer transition-all duration-150 relative group ${
                          isUnread
                            ? 'bg-blue-50/50 hover:bg-blue-50/80 border-l-[3px] border-blue-500'
                            : 'hover:bg-white/60 border-l-[3px] border-transparent'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <div className="flex items-center gap-1.5 min-w-0">
                            {isUnread && (
                              <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0 ring-4 ring-blue-100 shadow-2xs animate-pulse" />
                            )}
                            <span className={`truncate text-xs ${isUnread ? 'text-slate-900 font-bold' : 'text-slate-700 font-semibold'}`}>
                              {notif.title}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 shrink-0 font-mono flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5 opacity-70" />
                            <span>{notif.timestamp}</span>
                          </span>
                        </div>

                        <p className="text-slate-600 text-[11px] leading-relaxed pl-3.5 group-hover:text-slate-900 transition-colors line-clamp-2">
                          {notif.message}
                        </p>

                        <div className="flex items-center justify-between mt-2 pl-3.5 text-[10px]">
                          {(notif.reporterName || notif.reporter_name) ? (
                            <span className="text-slate-400">
                              From: <span className="font-semibold text-slate-700">{notif.reporterName || notif.reporter_name}</span>
                            </span>
                          ) : <span />}

                          {notif.linkTaskId && (
                            <span className="text-blue-600 font-semibold opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
                              <span>View Task</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Glass Footer */}
              <div className="relative p-2.5 bg-white/50 backdrop-blur-md border-t border-slate-200/50 flex items-center justify-center text-[11px]">
                <button
                  onClick={() => {
                    setIsNotifOpen(false);
                    navigateTo('notifications');
                  }}
                  className="w-full text-center py-1.5 px-3 font-semibold text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50/70 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-transparent hover:border-blue-100"
                >
                  <span>Open Notifications Center</span>
                  <ExternalLink className="w-3.5 h-3.5 text-blue-500" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Dropdown */}
        <div className="relative pl-1" ref={profileRef}>
          <button
            id="profile-menu"
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
              <div className="text-[10px] text-slate-400 leading-tight capitalize mt-0.5">{displayRoleName}</div>
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
