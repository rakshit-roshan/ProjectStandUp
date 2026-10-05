import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  Sparkles
} from 'lucide-react';

export const LoginPage = () => {
  const { login, authError, navigateTo } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await login(email, password);
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
                Enterprise
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-xs text-slate-500 font-medium hidden sm:inline">New to StandupFlow?</span>
            <button
              onClick={() => navigateTo('register')}
              className="px-4 py-1.5 rounded-full border border-[#0A66C2] text-[#0A66C2] hover:bg-blue-50 text-xs font-semibold transition-all shadow-2xs cursor-pointer"
            >
              Join now
            </button>
          </div>
        </div>
      </header>

      {/* Main Body (Fits 100% within viewable area with standard font sizes) */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 md:px-8 flex items-center justify-between min-h-0">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center w-full my-auto">
          
          {/* Left Side Hero Message */}
          <div className="lg:col-span-6 space-y-5">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/70 text-[#0A66C2] text-xs font-semibold">
              <Sparkles className="w-4 h-4 text-[#0A66C2]" />
              <span>Unified Engineering & Team Workspace</span>
            </div>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-slate-900 tracking-tight leading-[1.15]">
              Welcome to your professional team workspace
            </h1>

            <p className="text-sm md:text-base text-slate-600 leading-relaxed font-normal max-w-lg">
              Connect developer task boards, QA bug triage, active sprint burndowns, and employee workload health in one platform.
            </p>

            {/* Bullet Point Value Props */}
            <div className="space-y-3 pt-1">
              {[
                { title: 'Real-Time Sprint Velocity & Burndowns', desc: 'Monitor active story points, task completion rate, and deadlines.' },
                { title: 'QA Triage & Bug Evidence', desc: 'Directly log defect reports with screenshot evidence and step repro.' },
                { title: 'Employee Workload & Team Health', desc: 'Balance task allocations and maintain sustainable developer pace.' }
              ].map((item, idx) => (
                <div key={idx} className="flex items-start space-x-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800">{item.title}</div>
                    <div className="text-xs text-slate-500 font-normal">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Trust Badge */}
            <div className="pt-3 flex items-center space-x-4 text-xs text-slate-400 border-t border-slate-200/60 max-w-lg">
              <div className="flex items-center space-x-1.5">
                <ShieldCheck className="w-4 h-4 text-slate-500" />
                <span>MariaDB Enterprise Security</span>
              </div>
              <span>•</span>
              <span>256-bit TLS Encrypted</span>
            </div>
          </div>

          {/* Right Side Elevating Login Form Card */}
          <div className="lg:col-span-6 max-w-md mx-auto lg:max-w-none w-full">
            <div className="bg-white p-7 md:p-8 rounded-2xl border border-slate-200/90 shadow-xl shadow-slate-200/50 space-y-5">
              
              <div>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">Sign in</h2>
                <p className="text-xs text-slate-500 mt-1 font-normal">
                  Stay updated on your workspace activity
                </p>
              </div>

              {/* Error Alert */}
              {authError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center space-x-2.5">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span className="font-medium">{authError}</span>
                </div>
              )}

              {/* Credentials Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Email address
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

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-slate-700">
                      Password
                    </label>
                    <a href="#forgot" onClick={(e) => { e.preventDefault(); alert("Contact workspace manager to reset password."); }} className="text-xs text-[#0A66C2] font-semibold hover:underline">
                      Forgot password?
                    </a>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-white border border-slate-300 focus:border-[#0A66C2] focus:ring-2 focus:ring-blue-100 rounded-xl pl-10 pr-10 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 font-medium outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center space-x-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 text-[#0A66C2] focus:ring-blue-500"
                    />
                    <span className="text-xs text-slate-600 font-medium">Remember me</span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 bg-[#0A66C2] hover:bg-[#004182] active:bg-[#003266] text-white font-semibold text-sm rounded-full shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <span>{loading ? 'Authenticating...' : 'Sign in'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* Social SSO Buttons */}
              <div className="space-y-2.5">
                <div className="relative flex py-0.5 items-center">
                  <div className="flex-grow border-t border-slate-200"></div>
                  <span className="shrink mx-3 text-[11px] text-slate-400 font-semibold uppercase tracking-wider">or</span>
                  <div className="flex-grow border-t border-slate-200"></div>
                </div>

                <button
                  type="button"
                  onClick={() => alert("Google SSO Integration Active")}
                  className="w-full flex items-center justify-center space-x-2.5 py-2.5 px-4 bg-white hover:bg-slate-50 border border-slate-300 rounded-full text-xs font-semibold text-slate-700 transition-all shadow-2xs cursor-pointer"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>Continue with Google</span>
                </button>
              </div>

              <div className="pt-2 text-center border-t border-slate-100">
                <p className="text-xs text-slate-600 font-normal">
                  New to StandupFlow?{' '}
                  <button
                    type="button"
                    onClick={() => navigateTo('register')}
                    className="text-[#0A66C2] font-semibold hover:underline"
                  >
                    Join now
                  </button>
                </p>
              </div>

            </div>
          </div>

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





