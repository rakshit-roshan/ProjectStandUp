import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Shield,
  Plus,
  Check,
  X,
  Layers,
  Users,
  MessageSquare,
  Kanban,
  Table,
  AlertCircle,
  Activity,
  HeartPulse,
  Zap,
  BarChart3,
  Award,
  CheckSquare,
  UserCheck,
  Settings,
  Save,
  Lock,
  Trash2,
  CheckCircle2
} from 'lucide-react';

export const UserRolesView = () => {
  const { currentUser, API_BASE_URL } = useApp();
  const [roles, setRoles] = useState([]);
  const [selectedRoleCode, setSelectedRoleCode] = useState(1);
  const [permissions, setPermissions] = useState([]);
  const [roleName, setRoleName] = useState('');
  const [description, setDescription] = useState('');
  const [savedMessage, setSavedMessage] = useState(false);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  
  // New Role Form
  const [newRoleName, setNewRoleName] = useState('');
  const [newDescription, setNewDescription] = useState('');

  const allFeatures = [
    { key: 'dashboard', label: 'Home Dashboard', group: 'Workspace', icon: Layers, desc: 'Access primary overview dashboard' },
    { key: 'projects', label: 'Projects Overview', group: 'Workspace', icon: Layers, desc: 'View and manage project workspaces' },
    { key: 'team_members', label: 'Team Members Roster', group: 'Workspace', icon: Users, desc: 'Access team directory & member workload' },
    { key: 'chat', label: 'Team Chats & Direct Messaging', group: 'Workspace', icon: MessageSquare, desc: 'Real-time team chat & direct messaging' },
    
    { key: 'tasks_kanban', label: 'Kanban Board View', group: 'Tasks Queue', icon: Kanban, desc: 'Visual task board columns & drag-and-drop' },
    { key: 'tasks_table', label: 'Table List View', group: 'Tasks Queue', icon: Table, desc: 'Filterable table grid for all tasks' },
    { key: 'issues', label: 'Issues Registry', group: 'Tasks Queue', icon: AlertCircle, desc: 'Track defect bug reports & issues' },
    { key: 'monitor', label: 'Team Monitor Console', group: 'Tasks Queue', icon: Activity, desc: 'Real-time active work monitor' },
    { key: 'employee_health', label: 'Work & Attendance Health', group: 'Tasks Queue', icon: HeartPulse, desc: 'Workload health & session duration' },

    { key: 'sprints', label: 'Sprints & Burndown', group: 'Management Console', icon: Zap, desc: 'Sprint planning cycles & burndown charts' },
    { key: 'reports', label: 'Reports & Analytics', group: 'Management Console', icon: BarChart3, desc: 'Sprint reports & velocity analytics' },
    { key: 'performance_review', label: 'Appraisal Reviews', group: 'Management Console', icon: Award, desc: 'Performance appraisal evaluation notes' },

    { key: 'tester_workspace', label: 'Testing Queue Module', group: 'Testing Module', icon: CheckSquare, desc: 'QA testing queue & defect reporting' },

    { key: 'user_accounts', label: 'User Accounts Console', group: 'Administration', icon: UserCheck, desc: 'Create user accounts & enable/disable access' },
    { key: 'user_roles', label: 'User Roles & Permissions', group: 'Administration', icon: Shield, desc: 'Configure feature permissions & custom roles' },
    { key: 'settings', label: 'Workspace Settings', group: 'General', icon: Settings, desc: 'Edit profile & enter manager access codes' }
  ];

  const fetchRoles = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/roles`);
      if (res.ok) {
        const data = await res.json();
        setRoles(data);
        if (data.length > 0 && !selectedRoleCode) {
          setSelectedRoleCode(data[0].roleCode);
        }
      }
    } catch (err) {
      console.error("Failed to fetch roles", err);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, [API_BASE_URL]);

  const activeRole = roles.find(r => r.roleCode === selectedRoleCode) || roles[0];

  useEffect(() => {
    if (activeRole) {
      setRoleName(activeRole.roleName || '');
      setDescription(activeRole.description || '');
      try {
        const parsed = JSON.parse(activeRole.permissionsJson || '[]');
        setPermissions(Array.isArray(parsed) ? parsed : []);
      } catch (e) {
        setPermissions([]);
      }
    }
  }, [activeRole]);

  const togglePermission = (featureKey) => {
    if (permissions.includes(featureKey)) {
      setPermissions(permissions.filter(k => k !== featureKey));
    } else {
      setPermissions([...permissions, featureKey]);
    }
  };

  const handleSaveRole = async () => {
    if (!activeRole) return;
    try {
      const res = await fetch(`${API_BASE_URL}/roles/${activeRole.roleCode}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roleName: roleName.trim(),
          description: description.trim(),
          permissionsJson: JSON.stringify(permissions)
        })
      });

      if (res.ok) {
        setSavedMessage(true);
        setTimeout(() => setSavedMessage(false), 3000);
        fetchRoles();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateRole = async (e) => {
    e.preventDefault();
    if (!newRoleName) return;

    try {
      const defaultPerms = JSON.stringify(["dashboard", "projects", "team_members", "chat", "tasks_kanban", "tasks_table", "issues", "settings"]);
      const res = await fetch(`${API_BASE_URL}/roles/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roleName: newRoleName.trim(),
          description: newDescription.trim(),
          permissionsJson: defaultPerms
        })
      });

      if (res.ok) {
        const created = await res.json();
        setIsNewModalOpen(false);
        setNewRoleName('');
        setNewDescription('');
        fetchRoles();
        setSelectedRoleCode(created.roleCode);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteRole = async (roleCode) => {
    if (!window.confirm("Are you sure you want to delete this custom role?")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/roles/${roleCode}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setSelectedRoleCode(1);
        fetchRoles();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Group features by section
  const groups = ['Workspace', 'Tasks Queue', 'Management Console', 'Testing Module', 'Administration', 'General'];

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Header Bar */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">User Roles & Feature Access Control</h1>
            <p className="text-xs text-slate-500">Configure role-based access permissions, enable/disable sidebar menus, and define custom role capabilities</p>
          </div>
        </div>

        <button
          onClick={() => setIsNewModalOpen(true)}
          className="px-4 py-2 bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white font-semibold text-xs rounded-xl shadow-md transition-all flex items-center space-x-2 shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>+ Create Custom Role</span>
        </button>
      </div>

      {/* Main Container */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column: Roles Selection Tabs */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-3">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
            Workspace Roles ({roles.length})
          </div>

          <div className="space-y-1.5">
            {roles.map((r) => {
              const isSelected = r.roleCode === selectedRoleCode;
              return (
                <div
                  key={r.roleCode}
                  onClick={() => setSelectedRoleCode(r.roleCode)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'bg-amber-50/80 border-amber-400 text-amber-900 font-bold shadow-xs'
                      : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700 font-medium'
                  }`}
                >
                  <div className="truncate pr-2">
                    <div className="text-xs truncate flex items-center space-x-1.5">
                      <span>{r.roleName}</span>
                      {r.isSystem && (
                        <span className="text-[9px] px-1.5 py-0.2 bg-slate-100 text-slate-500 rounded font-mono">System</span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate mt-0.5">{r.description || 'Custom User Role'}</div>
                  </div>

                  {!r.isSystem && r.roleCode > 4 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteRole(r.roleCode);
                      }}
                      className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
                      title="Delete Custom Role"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 3 Columns: Feature Matrix & Permission Controls */}
        <div className="lg:col-span-3 space-y-5">
          {activeRole ? (
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-6">
              {/* Role Title & Metadata */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      disabled={activeRole.isSystem}
                      value={roleName}
                      onChange={(e) => setRoleName(e.target.value)}
                      className="text-base font-bold text-slate-900 bg-transparent border-b border-transparent focus:border-amber-500 outline-none"
                    />
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-mono font-bold rounded">
                      Role Code: {activeRole.roleCode}
                    </span>
                  </div>
                  <input
                    type="text"
                    disabled={activeRole.isSystem}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Role description..."
                    className="text-xs text-slate-500 bg-transparent w-full border-b border-transparent focus:border-amber-500 outline-none"
                  />
                </div>

                <div className="flex items-center space-x-3 shrink-0">
                  {savedMessage && (
                    <span className="text-xs text-emerald-600 font-semibold flex items-center space-x-1">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Permissions Saved!</span>
                    </span>
                  )}
                  <button
                    onClick={handleSaveRole}
                    className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-all flex items-center space-x-1.5 cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Role Permissions</span>
                  </button>
                </div>
              </div>

              {/* Feature Matrix grouped by section */}
              <div className="space-y-6">
                {groups.map((groupName) => {
                  const groupFeatures = allFeatures.filter(f => f.group === groupName);
                  if (groupFeatures.length === 0) return null;

                  return (
                    <div key={groupName} className="space-y-3">
                      <div className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-1.5 flex items-center justify-between">
                        <span>{groupName}</span>
                        <span className="text-[10px] text-slate-400 font-normal">
                          {groupFeatures.filter(f => permissions.includes(f.key)).length} of {groupFeatures.length} Enabled
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {groupFeatures.map((feat) => {
                          const Icon = feat.icon;
                          const isEnabled = permissions.includes(feat.key);

                          return (
                            <div
                              key={feat.key}
                              onClick={() => togglePermission(feat.key)}
                              className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                                isEnabled
                                  ? 'bg-emerald-50/50 border-emerald-300 text-slate-900 shadow-2xs'
                                  : 'bg-slate-50/60 border-slate-200 text-slate-400 hover:border-slate-300'
                              }`}
                            >
                              <div className="flex items-center space-x-3 pr-2">
                                <div className={`p-2 rounded-lg ${isEnabled ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-400'}`}>
                                  <Icon className="w-4 h-4" />
                                </div>
                                <div>
                                  <div className={`text-xs font-bold ${isEnabled ? 'text-slate-900' : 'text-slate-500 line-through'}`}>
                                    {feat.label}
                                  </div>
                                  <div className="text-[10px] text-slate-400 mt-0.5">{feat.desc}</div>
                                </div>
                              </div>

                              {/* Interactive Toggle Switch */}
                              <div className={`w-10 h-6 rounded-full p-0.5 transition-colors shrink-0 ${isEnabled ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                                <div className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform ${isEnabled ? 'translate-x-4' : 'translate-x-0'}`} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="bg-white p-8 rounded-xl border border-slate-200 text-center text-slate-400 text-xs">
              Select a role from the left menu to configure permissions.
            </div>
          )}
        </div>
      </div>

      {/* Create Custom Role Modal */}
      {isNewModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-amber-600" />
                <h2 className="font-bold text-slate-900 text-sm">Create Custom User Role</h2>
              </div>
              <button onClick={() => setIsNewModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-sm font-bold">✕</button>
            </div>

            <form onSubmit={handleCreateRole} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Role Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., DevOps Lead, Product Owner"
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Role Description</label>
                <input
                  type="text"
                  placeholder="Responsibilities & permission scope..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-amber-500"
                />
              </div>

              <div className="pt-3 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-semibold shadow-xs"
                >
                  Create Role
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
