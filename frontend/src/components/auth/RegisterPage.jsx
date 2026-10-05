import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Shield,
  Code,
  CheckSquare,
  Sparkles,
  ArrowRight,
  AlertCircle,
  Briefcase,
  User,
  Mail,
  Lock,
  Building,
  CheckCircle2,
  Users
} from 'lucide-react';

export const RegisterPage = () => {
  const { register, authError, navigateTo } = useApp();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [company, setCompany] = useState('');
  const [department, setDepartment] = useState('');
  const [selectedRole, setSelectedRole] = useState('ENGINEER');
  const [loading, setLoading] = useState(false);

  const roles = [
    {
      id: 'ENGINEER',
      title: 'Software Engineer / Tech Lead',
      desc: 'Plan sprints, manage tasks, review code burndowns, and collaborate across project workspaces.',
      icon: Code,
      badge: 'Dev & Lead Access',
      color: 'border-[#0A66C2] bg-blue-50/40 text-blue-900 ring-2 ring-blue-500/20'
    },
    {
      id: 'TESTER',
      title: 'QA / Tester Workspace',
      desc: 'Log bugs, attach test evidence, validate sprint builds, and track quality metrics.',
      icon: CheckSquare,
      badge: 'QA & Triage Access',
      color: 'border-fuchsia-600 bg-fuchsia-50/40 text-fuchsia-900 ring-2 ring-fuchsia-500/20'
    }
  ];

  const getPasswordStrength = () => {
    if (!password) return { label: 'Empty', percent: 0, color: 'bg-slate-200' };
    if (password.length < 6) return { label: 'Weak', percent: 33, color: 'bg-red-500' };
    if (password.length < 10) return { label: 'Good', percent: 66, color: 'bg-amber-500' };
    return { label: 'Strong', percent: 100, color: 'bg-emerald-500' };
  };

  const strength = getPasswordStrength();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) return;
    setLoading(true);
    await register(name, email, password, company, selectedRole, department);
    setLoading(false);
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#F8FAFC] flex flex-col justify-between font-sans text-slate-800 antialiased selection:bg-blue-100 selection:text-blue-700">
      
      {/* Top Header Bar */}
      <header className="w-full bg-white border-b border-slate-200/80 shrink-0 shadow-2xs">
        <div className="max-w-6xl mx-auto px-4 md:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigateTo('login')}>
            <img src="/logo.png" alt="StandupFlow Logo" className="w-9 h-9 rounded-xl object-contain bg-white p-0.5 border border-slate-200 shadow-2xs" />
            <div className="flex items-baseline space-x-1.5">
              <span className="font-bold text-slate-900 text-xl tracking-tight">
                Standup<span className="text-[#0A66C2]">Flow</span>
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1.5 py-0.5 bg-slate-100 rounded">
                Registration
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-xs text-slate-500 font-medium hidden sm:inline">Already on StandupFlow?</span>
            <button
              onClick={() => navigateTo('login')}
              className="px-4 py-1.5 rounded-full border border-[#0A66C2] text-[#0A66C2] hover:bg-blue-50 text-xs font-semibold transition-all shadow-2xs cursor-pointer"
            >
              Sign in
            </button>
          </div>
        </div>
      </header>

      {/* Main Body (Fits 100% within viewable area with standard fonts) */}
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 md:px-8 flex flex-col items-center justify-center min-h-0">
        
        {/* Title Heading */}
        <div className="text-center space-y-1 mb-4 max-w-xl shrink-0">
          <h1 className="text-2xl md:text-3xl font-semibold text-slate-900 tracking-tight">
            Make the most of your professional team workflow
          </h1>
          <p className="text-xs text-slate-500 font-normal">
            Join your company workspace and streamline daily standups, tasks, and QA triage
          </p>
        </div>

        {/* Main Card */}
        <div className="w-full bg-white rounded-2xl border border-slate-200/90 shadow-xl shadow-slate-200/50 p-6 md:p-8 space-y-4">
          
          {/* Error Alert */}
          {authError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center space-x-2.5">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span className="font-medium">{authError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Name & Email */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    required
                    placeholder="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-white border border-slate-300 focus:border-[#0A66C2] focus:ring-2 focus:ring-blue-100 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 font-medium outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Work Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type="email"
                    required
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white border border-slate-300 focus:border-[#0A66C2] focus:ring-2 focus:ring-blue-100 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 font-medium outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Password & Company */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type="password"
                    required
                    placeholder="At least 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white border border-slate-300 focus:border-[#0A66C2] focus:ring-2 focus:ring-blue-100 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 font-medium outline-none transition-all"
                  />
                </div>
                {/* Strength Meter */}
                <div className="mt-1 space-y-1">
                  <div className="flex justify-between items-center text-xs text-slate-500 font-medium">
                    <span>Strength</span>
                    <span className="font-bold">{strength.label}</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div className={`h-full transition-all duration-300 ${strength.color}`} style={{ width: `${strength.percent}%` }} />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Company Name
                </label>
                <div className="relative">
                  <Building className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Company Name"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="w-full bg-white border border-slate-300 focus:border-[#0A66C2] focus:ring-2 focus:ring-blue-100 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 font-medium outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Role Workspace Selection */}
            <div className="space-y-2.5 pt-1">
              <div>
                <label className="block text-xs font-semibold text-slate-800">
                  Select Your Primary Role Workspace
                </label>
                <p className="text-xs text-slate-500 font-normal">
                  Sets your default dashboard layout, navigation tabs, and permissions
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {roles.map(r => {
                  const Icon = r.icon;
                  const isSelected = selectedRole === r.id;
                  return (
                    <div
                      key={r.id}
                      onClick={() => setSelectedRole(r.id)}
                      className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all space-y-2 relative ${
                        isSelected ? r.color : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-[#0A66C2] text-white' : 'bg-slate-100 text-slate-600'}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{r.badge}</span>
                        </div>
                        {isSelected && (
                          <CheckCircle2 className="w-4 h-4 text-[#0A66C2] fill-blue-100" />
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 text-xs">{r.title}</div>
                        <p className="text-xs text-slate-500 leading-snug font-normal mt-0.5">{r.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Terms notice */}
            <p className="text-xs text-slate-500 text-center leading-tight font-normal">
              By clicking Agree & Join, you agree to the StandupFlow{' '}
              <a href="#terms" onClick={(e) => e.preventDefault()} className="text-[#0A66C2] font-semibold hover:underline">User Agreement</a>,{' '}
              <a href="#privacy" onClick={(e) => e.preventDefault()} className="text-[#0A66C2] font-semibold hover:underline">Privacy Policy</a>, and{' '}
              <a href="#cookie" onClick={(e) => e.preventDefault()} className="text-[#0A66C2] font-semibold hover:underline">Cookie Policy</a>.
            </p>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-[#0A66C2] hover:bg-[#004182] active:bg-[#003266] text-white font-semibold text-sm rounded-full shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2 cursor-pointer"
              >
                <span>{loading ? 'Creating Account...' : 'Agree & Join StandupFlow'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>

        </div>
      </main>

      {/* Corporate Footer */}
      <footer className="bg-white border-t border-slate-200 py-3 shrink-0">
        <div className="max-w-6xl mx-auto px-4 md:px-8 flex items-center justify-center text-xs text-slate-500 font-medium">
          <span>Copyright © 2026 StandupFlow Enterprise Inc. All rights reserved.</span>
        </div>
      </footer>

    </div>
  );
};





