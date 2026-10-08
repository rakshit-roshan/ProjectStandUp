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
  const { users, setUsers, fetchUsers, currentUser, API_BASE_URL, fetchRolesPermissions } = useApp();
  const [roles, setRoles] = useState([]);
  const [selectedRoleCode, setSelectedRoleCode] = useState(1);
  const [permissions, setPermissions] = useState([]);
  const [roleName, setRoleName] = useState('');
  const [description, setDescription] = useState('');
  const [savedMessage, setSavedMessage] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  
  // New Role Form State
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [modalError, setModalError] = useState(null);
  const [isCreating, setIsCreating] = useState(false);

  // Delete Role & Reassign State
  const [deleteTargetRole, setDeleteTargetRole] = useState(null);
  const [assignedUsersForDelete, setAssignedUsersForDelete] = useState([]);
  const [replacementRoleCode, setReplacementRoleCode] = useState(1);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  const allFeatures = [
    { key: 'dashboard', label: 'Home', group: 'Workspace', icon: Layers, desc: 'Access primary overview dashboard' },
    { key: 'projects', label: 'Projects', group: 'Workspace', icon: Layers, desc: 'View and manage project workspaces' },
    { key: 'team_members', label: 'Team Members', group: 'Workspace', icon: Users, desc: 'Access team directory & member workload' },
    { key: 'chat', label: 'Chats', group: 'Workspace', icon: MessageSquare, desc: 'Real-time team chat & direct messaging' },
    { key: 'issues', label: 'Issues Registry', group: 'Workspace', icon: AlertCircle, desc: 'Track defect bug reports & issues' },
    { key: 'monitor', label: 'Team Monitor', group: 'Workspace', icon: Activity, desc: 'Real-time active work monitor' },
    { key: 'employee_health', label: 'Work Health', group: 'Workspace', icon: HeartPulse, desc: 'Workload health & session duration' },

    { key: 'tasks_kanban', label: 'Kanban Board', group: 'Tasks Queue', icon: Kanban, desc: 'Visual task board columns & drag-and-drop' },
    { key: 'tasks_table', label: 'Table List View', group: 'Tasks Queue', icon: Table, desc: 'Filterable table grid for all tasks' },

    { key: 'sprints', label: 'Sprints & Burndown', group: 'Management Console', icon: Zap, desc: 'Sprint planning cycles & burndown charts' },
    { key: 'reports', label: 'Reports & Analytics', group: 'Management Console', icon: BarChart3, desc: 'Sprint reports & velocity analytics' },
    { key: 'performance_review', label: 'Appraisal Reviews', group: 'Management Console', icon: Award, desc: 'Performance appraisal evaluation notes' },

    { key: 'tester_workspace', label: 'Testing Queue', group: 'Testing Module', icon: CheckSquare, desc: 'QA testing queue & defect reporting' },

    { key: 'user_accounts', label: 'User Accounts', group: 'Administration', icon: UserCheck, desc: 'Create user accounts & enable/disable access' },
    { key: 'user_roles', label: 'User Roles', group: 'Administration', icon: Shield, desc: 'Configure feature permissions & custom roles' },
    { key: 'settings', label: 'Settings (Enter Code)', group: 'General', icon: Settings, desc: 'Edit profile & enter manager access codes' }
  ];

  const getHeaders = () => {
    const headers = { 'Content-Type': 'application/json' };
    const companyId = currentUser?.companyId || localStorage.getItem('standupflow_company_id');
    if (companyId) {
      headers['X-Company-Id'] = companyId;
    }
    return headers;
  };

  const fetchRoles = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/roles`, { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
        setRoles(data);
        const customs = data.filter(r => !r.isSystem && Number(r.roleCode) > 4);
        if (customs.length > 0) {
          if (!selectedRoleCode || !customs.some(r => r.roleCode === selectedRoleCode)) {
            setSelectedRoleCode(customs[0].roleCode);
          }
        } else {
          setSelectedRoleCode(null);
        }
      }
    } catch (err) {
      console.error("Failed to fetch roles", err);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, [API_BASE_URL]);

  const customRoles = roles.filter(r => !r.isSystem && Number(r.roleCode) > 4);
  const activeRole = customRoles.find(r => r.roleCode === selectedRoleCode);

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
    if (!roleName.trim()) {
      setSaveError("Role name cannot be empty.");
      return;
    }

    setSaveError(null);
    setIsSaving(true);
    try {
      const res = await fetch(`${API_BASE_URL}/roles/${activeRole.roleCode}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({
          roleName: roleName.trim(),
          description: description.trim(),
          permissionsJson: JSON.stringify(permissions)
        })
      });

      if (res.ok) {
        setSavedMessage(true);
        setTimeout(() => setSavedMessage(false), 3000);
        await fetchRoles();
        if (fetchRolesPermissions) fetchRolesPermissions();
      } else {
        const errText = await res.text();
        setSaveError(errText || "Failed to update role.");
      }
    } catch (err) {
      console.error(err);
      setSaveError("Server connection error.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateRole = async (e) => {
    e.preventDefault();
    if (!newRoleName.trim()) {
      setModalError("Role name is required.");
      return;
    }

    setModalError(null);
    setIsCreating(true);

    try {
      const defaultPerms = JSON.stringify(allFeatures.map(f => f.key));
      const res = await fetch(`${API_BASE_URL}/roles/create`, {
        method: 'POST',
        headers: getHeaders(),
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
        await fetchRoles();
        if (fetchRolesPermissions) fetchRolesPermissions();
        setSelectedRoleCode(created.roleCode);
      } else {
        const errText = await res.text();
        setModalError(errText || "Failed to create custom role.");
      }
    } catch (err) {
      console.error(err);
      setModalError("Server error while creating role.");
    } finally {
      setIsCreating(false);
    }
  };

  const initiateDeleteRole = (roleToDel) => {
    if (!roleToDel) return;
    setDeleteError(null);
    const affectedUsers = (users || []).filter(u => {
      const uRoleCode = Number(u.roleCode !== undefined && u.roleCode !== null ? u.roleCode : (u.role === 'ADMIN' ? 1 : (u.role || 1)));
      return uRoleCode === Number(roleToDel.roleCode);
    });
    setAssignedUsersForDelete(affectedUsers);

    // Pick default replacement role (Company Admin [1] or first available remaining role)
    const remainingRoles = roles.filter(r => Number(r.roleCode) !== Number(roleToDel.roleCode));
    const defaultReplacement = remainingRoles.length > 0 ? Number(remainingRoles[0].roleCode) : 1;
    setReplacementRoleCode(defaultReplacement);

    setDeleteTargetRole(roleToDel);
  };

  const handleConfirmDeleteRole = async () => {
    if (!deleteTargetRole) return;
    setIsDeleting(true);
    setDeleteError(null);

    try {
      // Step 1: Reassign all affected user accounts to replacementRoleCode first!
      if (assignedUsersForDelete.length > 0) {
        for (const usr of assignedUsersForDelete) {
          const res = await fetch(`${API_BASE_URL}/users/${usr.id}/update-role`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify({ role: replacementRoleCode, roleCode: replacementRoleCode })
          });
          if (!res.ok) {
            throw new Error(`Failed to reassign role for user ${usr.fullname || usr.name}`);
          }
        }
        if (fetchUsers) await fetchUsers();
      }

      // Step 2: Delete the custom role from backend
      const deleteRes = await fetch(`${API_BASE_URL}/roles/${deleteTargetRole.roleCode}`, {
        method: 'DELETE',
        headers: getHeaders()
      });

      if (deleteRes.ok) {
        setDeleteTargetRole(null);
        setSelectedRoleCode(null);
        await fetchRoles();
        if (fetchRolesPermissions) fetchRolesPermissions();
      } else {
        const errTxt = await deleteRes.text();
        setDeleteError(errTxt || "Failed to delete role.");
      }
    } catch (err) {
      console.error(err);
      setDeleteError(err.message || "Error occurred while reassigning users and deleting role.");
    } finally {
      setIsDeleting(false);
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
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">Custom User Roles & Feature Permissions</h1>
            <p className="text-xs text-slate-500">Create custom organizational roles and configure specific feature access permissions</p>
          </div>
        </div>

        <button
          onClick={() => setIsNewModalOpen(true)}
          className="px-4 py-2 bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white font-semibold text-xs rounded-xl shadow-md transition-all flex items-center space-x-2 shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Create Custom Role</span>
        </button>
      </div>

      {/* Main Container */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column: Custom Roles Selection Tabs */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-3">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
            Custom Roles ({customRoles.length})
          </div>

          {customRoles.length > 0 ? (
            <div className="space-y-1.5">
              {customRoles.map((r) => {
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
                      <div className="text-xs truncate font-bold">{r.roleName}</div>
                      <div className="text-[10px] text-slate-400 truncate mt-0.5">{r.description || 'Custom Role'}</div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        initiateDeleteRole(r);
                      }}
                      className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded cursor-pointer"
                      title="Delete Custom Role"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-4 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-center space-y-2">
              <div className="text-xs font-semibold text-slate-600">No Custom Roles</div>
              <p className="text-[11px] text-slate-400 leading-snug">Click 'Create Custom Role' above to define new roles.</p>
            </div>
          )}
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
                      value={roleName}
                      onChange={(e) => setRoleName(e.target.value)}
                      placeholder="Custom Role Name..."
                      className="text-base font-bold text-slate-900 bg-slate-50 border border-slate-200 focus:bg-white rounded-lg px-2.5 py-1 focus:border-amber-500 outline-none transition-all"
                    />
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-mono font-bold rounded">
                      Role Code: {activeRole.roleCode}
                    </span>
                  </div>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Role description & permission scope..."
                    className="text-xs text-slate-600 bg-slate-50 border border-slate-200 focus:bg-white rounded-lg px-2.5 py-1 w-full focus:border-amber-500 outline-none transition-all"
                  />
                </div>

                <div className="flex items-center space-x-3 shrink-0">
                  {savedMessage && (
                    <span className="text-xs text-emerald-600 font-semibold flex items-center space-x-1">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Permissions & Role Saved!</span>
                    </span>
                  )}
                  {saveError && (
                    <span className="text-xs text-red-600 font-semibold flex items-center space-x-1">
                      <AlertCircle className="w-4 h-4" />
                      <span>{saveError}</span>
                    </span>
                  )}
                  <button
                    onClick={() => initiateDeleteRole(activeRole)}
                    className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 font-semibold text-xs rounded-xl border border-red-200 transition-all flex items-center space-x-1 cursor-pointer"
                    title="Delete Role"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                  <button
                    onClick={handleSaveRole}
                    disabled={isSaving}
                    className="px-5 py-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-semibold text-xs rounded-xl shadow-xs transition-all flex items-center space-x-1.5 cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>{isSaving ? 'Saving...' : 'Save Role Permissions'}</span>
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
            <div className="bg-white p-10 rounded-2xl border border-slate-200 text-center space-y-4 shadow-2xs">
              <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto">
                <Shield className="w-6 h-6" />
              </div>
              <div className="max-w-md mx-auto space-y-1">
                <h3 className="text-sm font-bold text-slate-900">No Custom User Role Selected</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Default system roles (Company Administrator, Engineering Manager, Software Engineer, QA / Tester) have fixed governance permissions. Create custom roles to grant tailored access for team members.
                </p>
              </div>
              <button
                onClick={() => setIsNewModalOpen(true)}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-all inline-flex items-center space-x-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Create Custom Role</span>
              </button>
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

            {modalError && (
              <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs font-medium">
                {modalError}
              </div>
            )}

            <form onSubmit={handleCreateRole} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Role Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., DevOps Lead, Product Owner"
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-amber-500 font-semibold"
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
                  disabled={isCreating}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white rounded-lg font-semibold shadow-xs"
                >
                  {isCreating ? 'Creating...' : 'Create Role'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete / Reassign Role Confirmation Modal */}
      {deleteTargetRole && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2 text-red-600">
                <Trash2 className="w-5 h-5" />
                <h2 className="font-bold text-slate-900 text-sm">
                  {assignedUsersForDelete.length > 0 ? 'Role Currently Assigned - Reassign Required' : 'Delete Custom Role'}
                </h2>
              </div>
              <button onClick={() => setDeleteTargetRole(null)} className="text-slate-400 hover:text-slate-600 text-sm font-bold cursor-pointer">✕</button>
            </div>

            {deleteError && (
              <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs font-medium">
                {deleteError}
              </div>
            )}

            {assignedUsersForDelete.length > 0 ? (
              /* Case B: Role IS assigned to 1 or more user accounts */
              <div className="space-y-4 text-xs">
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-1">
                  <div className="font-bold text-amber-900 flex items-center space-x-1.5">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Role '{deleteTargetRole.roleName}' is assigned to {assignedUsersForDelete.length} user account(s)</span>
                  </div>
                  <div className="text-[11px] text-amber-800 font-medium">
                    Users: {assignedUsersForDelete.map(u => u.fullname || u.name || u.username).join(', ')}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block font-semibold text-slate-800 text-xs">
                    Assign role to all the Users of role <strong className="text-slate-900 font-bold">{deleteTargetRole.roleName}</strong>:
                  </label>
                  <select
                    value={replacementRoleCode}
                    onChange={(e) => setReplacementRoleCode(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-900 outline-none focus:border-amber-500 focus:bg-white transition-all cursor-pointer shadow-2xs"
                  >
                    {roles
                      .filter(r => Number(r.roleCode) !== Number(deleteTargetRole.roleCode))
                      .map(r => (
                        <option key={r.roleCode} value={r.roleCode}>
                          {r.roleName}
                        </option>
                      ))}
                  </select>
                </div>
              </div>
            ) : (
              /* Case A: Role is NOT assigned to any user account */
              <div className="space-y-2 text-xs text-slate-600">
                <p>
                  Are you sure you want to delete the custom role <strong className="text-slate-900">"{deleteTargetRole.roleName}"</strong>?
                </p>
                <p className="text-[11px] text-slate-400">
                  No user accounts are currently assigned to this role. This action cannot be undone.
                </p>
              </div>
            )}

            <div className="pt-3 flex items-center justify-end space-x-2">
              <button
                type="button"
                onClick={() => setDeleteTargetRole(null)}
                className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDeleteRole}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center space-x-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>
                  {isDeleting
                    ? 'Processing...'
                    : assignedUsersForDelete.length > 0
                    ? 'Reassign Users & Delete Role'
                    : 'Delete Role'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
