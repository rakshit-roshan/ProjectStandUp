import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';

// Dashboards
import { ManagerDashboard } from './components/dashboard/ManagerDashboard';
import { DeveloperDashboard } from './components/dashboard/DeveloperDashboard';
import { TesterDashboard } from './components/dashboard/TesterDashboard';

// Tasks
import { KanbanView } from './components/tasks/KanbanView';
import { TableView } from './components/tasks/TableView';
import { TaskDetailsDrawer } from './components/tasks/TaskDetailsDrawer';

// Issues
import { IssuesTableView } from './components/issues/IssuesTableView';
import { IssueDetailsDrawer } from './components/issues/IssueDetailsDrawer';

// Sprints
import { SprintDetailsView } from './components/sprints/SprintDetailsView';

// Monitor & Health
import { TeamMonitorDashboard } from './components/monitor/TeamMonitorDashboard';
import { EmployeeHealthDashboard } from './components/health/EmployeeHealthDashboard';
import { ProjectHealthDashboard } from './components/health/ProjectHealthDashboard';
import { PerformanceReviewView } from './components/health/PerformanceReviewView';

// Testing & Analytics
import { BugReportModal } from './components/testing/BugReportModal';
import { ReportsAnalyticsView } from './components/analytics/ReportsAnalyticsView';
import { NotificationsCenterView } from './components/notifications/NotificationsCenterView';
import { SettingsView } from './components/settings/SettingsView';
import { TeamMembersView } from './components/team/TeamMembersView';
import { TeamChatView } from './components/chat/TeamChatView';

// Admin & Governance
import { UserAccountsView } from './components/admin/UserAccountsView';
import { UserRolesView } from './components/admin/UserRolesView';

// Auth & Tour
import { LoginPage } from './components/auth/LoginPage';
import { RegisterPage } from './components/auth/RegisterPage';
import { InteractiveSpotlightTour } from './components/auth/InteractiveSpotlightTour';

// Modals
import { CreateTaskModal } from './components/modals/CreateTaskModal';
import { EditTaskModal } from './components/modals/EditTaskModal';
import { CreateSprintModal } from './components/modals/CreateSprintModal';
import { CreateProjectModal } from './components/modals/CreateProjectModal';
import { EditProjectModal } from './components/modals/EditProjectModal';

const MainContent = () => {
  const { isAuthenticated, currentView } = useApp();

  if (!isAuthenticated) {
    if (currentView === 'register') return <RegisterPage />;
    return <LoginPage />;
  }

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <ManagerDashboard />;
      case 'developer_workspace':
        return <DeveloperDashboard />;
      case 'tester_workspace':
        return <TesterDashboard />;
      case 'team_members':
        return <TeamMembersView />;
      case 'chat':
        return <TeamChatView />;
      case 'tasks_kanban':
        return <KanbanView />;
      case 'tasks_table':
        return <TableView />;
      case 'issues':
        return <IssuesTableView />;
      case 'sprints':
      case 'sprint_details':
        return <SprintDetailsView />;
      case 'monitor':
        return <TeamMonitorDashboard />;
      case 'employee_health':
        return <EmployeeHealthDashboard />;
      case 'project_health':
        return <ProjectHealthDashboard />;
      case 'performance_review':
        return <PerformanceReviewView />;
      case 'reports':
        return <ReportsAnalyticsView />;
      case 'user_accounts':
        return <UserAccountsView />;
      case 'user_roles':
        return <UserRolesView />;
      case 'notifications':
        return <NotificationsCenterView />;
      case 'settings':
        return <SettingsView />;
      case 'login':
        return <LoginPage />;
      case 'register':
        return <RegisterPage />;
      default:
        return <ManagerDashboard />;
    }
  };

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col bg-slate-100 font-sans text-slate-900">
      <Header />
      <div className="flex-1 flex overflow-hidden min-h-0 relative">
        <Sidebar />
        <main className="flex-1 h-full overflow-y-auto bg-slate-50 relative p-4 md:p-6 min-w-0" style={{ background: '#e5f4fa38' }}>
          {renderView()}
        </main>
      </div>

      {/* Flyout Drawers & Global Modals */}
      <TaskDetailsDrawer />
      <IssueDetailsDrawer />
      <CreateTaskModal />
      <EditTaskModal />
      <CreateSprintModal />
      <CreateProjectModal />
      <EditProjectModal />
      <BugReportModal />

      {/* Interactive Element-Targeted Console Spotlight Tour */}
      <InteractiveSpotlightTour />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
