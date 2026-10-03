import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Shield, Code, CheckSquare, Sparkles, ArrowRight, AlertCircle } from 'lucide-react';

export const RegisterPage = () => {
  const { register, authError, navigateTo } = useApp();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('password123');
  const [company, setCompany] = useState('Acme Enterprise');
  const [department, setDepartment] = useState('Software Engineering');
  const [selectedRole, setSelectedRole] = useState('ENGINEER');
  const [loading, setLoading] = useState(false);

  const roles = [
    {
      id: 'ENGINEER',
      title: 'Software Engineer / Tech Lead',
      desc: 'Lead project workspaces, plan sprints, manage backlogs, monitor team performance, and access your assigned tasks.',
      icon: Code,
      color: 'border-blue-500 bg-blue-50/40 text-blue-900'
    },
    {
      id: 'TESTER',
      title: 'QA / Tester',
      desc: 'Access QA testing tasks, validate test evidence, report bugs, and track quality metrics across invited project workspaces.',
      icon: CheckSquare,
      color: 'border-fuchsia-500 bg-fuchsia-50/40 text-fuchsia-900'
    }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) return;
    setLoading(true);
    await register(name, email, password, company, selectedRole, department);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-2xl p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <img src="/logo.png" alt="StandupFlow Logo" className="w-8 h-8 rounded-md object-contain" />
            <span className="font-bold text-lg text-slate-900">StandupFlow Registration</span>
          </div>

          <button
            onClick={() => navigateTo('login')}
            className="text-xs text-blue-600 font-bold hover:underline"
          >
            Already registered? Sign In →
          </button>
        </div>

        {authError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded text-xs text-red-700 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{authError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Full Name *</label>
              <input
                type="text"
                required
                placeholder="Rahul Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-xs font-semibold outline-none focus:border-blue-600"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Work Email *</label>
              <input
                type="email"
                required
                placeholder="rahul@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-xs font-semibold outline-none focus:border-blue-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Password *</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-xs font-semibold outline-none focus:border-blue-600"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Company Name</label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-xs font-semibold outline-none focus:border-blue-600"
              />
            </div>
          </div>

          {/* Role Selection Visual Cards */}
          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-2">
              Select Your Role Workspace (Strict Role View Assigned)
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {roles.map(r => {
                const Icon = r.icon;
                const isSelected = selectedRole === r.id;
                return (
                  <div
                    key={r.id}
                    onClick={() => setSelectedRole(r.id)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all space-y-2 ${
                      isSelected ? r.color : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <Icon className="w-5 h-5 text-blue-600" />
                      {isSelected && <span className="w-2.5 h-2.5 rounded-full bg-blue-600 ring-2 ring-blue-200" />}
                    </div>
                    <div className="font-bold text-slate-900 text-sm">{r.title}</div>
                    <p className="text-[11px] text-slate-500 leading-snug">{r.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-md shadow-xs transition-colors flex items-center justify-center space-x-1.5"
          >
            <span>{loading ? 'Creating Account in MariaDB...' : 'Create Account & Launch Tour'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
