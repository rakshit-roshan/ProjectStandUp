import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Users,
  UserPlus,
  Shield,
  CheckCircle2,
  XCircle,
  Key,
  Mail,
  Building,
  User,
  Search,
  Lock,
  Edit3,
  Power
} from 'lucide-react';

export const UserAccountsView = () => {
  const { users, currentUser, rolesPermissions, fetchRolesPermissions, createUser, toggleEnableUser, updateUserRole, API_BASE_URL } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [rolesList, setRolesList] = useState([]);
  
  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRoleCode, setSelectedRoleCode] = useState(3);
  const [department, setDepartment] = useState('Engineering');
  const [formError, setFormError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadRoles = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/roles`);
        if (res.ok) {
          const data = await res.json();
          setRolesList(data);
        }
      } catch (err) {
        console.error("Failed to load roles", err);
      }
    };
    loadRoles();
  }, [API_BASE_URL]);

  const defaultRoles = [
    { roleCode: 1, roleName: 'Company Administrator' },
    { roleCode: 2, roleName: 'Engineering Manager' },
    { roleCode: 3, roleName: 'Software Engineer' },
    { roleCode: 4, roleName: 'QA / Tester' }
  ];

  const activeRoles = rolesList.length > 0 ? rolesList : defaultRoles;

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!name || !email) {
      setFormError("Full Name and Email are required.");
      return;
    }
    setFormError(null);
    setLoading(true);

    try {
      const targetRoleObj = activeRoles.find(r => Number(r.roleCode) === Number(selectedRoleCode));
      const roleName = targetRoleObj ? targetRoleObj.roleName : 'DEVELOPER';

      const res = await fetch(`${API_BASE_URL}/users/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          username: username.trim() || name.trim().toLowerCase().replaceAll(/\s+/g, '_'),
          password: password.trim() || 'Password123!',
          role: String(selectedRoleCode),
          department: department.trim(),
          managerCode: currentUser?.managerCode || 'ORG99'
        })
      });

      if (res.ok) {
        setIsModalOpen(false);
        setName('');
        setEmail('');
        setUsername('');
        setPassword('');
        window.location.reload();
      } else {
        const text = await res.text();
        setFormError(text || "Failed to create user account.");
      }
    } catch (err) {
      setFormError("Server connection error.");
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = (users || []).filter(u => {
    const q = searchQuery.toLowerCase();
    return (
      (u.fullname && u.fullname.toLowerCase().includes(q)) ||
      (u.name && u.name.toLowerCase().includes(q)) ||
      (u.emailid && u.emailid.toLowerCase().includes(q)) ||
      (u.username && u.username.toLowerCase().includes(q))
    );
  });

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Header Bar */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">User Accounts & Workspace Management</h1>
            <p className="text-xs text-slate-500">Create team accounts, assign custom roles, and manage access permissions for company ID: <strong className="font-mono text-slate-800">{currentUser?.companyId || 'Master'}</strong></p>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-xs rounded-xl shadow-md transition-all flex items-center space-x-2 shrink-0 cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>+ Create New Account</span>
        </button>
      </div>

      {/* Search & Stats Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search accounts by name, username, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-800 outline-none"
          />
        </div>

        <div className="flex items-center space-x-3 text-xs font-semibold text-slate-500">
          <span className="px-3 py-1 bg-white border border-slate-200 rounded-lg">Total Users: <strong className="text-slate-900">{filteredUsers.length}</strong></span>
          <span className="px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg">Active Accounts: <strong className="text-emerald-800">{filteredUsers.filter(u => u.enable !== 0).length}</strong></span>
        </div>
      </div>

      {/* Accounts Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">User Details</th>
                <th className="py-3 px-4">Username Handle</th>
                <th className="py-3 px-4">Work Email</th>
                <th className="py-3 px-4">Assigned Role</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Account Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredUsers.map((usr) => {
                const isRootAdmin = usr.rootadmin === 1 || usr.username === 'root';
                const isAccountEnabled = usr.enable !== 0;

                return (
                  <tr key={usr.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-3">
                        <img
                          src={usr.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80'}
                          alt={usr.fullname || usr.name}
                          className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200 shrink-0"
                        />
                        <div>
                          <div className="font-bold text-slate-900 flex items-center space-x-1.5">
                            <span>{usr.fullname || usr.name || 'User'}</span>
                            {isRootAdmin && (
                              <span className="px-1.5 py-0.2 bg-amber-100 text-amber-800 border border-amber-300 text-[9px] font-bold rounded-full font-mono uppercase">
                                Root Admin
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">ID: {usr.id}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 font-mono font-bold text-blue-700">
                      @{usr.username || 'user'}
                    </td>

                    <td className="py-3 px-4 text-slate-600">
                      {usr.emailid || usr.email || 'N/A'}
                    </td>

                    <td className="py-3 px-4">
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-800 rounded font-semibold border border-slate-200">
                        {usr.role || 'DEVELOPER'}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-slate-600">
                      {usr.department || 'Engineering'}
                    </td>

                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold inline-flex items-center space-x-1 border ${
                        isAccountEnabled
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-red-50 text-red-700 border-red-200'
                      }`}>
                        {isAccountEnabled ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        <span>{isAccountEnabled ? 'Active' : 'Disabled'}</span>
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      {!isRootAdmin ? (
                        <button
                          onClick={async () => {
                            const newStatus = isAccountEnabled ? 0 : 1;
                            try {
                              await fetch(`${API_BASE_URL}/users/${usr.id}/toggle-enable`, {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ enable: newStatus })
                              });
                              window.location.reload();
                            } catch (e) {
                              console.error(e);
                            }
                          }}
                          className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                            isAccountEnabled
                              ? 'bg-red-50 text-red-700 hover:bg-red-100 border-red-200'
                              : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200'
                          }`}
                        >
                          {isAccountEnabled ? 'Disable Account' : 'Enable Account'}
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-mono italic">Primary Root</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Account Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <UserPlus className="w-5 h-5 text-blue-600" />
                <h2 className="font-bold text-slate-900 text-sm">Create New Team Account</h2>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-sm font-bold">✕</button>
            </div>

            {formError && (
              <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs font-medium">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateUser} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Work Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="john@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Username Handle</label>
                  <input
                    type="text"
                    placeholder="john_doe"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-blue-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Initial Password</label>
                  <input
                    type="password"
                    placeholder="Password123!"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Assign User Role *</label>
                  <select
                    value={selectedRoleCode}
                    onChange={(e) => setSelectedRoleCode(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-xs font-semibold outline-none focus:border-blue-500"
                  >
                    {activeRoles.map(r => (
                      <option key={r.roleCode} value={r.roleCode}>{r.roleName}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Department</label>
                  <input
                    type="text"
                    placeholder="Engineering"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs"
                >
                  {loading ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
