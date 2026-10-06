import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  INITIAL_USERS,
  INITIAL_PROJECTS,
  INITIAL_SPRINTS,
  INITIAL_TASKS,
  INITIAL_ISSUES,
  INITIAL_WORK_SESSIONS,
  INITIAL_NOTIFICATIONS,
  INITIAL_PERFORMANCE_REVIEWS
} from '../data/mockData';

const getDynamicApiUrl = () => {
  if (typeof window !== 'undefined' && window.location && window.location.hostname) {
    const host = window.location.hostname;
    if (host && host !== 'localhost' && host !== '127.0.0.1') {
      return `http://${host}:8080/api/v1`;
    }
  }
  return import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';
};

const DEFAULT_API_URL = getDynamicApiUrl();
let API_BASE_URL = DEFAULT_API_URL;
const AppContext = createContext();

// localStorage session helpers
const getStoredUser = () => {
  try {
    const u = localStorage.getItem('standupflow_user');
    return u ? JSON.parse(u) : null;
  } catch (e) {
    return null;
  }
};

const getStoredRole = () => {
  const role = localStorage.getItem('standupflow_role') || 'ENGINEER';
  if (role === 'MANAGER' || role === 'DEVELOPER') return 'ENGINEER';
  return role;
};
const getStoredAuth = () => localStorage.getItem('standupflow_auth') === 'true';
const getStoredView = (role) => {
  const saved = localStorage.getItem('standupflow_view');
  if (saved && saved !== 'login' && saved !== 'register') return saved;
  if (role === 'TESTER') return 'tester_workspace';
  return 'dashboard';
};

const getStoredInvitations = () => {
  try {
    const inv = localStorage.getItem('standupflow_invitations');
    return inv ? JSON.parse(inv) : [];
  } catch (e) {
    return [];
  }
};

const getStoredIssues = () => {
  try {
    const stored = localStorage.getItem('standupflow_issues');
    return stored ? JSON.parse(stored) : INITIAL_ISSUES;
  } catch (e) {
    return INITIAL_ISSUES;
  }
};

const getStoredChatMessages = () => {
  try {
    const stored = localStorage.getItem('standupflow_chat_messages');
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    return [];
  }
};

