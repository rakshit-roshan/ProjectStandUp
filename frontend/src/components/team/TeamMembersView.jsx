import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Users,
  UserPlus,
  Mail,
  Trash2,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Search,
  Key,
  Copy,
  Check,
  AlertCircle
} from 'lucide-react';

export const TeamMembersView = () => {
  const {
    currentUser,
    currentProject,
    users,
    invitations,
    sendInvitation,
    removeMemberFromProject,
    joinTeamCode,
    getProjectMembers
  } = useApp();

  const [inviteEmail, setInviteEmail] = useState('');
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Compute permissions for current user
  const canManageMembers = 
    currentUser?.role === 'MANAGER' ||
    currentUser?.id === currentProject?.leadId ||
    (currentUser?.name && currentProject?.lead && currentUser.name.toLowerCase().trim() === currentProject.lead.toLowerCase().trim()) ||
    (currentUser?.email && currentProject?.ownerEmail && currentUser.email.toLowerCase().trim() === currentProject.ownerEmail.toLowerCase().trim());

  // Filter users belonging to current project workspace
  const projectMembers = getProjectMembers(currentProject);

  // Filter pending invitations for current project
  const projectPendingInvites = invitations.filter(i => 
    i.status === 'PENDING' && (
      i.projectId === currentProject?.id || 
      i.managerCode === currentProject?.inviteCode ||
      i.managerCode === currentUser?.managerCode
    )
  );

  const filteredMembers = projectMembers.filter(m => 
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSendInvite = async (e) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    setLoading(true);
    const targetEmail = inviteEmail.trim().toLowerCase();

    const res = await sendInvitation(targetEmail, currentProject?.id);
    setLoading(false);
    if (res?.success) {
      setStatusMsg(`Invitation sent to ${targetEmail} for project workspace "${currentProject?.name}"!`);
      setInviteEmail('');
      setTimeout(() => setStatusMsg(''), 4000);
    } else {
      setStatusMsg(res?.message || 'Failed to send invitation.');
    }
  };

  const handleRemoveMember = async (userId, memberName) => {
    if (userId === currentProject?.leadId) {
      alert('Cannot remove the Project Lead from the project workspace.');
      return;
    }
    if (window.confirm(`Are you sure you want to remove ${memberName} from project "${currentProject?.name}"?`)) {
      await removeMemberFromProject(currentProject?.id, userId);
      setStatusMsg(`Removed ${memberName} from project workspace.`);
      setTimeout(() => setStatusMsg(''), 3000);
    }
  };

  const handleCopyInviteCode = () => {
    const codeToCopy = currentProject?.inviteCode || currentUser?.managerCode || 'PRJ-101-CODE';
    navigator.clipboard.writeText(codeToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleJoinWorkspace = async (e) => {
    e.preventDefault();
    if (!joinCodeInput.trim()) return;
    const res = await joinTeamCode(joinCodeInput);
    if (res?.success) {
      setStatusMsg(`Successfully joined project workspace using code ${joinCodeInput}!`);
      setJoinCodeInput('');
      setTimeout(() => setStatusMsg(''), 3000);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto text-xs">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-base font-bold text-slate-900">Project Team Members</h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-100 text-blue-700">
                {currentProject?.code || 'CORE'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Isolated team member roster for project workspace: <strong className="text-slate-800">{currentProject?.name || 'Default Workspace'}</strong>
            </p>
          </div>
        </div>

        {/* Project Hash Invite Code Card */}
        <div className="flex items-center space-x-3 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200">
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Project Invite Code</div>
            <div className="font-mono font-bold text-slate-900 text-xs">{currentProject?.inviteCode || currentUser?.managerCode || 'PRJ-CORE'}</div>
          </div>
          <button
            onClick={handleCopyInviteCode}
            className="p-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center space-x-1"
            title="Copy Invite Code"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {statusMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 font-semibold text-xs flex items-center space-x-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{statusMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Member Roster List (2 cols width) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Active Workspace Assignees ({projectMembers.length})
              </h2>
              <p className="text-[11px] text-slate-400">Only assignees listed here can be assigned tasks in this project.</p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search member by name/email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {filteredMembers.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                No team members found matching "{searchQuery}".
              </div>
            ) : (
              filteredMembers.map(member => {
                const isProjectLead = member.id === currentProject?.leadId || (member.name && currentProject?.lead && member.name.toLowerCase().trim() === currentProject.lead.toLowerCase().trim());
                const isSelf = member.id === currentUser?.id || (member.email && currentUser?.email && member.email.toLowerCase().trim() === currentUser.email.toLowerCase().trim());
                const isUserOnline = member.id === currentUser?.id || member.isOnline === true;

                return (
                  <div key={member.id} className="py-3.5 flex items-center justify-between text-xs hover:bg-slate-50/60 px-2 rounded-lg transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <img
                          src={member.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80'}
                          alt={member.name}
                          className="w-9 h-9 rounded-full object-cover ring-2 ring-slate-100 shadow-2xs"
                        />
                        <span
                          title={isUserOnline ? "Online" : "Offline"}
                          className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ring-2 ring-white ${
                            isUserOnline ? 'bg-emerald-500' : 'bg-slate-300'
                          }`}
                        />
                      </div>

                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-slate-900 text-xs">{member.name}</span>
                          {isProjectLead && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold uppercase bg-blue-100 text-blue-700 border border-blue-200">
                              PROJECT LEAD
                            </span>
                          )}
                          {isSelf && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold uppercase bg-slate-100 text-slate-600">
                              YOU
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">{member.email}</div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                          {member.role || 'ENGINEER'}
                        </span>
                        <div className="text-[10px] text-slate-400 mt-0.5 font-medium">{member.department || 'Engineering'}</div>
                      </div>

                      {/* Remove Member Action Button */}
                      {!isProjectLead && !isSelf && canManageMembers && (
                        <button
                          onClick={() => handleRemoveMember(member.id, member.name)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title={`Remove ${member.name} from project`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Add Member & Pending Invitations (1 col width) */}
        <div className="space-y-6">
          {/* Invite New Member Box */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2 border-b border-slate-100 pb-3">
              <UserPlus className="w-4 h-4 text-blue-600" />
              <span>Invite Member to Project Workspace</span>
            </h2>

            <form onSubmit={handleSendInvite} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Team Member Work Email</label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    required
                    placeholder="engineer@company.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 border border-slate-200 rounded-lg text-xs outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-2xs transition-colors flex items-center justify-center space-x-1.5"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>{loading ? 'Sending Invitation...' : 'Send Project Invitation'}</span>
              </button>
            </form>
          </div>

          {/* Pending Invitations List */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3">
            <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2 border-b border-slate-100 pb-3">
              <Clock className="w-4 h-4 text-amber-500" />
              <span>Pending Invitations ({projectPendingInvites.length})</span>
            </h2>

            <div className="space-y-2">
              {projectPendingInvites.length === 0 ? (
                <div className="py-3 text-center text-slate-400 text-[11px]">
                  No pending invitations for this workspace.
                </div>
              ) : (
                projectPendingInvites.map(inv => (
                  <div key={inv.id} className="p-3 bg-amber-50/50 rounded-lg border border-amber-200/60 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-slate-900">{inv.inviteeEmail}</div>
                      <div className="text-[10px] text-slate-400 font-mono">Code: {inv.managerCode}</div>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-800 border border-amber-300 animate-pulse">
                      PENDING
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Join Another Project Workspace Box */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3">
            <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2 border-b border-slate-100 pb-3">
              <Key className="w-4 h-4 text-indigo-600" />
              <span>Join Another Project Workspace</span>
            </h2>

            <form onSubmit={handleJoinWorkspace} className="space-y-3">
              <input
                type="text"
                placeholder="Enter Project Code (e.g. PRJ-101-CODE)"
                value={joinCodeInput}
                onChange={(e) => setJoinCodeInput(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-mono font-bold uppercase outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                className="w-full py-2 bg-slate-900 hover:bg-black text-white font-bold text-xs rounded-lg transition-colors"
              >
                Join Project Workspace
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
