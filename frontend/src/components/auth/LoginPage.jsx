import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Sparkles, Eye, EyeOff, Lock, Mail, ArrowRight, AlertCircle } from 'lucide-react';

export const LoginPage = () => {
  const { login, authError, navigateTo } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await login(email, password);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white rounded-xl shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2">
        {/* Left Brand Panel */}
        <div className="bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-900 p-8 text-white flex flex-col justify-between">
          <div className="flex items-center space-x-2.5">
            <img src="/logo.png" alt="StandupFlow Logo" className="w-9 h-9 rounded-lg object-contain bg-white/10 p-1 border border-white/20" />
            <span className="font-bold text-xl tracking-tight">StandupFlow</span>
          </div>

          <div className="space-y-4 my-8">
            <h2 className="text-2xl font-bold leading-tight">
              Enterprise Project & Team Productivity Platform
            </h2>
            <p className="text-xs text-blue-100 leading-relaxed">
              Unify developer task boards, QA bug triage, active sprint burndowns, and employee workload health in one workspace.
            </p>
          </div>

          <div className="text-[11px] text-blue-200/70 border-t border-white/10 pt-4 flex items-center justify-between">
            <span>MariaDB Persistent • SSL</span>
            <span>v2.4 Enterprise</span>
          </div>
        </div>

        {/* Right Login Form */}
        <div className="p-8 flex flex-col justify-center space-y-6">
          <div>
            <h3 className="text-xl font-bold text-slate-900">Sign in to StandupFlow</h3>
            <p className="text-xs text-slate-500 mt-1">Enter your credentials to access your workspace</p>
          </div>

          {authError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded text-xs text-red-700 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Work Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-md pl-9 pr-3 py-2 text-xs font-semibold outline-none focus:border-blue-600 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-md pl-9 pr-9 py-2 text-xs font-semibold outline-none focus:border-blue-600 focus:bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-md shadow-xs transition-colors flex items-center justify-center space-x-1.5"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="pt-2 border-t border-slate-100 text-center">
            <p className="text-[11px] text-slate-500">
              New team member?{' '}
              <button onClick={() => navigateTo('register')} className="text-blue-600 font-bold hover:underline">
                Create Account & Register
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
