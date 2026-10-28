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

const resolveApiUrl = (configuredUrl) => {
  if (typeof window !== 'undefined' && window.location && window.location.hostname) {
    const host = window.location.hostname;
    const protocol = window.location.protocol || 'http:';
    if (host && host !== 'localhost' && host !== '127.0.0.1') {
      if (!configuredUrl || configuredUrl.includes('localhost') || configuredUrl.includes('127.0.0.1')) {
        try {
          const parsed = new URL(configuredUrl || 'http://localhost:8080/api/v1');
          parsed.hostname = host;
          parsed.protocol = protocol;
          return parsed.toString().replace(/\/$/, '');
        } catch (e) {
          return `${protocol}//${host}:8080/api/v1`;
        }
      }
    }
  }
  return configuredUrl || import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';
};

const getDynamicApiUrl = () => {
  return resolveApiUrl(import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1');
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
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    return [];
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
            const resolved = resolveApiUrl(cfg.apiBaseUrl);
            API_BASE_URL = resolved;
            setApiUrl(resolved);
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

  const getStoredRequirements = () => {
    try {
      const stored = localStorage.getItem('standupflow_requirements');
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return [];
  };

  const [requirements, setRequirements] = useState(getStoredRequirements);

  useEffect(() => {
    try {
      localStorage.setItem('standupflow_requirements', JSON.stringify(requirements));
    } catch (e) {}
  }, [requirements]);

  const fetchRolesPermissions = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/roles`, { headers: getHeaders() });
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
    // Primary Root Administrator (rootadmin === 1) gets full unrestricted bypass
    if (Boolean(currentUser?.rootadmin === 1 || String(currentUser?.rootadmin) === '1')) {
      return true;
    }

    const userRoleCode = currentUser?.roleCode !== undefined && currentUser?.roleCode !== null
      ? Number(currentUser.roleCode)
      : (currentUser?.role === 'ADMIN' || currentUser?.role === 1 ? 1 : Number(currentUser?.role || 1));

    const roleObj = rolesPermissions.find(r =>
      Number(r.roleCode) === userRoleCode ||
      (r.roleName && currentUser?.role && String(r.roleName).toLowerCase() === String(currentUser.role).toLowerCase())
    );

    // Editor role has all access like manager or root admin: everything features allowed
    const roleNameLower = String(roleObj?.roleName || currentUser?.role || '').toLowerCase();
    if (roleNameLower.includes('editor')) {
      return true;
    }

    if (!roleObj || !roleObj.permissionsJson) {
      if (menuKey === 'header_create_actions' || menuKey === 'header_actions') {
        return false;
      }
      if (menuKey === 'new_requirements') {
        return true;
      }
      if (userRoleCode > 4) {
        return menuKey === 'dashboard';
      }
      if (menuKey === 'user_accounts' || menuKey === 'user_roles') {
        return false;
      }
      return true;
    }

    try {
      const perms = JSON.parse(roleObj.permissionsJson);
      if (Array.isArray(perms)) {
        if (menuKey === 'new_requirements' && !perms.includes('new_requirements')) {
          // If role doesn't explicitly restrict new_requirements, allow by default
          return true;
        }
        return perms.includes(menuKey);
      }
      return false;
    } catch (e) {
      return menuKey === 'dashboard';
    }
  };

  const getUserRoleName = (userToLookup = currentUser) => {
    if (!userToLookup) return 'User';

    let roleInput = null;
    let isRoot = false;

    if (typeof userToLookup === 'object') {
      isRoot = Boolean(userToLookup.rootadmin === 1 || String(userToLookup.rootadmin) === '1');
      if (isRoot) return 'Company Administrator (Root)';

      if (userToLookup.roleName && typeof userToLookup.roleName === 'string' && !userToLookup.roleName.startsWith('Role ')) {
        return userToLookup.roleName;
      }

      roleInput = userToLookup.roleCode !== undefined && userToLookup.roleCode !== null
        ? userToLookup.roleCode
        : userToLookup.role;
    } else {
      roleInput = userToLookup;
    }

    const codeNum = Number(roleInput);

    if (rolesPermissions && Array.isArray(rolesPermissions)) {
      const found = rolesPermissions.find(r =>
        Number(r.roleCode) === codeNum ||
        (r.roleName && String(roleInput).toLowerCase() === String(r.roleName).toLowerCase())
      );
      if (found && found.roleName) {
        return found.roleName;
      }
    }

    if (codeNum === 1 || String(roleInput).toUpperCase() === 'ADMIN' || String(roleInput).toUpperCase() === 'ROOT') {
      return isRoot ? 'Company Administrator (Root)' : 'Company Administrator';
    }
    if (codeNum === 2 || String(roleInput).toUpperCase() === 'MANAGER') return 'Engineering Manager';
    if (codeNum === 3 || String(roleInput).toUpperCase() === 'DEVELOPER' || String(roleInput).toUpperCase() === 'ENGINEER') return 'Software Engineer';
    if (codeNum === 4 || String(roleInput).toUpperCase() === 'TESTER' || String(roleInput).toUpperCase() === 'QA') return 'QA / Tester';

    if (typeof roleInput === 'string' && isNaN(codeNum) && roleInput.trim()) {
      return roleInput.trim();
    }

    return codeNum > 4 ? `Custom Role (${codeNum})` : 'User';
  };

  const canUserManageProjects = (userToLookup = currentUser) => {
    if (!userToLookup) return false;
    if (Boolean(userToLookup.rootadmin === 1 || String(userToLookup.rootadmin) === '1')) {
      return true;
    }
    const rCode = Number(
      userToLookup.roleCode !== undefined && userToLookup.roleCode !== null
        ? userToLookup.roleCode
        : (userToLookup.role === 'ADMIN' ? 1 : userToLookup.role)
    );
    if (rCode === 1 || rCode === 2) {
      return true;
    }
    const rName = String(userToLookup.roleName || userToLookup.role || getUserRoleName(userToLookup) || '').toLowerCase();
    if (rName.includes('admin') || rName.includes('manager') || rName.includes('editor')) {
      return true;
    }
    return false;
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
    if (task) {
      if (task.id) setSelectedTaskId(task.id);
      setEditingTask(task);
      setIsTaskDrawerOpen(true);
    }
  };

  const openEditProjectModal = (proj) => {
    setEditingProject(proj);
    setIsEditProjectModalOpen(true);
  };

  const [isSendToTestingModalOpen, setIsSendToTestingModalOpen] = useState(false);
  const [testingTargetTask, setTestingTargetTask] = useState(null);

  const openSendToTestingModal = (task) => {
    setTestingTargetTask(task);
    setIsSendToTestingModalOpen(true);
  };

  // Sync state changes with localStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('standupflow_user', JSON.stringify(currentUser));
      if (currentUser.companyId) {
        localStorage.setItem('standupflow_company_id', currentUser.companyId);
      }
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
    const companyId = currentUser?.companyId || currentUser?.company_id || localStorage.getItem('standupflow_company_id');
    if (companyId) {
      headers['X-Company-Id'] = String(companyId);
    }
    if (currentUser?.id) {
      headers['X-User-Id'] = String(currentUser.id);
    }
    const uEmail = currentUser?.email || currentUser?.emailid;
    if (uEmail) {
      headers['X-User-Email'] = String(uEmail);
    }
    const uName = currentUser?.name || currentUser?.fullname;
    if (uName) {
      headers['X-User-Name'] = String(uName);
    }
    const roleCode = currentUser?.roleCode !== undefined ? currentUser.roleCode : currentUser?.role;
    if (roleCode !== undefined && roleCode !== null) {
      headers['X-User-Role'] = String(roleCode);
    }
    if (currentUser?.rootadmin !== undefined) {
      headers['X-User-Rootadmin'] = String(currentUser.rootadmin);
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

  const fetchApiData = async () => {
    const activeUrl = apiUrl || API_BASE_URL;
    const headers = getHeaders();
    try {
      const [tasksRes, issuesRes, projectsRes, sprintsRes, usersRes, invRes, notifRes, chatMsgsRes, chatChanRes, reqsRes] = await Promise.all([
        fetch(`${activeUrl}/tasks`, { headers }),
        fetch(`${activeUrl}/issues`, { headers }),
        fetch(`${activeUrl}/projects`, { headers }),
        fetch(`${activeUrl}/sprints`, { headers }),
        fetch(`${activeUrl}/users`, { headers }),
        fetch(`${activeUrl}/invitations`, { headers }),
        fetch(`${activeUrl}/notifications`, { headers }),
        fetch(`${activeUrl}/chat/messages`, { headers }),
        fetch(`${activeUrl}/chat/channels`, { headers }),
        fetch(`${activeUrl}/requirements`, { headers }).catch(() => ({ ok: false }))
      ]);

      if (checkTenantDeleted(tasksRes) || checkTenantDeleted(usersRes) || checkTenantDeleted(projectsRes)) {
        return;
      }

      if (reqsRes && reqsRes.ok) {
        const reqsData = await reqsRes.json();
        if (Array.isArray(reqsData)) {
          const parsed = reqsData.map(r => {
            let atts = [];
            if (r.attachmentsJson) {
              try {
                atts = JSON.parse(r.attachmentsJson);
              } catch (e) {}
            } else if (Array.isArray(r.attachments)) {
              atts = r.attachments;
            }
            return { ...r, attachments: atts };
          });
          setRequirements(parsed);
        }
      }

      if (tasksRes.ok) {
        const tasksData = await tasksRes.json();
        if (Array.isArray(tasksData)) {
          const parsedTasks = tasksData.map(t => {
            let atts = [];
            if (t.attachmentsJson) {
              try { atts = JSON.parse(t.attachmentsJson); } catch (e) {}
            } else if (Array.isArray(t.attachments)) {
              atts = t.attachments;
            }
            let subs = [];
            if (t.subtasksJson) {
              try { subs = JSON.parse(t.subtasksJson); } catch (e) {}
            } else if (Array.isArray(t.subtasks)) {
              subs = t.subtasks;
            }
            return { ...t, attachments: atts, subtasks: subs };
          });
          setTasks(parsedTasks);
        }
      }
      if (issuesRes.ok) {
        const issuesData = await issuesRes.json();
        if (Array.isArray(issuesData)) {
          setIssues(issuesData);
        }
      }
      if (projectsRes.ok) {
        const projData = await projectsRes.json();
        if (Array.isArray(projData)) {
          setProjects(projData);
          if (projData.length === 0) {
            setCurrentProject(null);
            const canManage = canUserManageProjects(currentUser);
            if (canManage) {
              setCurrentView(prev => (prev === 'login' || prev === 'register' ? prev : 'project_health'));
            } else {
              setCurrentView(prev => (prev === 'login' || prev === 'register' ? prev : 'dashboard'));
            }
          } else {
            setCurrentProject(prev => {
              if (!prev) return projData[0] || null;
              const updated = projData.find(p => p.id === prev.id || String(p.id) === String(prev.id));
              return updated || projData[0] || null;
            });
          }
        }
      }
      if (sprintsRes.ok) {
        const sprData = await sprintsRes.json();
        if (sprData && Array.isArray(sprData)) setSprints(sprData);
      }
      if (usersRes.ok) {
        const usersData = await usersRes.json();
        if (usersData && Array.isArray(usersData)) setUsers(usersData);
      }
      if (invRes && invRes.ok) {
        const invData = await invRes.json();
        if (invData && Array.isArray(invData)) setInvitations(invData);
      }
      if (notifRes && notifRes.ok) {
        const notifData = await notifRes.json();
        if (Array.isArray(notifData)) {
          setNotifications(notifData);
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
          } catch (e) { }
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

  // Fetch initial and periodic data from Spring Boot REST API
  useEffect(() => {
    fetchApiData();
    const interval = setInterval(fetchApiData, 3000);
    return () => clearInterval(interval);
  }, [apiUrl, currentUser]);

  // Login handler against MariaDB backend with 3 inputs: companyIdentifier (companyId or admin email), username, and password
  const login = async (companyIdentifier, username, password) => {
    setAuthError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyIdentifier, username, password })
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
        fetchRolesPermissions();

        // Check actual backend projects for this user/company to determine initial post-login view
        let currentProjects = [];
        try {
          const activeUrl = apiUrl || API_BASE_URL;
          const loginHeaders = {
            'Content-Type': 'application/json',
            'X-Company-Id': String(compId || ''),
            'X-User-Id': String(user.id || ''),
            'X-User-Email': String(user.email || user.emailid || ''),
            'X-User-Name': String(user.name || user.fullname || ''),
            'X-User-Role': String(user.roleCode !== undefined ? user.roleCode : user.role || ''),
            'X-User-Rootadmin': String(user.rootadmin !== undefined ? user.rootadmin : '')
          };
          const pRes = await fetch(`${activeUrl}/projects`, { headers: loginHeaders });
          if (pRes.ok) {
            const pData = await pRes.json();
            if (Array.isArray(pData)) {
              currentProjects = pData;
              setProjects(pData);
              if (pData.length > 0) {
                setCurrentProject(pData[0]);
              }
            }
          }
        } catch (e) {
          currentProjects = projects || [];
        }

        const canManage = canUserManageProjects(user);

        // If no projects exist yet, initial view after login is the project creation page
        if (!currentProjects || currentProjects.length === 0) {
          if (canManage) {
            setCurrentView('project_health');
          } else {
            setCurrentView('dashboard');
          }
          setIsOnboardingOpen(false);
        } else {
          // If project already created, open on Home page (dashboard)
          if (user.role === 'DEVELOPER') setCurrentView('developer_workspace');
          else if (user.role === 'TESTER') setCurrentView('tester_workspace');
          else setCurrentView('dashboard');

          // Check if first-time tour is required
          if (!user.hasCompletedTour) {
            setIsOnboardingOpen(true);
          }
        }
        return true;
      } else {
        setAuthError(data.message || 'Invalid credentials');
        return false;
      }
    } catch (err) {
      // Fallback local authentication
      const user = users.find(u => u.username === username || u.email === username);
      if (user && user.password === password) {
        setCurrentUser(user);
        setCurrentRole(user.role);
        setIsAuthenticated(true);
        if (!projects || projects.length === 0) {
          const canManage = canUserManageProjects(user);
          if (canManage) {
            setCurrentView('project_health');
          } else {
            setCurrentView('dashboard');
          }
          setIsOnboardingOpen(false);
        } else {
          if (user.role === 'DEVELOPER') setCurrentView('developer_workspace');
          else if (user.role === 'TESTER') setCurrentView('tester_workspace');
          else setCurrentView('dashboard');
          if (!user.hasCompletedTour) setIsOnboardingOpen(true);
        }
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
        setUsers([user]);
        setTasks([]);
        setSprints([]);
        setProjects([]);
        setIssues([]);
        setRequirements([]);
        setNotifications([]);
        setCurrentProject(null);
        setCurrentSprint(null);
        localStorage.removeItem('standupflow_requirements');
        localStorage.removeItem('standupflow_issues');
        setIsAuthenticated(true);

        // Project creation required first before console tour starts
        setCurrentView('project_health');
        setIsOnboardingOpen(false);
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
      setUsers([newUser]);
      setTasks([]);
      setSprints([]);
      setProjects([]);
      setIssues([]);
      setRequirements([]);
      setNotifications([]);
      setCurrentProject(null);
      setCurrentSprint(null);
      localStorage.removeItem('standupflow_requirements');
      localStorage.removeItem('standupflow_issues');
      setCurrentUser(newUser);
      setCurrentRole(newUser.role);
      setIsAuthenticated(true);
      setCurrentView('project_health');
      setIsOnboardingOpen(false);
      return true;
    }
  };

  // Complete Onboarding Tour in MariaDB — persists has_completed_tour = true in tblUser_details
  const completeTour = async () => {
    if (!currentUser) return;
    // Always update local state immediately so tour won't reopen within this session
    setCurrentUser(prev => ({ ...prev, hasCompletedTour: true }));
    try {
      // X-Company-Id header required by TenantInterceptor to route to the correct tenant DB
      await fetch(`${API_BASE_URL}/auth/complete-tour/${currentUser.id}`, {
        method: 'POST',
        headers: getHeaders()
      });
    } catch (e) {
      console.warn('[completeTour] Could not persist to DB, will retry on next tour dismiss.');
    }
  };

  // Logout / Clear Session Storage
  const logout = () => {
    if (currentUser?.id) {
      const uId = currentUser.id;
      setUsers(prev => prev.map(u => u.id === uId ? { ...u, isOnline: false } : u));
      fetch(`${API_BASE_URL}/auth/logout/${uId}`, { method: 'POST' }).catch(() => { });
    }
    setCurrentUser(null);
    setIsAuthenticated(false);
    setCurrentView('login');
    setNotifications([]);
    setTasks([]);
    setSprints([]);
    setProjects([]);
    setIssues([]);
    setRequirements([]);
    setInvitations([]);
    setCurrentProject(null);
    setCurrentSprint(null);
    localStorage.removeItem('standupflow_user');
    localStorage.removeItem('standupflow_role');
    localStorage.removeItem('standupflow_auth');
    localStorage.removeItem('standupflow_view');
    localStorage.removeItem('standupflow_company_id');
    localStorage.removeItem('standupflow_requirements');
    localStorage.removeItem('standupflow_issues');
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
        // Securely preserve the user's assigned role, roleCode, roleName, and rootadmin
        const merged = {
          ...currentUser,
          ...saved,
          role: saved.role !== undefined && saved.role !== null ? saved.role : currentUser.role,
          roleCode: saved.roleCode !== undefined && saved.roleCode !== null ? saved.roleCode : currentUser.roleCode,
          roleName: saved.roleName || currentUser.roleName,
          rootadmin: saved.rootadmin !== undefined && saved.rootadmin !== null ? saved.rootadmin : currentUser.rootadmin
        };
        setCurrentUser(merged);
        setUsers(prev => prev.map(u => u.id === merged.id ? merged : u));
        return { success: true, user: merged };
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
    } catch (e) { }
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
    if (viewName !== 'login' && viewName !== 'register' && viewName !== 'project_health' && (!projects || projects.length === 0)) {
      setCurrentView('project_health');
      return;
    }
    if (viewName === 'task_details') {
      if (extraId) setSelectedTaskId(extraId);
      setIsTaskDrawerOpen(true);
      return;
    } else if (viewName === 'issue_details') {
      if (extraId) setSelectedIssueId(extraId);
      setIsIssueDrawerOpen(true);
      return;
    } else if (viewName === 'sprint_details') {
      if (extraId) setSelectedSprintId(extraId);
      setCurrentView('sprints');
      return;
    }
    setCurrentView(viewName);
  };

  // Create Project REST Persist
  const createProject = async (projData) => {
    const isFirstProject = (!projects || projects.length === 0);
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
      lead: currentUser?.fullname || currentUser?.name || 'Root Administrator',
      leadId: currentUser?.id ? String(currentUser.id) : '1',
      color: projData.color || '#2563eb',
      inviteCode: `INV-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      memberEmails: projData.memberEmails !== undefined ? projData.memberEmails : (currentUser?.email || currentUser?.emailid || ''),
      memberIds: projData.memberIds !== undefined ? projData.memberIds : (currentUser?.id ? String(currentUser.id) : '1')
    };

    let savedProj = newProj;
    try {
      const activeUrl = apiUrl || API_BASE_URL;
      const res = await fetch(`${activeUrl}/projects`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(newProj)
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.id) {
          savedProj = data;
        }
      } else {
        const errText = await res.text();
        console.error('Backend rejected project save:', res.status, errText);
        throw new Error(`Server returned ${res.status}: ${errText || 'Failed to save project'}`);
      }
    } catch (e) {
      console.error('Persisted project error:', e);
      throw e;
    }

    setProjects(prev => {
      const filtered = prev.filter(p => p.id !== savedProj.id);
      return [savedProj, ...filtered];
    });
    setCurrentProject(savedProj);

    // If first project, navigate to Home and launch Console Tour from dashboard
    if (isFirstProject) {
      setCurrentView('dashboard');
      setTimeout(() => {
        setIsOnboardingOpen(true);
      }, 450);
    }

    return savedProj;
  };

  const updateProject = async (projId, updatedFields) => {
    const existing = projects.find(p => p.id === projId || String(p.id) === String(projId)) || editingProject || currentProject || {};
    const fullUpdatedProj = { ...existing, ...updatedFields, id: projId };

    try {
      const activeUrl = apiUrl || API_BASE_URL;
      const res = await fetch(`${activeUrl}/projects/${projId}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(fullUpdatedProj)
      });
      if (res.ok) {
        const saved = await res.json();
        if (saved && saved.id) {
          setProjects(prev => prev.map(p => (p.id === saved.id || String(p.id) === String(saved.id)) ? saved : p));
          if (currentProject?.id === saved.id || String(currentProject?.id) === String(saved.id)) {
            setCurrentProject(saved);
          }
          return saved;
        }
      } else {
        const errText = await res.text();
        console.error('Backend rejected project update:', res.status, errText);
        throw new Error(`Server returned ${res.status}: ${errText || 'Failed to update project'}`);
      }
    } catch (e) {
      console.error('Project update error:', e);
      throw e;
    }

    setProjects(prev => prev.map(p => (p.id === projId || String(p.id) === String(projId)) ? fullUpdatedProj : p));
    if (currentProject?.id === projId || String(currentProject?.id) === String(projId)) {
      setCurrentProject(fullUpdatedProj);
    }
    return fullUpdatedProj;
  };

  const deleteProject = async (projId) => {
    const remainingProjects = projects.filter(p => p.id !== projId && String(p.id) !== String(projId));
    setProjects(remainingProjects);

    if (currentProject?.id === projId || String(currentProject?.id) === String(projId)) {
      if (remainingProjects.length > 0) {
        setCurrentProject(remainingProjects[0]);
      } else {
        setCurrentProject(null);
      }
    }

    try {
      const activeUrl = apiUrl || API_BASE_URL;
      await fetch(`${activeUrl}/projects/${projId}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
    } catch (e) {
      console.warn('Backend deleteProject error:', e);
    }
  };

  // Helper to test if task is assigned to user
  const isTaskAssignedToUser = (task, user = currentUser) => {
    if (!task || !user) return false;
    const uId = user.id ? String(user.id).trim() : '';
    const uName = (user.name || user.fullname) ? String(user.name || user.fullname).toLowerCase().trim() : '';
    const uEmail = (user.email || user.emailid) ? String(user.email || user.emailid).toLowerCase().trim() : '';

    if (task.assigneeIds && Array.isArray(task.assigneeIds)) {
      const cleanIds = task.assigneeIds.map(String).map(s => s.trim()).filter(Boolean);
      if (uId && cleanIds.includes(uId)) return true;
    }

    if (task.assigneeId && String(task.assigneeId).trim()) {
      const ids = String(task.assigneeId).split(',').map(s => s.trim()).filter(Boolean);
      if (uId && ids.some(id => id.toLowerCase() === uId.toLowerCase())) return true;
      if (uEmail && ids.some(id => id.toLowerCase() === uEmail)) return true;
    }

    if (task.assigneeEmail && String(task.assigneeEmail).trim() && uEmail) {
      const emails = String(task.assigneeEmail).split(',').map(s => s.toLowerCase().trim()).filter(Boolean);
      if (emails.includes(uEmail)) return true;
    }

    if (task.assigneeName && String(task.assigneeName).trim() && uName) {
      const names = String(task.assigneeName).split(',').map(s => s.toLowerCase().trim()).filter(Boolean);
      if (names.some(n => n !== 'unassigned' && n === uName)) return true;
    }

    if (task.testerId && uId && String(task.testerId).trim().toLowerCase() === uId.toLowerCase()) return true;
    if (task.testerEmail && uEmail && String(task.testerEmail).trim().toLowerCase() === uEmail) return true;
    if (task.testerName && uName && String(task.testerName).trim().toLowerCase() !== 'unassigned' && String(task.testerName).trim().toLowerCase() === uName) return true;

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
      linkTaskId: notifData.linkTaskId || null,
      // Include who sent the notification so recipient can see the sender's name
      reporterName: notifData.reporterName || currentUser?.name || null
    };

    // Only add to local state if intended for currently logged in user
    const isForCurrentUser = currentUser && (
      (newNotif.userId && String(newNotif.userId) === String(currentUser.id)) ||
      (newNotif.userEmail && currentUser.email && newNotif.userEmail.toLowerCase() === currentUser.email.toLowerCase())
    );
    if (isForCurrentUser) {
      setNotifications(prev => [newNotif, ...prev]);
    }

    const activeUrl = apiUrl || API_BASE_URL;
    fetch(`${activeUrl}/notifications`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(newNotif)
    }).catch(() => { });
  };

  const markNotificationRead = (notifId) => {
    const activeUrl = apiUrl || API_BASE_URL;
    setNotifications(prev => prev.map(n => n.id === notifId ? { ...n, read: true } : n));
    fetch(`${activeUrl}/notifications/${notifId}/read`, {
      method: 'PUT',
      headers: getHeaders()
    }).catch(() => { });
  };

  const markAllNotificationsRead = () => {
    const activeUrl = apiUrl || API_BASE_URL;
    const currentUserId = currentUser?.id ? String(currentUser.id) : '';
    const currentEmail = currentUser?.email ? currentUser.email.toLowerCase() : '';
    // Only mark notifications that belong to the currently logged-in user as read
    setNotifications(prev => prev.map(n => {
      const nUid = n.userId != null ? String(n.userId).trim() : '';
      const nEmail = n.userEmail ? n.userEmail.toLowerCase().trim() : '';
      const matchesUser = (currentUserId && nUid && (nUid === currentUserId || nUid.split(',').map(s => s.trim()).includes(currentUserId)))
        || (currentEmail && nEmail && (nEmail === currentEmail || nEmail.split(',').map(s => s.trim()).includes(currentEmail)));
      return matchesUser ? { ...n, read: true } : n;
    }));
    fetch(`${activeUrl}/notifications/read-all`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ userEmail: currentUser?.email, userId: currentUser?.id })
    }).catch(() => { });
  };

  // Create Task REST Persist
  const createTask = async (newTaskData) => {
    const activeUrl = apiUrl || API_BASE_URL;
    const taskId = `TASK-${Date.now()}`;
    const activeProject = currentProject || (projects.length > 0 ? projects[0] : null);
    const activeSprint = currentSprint || (sprints.length > 0 ? sprints[0] : null);

    // Resolve assigned user reliably: ONLY when explicitly provided, NEVER default to currentUser
    const hasExplicitAssignee = Boolean(
      (newTaskData.assigneeId && String(newTaskData.assigneeId).trim()) ||
      (newTaskData.assigneeIds && newTaskData.assigneeIds.length > 0) ||
      (newTaskData.assigneeEmail && String(newTaskData.assigneeEmail).trim())
    );

    let assignedUser = null;
    if (hasExplicitAssignee) {
      assignedUser = users.find(u => String(u.id) === String(newTaskData.assigneeId)) ||
        users.find(u => u.email === newTaskData.assigneeEmail) ||
        null;
    }

    const taskSprintId = newTaskData.sprintId !== undefined ? newTaskData.sprintId : (activeSprint?.id || '');
    const matchedSprint = sprints.find(s => String(s.id) === String(taskSprintId));

    const task = {
      id: taskId,
      title: newTaskData.title || 'Untitled Task',
      description: newTaskData.description || '',
      status: newTaskData.status || 'Backlog',
      priority: newTaskData.priority || 'Medium',
      assigneeId: hasExplicitAssignee ? (newTaskData.assigneeId || (assignedUser ? assignedUser.id : '')) : '',
      assigneeName: hasExplicitAssignee ? (newTaskData.assigneeName || (assignedUser ? assignedUser.name : 'Unassigned')) : 'Unassigned',
      assigneeAvatar: hasExplicitAssignee ? (newTaskData.assigneeAvatar || (assignedUser ? assignedUser.avatar : '')) : '',
      reporterId: currentUser?.id || '',
      reporterName: currentUser?.name || 'Manager',
      sprintId: taskSprintId,
      sprintName: matchedSprint ? matchedSprint.name : (taskSprintId ? 'Sprint' : ''),
      projectId: newTaskData.projectId || activeProject?.id || 'PRJ-101',
      projectName: projects.find(p => String(p.id) === String(newTaskData.projectId))?.name || activeProject?.name || 'Core Platform',
      labels: newTaskData.labels || ['Feature'],
      storyPoints: parseInt(newTaskData.storyPoints) || 3,
      startDate: newTaskData.startDate || new Date().toISOString().split('T')[0],
      dueDate: newTaskData.dueDate || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      updatedAt: new Date().toISOString(),
      testingStatus: 'Pending Testing',
      testerId: currentUser?.id || '',
      testerName: currentUser?.name || '',
      hasIssue: false,
      attachments: Array.isArray(newTaskData.attachments) ? newTaskData.attachments : [],
      attachmentsJson: JSON.stringify(Array.isArray(newTaskData.attachments) ? newTaskData.attachments : []),
      subtasks: Array.isArray(newTaskData.subtasks) ? newTaskData.subtasks : [],
      subtasksJson: JSON.stringify(Array.isArray(newTaskData.subtasks) ? newTaskData.subtasks : [])
    };

    let savedTask = task;
    const res = await fetch(`${activeUrl}/tasks`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(task)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `Failed to create task (${res.status})`);
    }
    savedTask = await res.json();
    let atts = Array.isArray(newTaskData.attachments) ? newTaskData.attachments : [];
    if (savedTask.attachmentsJson) {
      try { atts = JSON.parse(savedTask.attachmentsJson); } catch (e) {}
    } else if (Array.isArray(savedTask.attachments)) {
      atts = savedTask.attachments;
    }
    let subs = Array.isArray(newTaskData.subtasks) ? newTaskData.subtasks : [];
    if (savedTask.subtasksJson) {
      try { subs = JSON.parse(savedTask.subtasksJson); } catch (e) {}
    } else if (Array.isArray(savedTask.subtasks)) {
      subs = savedTask.subtasks;
    }
    const finalized = { ...savedTask, attachments: atts, subtasks: subs };

    setTasks(prev => [finalized, ...prev]);
    return finalized;
  };

  // Update Task Status REST Persist
  const updateTaskStatus = async (taskId, newStatus) => {
    const activeUrl = apiUrl || API_BASE_URL;
    setTasks(prev => prev.map(t => t.id === taskId ? {
      ...t,
      status: newStatus,
      updatedAt: new Date().toISOString()
    } : t));

    try {
      const targetTask = tasks.find(t => t.id === taskId);
      if (targetTask) {
        await fetch(`${activeUrl}/tasks/${taskId}`, {
          method: 'PUT',
          headers: getHeaders(),
          body: JSON.stringify({ ...targetTask, status: newStatus })
        });
      }
    } catch (e) {
      console.warn('Backend updateTaskStatus fallback:', e);
    }
  };

  const updateTask = async (taskId, updatedFields) => {
    const activeUrl = apiUrl || API_BASE_URL;
    const existingTask = tasks.find(t => t.id === taskId) || (editingTask?.id === taskId ? editingTask : null) || {};

    let attachments = updatedFields.attachments !== undefined ? updatedFields.attachments : (existingTask.attachments || []);
    let attachmentsJson = updatedFields.attachmentsJson;
    if (updatedFields.attachments !== undefined && attachmentsJson === undefined) {
      attachmentsJson = JSON.stringify(updatedFields.attachments || []);
    }

    let subtasks = updatedFields.subtasks !== undefined ? updatedFields.subtasks : (existingTask.subtasks || []);
    let subtasksJson = updatedFields.subtasksJson;
    if (updatedFields.subtasks !== undefined && subtasksJson === undefined) {
      subtasksJson = JSON.stringify(updatedFields.subtasks || []);
    }

    const updatedTask = {
      ...existingTask,
      ...updatedFields,
      attachments,
      subtasks,
      ...(attachmentsJson !== undefined ? { attachmentsJson } : {}),
      ...(subtasksJson !== undefined ? { subtasksJson } : {}),
      id: taskId,
      updatedAt: new Date().toISOString()
    };

    // Update state immediately
    setTasks(prev => {
      const exists = prev.some(t => t.id === taskId);
      if (exists) {
        return prev.map(t => t.id === taskId ? updatedTask : t);
      }
      return [updatedTask, ...prev];
    });

    if (editingTask && editingTask.id === taskId) {
      setEditingTask(updatedTask);
    }

    try {
      const res = await fetch(`${activeUrl}/tasks/${taskId}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(updatedTask)
      });
      if (res.ok) {
        const saved = await res.json();
        let atts = attachments;
        if (saved.attachmentsJson) {
          try { atts = JSON.parse(saved.attachmentsJson); } catch (e) {}
        } else if (Array.isArray(saved.attachments)) {
          atts = saved.attachments;
        }
        let subs = subtasks;
        if (saved.subtasksJson) {
          try { subs = JSON.parse(saved.subtasksJson); } catch (e) {}
        } else if (Array.isArray(saved.subtasks)) {
          subs = saved.subtasks;
        }
        const finalized = { ...saved, attachments: atts, subtasks: subs };
        setTasks(prev => prev.map(t => t.id === finalized.id ? finalized : t));
        if (editingTask && editingTask.id === finalized.id) {
          setEditingTask(finalized);
        }
        return finalized;
      } else {
        throw new Error(`Failed to update task (${res.status})`);
      }
    } catch (e) {
      console.warn('Backend updateTask error:', e);
      throw e;
    }
  };

  const deleteTask = async (taskId) => {
    const activeUrl = apiUrl || API_BASE_URL;
    setTasks(prev => prev.filter(t => t.id !== taskId));
    try {
      await fetch(`${activeUrl}/tasks/${taskId}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
    } catch (e) {
      console.warn('Backend deleteTask error:', e);
    }
  };

  // Create Issue / Bug REST Persist
  const createIssue = async (bugData) => {
    const activeUrl = apiUrl || API_BASE_URL;
    const activeProject = currentProject || (projects.length > 0 ? projects[0] : null);
    
    // Resolve multiple or single assignees
    const rawAssigneeIds = Array.isArray(bugData.assigneeIds)
      ? bugData.assigneeIds.map(String)
      : (bugData.assigneeId ? String(bugData.assigneeId).split(',').map(s => s.trim()).filter(Boolean) : []);
    const assignedUsers = users.filter(u => rawAssigneeIds.includes(String(u.id)) || rawAssigneeIds.includes(u.email));
    const fallbackUser = users.find(u => String(u.id) === String(bugData.assigneeId) || u.email === bugData.assigneeId);
    
    const resolvedIds = assignedUsers.length > 0 
      ? assignedUsers.map(u => u.id) 
      : (fallbackUser ? [fallbackUser.id] : ['USR-102']);
    const resolvedNames = assignedUsers.length > 0
      ? assignedUsers.map(u => u.name).join(', ')
      : (fallbackUser?.name || bugData.assigneeName || 'Rahul Sharma');
    const resolvedAvatar = assignedUsers[0]?.avatar || fallbackUser?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80';

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
      assigneeId: resolvedIds.join(','),
      assigneeIds: resolvedIds,
      assigneeName: resolvedNames,
      assigneeAvatar: resolvedAvatar,
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
      updateTask(bugData.linkedTaskId, { hasIssue: true }).catch(() => { });
    }

    let savedBug = newBug;
    const res = await fetch(`${activeUrl}/issues`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(newBug)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `Failed to create issue (${res.status})`);
    }
    savedBug = await res.json();

    setIssues(prev => {
      const nextIssues = [savedBug, ...prev];
      try {
        localStorage.setItem('standupflow_issues', JSON.stringify(nextIssues));
      } catch (e) { }
      return nextIssues;
    });
    return savedBug;
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
      } catch (e) { }
      return nextMsgs;
    });

    try {
      await fetch(`${activeUrl}/chat/messages`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(newMsg)
      });
    } catch (e) { }

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
      } catch (e) { }
      return updated;
    });

    try {
      const res = await fetch(`${activeUrl}/chat/messages/${messageId}`, {
        method: 'DELETE',
        headers: getHeaders()
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
          } catch (e) { }
          return updated;
        });
      }
    } catch (e) {
      console.warn('Delete message backend sync fallback:', e);
    }
  };

  const markChatAsRead = async (contactId) => {
    if (!currentUser || !contactId) return;
    const activeUrl = apiUrl || API_BASE_URL;

    setChatMessages(prev => {
      const updated = prev.map(msg => {
        if (String(msg.senderId) === String(contactId) && String(msg.recipientId) === String(currentUser.id)) {
          return { ...msg, isRead: true };
        }
        return msg;
      });
      try {
        localStorage.setItem('standupflow_chat_messages', JSON.stringify(updated));
      } catch (e) { }
      return updated;
    });

    try {
      await fetch(`${activeUrl}/chat/messages/read?senderId=${encodeURIComponent(contactId)}&recipientId=${encodeURIComponent(currentUser.id)}`, {
        method: 'PUT',
        headers: getHeaders()
      });
    } catch (e) { }
  };

  const createChatChannel = async (channelData) => {
    const activeUrl = apiUrl || API_BASE_URL;
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
      await fetch(`${activeUrl}/chat/channels`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(newChannel)
      });
    } catch (e) { }

    return newChannel;
  };

  const updateIssueState = async (issueId, newState) => {
    const activeUrl = apiUrl || API_BASE_URL;
    setIssues(prev => prev.map(i => i.id === issueId ? { ...i, state: newState } : i));
    try {
      await fetch(`${activeUrl}/issues/${issueId}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ state: newState })
      });
    } catch (e) {
      console.warn('Update issue state backend sync fallback:', e);
    }
  };

  const updateIssue = async (issueId, patchData) => {
    const activeUrl = apiUrl || API_BASE_URL;
    setIssues(prev => prev.map(i => i.id === issueId ? { ...i, ...patchData } : i));
    try {
      await fetch(`${activeUrl}/issues/${issueId}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(patchData)
      });
    } catch (e) {
      console.warn('Update issue backend sync fallback:', e);
    }
  };

  const sendTaskToTesting = async (taskId, testerIds, testNotes = '') => {
    const targetTask = tasks.find(t => String(t.id) === String(taskId)) || (selectedTask?.id === taskId ? selectedTask : null);
    if (!targetTask) return;

    const rawIds = Array.isArray(testerIds)
      ? testerIds.map(String)
      : String(testerIds || '').split(',').map(s => s.trim()).filter(Boolean);
    const assignedTesters = users.filter(u => rawIds.includes(String(u.id)) || rawIds.includes(u.email));
    
    const resolvedTesterIds = assignedTesters.length > 0 ? assignedTesters.map(u => u.id) : (rawIds.length > 0 ? rawIds : []);
    const testerNames = assignedTesters.length > 0 
      ? assignedTesters.map(u => u.name).join(', ') 
      : 'Assigned Tester';
    const testerEmails = assignedTesters.map(u => u.email).filter(Boolean).join(', ');

    const newComments = testNotes ? [
      ...(targetTask.comments || []),
      {
        id: `CM-${Date.now()}`,
        author: currentUser?.name || 'Developer',
        avatar: currentUser?.avatar || '',
        text: `🚀 Sent to QA Testing. Assigned to tester(s): ${testerNames}. Note: ${testNotes}`,
        time: 'Just now'
      }
    ] : (targetTask.comments || []);

    await updateTask(taskId, {
      status: 'In Review',
      testingStatus: 'Pending Testing',
      testerId: resolvedTesterIds.join(','),
      testerIds: resolvedTesterIds,
      testerName: testerNames,
      testerEmail: testerEmails,
      comments: newComments
    });

    assignedTesters.forEach(tUser => {
      addNotification({
        userId: tUser.id,
        userEmail: tUser.email,
        title: 'Task Assigned for Testing',
        message: `${currentUser?.name || 'Developer'} sent task ${targetTask.id} (${targetTask.title}) to you for QA testing.`,
        linkTaskId: taskId,
        reporterName: currentUser?.name
      });
    });
  };

  const reassignTaskToDeveloper = async (taskId, developerIds, fixNotes = '', issueId = null) => {
    const rawIds = Array.isArray(developerIds)
      ? developerIds.map(String)
      : String(developerIds || '').split(',').map(s => s.trim()).filter(Boolean);
    const assignedDevs = users.filter(u => rawIds.includes(String(u.id)) || rawIds.includes(u.email));
    if (assignedDevs.length === 0) return;

    const devNames = assignedDevs.map(u => u.name).join(', ');
    const devIdsStr = assignedDevs.map(u => u.id).join(',');
    const firstAvatar = assignedDevs[0]?.avatar || '';

    const targetTask = taskId ? (tasks.find(t => String(t.id) === String(taskId)) || (selectedTask?.id === taskId ? selectedTask : null)) : null;

    if (targetTask) {
      const newComments = [
        ...(targetTask.comments || []),
        {
          id: `CM-${Date.now()}`,
          author: currentUser?.name || 'Manager',
          avatar: currentUser?.avatar || '',
          text: `⚠️ Reassigned for fix to ${devNames}${issueId ? ` (Bug: ${issueId})` : ''}. Notes: ${fixNotes || 'Please fix the defect and re-submit for testing.'}`,
          time: 'Just now'
        }
      ];

      await updateTask(targetTask.id, {
        assigneeId: devIdsStr,
        assigneeIds: assignedDevs.map(u => u.id),
        assigneeName: devNames,
        assigneeAvatar: firstAvatar,
        status: 'In Progress',
        testingStatus: 'Failed',
        hasIssue: true,
        comments: newComments
      });
    }

    const effectiveIssueId = issueId || targetTask?.activeBugId;
    if (effectiveIssueId) {
      await updateIssue(effectiveIssueId, {
        assigneeId: devIdsStr,
        assigneeIds: assignedDevs.map(u => u.id),
        assigneeName: devNames,
        assigneeAvatar: firstAvatar,
        state: 'In Progress'
      });
    }

    assignedDevs.forEach(devUser => {
      addNotification({
        userId: devUser.id,
        userEmail: devUser.email,
        title: 'Task Reassigned for Fix',
        message: `${currentUser?.name || 'Manager'} reassigned ${targetTask ? `task ${targetTask.id}` : ''}${issueId ? ` issue ${issueId}` : ''} to you to fix defect.`,
        linkTaskId: taskId || undefined,
        reporterName: currentUser?.name
      });
    });
  };

  const createSprint = async (sprintData) => {
    const activeUrl = apiUrl || API_BASE_URL;
    const activeProject = currentProject || (projects.length > 0 ? projects[0] : null);
    const sprintId = `SPR-${Date.now()}`;
    const newSprint = {
      id: sprintId,
      name: sprintData.name,
      projectId: sprintData.projectId || activeProject?.id || 'PRJ-101',
      projectName: sprintData.projectName || activeProject?.name || 'Default Project',
      goal: sprintData.goal || '',
      startDate: sprintData.startDate,
      endDate: sprintData.endDate,
      status: sprintData.status || 'Planning',
      totalTasks: 0,
      completedTasks: 0,
      storyPoints: parseInt(sprintData.storyPoints) || 0,
      completedStoryPoints: 0
    };

    let savedSprint = newSprint;
    const res = await fetch(`${activeUrl}/sprints`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(newSprint)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `Failed to create sprint (${res.status})`);
    }
    savedSprint = await res.json();

    setSprints(prev => [...prev, savedSprint]);
    if (!currentSprint) setCurrentSprint(savedSprint);
    return savedSprint;
  };

  const updateSprint = async (sprintId, sprintData) => {
    const activeUrl = apiUrl || API_BASE_URL;
    setSprints(prev => prev.map(s => s.id === sprintId ? { ...s, ...sprintData } : s));
    if (currentSprint?.id === sprintId) {
      setCurrentSprint(prev => ({ ...prev, ...sprintData }));
    }
    try {
      const res = await fetch(`${activeUrl}/sprints/${sprintId}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(sprintData)
      });
      if (res.ok) {
        const updated = await res.json();
        setSprints(prev => prev.map(s => s.id === updated.id ? updated : s));
        return updated;
      }
    } catch (e) {
      console.warn('Backend updateSprint fallback:', e);
    }
  };

  const deleteSprint = async (sprintId) => {
    const activeUrl = apiUrl || API_BASE_URL;
    setSprints(prev => prev.filter(s => s.id !== sprintId));
    if (currentSprint?.id === sprintId) {
      setCurrentSprint(null);
    }
    try {
      await fetch(`${activeUrl}/sprints/${sprintId}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
    } catch (e) {
      console.warn('Backend deleteSprint fallback:', e);
    }
  };

  // Team Invitations State & Persistence Handlers
  const [invitations, setInvitations] = useState(getStoredInvitations);

  // Sync invitations with localStorage
  useEffect(() => {
    try {
      localStorage.setItem('standupflow_invitations', JSON.stringify(invitations));
    } catch (e) { }
  }, [invitations]);

  // Fetch invitations from backend API
  useEffect(() => {
    if (!currentUser) return;
    const fetchUserInvitations = async () => {
      const activeUrl = apiUrl || API_BASE_URL;
      try {
        const res = await fetch(`${activeUrl}/invitations`, { headers: getHeaders() });
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
      } catch (e) { }
    };
    fetchUserInvitations();
  }, [currentUser, apiUrl]);

  // Requirements Management Methods
  const fetchRequirements = async () => {
    const activeUrl = apiUrl || API_BASE_URL;
    try {
      const res = await fetch(`${activeUrl}/requirements`, { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          const parsed = data.map(r => {
            let atts = [];
            if (r.attachmentsJson) {
              try { atts = JSON.parse(r.attachmentsJson); } catch (e) {}
            } else if (Array.isArray(r.attachments)) {
              atts = r.attachments;
            }
            return { ...r, attachments: atts };
          });
          setRequirements(parsed);
        }
      }
    } catch (err) {
      console.warn('Failed to fetch requirements:', err);
    }
  };

  const createRequirement = async (reqData) => {
    const activeUrl = apiUrl || API_BASE_URL;
    const reqId = `REQ-${Date.now().toString().slice(-4)}`;
    const attachments = Array.isArray(reqData.attachments) ? reqData.attachments : [];
    const attachmentsJson = JSON.stringify(attachments);
    const newReq = {
      id: reqId,
      title: reqData.title,
      description: reqData.description || '',
      priority: reqData.priority || 'Medium',
      category: reqData.category || 'Feature',
      projectId: reqData.projectId || currentProject?.id || '',
      projectName: reqData.projectName || currentProject?.name || '',
      sprintId: reqData.sprintId || '',
      sprintName: reqData.sprintName || '',
      assigneeId: reqData.assigneeId || '',
      assigneeName: reqData.assigneeName || '',
      assigneeAvatar: reqData.assigneeAvatar || '',
      status: reqData.status || 'Submitted',
      convertedTaskId: '',
      createdByUserId: reqData.createdByUserId || currentUser?.id || '1',
      createdByName: reqData.createdByName || currentUser?.name || 'User',
      createdByAvatar: reqData.createdByAvatar || currentUser?.avatar || '',
      createdByRole: reqData.createdByRole || currentUser?.role || 'Member',
      attachments: attachments,
      attachmentsJson: attachmentsJson,
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 16)
    };

    setRequirements(prev => [newReq, ...prev]);

    try {
      const res = await fetch(`${activeUrl}/requirements`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(newReq)
      });
      if (res.ok) {
        const saved = await res.json();
        let atts = attachments;
        if (saved.attachmentsJson) {
          try { atts = JSON.parse(saved.attachmentsJson); } catch (e) {}
        }
        const finalized = { ...saved, attachments: atts };
        setRequirements(prev => prev.map(r => r.id === reqId ? finalized : r));
        return finalized;
      }
    } catch (err) {
      console.warn('Backend createRequirement fallback:', err);
    }
    return newReq;
  };

  const updateRequirement = async (id, updatedData) => {
    const activeUrl = apiUrl || API_BASE_URL;
    const payload = { ...updatedData };
    if (updatedData.attachments !== undefined) {
      payload.attachmentsJson = JSON.stringify(updatedData.attachments);
    }

    setRequirements(prev => prev.map(r => {
      if (r.id !== id) return r;
      const merged = { ...r, ...payload, updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 16) };
      if (updatedData.attachments !== undefined) {
        merged.attachments = updatedData.attachments;
      }
      return merged;
    }));

    try {
      await fetch(`${activeUrl}/requirements/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(payload)
      });
    } catch (err) {
      console.warn('Backend updateRequirement fallback:', err);
    }
  };

  const deleteRequirement = async (id) => {
    const activeUrl = apiUrl || API_BASE_URL;
    setRequirements(prev => prev.filter(r => r.id !== id));

    try {
      await fetch(`${activeUrl}/requirements/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
    } catch (err) {
      console.warn('Backend deleteRequirement fallback:', err);
    }
  };

  const convertRequirementToTask = async (reqId, taskPayload) => {
    const createdTask = await createTask(taskPayload);
    await updateRequirement(reqId, {
      status: 'Converted to Task',
      convertedTaskId: createdTask.id,
      projectId: taskPayload.projectId,
      projectName: taskPayload.projectName,
      sprintId: taskPayload.sprintId,
      sprintName: taskPayload.sprintName,
      assigneeId: taskPayload.assigneeId,
      assigneeName: taskPayload.assigneeName,
      assigneeAvatar: taskPayload.assigneeAvatar
    });
    return createdTask;
  };

  const isManagerOrEditorOrRoot = (user = currentUser) => {
    if (!user) return false;
    if (Boolean(user.rootadmin === 1 || String(user.rootadmin) === '1')) return true;
    const code = Number(user.roleCode !== undefined && user.roleCode !== null ? user.roleCode : user.role);
    if (code === 1 || code === 2) return true;
    const roleName = String(getUserRoleName(user)).toLowerCase();
    const roleRaw = String(user.role || '').toLowerCase();
    return roleName.includes('admin') || roleName.includes('manager') || roleName.includes('editor') ||
           roleRaw.includes('admin') || roleRaw.includes('manager') || roleRaw.includes('editor');
  };

  const isViewer = (user = currentUser) => {
    if (!user) return false;
    if (Boolean(user.rootadmin === 1 || String(user.rootadmin) === '1')) return false;
    const roleName = String(getUserRoleName(user)).toLowerCase();
    const roleRaw = String(user.role || '').toLowerCase();
    return roleName.includes('viewer') || roleRaw.includes('viewer') || roleName.includes('read only') || roleRaw.includes('read only');
  };

  // Enterprise RBAC Permission Evaluators
  const canManageTaskAssignment = (userToLookup = currentUser) => {
    return isManagerOrEditorOrRoot(userToLookup);
  };

  const canEditTaskScope = (userToLookup = currentUser) => {
    return isManagerOrEditorOrRoot(userToLookup);
  };

  const canUpdateTaskStatus = (task, userToLookup = currentUser) => {
    if (!task || !userToLookup) return false;
    if (isViewer(userToLookup)) return false;
    if (isManagerOrEditorOrRoot(userToLookup)) return true;
    return isTaskAssignedToUser(task, userToLookup);
  };

  const canSendTaskToTesting = (task, userToLookup = currentUser) => {
    if (!task || !userToLookup) return false;
    if (isViewer(userToLookup)) return false;

    // In Jira enterprise flow, task must be marked Completed (or In Review/Pending Testing)
    const isReadyForTesting = task.status === 'Completed' || task.status === 'In Review' || task.testingStatus === 'Pending Testing';
    if (!isReadyForTesting) return false;

    // Must be manager/editor/root OR the assigner (reporter) of the task
    if (isManagerOrEditorOrRoot(userToLookup)) return true;

    const uId = String(userToLookup.id || '').trim();
    const uEmail = String(userToLookup.email || userToLookup.emailid || '').toLowerCase().trim();
    const uName = String(userToLookup.name || userToLookup.fullname || '').toLowerCase().trim();

    const rId = String(task.reporterId || '').trim();
    const rEmail = String(task.reporterEmail || '').toLowerCase().trim();
    const rName = String(task.reporterName || '').toLowerCase().trim();

    if (uId && rId && uId === rId) return true;
    if (uEmail && rEmail && uEmail === rEmail) return true;
    if (uName && rName && uName === rName) return true;

    return false;
  };

  // Send Team Invitation (Project scoped)
  const sendInvitation = async (inviteeEmail, targetProjectId = null) => {
    if (!currentUser) {
      return { success: false, message: 'Must be logged in to send team invitations' };
    }
    const targetProj = targetProjectId ? projects.find(p => p.id === targetProjectId || String(p.id) === String(targetProjectId)) : null;
    const invCode = targetProj?.inviteCode || currentUser?.managerCode || 'COMPANY-TEAM';
    const email = inviteeEmail.trim().toLowerCase();

    const payload = {
      managerId: currentUser.id,
      managerName: currentUser.name,
      managerCode: invCode,
      projectId: targetProj ? targetProj.id : null,
      inviteeEmail: email
    };

    const activeUrl = apiUrl || API_BASE_URL;
    try {
      const res = await fetch(`${activeUrl}/invitations/send`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const savedInv = await res.json();
        setInvitations(prev => [savedInv, ...prev.filter(i => i.id !== savedInv.id)]);
        return { success: true, invitation: savedInv };
      }
    } catch (e) { }

    const localInv = {
      id: `INV-${Date.now()}`,
      managerId: currentUser.id,
      managerName: currentUser.name,
      managerCode: invCode,
      projectId: targetProj ? targetProj.id : null,
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
    const sUserId = String(userId).trim();
    const targetUser = users.find(u => String(u.id).trim() === sUserId);
    const uEmail = targetUser?.email ? targetUser.email.toLowerCase().trim() : '';

    // 1. Optimistically update local project state
    setProjects(prev => prev.map(p => {
      if (p.id === projectId || String(p.id) === String(projectId)) {
        let updatedMemberIds = typeof p.memberIds === 'string'
          ? p.memberIds.split(',').map(s => s.trim()).filter(Boolean)
          : (p.memberIds || []);
        updatedMemberIds = updatedMemberIds.filter(id => String(id).trim() !== sUserId);

        let updatedMemberEmails = typeof p.memberEmails === 'string'
          ? p.memberEmails.split(',').map(s => s.trim()).filter(Boolean)
          : (p.memberEmails || []);
        if (uEmail) {
          updatedMemberEmails = updatedMemberEmails.filter(e => e.toLowerCase().trim() !== uEmail);
        }

        const updated = {
          ...p,
          memberIds: Array.isArray(p.memberIds) ? updatedMemberIds : updatedMemberIds.join(','),
          memberEmails: Array.isArray(p.memberEmails) ? updatedMemberEmails : updatedMemberEmails.join(',')
        };
        if (currentProject?.id === p.id || String(currentProject?.id) === String(p.id)) {
          setCurrentProject(updated);
        }
        return updated;
      }
      return p;
    }));

    // 2. Clear invitation records in local state for this user and project
    if (uEmail) {
      setInvitations(prev => (prev || []).map(inv => {
        const matchesEmail = inv.inviteeEmail?.toLowerCase().trim() === uEmail;
        const matchesProj = inv.projectId === projectId || String(inv.projectId) === String(projectId);
        if (matchesEmail && matchesProj) {
          return { ...inv, status: 'REMOVED' };
        }
        return inv;
      }));
    }

    // 3. Clear user's managerCode in local state if it matched this project
    const targetProj = projects.find(p => p.id === projectId || String(p.id) === String(projectId));
    if (targetProj) {
      setUsers(prev => (prev || []).map(u => {
        if (String(u.id).trim() === sUserId) {
          if (u.managerCode === targetProj.code || u.managerCode === targetProj.inviteCode) {
            return { ...u, managerCode: null };
          }
        }
        return u;
      }));
    }

    // 4. Send backend DELETE call to remove member
    try {
      const res = await fetch(`${activeUrl}/projects/${projectId}/members/${sUserId}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      if (!res.ok) {
        const curProj = projects.find(p => p.id === projectId || String(p.id) === String(projectId));
        if (curProj) {
          let updatedMemberIds = typeof curProj.memberIds === 'string'
            ? curProj.memberIds.split(',').map(s => s.trim()).filter(Boolean)
            : (curProj.memberIds || []);
          updatedMemberIds = updatedMemberIds.filter(id => String(id).trim() !== sUserId);
          let updatedMemberEmails = typeof curProj.memberEmails === 'string'
            ? curProj.memberEmails.split(',').map(s => s.trim()).filter(Boolean)
            : (curProj.memberEmails || []);
          if (uEmail) updatedMemberEmails = updatedMemberEmails.filter(e => e.toLowerCase().trim() !== uEmail);
          const putPayload = {
            ...curProj,
            memberIds: Array.isArray(curProj.memberIds) ? updatedMemberIds : updatedMemberIds.join(','),
            memberEmails: Array.isArray(curProj.memberEmails) ? updatedMemberEmails : updatedMemberEmails.join(',')
          };
          await fetch(`${activeUrl}/projects/${projectId}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(putPayload)
          });
        }
      }
    } catch (e) {
      console.error('Error removing member from project:', e);
    }

    // 5. Re-sync all state cleanly
    await fetchApiData();
  };

  // Directly assign an existing registered user to a project workspace via pending invitation
  const addMemberToProject = async (projId, userId) => {
    const targetProj = projects.find(p => p.id === projId || String(p.id) === String(projId));
    const targetUser = users.find(u => u.id === userId || String(u.id) === String(userId));
    if (!targetProj || !targetUser) return { success: false, message: 'User or Project not found' };

    const email = (targetUser.email || targetUser.emailid || '').trim().toLowerCase();
    if (!email) return { success: false, message: 'User has no registered email' };

    const invRes = await sendInvitation(email, targetProj.id);
    await fetchApiData();
    return { success: true, pending: true, invitation: invRes?.invitation };
  };

  // Assign or unassign a user across multiple projects
  const assignUserToProjects = async (userId, projectIds = []) => {
    const targetUser = users.find(u => u.id === userId || String(u.id) === String(userId));
    if (!targetUser) return;

    const uId = String(targetUser.id);
    const uEmail = targetUser.email ? targetUser.email.toLowerCase().trim() : '';

    const updates = [];
    for (const proj of projects) {
      let mIds = typeof proj.memberIds === 'string'
        ? proj.memberIds.split(',').map(s => s.trim()).filter(Boolean)
        : (proj.memberIds || []);
      let mEmails = typeof proj.memberEmails === 'string'
        ? proj.memberEmails.split(',').map(s => s.trim().toLowerCase()).filter(Boolean)
        : (proj.memberEmails || []);

      const shouldBeMember = projectIds.some(pId => String(pId) === String(proj.id));
      let modified = false;

      if (shouldBeMember) {
        if (!mIds.includes(uId)) {
          mIds.push(uId);
          modified = true;
        }
        if (uEmail && !mEmails.includes(uEmail)) {
          mEmails.push(uEmail);
          modified = true;
        }
      } else {
        if (mIds.includes(uId)) {
          mIds = mIds.filter(id => id !== uId);
          modified = true;
        }
        if (uEmail && mEmails.includes(uEmail)) {
          mEmails = mEmails.filter(e => e !== uEmail);
          modified = true;
        }
      }

      if (modified) {
        updates.push(updateProject(proj.id, {
          memberIds: mIds.join(','),
          memberEmails: mEmails.join(',')
        }));
      }
    }

    await Promise.all(updates);
  };

  // Accept Team Invitation (Developer / Tester)
  const acceptInvitation = async (invitationId) => {
    if (!currentUser) return { success: false };
    const targetInv = invitations.find(i => i.id === invitationId);
    const activeUrl = apiUrl || API_BASE_URL;

    try {
      await fetch(`${activeUrl}/invitations/${invitationId}/accept`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ email: currentUser.email || currentUser.emailid })
      });
    } catch (e) { }

    if (targetInv) {
      const code = targetInv.managerCode;
      const projId = targetInv.projectId;
      const updatedUser = { ...currentUser, managerCode: code };
      setCurrentUser(updatedUser);
      setUsers(prev => prev.map(u => u.id === currentUser.id ? updatedUser : u));

      // ONLY if invitation specifically designated a project ID, add user to that project
      if (projId && projId.trim()) {
        const targetProj = projects.find(p => p.id === projId || String(p.id) === String(projId));
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

          fetch(`${activeUrl}/projects/${targetProj.id}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(updatedProj)
          }).catch(() => { });
        }
      }

      setInvitations(prev => prev.map(i => i.id === invitationId ? { ...i, status: 'ACCEPTED' } : i));
      await fetchApiData();
      return { success: true, managerCode: code };
    }
    await fetchApiData();
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
    } catch (e) { }
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

  const isRootAdmin = (userToLookup = currentUser) => {
    if (!userToLookup) return false;
    return Boolean(userToLookup.rootadmin === 1 || String(userToLookup.rootadmin) === '1');
  };

  // Check if a user is an administrator or manager/editor with full management rights
  const isUserAdmin = (userToLookup = currentUser) => {
    if (!userToLookup) return false;
    return isManagerOrEditorOrRoot(userToLookup);
  };

  // Filter tasks strictly available to currentUser
  const userTasks = isUserAdmin()
    ? tasks
    : tasks.filter(t => isTaskAssignedToUser(t, currentUser));

  // Check if a project is assigned to a user
  const isUserAssignedToProject = (proj, user = currentUser) => {
    if (!proj || !user) return false;
    if (isUserAdmin(user)) return true;

    const uId = user.id ? String(user.id).trim() : '';
    const uEmail = user.email ? user.email.toLowerCase().trim() : '';
    const uName = (user.name || user.fullname) ? String(user.name || user.fullname).toLowerCase().trim() : '';

    // 1. Check if user has tasks in this project
    if (userTasks.some(t => t.projectId === proj.id || String(t.projectId) === String(proj.id))) return true;

    // 2. Check if user is in memberIds
    let mIds = [];
    if (Array.isArray(proj.memberIds)) mIds = proj.memberIds.map(String);
    else if (typeof proj.memberIds === 'string') mIds = proj.memberIds.split(',').map(s => s.trim());
    if (uId && mIds.includes(uId)) return true;

    // 3. Check if user is in memberEmails
    let mEmails = [];
    if (Array.isArray(proj.memberEmails)) mEmails = proj.memberEmails.map(e => String(e).toLowerCase().trim());
    else if (typeof proj.memberEmails === 'string') mEmails = proj.memberEmails.split(',').map(e => e.toLowerCase().trim());
    if (uEmail && mEmails.includes(uEmail)) return true;

    // 4. Check if user is lead
    if (uId && (String(proj.leadId) === uId || proj.lead === user.name)) return true;

    return false;
  };

  // Filter projects strictly available to currentUser
  const userProjects = isUserAdmin()
    ? projects
    : projects.filter(p => isUserAssignedToProject(p, currentUser));

  // Filter sprints strictly available to currentUser (sprints in assigned projects or with assigned tasks)
  const userSprints = isUserAdmin()
    ? sprints
    : sprints.filter(s => {
      if (userTasks.some(t => t.sprintId === s.id || String(t.sprintId) === String(s.id))) return true;
      if (s.projectId && userProjects.some(p => p.id === s.projectId || String(p.id) === String(s.projectId))) return true;
      return false;
    });

  // Filter issues strictly available to currentUser
  const userIssues = isUserAdmin()
    ? issues
    : issues.filter(i => {
      if (!currentUser) return false;
      const uId = currentUser.id ? String(currentUser.id).trim() : '';
      const uName = (currentUser.name || currentUser.fullname) ? String(currentUser.name || currentUser.fullname).toLowerCase().trim() : '';
      if (uId && (String(i.assigneeId) === uId || String(i.reporterId) === uId)) return true;
      if (uName && (i.assigneeName?.toLowerCase() === uName || i.reporterName?.toLowerCase() === uName)) return true;
      if (userTasks.some(t => t.id === i.linkedTaskId)) return true;
      return false;
    });

  // Filter notifications strictly available to currentUser (only notifications targeted to this user)
  const userNotifications = (notifications || []).filter(n => {
    if (!currentUser || !n) return false;
    const uId = currentUser.id ? String(currentUser.id).trim() : '';
    const uEmail = currentUser.email ? String(currentUser.email).toLowerCase().trim() : '';
    const nUid = n.userId !== undefined && n.userId !== null ? String(n.userId).trim() : '';
    const nEmail = n.userEmail ? String(n.userEmail).toLowerCase().trim() : '';

    const matchesId = uId && nUid && (nUid === uId || nUid.split(',').map(s => s.trim()).includes(uId));
    const matchesEmail = uEmail && nEmail && (nEmail === uEmail || nEmail.split(',').map(s => s.trim()).includes(uEmail));
    return matchesId || matchesEmail;
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
  }, [currentUser, projects, tasks]);

  // Synchronize currentSprint strictly with userSprints
  useEffect(() => {
    if (userSprints && userSprints.length > 0) {
      if (!currentSprint || !userSprints.some(s => s.id === currentSprint.id)) {
        setCurrentSprint(userSprints[0]);
      }
    } else {
      if (currentSprint !== null) {
        setCurrentSprint(null);
      }
    }
  }, [currentUser, sprints, tasks]);

  const selectedTask = (selectedTaskId && tasks.find(t => t.id === selectedTaskId)) || userTasks.find(t => t.id === selectedTaskId) || userTasks[0] || null;
  const selectedIssue = (selectedIssueId && issues.find(i => i.id === selectedIssueId)) || userIssues.find(i => i.id === selectedIssueId) || userIssues[0] || null;
  const selectedSprint = (selectedSprintId && sprints.find(s => s.id === selectedSprintId)) || userSprints.find(s => s.id === selectedSprintId) || userSprints[0] || null;

  const fetchUsers = async () => {
    const activeUrl = apiUrl || API_BASE_URL;
    const headers = getHeaders();
    try {
      const res = await fetch(`${activeUrl}/users`, { headers });
      if (res.ok) {
        const usersData = await res.json();
        if (usersData && Array.isArray(usersData)) {
          setUsers(usersData);
          return usersData;
        }
      }
    } catch (e) {
      console.error("Failed to fetch users", e);
    }
    return [];
  };

  return (
    <AppContext.Provider
      value={{
        users,
        setUsers,
        fetchUsers,
        currentUser,
        currentRole,
        isAuthenticated,
        authError,
        projects: userProjects,
        currentProject,
        getProjectMembers,
        isTaskAssignedToUser,
        isUserAdmin,
        addNotification,
        markNotificationRead,
        markAllNotificationsRead,
        sprints: userSprints,
        currentSprint,
        tasks: userTasks,
        issues: userIssues,
        allTasks: tasks,
        allProjects: projects,
        allSprints: sprints,
        allIssues: issues,
        workSessions,
        notifications: userNotifications,
        userNotifications,
        allNotifications: notifications,
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
        isSendToTestingModalOpen,
        setIsSendToTestingModalOpen,
        testingTargetTask,
        setTestingTargetTask,
        openSendToTestingModal,
        isOnboardingOpen,
        searchQuery,
        sidebarCollapsed,
        rolesPermissions,
        fetchRolesPermissions,
        hasPermission,
        getUserRoleName,
        canUserManageProjects,
        refreshData: fetchApiData,
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
        addMemberToProject,
        assignUserToProjects,
        isUserAssignedToProject,
        navigateTo,
        createTask,
        updateTask,
        updateTaskStatus,
        sendTaskToTesting,
        reassignTaskToDeveloper,
        deleteTask,
        openEditTaskModal,
        openEditProjectModal,
        createIssue,
        updateIssue,
        updateIssueState,
        createSprint,
        createProject,
        updateProject,
        deleteProject,
        isEditProjectModalOpen,
        setIsEditProjectModalOpen,
        editingProject,
        setEditingProject,
        // Requirements & Role Capabilities
        requirements,
        setRequirements,
        fetchRequirements,
        createRequirement,
        updateRequirement,
        deleteRequirement,
        convertRequirementToTask,
        isManagerOrEditorOrRoot,
        isRootAdmin,
        canManageTaskAssignment,
        canEditTaskScope,
        canUpdateTaskStatus,
        canSendTaskToTesting,
        isViewer,
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