export const AppProvider = ({ children }) => {
  // Dynamic API Base URL from config.ini / config.json
  const [apiUrl, setApiUrl] = useState(DEFAULT_API_URL);

  // Authentication & Role State with localStorage persistence
  const [currentUser, setCurrentUser] = useState(getStoredUser);
  const [currentRole, setCurrentRole] = useState(getStoredRole);
  const [isAuthenticated, setIsAuthenticated] = useState(getStoredAuth);
  const [authError, setAuthError] = useState(null);

  // Fetch runtime config.json (generated from config.ini)
  useEffect(() => {
    const fetchRuntimeConfig = async () => {
      try {
        const res = await fetch('/config.json?t=' + Date.now());
        if (res.ok) {
          const cfg = await res.json();
          if (cfg.apiBaseUrl) {
            API_BASE_URL = cfg.apiBaseUrl;
            setApiUrl(cfg.apiBaseUrl);
          }
        }
      } catch (e) {
        // Fallback default
      }
    };
    fetchRuntimeConfig();
  }, []);

  // Entities State
  const [users, setUsers] = useState(INITIAL_USERS);
  const [projects, setProjects] = useState(INITIAL_PROJECTS);
  const [currentProject, setCurrentProject] = useState(null);
  const [sprints, setSprints] = useState(INITIAL_SPRINTS);
  const [currentSprint, setCurrentSprint] = useState(null);
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [issues, setIssues] = useState(getStoredIssues);
  const [workSessions, setWorkSessions] = useState(INITIAL_WORK_SESSIONS);
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [performanceReviews, setPerformanceReviews] = useState(INITIAL_PERFORMANCE_REVIEWS);
  const [chatMessages, setChatMessages] = useState(getStoredChatMessages);
  const [chatChannels, setChatChannels] = useState([]);
  const [rolesPermissions, setRolesPermissions] = useState([]);

  const fetchRolesPermissions = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/roles`);
      if (res.ok) {
        const data = await res.json();
        setRolesPermissions(data);
      }
    } catch (err) {
      console.error("Failed to fetch roles permissions", err);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchRolesPermissions();
    }
  }, [isAuthenticated]);

  const hasPermission = (menuKey) => {
    if (currentRole === 'ADMIN' || currentRole === 'ROOT' || currentRole === 1 || currentRole === '1' || currentUser?.rootadmin === 1) {
      return true;
    }
    const userRoleCode = currentUser?.roleCode || currentUser?.role;
    const roleObj = rolesPermissions.find(r => 
      String(r.roleCode) === String(userRoleCode) || 
      (r.roleName && currentUser?.role && r.roleName.toLowerCase().includes(String(currentUser.role).toLowerCase()))
    );

    if (!roleObj || !roleObj.permissionsJson) {
      return true;
    }

    try {
      const perms = JSON.parse(roleObj.permissionsJson);
      return Array.isArray(perms) ? perms.includes(menuKey) : true;
    } catch (e) {
      return true;
    }
  };

  // View & UI Navigation State
  const [currentView, setCurrentView] = useState(() => {
    const isAuth = getStoredAuth();
    if (!isAuth) return 'login';
    return getStoredView(getStoredRole());
  });
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [selectedIssueId, setSelectedIssueId] = useState(null);
  const [selectedSprintId, setSelectedSprintId] = useState(null);

  // Modals & Tour State
  const [isTaskDrawerOpen, setIsTaskDrawerOpen] = useState(false);
  const [isIssueDrawerOpen, setIsIssueDrawerOpen] = useState(false);
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false);
  const [isEditTaskModalOpen, setIsEditTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [isCreateSprintModalOpen, setIsCreateSprintModalOpen] = useState(false);
  const [isCreateProjectModalOpen, setIsCreateProjectModalOpen] = useState(false);
  const [isEditProjectModalOpen, setIsEditProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [isReportBugModalOpen, setIsReportBugModalOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const openEditTaskModal = (task) => {
    setEditingTask(task);
    setIsEditTaskModalOpen(true);
  };

  const openEditProjectModal = (proj) => {
    setEditingProject(proj);
    setIsEditProjectModalOpen(true);
  };

  // Sync state changes with localStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('standupflow_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('standupflow_user');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('standupflow_role', currentRole);
  }, [currentRole]);

  useEffect(() => {
    localStorage.setItem('standupflow_auth', isAuthenticated ? 'true' : 'false');
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated && currentView !== 'login' && currentView !== 'register') {
      localStorage.setItem('standupflow_view', currentView);
    }
  }, [currentView, isAuthenticated]);

  const getHeaders = (extra = {}) => {
    const headers = { 'Content-Type': 'application/json', ...extra };
    const companyId = localStorage.getItem('standupflow_company_id');
    if (companyId) {
      headers['X-Company-Id'] = companyId;
    }
    return headers;
  };

  const checkTenantDeleted = (res) => {
    if (res && (res.status === 401 || res.headers?.get('X-Tenant-Deleted') === 'true')) {
      setCurrentUser(null);
      setIsAuthenticated(false);
      setCurrentView('login');
      localStorage.removeItem('standupflow_user');
      localStorage.removeItem('standupflow_role');
      localStorage.removeItem('standupflow_auth');
      localStorage.removeItem('standupflow_view');
      localStorage.removeItem('standupflow_company_id');
      setAuthError('Your company workspace or database was deleted. You have been disconnected.');
      return true;
    }
    return false;
  };

  // Fetch initial and periodic data from Spring Boot REST API
  useEffect(() => {
    const fetchApiData = async () => {
      const activeUrl = apiUrl || API_BASE_URL;
      const headers = getHeaders();
      try {
        const [tasksRes, issuesRes, projectsRes, sprintsRes, usersRes, invRes, notifRes, chatMsgsRes, chatChanRes] = await Promise.all([
          fetch(`${activeUrl}/tasks`, { headers }),
          fetch(`${activeUrl}/issues`, { headers }),
          fetch(`${activeUrl}/projects`, { headers }),
          fetch(`${activeUrl}/sprints`, { headers }),
          fetch(`${activeUrl}/users`, { headers }),
          fetch(`${activeUrl}/invitations`, { headers }),
          fetch(`${activeUrl}/notifications`, { headers }),
          fetch(`${activeUrl}/chat/messages`, { headers }),
          fetch(`${activeUrl}/chat/channels`, { headers })
        ]);

        if (checkTenantDeleted(tasksRes) || checkTenantDeleted(usersRes) || checkTenantDeleted(projectsRes)) {
          return;
        }

        if (tasksRes.ok) {
          const tasksData = await tasksRes.json();
          if (tasksData && tasksData.length > 0) setTasks(tasksData);
        }
        if (issuesRes.ok) {
          const issuesData = await issuesRes.json();
          if (issuesData && Array.isArray(issuesData)) {
            setIssues(prev => {
              if (issuesData.length === 0) return prev;
              const map = new Map();
              prev.forEach(i => map.set(i.id, i));
              issuesData.forEach(i => map.set(i.id, i));
              return Array.from(map.values());
            });
          }
        }
        if (projectsRes.ok) {
          const projData = await projectsRes.json();
          if (projData && Array.isArray(projData) && projData.length > 0) {
            setProjects(projData);
            setCurrentProject(prev => {
              if (!prev) return null;
              const updated = projData.find(p => p.id === prev.id || String(p.id) === String(prev.id));
              return updated || prev;
            });
          }
        }
        if (sprintsRes.ok) {
          const sprData = await sprintsRes.json();
          if (sprData && Array.isArray(sprData)) setSprints(sprData);
        }
        if (usersRes.ok) {
          const usersData = await usersRes.json();
          if (usersData && usersData.length > 0) setUsers(usersData);
        }
        if (invRes && invRes.ok) {
          const invData = await invRes.json();
          if (invData && Array.isArray(invData)) setInvitations(invData);
        }
        if (notifRes && notifRes.ok) {
          const notifData = await notifRes.json();
          if (notifData && Array.isArray(notifData)) {
            setNotifications(prev => {
              const map = new Map();
              prev.forEach(n => map.set(n.id, n));
              notifData.forEach(n => map.set(n.id, n));
              return Array.from(map.values());
            });
          }
        }
        if (chatMsgsRes && chatMsgsRes.ok) {
          const msgsData = await chatMsgsRes.json();
          if (msgsData && Array.isArray(msgsData)) {
            const formattedMsgs = msgsData.map(m => ({
              ...m,
              isDeleted: Boolean(m.isDeleted || m.deleted)
            }));
            setChatMessages(formattedMsgs);
            try {
              localStorage.setItem('standupflow_chat_messages', JSON.stringify(formattedMsgs));
            } catch (e) {}
          }
        }
        if (chatChanRes && chatChanRes.ok) {
          const chanData = await chatChanRes.json();
          if (chanData && Array.isArray(chanData) && chanData.length > 0) setChatChannels(chanData);
        }
      } catch (err) {
        console.warn('SpringBoot backend connecting... using responsive local store fallback.', err);
      }
    };

    fetchApiData();
    const interval = setInterval(fetchApiData, 3000);
    return () => clearInterval(interval);
  }, [apiUrl]);

  // Login handler against MariaDB backend
  const login = async (email, password) => {
    setAuthError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();

      if (response.ok && data.success) {
        const user = data.user;
        const compId = data.companyId || user.companyId;
        if (compId) {
          localStorage.setItem('standupflow_company_id', compId);
        }
        setCurrentUser(user);
        setCurrentRole(user.role);
        setIsAuthenticated(true);

        // Strict role view assignment
        if (user.role === 'DEVELOPER') setCurrentView('developer_workspace');
        else if (user.role === 'TESTER') setCurrentView('tester_workspace');
        else setCurrentView('dashboard');

        // Check if first-time tour is required
        if (!user.hasCompletedTour) {
          setIsOnboardingOpen(true);
        }
        return true;
      } else {
        setAuthError(data.message || 'Invalid credentials');
        return false;
      }
    } catch (err) {
      // Fallback local authentication
      const user = users.find(u => u.email === email);
      if (user) {
        setCurrentUser(user);
        setCurrentRole(user.role);
        setIsAuthenticated(true);
        if (user.role === 'DEVELOPER') setCurrentView('developer_workspace');
        else if (user.role === 'TESTER') setCurrentView('tester_workspace');
        else setCurrentView('dashboard');
        if (!user.hasCompletedTour) setIsOnboardingOpen(true);
        return true;
      }
      setAuthError('Authentication failed. Check credentials.');
      return false;
    }
  };

  // Register handler against MariaDB backend
  const register = async (name, email, password, company, role, department) => {
    setAuthError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, company, role, department })
      });
      const data = await response.json();

      if (response.ok && data.success) {
        const user = data.user;
        const compId = data.companyId || user.companyId;
        if (compId) {
          localStorage.setItem('standupflow_company_id', compId);
        }
        setCurrentUser(user);
        setCurrentRole(user.role);
        setUsers(prev => [user, ...prev]);
        setIsAuthenticated(true);

        // Root / Manager admin gets full dashboard
        setCurrentView('dashboard');

        // Always show tutorial tour after first registration!
        setIsOnboardingOpen(true);
        return true;
      } else {
        setAuthError(data.message || 'Registration failed');
        return false;
      }
    } catch (err) {
      const compId = String(Math.floor(Math.random() * 89999999 + 10000000));
      localStorage.setItem('standupflow_company_id', compId);
      const newUser = {
        id: String(Date.now()),
        name,
        email,
        password,
        role: 'ADMIN',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=120&q=80',
        department: department || 'Engineering',
        workload: 'Balanced',
        assignedTasksCount: 0,
        completedTasksCount: 0,
        pendingReviewsCount: 0,
        loggedHoursThisWeek: 0,
        onTimeDeliveryRate: 100,
        reopenedBugsCount: 0,
        hasCompletedTour: false,
        companyId: compId
      };
      setUsers(prev => [newUser, ...prev]);
      setCurrentUser(newUser);
      setCurrentRole(newUser.role);
      setIsAuthenticated(true);
      setCurrentView('dashboard');
      setIsOnboardingOpen(true);
      return true;
    }
  };

  // Complete Onboarding Tour in MariaDB
  const completeTour = async () => {
    if (!currentUser) return;
    try {
      await fetch(`${API_BASE_URL}/auth/complete-tour/${currentUser.id}`, { method: 'POST' });
    } catch (e) {
      console.warn('Completed tour offline state.');
    }
    setCurrentUser(prev => ({ ...prev, hasCompletedTour: true }));
  };

  // Logout / Clear Session Storage
  const logout = () => {
    if (currentUser?.id) {
      const uId = currentUser.id;
      setUsers(prev => prev.map(u => u.id === uId ? { ...u, isOnline: false } : u));
      fetch(`${API_BASE_URL}/auth/logout/${uId}`, { method: 'POST' }).catch(() => {});
    }
    setCurrentUser(null);
    setIsAuthenticated(false);
    setCurrentView('login');
    localStorage.removeItem('standupflow_user');
    localStorage.removeItem('standupflow_role');
    localStorage.removeItem('standupflow_auth');
    localStorage.removeItem('standupflow_view');
    localStorage.removeItem('standupflow_company_id');
  };

  // Update Profile Info (Name, Email, Password, Department, Avatar)
  const updateUserProfile = async (profileData) => {
    if (!currentUser) return { success: false, message: 'No user active' };
    const updatedUser = { ...currentUser, ...profileData };

    try {
      const res = await fetch(`${API_BASE_URL}/users/${currentUser.id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(profileData)
      });
      if (checkTenantDeleted(res)) {
        return { success: false, message: 'Database deleted. Disconnecting...' };
      }
      if (res.ok) {
        const saved = await res.json();
        setCurrentUser(saved);
        setUsers(prev => prev.map(u => u.id === saved.id ? saved : u));
        return { success: true, user: saved };
      }
    } catch (e) {
      console.warn('Profile updated locally.');
    }
    setCurrentUser(updatedUser);
    setUsers(prev => prev.map(u => u.id === currentUser.id ? updatedUser : u));
    return { success: true, user: updatedUser };
  };

  // Join Team via Manager Code (For Developers and Testers)
  const joinTeamCode = async (managerCode) => {
    if (!currentUser) return { success: false, message: 'No user active' };
    const code = managerCode.trim().toUpperCase();
    const updatedUser = { ...currentUser, managerCode: code };
    setCurrentUser(updatedUser);
    setUsers(prev => prev.map(u => u.id === currentUser.id ? updatedUser : u));

    try {
      const res = await fetch(`${API_BASE_URL}/users/${currentUser.id}/join-team`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ managerCode: code })
      });
      if (res.ok) {
        const saved = await res.json();
        setCurrentUser(saved);
        setUsers(prev => prev.map(u => u.id === saved.id ? saved : u));
        return { success: true, user: saved };
      }
    } catch (e) {}
    return { success: true, user: updatedUser };
  };

  // Assign Team Member by Email (For Managers)
  const assignMemberByEmail = async (memberEmail) => {
    if (!currentUser || currentUser.role !== 'MANAGER' || !currentUser.managerCode) {
      return { success: false, message: 'Only Managers with active Manager Codes can assign members' };
    }
    const code = currentUser.managerCode;
    try {
      const res = await fetch(`${API_BASE_URL}/users/assign-member`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: memberEmail, managerCode: code })
      });
      if (res.ok) {
        const updatedMember = await res.json();
        setUsers(prev => prev.map(u => u.id === updatedMember.id ? updatedMember : u));
        return { success: true, member: updatedMember };
      } else {
        return { success: false, message: 'Member email not found' };
      }
    } catch (e) {
      setUsers(prev => prev.map(u => u.email === memberEmail ? { ...u, managerCode: code } : u));
      return { success: true };
    }
  };

  // Navigation Helper
  const navigateTo = (viewName, extraId = null) => {
    setCurrentView(viewName);
    if (viewName === 'task_details' && extraId) {
      setSelectedTaskId(extraId);
      setIsTaskDrawerOpen(true);
    } else if (viewName === 'issue_details' && extraId) {
      setSelectedIssueId(extraId);
      setIsIssueDrawerOpen(true);
    } else if (viewName === 'sprint_details' && extraId) {
      setSelectedSprintId(extraId);
    }
  };

  // Create Project REST Persist
  const createProject = async (projData) => {
    const projId = `PRJ-${Date.now()}`;
    const newProj = {
      id: projId,
      name: projData.name || 'New Project Workspace',
      code: projData.code || `PRJ-${Math.floor(Math.random() * 900 + 100)}`,
      description: projData.description || '',
      status: 'On Track',
      sprintCompletion: 0,
      totalTasks: 0,
      completedTasks: 0,
      openIssues: 0,
      overdueTasks: 0,
      lead: currentUser?.name || 'Manager',
      color: projData.color || '#2563eb'
    };

    try {
      await fetch(`${API_BASE_URL}/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProj)
      });
    } catch (e) {
      console.warn('Persisted project locally:', e);
    }

    setProjects(prev => [newProj, ...prev]);
    setCurrentProject(newProj);
    return newProj;
  };

  const updateProject = async (projId, updatedFields) => {
    let updatedProj = null;
    setProjects(prev => prev.map(p => {
      if (p.id === projId) {
        updatedProj = { ...p, ...updatedFields };
        return updatedProj;
      }
      return p;
    }));

    if (currentProject?.id === projId && updatedProj) {
      setCurrentProject(updatedProj);
    }

    if (updatedProj) {
      try {
        await fetch(`${API_BASE_URL}/projects/${projId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedProj)
        });
      } catch (e) {}
    }
  };

  const deleteProject = async (projId) => {
    const remainingProjects = projects.filter(p => p.id !== projId);
    setProjects(remainingProjects);

    if (currentProject?.id === projId) {
      if (remainingProjects.length > 0) {
        setCurrentProject(remainingProjects[0]);
      } else {
        setCurrentProject(null);
      }
    }

    try {
      await fetch(`${API_BASE_URL}/projects/${projId}`, {
        method: 'DELETE'
      });
    } catch (e) {}
  };

  // Helper to test if task is assigned to user
  const isTaskAssignedToUser = (task, user) => {
    if (!task || !user) return false;
    const uId = user.id ? String(user.id).trim() : '';
    const uName = user.name ? user.name.toLowerCase().trim() : '';
    const uEmail = user.email ? user.email.toLowerCase().trim() : '';

    if (task.assigneeIds && Array.isArray(task.assigneeIds)) {
      if (task.assigneeIds.map(String).includes(uId)) return true;
    }

    if (task.assigneeId) {
      const ids = String(task.assigneeId).split(',').map(s => s.trim());
      if (ids.includes(uId)) return true;
    }

    if (task.assigneeName && uName) {
      const names = String(task.assigneeName).split(',').map(s => s.toLowerCase().trim());
      if (names.some(n => n === uName || n.includes(uName))) return true;
    }

    if (task.assigneeEmail && uEmail) {
      const emails = String(task.assigneeEmail).split(',').map(s => s.toLowerCase().trim());
      if (emails.includes(uEmail)) return true;
    }

    return false;
  };

  // Notification management handlers
  const addNotification = (notifData) => {
    const newNotif = {
      id: `NOTIF-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      userId: notifData.userId || null,
      userEmail: notifData.userEmail ? notifData.userEmail.toLowerCase() : null,
      title: notifData.title || 'Notification',
      message: notifData.message || '',
      timestamp: 'Just now',
      read: false,
      linkTaskId: notifData.linkTaskId || null
    };
    setNotifications(prev => [newNotif, ...prev]);

    fetch(`${API_BASE_URL}/notifications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newNotif)
    }).catch(() => {});
  };

  const markNotificationRead = (notifId) => {
    setNotifications(prev => prev.map(n => n.id === notifId ? { ...n, read: true } : n));
    fetch(`${API_BASE_URL}/notifications/${notifId}/read`, {
      method: 'PUT'
    }).catch(() => {});
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    fetch(`${API_BASE_URL}/notifications/read-all`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userEmail: currentUser?.email, userId: currentUser?.id })
    }).catch(() => {});
  };

  // Create Task REST Persist
  const createTask = async (newTaskData) => {
    const taskId = `TASK-${Date.now()}`;
    const activeProject = currentProject || (projects.length > 0 ? projects[0] : null);
    const activeSprint = currentSprint || (sprints.length > 0 ? sprints[0] : null);

    // Resolve assigned user reliably using String comparison
    const assignedUser = users.find(u => String(u.id) === String(newTaskData.assigneeId)) || 
                         users.find(u => u.email === newTaskData.assigneeEmail) || 
                         currentUser;

    const task = {
      id: taskId,
      title: newTaskData.title || 'Untitled Task',
      description: newTaskData.description || '',
      status: newTaskData.status || 'Backlog',
      priority: newTaskData.priority || 'Medium',
      assigneeId: newTaskData.assigneeId || assignedUser?.id || currentUser?.id,
      assigneeName: newTaskData.assigneeName || assignedUser?.name || currentUser?.name || 'Unassigned',
      assigneeAvatar: newTaskData.assigneeAvatar || assignedUser?.avatar || currentUser?.avatar,
      reporterId: currentUser?.id,
      reporterName: currentUser?.name || 'Manager',
      sprintId: newTaskData.sprintId || activeSprint?.id || 'SPR-08',
      sprintName: sprints.find(s => String(s.id) === String(newTaskData.sprintId))?.name || activeSprint?.name || 'Sprint 08',
      projectId: newTaskData.projectId || activeProject?.id || 'PRJ-101',
      projectName: projects.find(p => String(p.id) === String(newTaskData.projectId))?.name || activeProject?.name || 'Core Platform',
      labels: newTaskData.labels || ['Feature'],
      storyPoints: parseInt(newTaskData.storyPoints) || 3,
      startDate: newTaskData.startDate || new Date().toISOString().split('T')[0],
      dueDate: newTaskData.dueDate || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      updatedAt: new Date().toISOString(),
      testingStatus: 'Pending Testing',
      testerId: currentUser?.id,
      testerName: currentUser?.name,
      hasIssue: false
    };

    // Trigger Notification to Assigned User(s)
    const targetAssigneeIds = newTaskData.assigneeIds && Array.isArray(newTaskData.assigneeIds)
      ? newTaskData.assigneeIds.map(String)
      : (task.assigneeId ? String(task.assigneeId).split(',').map(s => s.trim()) : []);

    targetAssigneeIds.forEach(uId => {
      const targetUser = users.find(u => String(u.id) === String(uId));
      if (targetUser && targetUser.id !== currentUser?.id) {
        addNotification({
          userId: targetUser.id,
          userEmail: targetUser.email,
          title: 'New Task Assigned',
          message: `${currentUser?.name || 'Manager'} assigned task "${task.title}" (${task.id}) to ${targetUser?.name || 'you'}.`,
          linkTaskId: task.id
        });
      }
    });

    try {
      await fetch(`${API_BASE_URL}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(task)
      });
    } catch (e) {
      console.warn('Persisted locally:', e);
    }

    setTasks(prev => [task, ...prev]);
    return task;
  };

  // Update Task Status REST Persist
  const updateTaskStatus = async (taskId, newStatus) => {
    setTasks(prev => prev.map(t => t.id === taskId ? {
      ...t,
      status: newStatus,
      updatedAt: new Date().toISOString()
    } : t));

    try {
      const targetTask = tasks.find(t => t.id === taskId);
      if (targetTask) {
        await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...targetTask, status: newStatus })
        });
      }
    } catch (e) {}
  };

  const updateTask = async (taskId, updatedFields) => {
    let updatedTask = null;
    const previousTask = tasks.find(t => t.id === taskId);

    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        updatedTask = { ...t, ...updatedFields, updatedAt: new Date().toISOString() };
        return updatedTask;
      }
      return t;
    }));

    if (updatedTask) {
      // Check newly assigned users and trigger notification
      const newAssigneeIds = updatedTask.assigneeIds && Array.isArray(updatedTask.assigneeIds)
        ? updatedTask.assigneeIds.map(String)
        : (updatedTask.assigneeId ? String(updatedTask.assigneeId).split(',').map(s => s.trim()) : []);

      const oldAssigneeIds = previousTask?.assigneeIds && Array.isArray(previousTask.assigneeIds)
        ? previousTask.assigneeIds.map(String)
        : (previousTask?.assigneeId ? String(previousTask.assigneeId).split(',').map(s => s.trim()) : []);

      newAssigneeIds.forEach(uId => {
        if (!oldAssigneeIds.includes(uId)) {
          const targetUser = users.find(u => String(u.id) === String(uId));
          if (targetUser && targetUser.id !== currentUser?.id) {
            addNotification({
              userId: targetUser.id,
              userEmail: targetUser.email,
              title: 'Task Assigned To You',
              message: `${currentUser?.name || 'Manager'} assigned task "${updatedTask.title}" (${updatedTask.id}) to ${targetUser?.name || 'you'}.`,
              linkTaskId: updatedTask.id
            });
          }
        }
      });

      try {
        const res = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedTask)
        });
        if (res.ok) {
          const saved = await res.json();
          setTasks(prev => prev.map(t => t.id === saved.id ? saved : t));
        }
      } catch (e) {
        console.warn('Backend updateTask error:', e);
      }
    }
  };

  const deleteTask = async (taskId) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
    try {
      await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
        method: 'DELETE'
      });
    } catch (e) {
      console.warn('Backend deleteTask error:', e);
    }
  };

  // Create Issue / Bug REST Persist
  const createIssue = async (bugData) => {
    const activeProject = currentProject || (projects.length > 0 ? projects[0] : null);
    const assignedUser = users.find(u => String(u.id) === String(bugData.assigneeId) || u.email === bugData.assigneeId);
    const linkedTask = tasks.find(t => String(t.id) === String(bugData.linkedTaskId));
    const bugId = `BUG-${200 + issues.length + 1}`;

    const newBug = {
      id: bugId,
      title: bugData.title,
      description: bugData.description || '',
      state: 'Pending',
      priority: bugData.priority || 'High',
      severity: bugData.severity || 'High',
      projectId: bugData.projectId || activeProject?.id || 'PRJ-101',
      projectName: bugData.projectName || activeProject?.name || 'Default Project',
      assigneeId: bugData.assigneeId || assignedUser?.id || 'USR-102',
      assigneeName: assignedUser?.name || bugData.assigneeName || 'Rahul Sharma',
      assigneeAvatar: assignedUser?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
      reporterId: currentUser?.id || 'USR-103',
      reporterName: currentUser?.name || 'Priya Verma',
      module: bugData.module || 'Auth API',
      linkedTaskId: bugData.linkedTaskId || '',
      linkedTaskTitle: linkedTask?.title || 'Task Item',
      startDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
      endDate: null,
      stepsToReproduce: bugData.stepsToReproduce || '',
      expectedResult: bugData.expectedResult || '',
      actualResult: bugData.actualResult || '',
      environment: bugData.environment || 'Staging / Chrome'
    };

    if (bugData.linkedTaskId) {
      updateTask(bugData.linkedTaskId, { hasIssue: true });
    }

    try {
      await fetch(`${API_BASE_URL}/issues`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBug)
      });
    } catch (e) {}

    setIssues(prev => {
      const nextIssues = [newBug, ...prev];
      try {
        localStorage.setItem('standupflow_issues', JSON.stringify(nextIssues));
      } catch (e) {}
      return nextIssues;
    });
    return newBug;
  };

  const sendChatMessage = async (msgData) => {
    const activeUrl = apiUrl || API_BASE_URL;
    const newMsg = {
      id: `MSG-${Date.now()}`,
      senderId: msgData.senderId || currentUser?.id || 'USR-101',
      senderName: msgData.senderName || currentUser?.name || 'Manager',
      senderAvatar: msgData.senderAvatar || currentUser?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=120&q=80',
      recipientId: msgData.recipientId || null,
      channelId: msgData.channelId || null,
      content: msgData.content || '',
      attachments: msgData.attachments || [],
      attachmentsJson: JSON.stringify(msgData.attachments || []),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isRead: false,
      isDeleted: false
    };

    setChatMessages(prev => {
      const nextMsgs = [...prev, newMsg];
      try {
        localStorage.setItem('standupflow_chat_messages', JSON.stringify(nextMsgs));
      } catch (e) {}
      return nextMsgs;
    });

    try {
      await fetch(`${activeUrl}/chat/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMsg)
      });
    } catch (e) {}

    return newMsg;
  };

  const deleteChatMessage = async (messageId) => {
    const activeUrl = apiUrl || API_BASE_URL;

    setChatMessages(prev => {
      const updated = prev.map(m => {
        if (String(m.id) === String(messageId)) {
          return {
            ...m,
            isDeleted: true,
            deleted: true,
            content: 'This message was deleted',
            attachments: [],
            attachmentsJson: null
          };
        }
        return m;
      });
      try {
        localStorage.setItem('standupflow_chat_messages', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    try {
      const res = await fetch(`${activeUrl}/chat/messages/${messageId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        const deletedMsg = await res.json();
        setChatMessages(prev => {
          const updated = prev.map(m => (m.id === deletedMsg.id || String(m.id) === String(messageId)) ? {
            ...m,
            ...deletedMsg,
            isDeleted: true,
            deleted: true
          } : m);
          try {
            localStorage.setItem('standupflow_chat_messages', JSON.stringify(updated));
          } catch (e) {}
          return updated;
        });
      }
    } catch (e) {
      console.warn('Delete message backend sync fallback:', e);
    }
  };

  const markChatAsRead = async (contactId) => {
    if (!currentUser || !contactId) return;

    setChatMessages(prev => {
      const updated = prev.map(msg => {
        if (String(msg.senderId) === String(contactId) && String(msg.recipientId) === String(currentUser.id)) {
          return { ...msg, isRead: true };
        }
        return msg;
      });
      try {
        localStorage.setItem('standupflow_chat_messages', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    try {
      await fetch(`${API_BASE_URL}/chat/messages/read?senderId=${encodeURIComponent(contactId)}&recipientId=${encodeURIComponent(currentUser.id)}`, {
        method: 'PUT'
      });
    } catch (e) {}
  };

  const createChatChannel = async (channelData) => {
    const newChannel = {
      id: `CH-${Date.now()}`,
      name: channelData.name.toLowerCase().replace(/\s+/g, '-'),
      type: 'GROUP',
      description: channelData.description || '',
      memberIds: channelData.memberIds || '',
      createdBy: currentUser?.id || 'USER',
      createdAt: new Date().toISOString()
    };

    setChatChannels(prev => [...prev, newChannel]);

    try {
      await fetch(`${API_BASE_URL}/chat/channels`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newChannel)
      });
    } catch (e) {}

    return newChannel;
  };

  const updateIssueState = (issueId, newState) => {
    setIssues(prev => prev.map(i => i.id === issueId ? { ...i, state: newState } : i));
  };

  const createSprint = async (sprintData) => {
    const activeProject = currentProject || (projects.length > 0 ? projects[0] : null);
    const sprintId = `SPR-${Date.now()}`;
    const newSprint = {
      id: sprintId,
      name: sprintData.name,
      projectId: sprintData.projectId || activeProject?.id || 'PRJ-101',
      projectName: activeProject?.name || 'Default Project',
      goal: sprintData.goal || '',
      startDate: sprintData.startDate,
      endDate: sprintData.endDate,
      status: 'Planning',
      totalTasks: 0,
      completedTasks: 0,
      storyPoints: 0,
      completedStoryPoints: 0
    };

    try {
      await fetch(`${API_BASE_URL}/sprints`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSprint)
      });
    } catch (e) {
      console.warn('Backend sprint save failed, fallback to local state:', e);
    }

    setSprints(prev => [...prev, newSprint]);
    if (!currentSprint) setCurrentSprint(newSprint);
    return newSprint;
  };

  // Team Invitations State & Persistence Handlers
  const [invitations, setInvitations] = useState(getStoredInvitations);

  // Sync invitations with localStorage
  useEffect(() => {
    try {
      localStorage.setItem('standupflow_invitations', JSON.stringify(invitations));
    } catch (e) {}
  }, [invitations]);

  // Fetch invitations from backend API
  useEffect(() => {
    if (!currentUser) return;
    const fetchUserInvitations = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/invitations`);
        if (res.ok) {
          const list = await res.json();
          if (Array.isArray(list) && list.length > 0) {
            setInvitations(prev => {
              const map = new Map();
              prev.forEach(i => map.set(i.id, i));
              list.forEach(i => map.set(i.id, i));
              return Array.from(map.values());
            });
          }
        }
      } catch (e) {}
    };
    fetchUserInvitations();
  }, [currentUser, apiUrl]);

  // Send Team Invitation (Project scoped)
  const sendInvitation = async (inviteeEmail, targetProjectId = null) => {
    if (!currentUser) {
      return { success: false, message: 'Must be logged in to send team invitations' };
    }
    const targetProj = projects.find(p => p.id === targetProjectId) || currentProject;
    const invCode = targetProj?.inviteCode || currentUser?.managerCode || 'PRJ-101-CODE';
    const email = inviteeEmail.trim().toLowerCase();

    const payload = {
      managerId: currentUser.id,
      managerName: currentUser.name,
      managerCode: invCode,
      projectId: targetProj?.id,
      inviteeEmail: email
    };

    try {
      const res = await fetch(`${API_BASE_URL}/invitations/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const savedInv = await res.json();
        setInvitations(prev => [savedInv, ...prev.filter(i => i.id !== savedInv.id)]);
        return { success: true, invitation: savedInv };
      }
    } catch (e) {}

    const localInv = {
      id: `INV-${Date.now()}`,
      managerId: currentUser.id,
      managerName: currentUser.name,
      managerCode: invCode,
      projectId: targetProj?.id,
      inviteeEmail: email,
      status: 'PENDING',
      createdAt: new Date().toISOString()
    };
    setInvitations(prev => [localInv, ...prev.filter(i => i.id !== localInv.id)]);
    return { success: true, invitation: localInv };
  };

  // Remove Member from Project Workspace
  const removeMemberFromProject = async (projectId, userId) => {
    const activeUrl = apiUrl || API_BASE_URL;

    setProjects(prev => prev.map(p => {
      if (p.id === projectId || String(p.id) === String(projectId)) {
        let updatedMemberIds = typeof p.memberIds === 'string'
          ? p.memberIds.split(',').map(s => s.trim()).filter(Boolean)
          : (p.memberIds || []);
        updatedMemberIds = updatedMemberIds.filter(id => id !== userId);

        const targetUser = users.find(u => u.id === userId);
        let updatedMemberEmails = typeof p.memberEmails === 'string'
          ? p.memberEmails.split(',').map(s => s.trim()).filter(Boolean)
          : (p.memberEmails || []);
        if (targetUser) {
          updatedMemberEmails = updatedMemberEmails.filter(e => e.toLowerCase() !== targetUser.email?.toLowerCase());
        }

        const updated = {
          ...p,
          memberIds: Array.isArray(p.memberIds) ? updatedMemberIds : updatedMemberIds.join(','),
          memberEmails: Array.isArray(p.memberEmails) ? updatedMemberEmails : updatedMemberEmails.join(',')
        };
        if (currentProject?.id === p.id) setCurrentProject(updated);

        fetch(`${activeUrl}/projects/${p.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updated)
        }).catch(() => {});

        return updated;
      }
      return p;
    }));
  };

  // Accept Team Invitation (Developer / Tester)
  const acceptInvitation = async (invitationId) => {
    if (!currentUser) return { success: false };
    const targetInv = invitations.find(i => i.id === invitationId);
    
    try {
      await fetch(`${API_BASE_URL}/invitations/${invitationId}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: currentUser.email })
      });
    } catch (e) {}

    if (targetInv) {
      const code = targetInv.managerCode;
      const projId = targetInv.projectId;
      const updatedUser = { ...currentUser, managerCode: code };
      setCurrentUser(updatedUser);
      setUsers(prev => prev.map(u => u.id === currentUser.id ? updatedUser : u));

      // Find matching project in ALL projects and add user to project member list UPON ACCEPTANCE
      const targetProj = projects.find(p => 
        p.id === projId || 
        String(p.id) === String(projId) || 
        p.inviteCode === code || 
        p.code === code || 
        p.leadId === targetInv.managerId
      );
      if (targetProj) {
        let emails = typeof targetProj.memberEmails === 'string'
          ? targetProj.memberEmails.split(',').map(s => s.trim()).filter(Boolean)
          : (targetProj.memberEmails || []);
        if (currentUser.email && !emails.map(e => e.toLowerCase()).includes(currentUser.email.toLowerCase())) {
          emails.push(currentUser.email.toLowerCase());
        }

        let ids = typeof targetProj.memberIds === 'string'
          ? targetProj.memberIds.split(',').map(s => s.trim()).filter(Boolean)
          : (targetProj.memberIds || []);
        if (currentUser.id && !ids.includes(currentUser.id)) {
          ids.push(currentUser.id);
        }

        const updatedProj = {
          ...targetProj,
          memberEmails: emails.join(','),
          memberIds: ids.join(',')
        };

        setProjects(prev => prev.map(p => p.id === targetProj.id ? updatedProj : p));
        setCurrentProject(updatedProj);

        fetch(`${API_BASE_URL}/projects/${targetProj.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedProj)
        }).catch(() => {});
      }

      setInvitations(prev => prev.map(i => i.id === invitationId ? { ...i, status: 'ACCEPTED' } : i));
      return { success: true, managerCode: code };
    }
    return { success: false };
  };

  // Helper to reliably compute team members for any project
  const getProjectMembers = (targetProj = currentProject) => {
    if (!targetProj) return [];

    let mEmails = [];
    if (Array.isArray(targetProj.memberEmails)) {
      mEmails = targetProj.memberEmails.map(e => String(e).toLowerCase().trim());
    } else if (typeof targetProj.memberEmails === 'string') {
      mEmails = targetProj.memberEmails.split(',').map(e => e.toLowerCase().trim()).filter(Boolean);
    }

    let mIds = [];
    if (Array.isArray(targetProj.memberIds)) {
      mIds = targetProj.memberIds.map(id => String(id).trim());
    } else if (typeof targetProj.memberIds === 'string') {
      mIds = targetProj.memberIds.split(',').map(id => id.trim()).filter(Boolean);
    }

    return users.filter(u => {
      if (!u) return false;
      const uEmail = u.email ? u.email.toLowerCase().trim() : '';
      const uId = u.id ? String(u.id).trim() : '';

      // Lead or Owner
      if (uId && (uId === String(targetProj.leadId) || u.name === targetProj.lead)) return true;
      if (targetProj.ownerEmail && uEmail === targetProj.ownerEmail.toLowerCase().trim()) return true;

      // Listed in memberEmails or memberIds
      if (uEmail && mEmails.includes(uEmail)) return true;
      if (uId && mIds.includes(uId)) return true;

      // Manager code / invite code matching
      if (u.managerCode && (u.managerCode === targetProj.inviteCode || u.managerCode === targetProj.code)) return true;

      // Accepted invitation
      const hasAccepted = (invitations || []).some(inv => 
        inv.status === 'ACCEPTED' && 
        inv.inviteeEmail?.toLowerCase().trim() === uEmail &&
        (
          inv.projectId === targetProj.id || 
          String(inv.projectId) === String(targetProj.id) ||
          (targetProj.inviteCode && inv.managerCode === targetProj.inviteCode) ||
          (targetProj.code && inv.managerCode === targetProj.code)
        )
      );

      return hasAccepted;
    });
  };

  // Decline Team Invitation
  const declineInvitation = async (invitationId) => {
    const inv = invitations.find(i => i.id === invitationId);
    try {
      await fetch(`${API_BASE_URL}/invitations/${invitationId}/decline`, { method: 'POST' });
    } catch (e) {}
    setInvitations(prev => prev.map(i => i.id === invitationId ? { ...i, status: 'DECLINED' } : i));
    if (inv) {
      setProjects(prev => prev.map(p => {
        if (p.id === inv.projectId || p.name === inv.projectName) {
          return {
            ...p,
            memberEmails: (p.memberEmails || []).filter(e => e?.toLowerCase() !== currentUser?.email?.toLowerCase() && e?.toLowerCase() !== inv.inviteeEmail?.toLowerCase()),
            memberIds: (p.memberIds || []).filter(id => id !== currentUser?.id)
          };
        }
        return p;
      }));
    }
    return { success: true };
  };

  // Filter projects strictly available to currentUser
  const userProjects = projects.filter(p => {
    if (!currentUser) return true;
    if (p.leadId === currentUser.id || p.lead === currentUser.name) return true;
    if (p.ownerEmail && currentUser.email && p.ownerEmail.toLowerCase() === currentUser.email.toLowerCase()) return true;

    let mIds = [];
    if (Array.isArray(p.memberIds)) mIds = p.memberIds.map(String);
    else if (typeof p.memberIds === 'string') mIds = p.memberIds.split(',').map(s => s.trim()).filter(Boolean);
    if (currentUser.id && mIds.includes(String(currentUser.id))) return true;

    let mEmails = [];
    if (Array.isArray(p.memberEmails)) mEmails = p.memberEmails.map(e => String(e).toLowerCase().trim());
    else if (typeof p.memberEmails === 'string') mEmails = p.memberEmails.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
    if (currentUser.email && mEmails.includes(currentUser.email.toLowerCase().trim())) return true;

    // Check if user's managerCode matches project inviteCode or code
    if (currentUser.managerCode && (currentUser.managerCode === p.inviteCode || currentUser.managerCode === p.code)) return true;

    // Check if user has an accepted invitation for this project
    const hasAccepted = (invitations || []).some(inv => 
      inv.status === 'ACCEPTED' && 
      (inv.projectId === p.id || String(inv.projectId) === String(p.id) || inv.managerCode === p.inviteCode || inv.managerCode === p.code) &&
      inv.inviteeEmail?.toLowerCase() === currentUser.email?.toLowerCase()
    );

    return hasAccepted;
  });

  // Synchronize currentProject strictly with userProjects
  useEffect(() => {
    if (userProjects && userProjects.length > 0) {
      if (!currentProject || !userProjects.some(p => p.id === currentProject.id)) {
        setCurrentProject(userProjects[0]);
      }
    } else {
      if (currentProject !== null) {
        setCurrentProject(null);
      }
    }
  }, [currentUser, projects]);

  const selectedTask = tasks.find(t => t.id === selectedTaskId) || tasks[0];
  const selectedIssue = issues.find(i => i.id === selectedIssueId) || issues[0];
  const selectedSprint = sprints.find(s => s.id === selectedSprintId) || sprints[0];

  return (
    <AppContext.Provider
      value={{
        users,
        currentUser,
        currentRole,
        isAuthenticated,
        authError,
        projects: userProjects,
        currentProject,
        getProjectMembers,
        isTaskAssignedToUser,
        addNotification,
        markNotificationRead,
        markAllNotificationsRead,
        sprints,
        currentSprint,
        tasks,
        issues,
        workSessions,
        notifications,
        performanceReviews,
        invitations,
        currentView,
        selectedTaskId,
        selectedIssueId,
        selectedSprintId,
        selectedTask,
        selectedIssue,
        selectedSprint,
        isTaskDrawerOpen,
        isIssueDrawerOpen,
        isCreateTaskModalOpen,
        isEditTaskModalOpen,
        editingTask,
        isCreateSprintModalOpen,
        isCreateProjectModalOpen,
        isReportBugModalOpen,
        isOnboardingOpen,
        searchQuery,
        sidebarCollapsed,
        rolesPermissions,
        fetchRolesPermissions,
        hasPermission,
        API_BASE_URL,
        // Setters
        setCurrentProject,
        setCurrentSprint,
        setIsTaskDrawerOpen,
        setIsIssueDrawerOpen,
        setIsCreateTaskModalOpen,
        setIsEditTaskModalOpen,
        setEditingTask,
        setIsCreateSprintModalOpen,
        setIsCreateProjectModalOpen,
        setIsReportBugModalOpen,
        setIsOnboardingOpen,
        setSearchQuery,
        setSidebarCollapsed,
        setIsAuthenticated,
        setSelectedTaskId,
        setSelectedIssueId,
        setSelectedSprintId,
        // Handlers
        login,
        register,
        logout,
        completeTour,
        updateUserProfile,
        joinTeamCode,
        assignMemberByEmail,
        sendInvitation,
        acceptInvitation,
        declineInvitation,
        removeMemberFromProject,
        navigateTo,
        createTask,
        updateTask,
        updateTaskStatus,
        deleteTask,
        openEditTaskModal,
        openEditProjectModal,
        createIssue,
        updateIssueState,
        createSprint,
        createProject,
        updateProject,
        deleteProject,
        isEditProjectModalOpen,
        setIsEditProjectModalOpen,
        editingProject,
        setEditingProject,
        // Team Chat & Docs
        chatMessages,
        chatChannels,
        sendChatMessage,
        deleteChatMessage,
        createChatChannel,
        markChatAsRead
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
