import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Sparkles,
  ChevronRight,
  ChevronLeft,
  X,
  Layers,
  Home,
  Users,
  MessageSquare,
  AlertCircle,
  Activity,
  HeartPulse,
  Kanban,
  BarChart3,
  Shield,
  Bell,
  Settings,
  CheckCircle2,
  Compass,
  ArrowRight
} from 'lucide-react';

export const InteractiveSpotlightTour = () => {
  const {
    currentRole,
    completeTour,
    isOnboardingOpen,
    setIsOnboardingOpen,
    navigateTo,
    currentView,
    projects = [],
    currentUser,
    canUserManageProjects
  } = useApp();

  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState(null);

  // Define comprehensive tour steps across each and every tab starting from Home to Settings
  const tourSteps = [
    // ----------------------------------------------------
    // SECTION 1: GLOBAL HEADER & NAVIGATION RAIL
    // ----------------------------------------------------
    {
      id: 'brand-logo',
      targetId: 'brand-logo',
      tabName: 'Console Overview',
      tabCategory: 'Header',
      icon: Compass,
      title: 'StandupFlow Console Header',
      content: 'Welcome to StandupFlow Enterprise! This top bar displays your active company workspace, system version, and role privileges.',
      view: 'dashboard'
    },
    {
      id: 'project-switcher',
      targetId: 'project-switcher',
      tabName: 'Project Switcher',
      tabCategory: 'Header',
      icon: Layers,
      title: 'Active Project Registry',
      content: 'Switch between active software repositories and project workspaces. All tasks, sprint cycles, defects, and team rosters adapt dynamically.',
      view: 'dashboard'
    },
    {
      id: 'global-search-bar',
      targetId: 'global-search-bar',
      tabName: 'Global Search',
      tabCategory: 'Header',
      icon: Compass,
      title: 'Global Search (Ctrl + K)',
      content: 'Quickly find any task item, defect bug, sprint cycle, or team member across your company workspace in real-time.',
      view: 'dashboard'
    },
    {
      id: 'quick-actions-bar',
      targetId: 'quick-actions-bar',
      tabName: 'Quick Actions',
      tabCategory: 'Header',
      icon: Sparkles,
      title: 'Quick Actions Bar',
      content: 'Create new sprint cycles (+ New Sprint) or add new work items (+ New Task) with one click from any screen.',
      view: 'dashboard'
    },
    {
      id: 'notifications-btn',
      targetId: 'notifications-btn',
      tabName: 'Notifications Hub',
      tabCategory: 'Header',
      icon: Bell,
      title: 'Real-Time Notification Bell',
      content: 'Receive live alerts whenever tasks are assigned, code reviews are requested, or QA testers report bugs.',
      view: 'dashboard'
    },
    {
      id: 'profile-menu',
      targetId: 'profile-menu',
      tabName: 'Profile & Menu',
      tabCategory: 'Header',
      icon: Settings,
      title: 'User Profile & Menu',
      content: 'Manage your profile, view assigned role badge, restart this console tutorial anytime, or securely sign out.',
      view: 'dashboard'
    },
    {
      id: 'sidebar-nav',
      targetId: 'sidebar-nav',
      tabName: 'Navigation Rail',
      tabCategory: 'Sidebar',
      icon: Compass,
      title: 'Role Navigation Rail',
      content: 'Your central sidebar for navigating across workspace modules: Home, Projects, Team, Chats, Issues, Monitors, Health, Kanban, Sprints, Analytics, and Settings.',
      view: 'dashboard'
    },

    // ----------------------------------------------------
    // SECTION 2: HOME TAB (Command Center)
    // ----------------------------------------------------
    {
      id: 'nav-home',
      targetId: 'nav-home',
      tabName: 'Home',
      tabCategory: 'Home Tab',
      icon: Home,
      title: 'Home Tab Navigation',
      content: 'The Home dashboard is your primary command center with high-level workspace health and daily operational status.',
      view: 'dashboard'
    },
    {
      id: 'home-welcome-banner',
      targetId: 'home-welcome-banner',
      tabName: 'Home',
      tabCategory: 'Home Tab',
      icon: Home,
      title: 'Welcome Banner & Active Sprint',
      content: 'Displays your personalized greeting, active sprint cycle status, role tag, and daily engineering motivation.',
      view: 'dashboard'
    },
    {
      id: 'home-metrics-grid',
      targetId: 'home-metrics-grid',
      tabName: 'Home',
      tabCategory: 'Home Tab',
      icon: Activity,
      title: 'Summary Metric KPI Cards',
      content: 'Six summary metric cards displaying live counts for Active Tasks, Completed Tasks, In Progress, Pending QA Review, Open Issues, and Sprint Progress %.',
      view: 'dashboard'
    },
    {
      id: 'home-sprint-overview',
      targetId: 'home-sprint-overview',
      tabName: 'Home',
      tabCategory: 'Home Tab',
      icon: Sparkles,
      title: 'Sprint Workload & Stage Counters',
      content: 'Visual workload progress bar with clickable workflow stage counters for Backlog, In Progress, In Review, and Completed.',
      view: 'dashboard'
    },
    {
      id: 'home-priority-tasks',
      targetId: 'home-priority-tasks',
      tabName: 'Home',
      tabCategory: 'Home Tab',
      icon: AlertCircle,
      title: 'Top Priority Tasks Table',
      content: 'Highlights urgent work items with task IDs, priority badges, story points, assignee stacks, and direct Edit / Delete action buttons.',
      view: 'dashboard'
    },
    {
      id: 'home-sprints-accordion',
      targetId: 'home-sprints-accordion',
      tabName: 'Home',
      tabCategory: 'Home Tab',
      icon: BarChart3,
      title: 'All Sprints & Task Breakdown Accordion',
      content: 'Collapsible accordion listing all sprint cycles in this workspace with story point totals, completion percentages, and task items.',
      view: 'dashboard'
    },
    {
      id: 'home-team-workload',
      targetId: 'home-team-workload',
      tabName: 'Home',
      tabCategory: 'Home Tab',
      icon: Users,
      title: 'Team Workload & Online Indicators',
      content: 'Live roster of teammates in this workspace with online/offline indicators, task count metrics, and workload status (Balanced, High, Overloaded).',
      view: 'dashboard'
    },
    {
      id: 'home-recent-activity',
      targetId: 'home-recent-activity',
      tabName: 'Home',
      tabCategory: 'Home Tab',
      icon: Activity,
      title: 'Recent Sprint Activity Timeline',
      content: 'Chronological timeline showing real-time task updates, sprint initializations, and work sessions as they happen.',
      view: 'dashboard'
    },

    // ----------------------------------------------------
    // SECTION 3: PROJECTS TAB
    // ----------------------------------------------------
    {
      id: 'nav-projects',
      targetId: 'nav-projects',
      tabName: 'Projects',
      tabCategory: 'Projects Tab',
      icon: Layers,
      title: 'Projects Tab Navigation',
      content: 'Click here to switch into the Projects portfolio view, tracking software repositories and multi-project workspaces.',
      view: 'project_health'
    },
    {
      id: 'projects-header',
      targetId: 'projects-header',
      tabName: 'Projects',
      tabCategory: 'Projects Tab',
      icon: Layers,
      title: 'Project Health Console Header',
      content: 'Provides an executive portfolio overview of sprint completion percentages, open defect risks, and upcoming deadlines.',
      view: 'project_health'
    },
    {
      id: 'projects-grid',
      targetId: 'projects-grid',
      tabName: 'Projects',
      tabCategory: 'Projects Tab',
      icon: Layers,
      title: 'Project Workspace Health Cards',
      content: 'Diagnostic cards for each project showing On Track / At Risk status, sprint progress %, completed tasks, open defects, and project leads. Clicking any card switches into that workspace!',
      view: 'project_health'
    },

    // ----------------------------------------------------
    // SECTION 4: TEAM MEMBERS TAB
    // ----------------------------------------------------
    {
      id: 'nav-team-members',
      targetId: 'nav-team-members',
      tabName: 'Team Members',
      tabCategory: 'Team Tab',
      icon: Users,
      title: 'Team Members Tab Navigation',
      content: 'Manage assignees, invite engineers, and control project member access.',
      view: 'team_members'
    },
    {
      id: 'team-header',
      targetId: 'team-header',
      tabName: 'Team Members',
      tabCategory: 'Team Tab',
      icon: Users,
      title: 'Project Team Roster Header',
      content: 'Displays the isolated team member roster for the active project workspace and its project code.',
      view: 'team_members'
    },
    {
      id: 'team-invite-code',
      targetId: 'team-invite-code',
      tabName: 'Team Members',
      tabCategory: 'Team Tab',
      icon: Users,
      title: 'Project Invite Code Card',
      content: 'Copy this unique workspace invite code with one click and share it with engineers and testers to let them join this project.',
      view: 'team_members'
    },
    {
      id: 'team-roster',
      targetId: 'team-roster',
      tabName: 'Team Members',
      tabCategory: 'Team Tab',
      icon: Users,
      title: 'Active Workspace Assignees Roster',
      content: 'Search and inspect team members, their assigned roles, departments, online availability, and project lead designation.',
      view: 'team_members'
    },
    {
      id: 'team-invite-form',
      targetId: 'team-invite-form',
      tabName: 'Team Members',
      tabCategory: 'Team Tab',
      icon: Users,
      title: 'Invite Member by Work Email',
      content: 'Enter an engineer’s work email to send an immediate invitation to join this active project workspace.',
      view: 'team_members'
    },
    {
      id: 'team-pending-invites',
      targetId: 'team-pending-invites',
      tabName: 'Team Members',
      tabCategory: 'Team Tab',
      icon: Users,
      title: 'Pending Invitations Queue',
      content: 'Shows all outstanding workspace invitations with their invite codes and pending acceptance states.',
      view: 'team_members'
    },
    {
      id: 'team-join-workspace',
      targetId: 'team-join-workspace',
      tabName: 'Team Members',
      tabCategory: 'Team Tab',
      icon: Users,
      title: 'Join Another Workspace',
      content: 'Enter an invitation or project code to connect to another team project workspace instantly.',
      view: 'team_members'
    },

    // ----------------------------------------------------
    // SECTION 5: CHATS TAB
    // ----------------------------------------------------
    {
      id: 'nav-chat',
      targetId: 'nav-chat',
      tabName: 'Chats',
      tabCategory: 'Chats Tab',
      icon: MessageSquare,
      title: 'Chats Tab Navigation',
      content: 'Integrated team messaging for fast collaboration without leaving your workspace.',
      view: 'chat'
    },
    {
      id: 'chat-channels-list',
      targetId: 'chat-channels-list',
      tabName: 'Chats',
      tabCategory: 'Chats Tab',
      icon: MessageSquare,
      title: 'Group Channels & Direct Chats',
      content: 'WhatsApp-style chat pane with channels (#general, #sprints), direct 1-on-1 chats, unread badges, and search filter.',
      view: 'chat'
    },
    {
      id: 'chat-create-group',
      targetId: 'chat-create-group',
      tabName: 'Chats',
      tabCategory: 'Chats Tab',
      icon: MessageSquare,
      title: 'Create Group Channel',
      content: 'Click here to launch the 2-step modal to select team members and create a new project group chat channel.',
      view: 'chat'
    },
    {
      id: 'chat-conversation-area',
      targetId: 'chat-conversation-area',
      tabName: 'Chats',
      tabCategory: 'Chats Tab',
      icon: MessageSquare,
      title: 'Real-Time Message Canvas',
      content: 'Encrypted message area supporting text messages, image previews, downloadable file attachments, and read receipts.',
      view: 'chat'
    },
    {
      id: 'chat-input-composer',
      targetId: 'chat-input-composer',
      tabName: 'Chats',
      tabCategory: 'Chats Tab',
      icon: MessageSquare,
      title: 'Message Composer & Attachments',
      content: 'Type messages, attach local documents (PDF, DOCX) or photos, and send them instantly to your teammates.',
      view: 'chat'
    },

    // ----------------------------------------------------
    // SECTION 6: ISSUES REGISTRY TAB
    // ----------------------------------------------------
    {
      id: 'nav-issues',
      targetId: 'nav-issues',
      tabName: 'Issues Registry',
      tabCategory: 'Issues Tab',
      icon: AlertCircle,
      title: 'Issues Registry Tab Navigation',
      content: 'Centralized defect tracking, triage, and bug lifecycle registry.',
      view: 'issues'
    },
    {
      id: 'issues-header',
      targetId: 'issues-header',
      tabName: 'Issues Registry',
      tabCategory: 'Issues Tab',
      icon: AlertCircle,
      title: 'Issues & Bug Registry Header',
      content: 'View defect counts, report new bugs, and inspect bug resolution timelines.',
      view: 'issues'
    },
    {
      id: 'issues-filters',
      targetId: 'issues-filters',
      tabName: 'Issues Registry',
      tabCategory: 'Issues Tab',
      icon: AlertCircle,
      title: 'State & Priority Filter Controls',
      content: 'Filter defects by State (Pending, In Progress, Done) and Priority (Critical, High, Medium, Low), or click Report Bug.',
      view: 'issues'
    },
    {
      id: 'issues-table',
      targetId: 'issues-table',
      tabName: 'Issues Registry',
      tabCategory: 'Issues Tab',
      icon: AlertCircle,
      title: 'Issues Registry Data Table',
      content: 'Comprehensive list of defect logs with issue IDs, assigned engineer, affected module, linked task, and inspect drawer.',
      view: 'issues'
    },

    // ----------------------------------------------------
    // SECTION 7: TEAM MONITOR TAB
    // ----------------------------------------------------
    {
      id: 'nav-monitor',
      targetId: 'nav-monitor',
      tabName: 'Team Monitor',
      tabCategory: 'Monitor Tab',
      icon: Activity,
      title: 'Team Monitor Tab Navigation',
      content: 'Real-time team operational monitoring, workload balancing, and live metrics.',
      view: 'monitor'
    },
    {
      id: 'monitor-header',
      targetId: 'monitor-header',
      tabName: 'Team Monitor',
      tabCategory: 'Monitor Tab',
      icon: Activity,
      title: 'Team Activity & Workload Monitor Header',
      content: 'High-level operational overview of active team members and today’s execution throughput.',
      view: 'monitor'
    },
    {
      id: 'monitor-kpi-cards',
      targetId: 'monitor-kpi-cards',
      tabName: 'Team Monitor',
      tabCategory: 'Monitor Tab',
      icon: Activity,
      title: 'Team Capacity KPI Cards',
      content: 'Summary tiles showing Total Team, Active Today, Assigned Tasks, Completed Today, In Progress, and Awaiting Review.',
      view: 'monitor'
    },
    {
      id: 'monitor-workload-table',
      targetId: 'monitor-workload-table',
      tabName: 'Team Monitor',
      tabCategory: 'Monitor Tab',
      icon: Activity,
      title: 'Member Workload Metrics Table',
      content: 'Detailed breakdown of tasks assigned, completed, and in review per team member with workload status tags.',
      view: 'monitor'
    },
    {
      id: 'monitor-workload-chart',
      targetId: 'monitor-workload-chart',
      tabName: 'Team Monitor',
      tabCategory: 'Monitor Tab',
      icon: Activity,
      title: 'Task Allocation Distribution Chart',
      content: 'Interactive bar chart visualizing task load distribution across all team members to prevent bottlenecks.',
      view: 'monitor'
    },

    // ----------------------------------------------------
    // SECTION 8: WORK HEALTH TAB
    // ----------------------------------------------------
    {
      id: 'nav-employee-health',
      targetId: 'nav-employee-health',
      tabName: 'Work Health',
      tabCategory: 'Health Tab',
      icon: HeartPulse,
      title: 'Work Health Tab Navigation',
      content: 'Engineering wellness, attendance logs, and database productivity metrics.',
      view: 'employee_health'
    },
    {
      id: 'health-header',
      targetId: 'health-header',
      tabName: 'Work Health',
      tabCategory: 'Health Tab',
      icon: HeartPulse,
      title: 'Employee Work & Attendance Health Header',
      content: 'View attendance health and switch between team members using the employee selector dropdown.',
      view: 'employee_health'
    },
    {
      id: 'health-work-log',
      targetId: 'health-work-log',
      tabName: 'Work Health',
      tabCategory: 'Health Tab',
      icon: HeartPulse,
      title: 'Recorded Work Session Logs',
      content: 'Chronological work sessions recorded in the database, including login/logout times, productive hours, and activity stream.',
      view: 'employee_health'
    },
    {
      id: 'health-metrics-card',
      targetId: 'health-metrics-card',
      tabName: 'Work Health',
      tabCategory: 'Health Tab',
      icon: HeartPulse,
      title: 'Database Telemetry Metrics Card',
      content: 'Real database metrics: logged hours this week, on-time delivery rate %, reopened bugs count, and workload health.',
      view: 'employee_health'
    },

    // ----------------------------------------------------
    // SECTION 9: TASKS QUEUE TAB
    // ----------------------------------------------------
    {
      id: 'nav-tasks-queue',
      targetId: 'nav-tasks-queue',
      tabName: 'Tasks Queue',
      tabCategory: 'Tasks Tab',
      icon: Kanban,
      title: 'Tasks Queue Navigation',
      content: 'Manage the core task execution pipeline via interactive Kanban Board and Table list views.',
      view: 'tasks_kanban'
    },
    {
      id: 'tasks-kanban-header',
      targetId: 'tasks-kanban-header',
      tabName: 'Tasks Queue',
      tabCategory: 'Tasks Tab',
      icon: Kanban,
      title: 'Sprint Kanban Board Header',
      content: 'Header controls for the Kanban board with drag & drop guidance and filters.',
      view: 'tasks_kanban'
    },
    {
      id: 'tasks-kanban-filters',
      targetId: 'tasks-kanban-filters',
      tabName: 'Tasks Queue',
      tabCategory: 'Tasks Tab',
      icon: Kanban,
      title: 'Priority & Assignee Board Filters',
      content: 'Instantly filter task cards by priority (Critical, High, Medium, Low) and by specific team member assignee.',
      view: 'tasks_kanban'
    },
    {
      id: 'tasks-kanban-board',
      targetId: 'tasks-kanban-board',
      tabName: 'Tasks Queue',
      tabCategory: 'Tasks Tab',
      icon: Kanban,
      title: '4-Stage Kanban Workflow Columns',
      content: 'Visual columns: Backlog, In Progress, In Review, and Completed. Click any card to inspect full details, subtasks, and comments.',
      view: 'tasks_kanban'
    },

    // ----------------------------------------------------
    // SECTION 10: MANAGEMENT CONSOLE (Sprints & Burndown)
    // ----------------------------------------------------
    {
      id: 'nav-management-console',
      targetId: 'nav-management-console',
      tabName: 'Management',
      tabCategory: 'Sprints Tab',
      icon: BarChart3,
      title: 'Management Console Navigation',
      content: 'Sprint planning, burndown tracking, appraisal reviews, and analytics.',
      view: 'sprints'
    },
    {
      id: 'sprint-details-header',
      targetId: 'sprint-details-header',
      tabName: 'Sprints & Burndown',
      tabCategory: 'Sprints Tab',
      icon: BarChart3,
      title: 'Sprint Details & Execution Header',
      content: 'Active sprint status badge, cycle title, and target sprint goals for the active project.',
      view: 'sprints'
    },
    {
      id: 'sprint-burndown-chart',
      targetId: 'sprint-burndown-chart',
      tabName: 'Sprints & Burndown',
      tabCategory: 'Sprints Tab',
      icon: BarChart3,
      title: 'Interactive Sprint Burndown Chart',
      content: 'Compares the ideal story point trajectory against actual completed work points across the 14-day sprint cycle.',
      view: 'sprints'
    },
    {
      id: 'sprint-metrics-card',
      targetId: 'sprint-metrics-card',
      tabName: 'Sprints & Burndown',
      tabCategory: 'Sprints Tab',
      icon: BarChart3,
      title: 'Sprint Delivery Metrics Card',
      content: 'Key sprint summary numbers: total tasks, completed tasks, in-progress items, and sprint goal completion percentage.',
      view: 'sprints'
    },

    // ----------------------------------------------------
    // SECTION 11: REPORTS & ANALYTICS
    // ----------------------------------------------------
    {
      id: 'reports-header',
      targetId: 'reports-header',
      tabName: 'Reports & Analytics',
      tabCategory: 'Analytics Tab',
      icon: BarChart3,
      title: 'Reports & Analytics Workspace Header',
      content: 'Generate audit reports, review deliverable trends, and export CSV spreadsheets.',
      view: 'reports'
    },
    {
      id: 'reports-status-pie',
      targetId: 'reports-status-pie',
      tabName: 'Reports & Analytics',
      tabCategory: 'Analytics Tab',
      icon: BarChart3,
      title: 'Task Status Breakdown Pie Chart',
      content: 'Visual distribution chart showing the proportion of tasks across Completed, In Progress, In Review, and Backlog.',
      view: 'reports'
    },
    {
      id: 'reports-velocity-chart',
      targetId: 'reports-velocity-chart',
      tabName: 'Reports & Analytics',
      tabCategory: 'Analytics Tab',
      icon: BarChart3,
      title: 'Historical Velocity & Story Points Chart',
      content: 'Compares committed story points vs completed story points across past and present sprint iterations.',
      view: 'reports'
    },

    // ----------------------------------------------------
    // SECTION 12: ADMINISTRATOR CONTROLS
    // ----------------------------------------------------
    {
      id: 'nav-admin',
      targetId: 'nav-admin',
      tabName: 'Administrator',
      tabCategory: 'Admin Tab',
      icon: Shield,
      title: 'Administrator Controls Navigation',
      content: 'Enterprise user management, role permissions, and access governance.',
      view: 'user_accounts'
    },
    {
      id: 'admin-header',
      targetId: 'admin-header',
      tabName: 'Administrator',
      tabCategory: 'Admin Tab',
      icon: Shield,
      title: 'User Accounts & Workspace Management Header',
      content: 'Enterprise governance overview showing your company workspace ID and tenant user administration.',
      view: 'user_accounts'
    },
    {
      id: 'admin-create-account-btn',
      targetId: 'admin-create-account-btn',
      tabName: 'Administrator',
      tabCategory: 'Admin Tab',
      icon: Shield,
      title: 'Create New User Account',
      content: 'Opens the account creation modal to create login credentials and assign custom roles to new employees.',
      view: 'user_accounts'
    },
    {
      id: 'admin-accounts-table',
      targetId: 'admin-accounts-table',
      tabName: 'Administrator',
      tabCategory: 'Admin Tab',
      icon: Shield,
      title: 'User Accounts & Access Table',
      content: 'Complete account registry: change user roles, enable/disable access, and manage employee accounts with live backend persistence.',
      view: 'user_accounts'
    },

    // ----------------------------------------------------
    // SECTION 13: NOTIFICATIONS CENTER
    // ----------------------------------------------------
    {
      id: 'nav-notifications',
      targetId: 'nav-notifications',
      tabName: 'Notifications',
      tabCategory: 'Notifications Tab',
      icon: Bell,
      title: 'Notifications Tab Navigation',
      content: 'Dedicated full-page notification and activity alert center.',
      view: 'notifications'
    },
    {
      id: 'notifications-center-header',
      targetId: 'notifications-center-header',
      tabName: 'Notifications',
      tabCategory: 'Notifications Tab',
      icon: Bell,
      title: 'Notification Center Header & Filter',
      content: 'Toggle between all notifications and unread alerts, or mark all notifications as read in one click.',
      view: 'notifications'
    },
    {
      id: 'notifications-list',
      targetId: 'notifications-list',
      tabName: 'Notifications',
      tabCategory: 'Notifications Tab',
      icon: Bell,
      title: 'Real-Time Notification Feed',
      content: 'Interactive feed of alerts for task handoffs, code reviews, and defect reports. Clicking any item opens the relevant task details drawer.',
      view: 'notifications'
    },

    // ----------------------------------------------------
    // SECTION 14: SETTINGS TAB (The Last Option!)
    // ----------------------------------------------------
    {
      id: 'nav-settings',
      targetId: 'nav-settings',
      tabName: 'Settings',
      tabCategory: 'Settings Tab',
      icon: Settings,
      title: 'Settings Tab Navigation',
      content: 'Configure your profile, password, MariaDB database, server ports, and system preferences.',
      view: 'settings'
    },
    {
      id: 'settings-header',
      targetId: 'settings-header',
      tabName: 'Settings',
      tabCategory: 'Settings Tab',
      icon: Settings,
      title: 'System & Workspace Settings Header',
      content: 'Centralized settings for personal account preferences and enterprise infrastructure configuration.',
      view: 'settings'
    },
    {
      id: 'settings-tabs-bar',
      targetId: 'settings-tabs-bar',
      tabName: 'Settings',
      tabCategory: 'Settings Tab',
      icon: Settings,
      title: 'Settings Categories Bar',
      content: 'Easily switch between: Profile Picture, Password, MariaDB Database, Port Settings, and Read-Only Account Info.',
      view: 'settings'
    },
    {
      id: 'settings-tab-profile',
      targetId: 'settings-tab-profile',
      tabName: 'Settings',
      tabCategory: 'Settings Tab',
      icon: Settings,
      title: 'Profile Picture & Avatar Options',
      content: 'Upload your custom photo (up to 2MB) or pick from built-in avatar presets with live preview.',
      view: 'settings'
    },
    {
      id: 'settings-tab-password',
      targetId: 'settings-tab-password',
      tabName: 'Settings',
      tabCategory: 'Settings Tab',
      icon: Settings,
      title: 'Password Security & Strength Meter',
      content: 'Update your password with real-time 6-level strength verification (length, uppercase, lowercase, numbers, symbols, matching).',
      view: 'settings'
    },
    {
      id: 'settings-tab-mariadb',
      targetId: 'settings-tab-mariadb',
      tabName: 'Settings',
      tabCategory: 'Settings Tab',
      icon: Settings,
      title: 'MariaDB Database Settings & Live Test',
      content: 'Configure MariaDB host, port (3306), database name, username, and test the database connection live.',
      view: 'settings'
    },
    {
      id: 'settings-tab-ports',
      targetId: 'settings-tab-ports',
      tabName: 'Settings',
      tabCategory: 'Settings Tab',
      icon: Settings,
      title: 'Server Ports & API URL Settings',
      content: 'View or modify the Spring Boot server port (8080), Vite frontend port (3000), and copy the API Base URL with one click.',
      view: 'settings'
    },
    {
      id: 'settings-tab-readonly',
      targetId: 'settings-tab-readonly',
      tabName: 'Settings',
      tabCategory: 'Settings Tab',
      icon: Settings,
      title: 'Account Information (Read-Only)',
      content: 'Displays system-governed account data: Full Name, Username, Email Address, and Copyable Company Workspace ID.',
      view: 'settings'
    },

    // ----------------------------------------------------
    // SECTION 15: COMPLETION
    // ----------------------------------------------------
    {
      id: 'nav-console-tour',
      targetId: 'nav-console-tour',
      tabName: 'Console Tour',
      tabCategory: 'Completed',
      icon: Sparkles,
      title: 'Console Tour Completed! 🚀',
      content: 'Congratulations! You have toured every tab and feature in StandupFlow. You can restart this tutorial at any time by clicking "Console Tour" in the left menu or "Restart Console Tutorial" from the Header profile dropdown.',
      view: 'settings'
    }
  ];

  const currentStepData = tourSteps[currentStep] || tourSteps[0];
  const StepIcon = currentStepData.icon || Sparkles;

  // Whenever the tour opens, reset step to 0 and switch to step 0 view
  useEffect(() => {
    if (isOnboardingOpen) {
      setCurrentStep(0);
      if (tourSteps[0]?.view && currentView !== tourSteps[0].view) {
        navigateTo(tourSteps[0].view);
      }
    }
  }, [isOnboardingOpen]);

  // Handle navigating view when step changes
  useEffect(() => {
    if (!isOnboardingOpen) return;
    if (currentStepData.view && currentView !== currentStepData.view) {
      navigateTo(currentStepData.view);
    }
  }, [currentStep, isOnboardingOpen]);

  // Spotlight position updater
  useEffect(() => {
    if (!isOnboardingOpen) return;

    let retryCount = 0;
    const maxRetries = 5;

    const updateSpotlight = () => {
      const el = document.getElementById(currentStepData.targetId);
      if (el) {
        const rect = el.getBoundingClientRect();
        // Check if element has dimensions
        if (rect.width > 0 && rect.height > 0) {
          setTargetRect({
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height
          });
          el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          return;
        }
      }

      if (retryCount < maxRetries) {
        retryCount++;
        setTimeout(updateSpotlight, 120);
      } else {
        setTargetRect(null);
      }
    };

    // Small delay to allow view render
    const timeout = setTimeout(updateSpotlight, 80);
    window.addEventListener('resize', updateSpotlight);
    window.addEventListener('scroll', updateSpotlight, true);

    return () => {
      clearTimeout(timeout);
      window.removeEventListener('resize', updateSpotlight);
      window.removeEventListener('scroll', updateSpotlight, true);
    };
  }, [currentStep, isOnboardingOpen, currentView]);

  // Keyboard navigation support
  useEffect(() => {
    if (!isOnboardingOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight' || e.key === 'Enter') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'Escape') {
        handleSkip();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentStep, isOnboardingOpen]);

  const canManageProjects = canUserManageProjects ? canUserManageProjects(currentUser) : false;
  if (!isOnboardingOpen || (!canManageProjects && (!projects || projects.length === 0))) return null;

  const handleSkip = () => {
    completeTour();
    setIsOnboardingOpen(false);
  };

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      completeTour();
      setIsOnboardingOpen(false);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleJumpToStep = (index) => {
    setCurrentStep(index);
  };

  // Distinct categories for quick jump
  const uniqueCategories = Array.from(
    new Set(tourSteps.map(s => s.tabCategory))
  );

  // Compute tooltip position
  const getPopoverStyle = () => {
    if (!targetRect) {
      return {
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        position: 'fixed'
      };
    }

    const popoverWidth = 360;
    const popoverHeight = 240;
    const padding = 16;

    // Prefer below the target, or above if near bottom
    let top = targetRect.top + targetRect.height + 12;
    if (top + popoverHeight > window.innerHeight - padding) {
      top = Math.max(padding, targetRect.top - popoverHeight - 12);
    }

    // Align left with target, clamped within screen
    let left = targetRect.left;
    if (left + popoverWidth > window.innerWidth - padding) {
      left = Math.max(padding, window.innerWidth - popoverWidth - padding);
    }
    if (left < padding) left = padding;

    return {
      top: `${top}px`,
      left: `${left}px`,
      position: 'fixed'
    };
  };

  const progressPercent = Math.round(((currentStep + 1) / tourSteps.length) * 100);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden pointer-events-auto select-none">
      {/* Dark Scrim Backdrop */}
      <div
        className="absolute inset-0 bg-slate-950/70 transition-all duration-300 backdrop-blur-2xs"
        onClick={handleSkip}
      />

      {/* Target Element Glowing Spotlight Ring */}
      {targetRect && (
        <div
          className="absolute border-2 border-blue-500 rounded-xl shadow-[0_0_35px_rgba(37,99,235,0.85)] transition-all duration-300 pointer-events-none animate-pulse ring-4 ring-blue-500/20"
          style={{
            top: `${Math.max(0, targetRect.top - 4)}px`,
            left: `${Math.max(0, targetRect.left - 4)}px`,
            width: `${targetRect.width + 8}px`,
            height: `${targetRect.height + 8}px`
          }}
        />
      )}

      {/* Interactive Tooltip Card */}
      <div
        className="z-50 w-[360px] max-w-[92vw] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        style={getPopoverStyle()}
        onClick={e => e.stopPropagation()}
      >
        {/* Progress Bar Top Strip */}
        <div className="w-full h-1.5 bg-slate-100">
          <div
            className="h-full bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Card Header */}
        <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-700 border border-blue-200 flex items-center space-x-1">
              <StepIcon className="w-3 h-3" />
              <span>{currentStepData.tabCategory}</span>
            </span>
            <span className="text-[11px] font-mono font-bold text-slate-500">
              {currentStep + 1}/{tourSteps.length}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleSkip}
              className="text-slate-400 hover:text-slate-700 p-1 rounded-md text-xs font-semibold flex items-center transition-colors hover:bg-slate-200/60"
              title="Dismiss Guide"
            >
              <span className="text-[11px] mr-1">Dismiss Guide</span>
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Card Content Body */}
        <div className="p-5 space-y-3">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-500/20 font-bold text-xs mt-0.5">
              {currentStep + 1}
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 leading-snug">
                {currentStepData.title}
              </h3>
              <span className="text-[10px] font-medium text-blue-600 block mt-0.5">
                Tab: {currentStepData.tabName}
              </span>
            </div>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed pl-11">
            {currentStepData.content}
          </p>

          {/* Tab Quick Selector Dropdown */}
          <div className="pt-2 pl-11">
            <select
              value={currentStep}
              onChange={(e) => handleJumpToStep(Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-lg px-2.5 py-1 text-[11px] font-semibold outline-none focus:border-blue-500 cursor-pointer"
            >
              {tourSteps.map((s, idx) => (
                <option key={s.id + idx} value={idx}>
                  Step {idx + 1}: [{s.tabCategory}] {s.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Card Navigation Footer */}
        <div className="px-5 py-3.5 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between text-xs">
          <button
            onClick={handlePrev}
            disabled={currentStep === 0}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1 transition-colors ${
              currentStep === 0
                ? 'text-slate-300 cursor-not-allowed'
                : 'text-slate-700 hover:bg-slate-200/80 active:bg-slate-300'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <button
            onClick={handleNext}
            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs rounded-lg shadow-md shadow-blue-500/20 transition-all flex items-center space-x-1.5 cursor-pointer"
          >
            <span>{currentStep === tourSteps.length - 1 ? 'Finish Tour 🚀' : 'Next Option'}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
