import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff } from 'lucide-react';
import { ModalDialog } from '../components/common/ModalDialog';
import { SimulationBar } from '../components/common/SimulationBar';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [username, setUsername] = useState('Harikrishna S');
  const [password, setPassword] = useState('Clinevo@2026');
  const [enterprise, setEnterprise] = useState('Clinevo');
  const [showPassword, setShowPassword] = useState(false);

  const [errorModal, setErrorModal] = useState<{
    isOpen: boolean;
    message: string;
  }>({
    isOpen: false,
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // OQ Scenarios 1-2 & PQ Scenarios 1-2:
    // If any field is empty, show Error Modal
    if (!username.trim() || !password.trim() || !enterprise.trim()) {
      setErrorModal({
        isOpen: true,
        message: 'Please enter User Name, Password, and Enterprise.',
      });
      return;
    }

    // Determine environment based on URL or default
    const isProd = window.location.hostname.includes('prod') || window.location.search.includes('env=prod');
    login(username, enterprise, isProd ? 'Production' : 'Validation');

    // Redirect to home / manual case registration
    navigate('/intake/manual-case-registration');
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-gradient-to-b from-[#eef5fc] via-[#f3f8fd] to-[#e4eef8] font-sans text-slate-800 relative selection:bg-brand-200">
      {/* Top Header */}
      <header className="p-6 md:px-12 flex items-center">
        <div className="flex items-center space-x-2.5">
          {/* Brain-circuit icon matching image_4c6b7b.png */}
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 via-indigo-500 to-pink-500 flex items-center justify-center shadow-md">
            <svg
              className="w-5 h-5 text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-2.04Z" />
              <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-2.04Z" />
            </svg>
          </div>
          <span className="font-bold text-2xl text-brand-900 tracking-tight">OnePV Intake</span>
        </div>
      </header>

      {/* Main Content: 2-column layout matching image_4c6b7b.png */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 md:px-12 py-6 flex flex-col lg:flex-row items-center justify-between gap-12">
        {/* Left Column: Hero Content */}
        <div className="lg:w-1/2 space-y-4">
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
            Clinevotech OnePV
          </h1>
          <p className="text-slate-600 text-sm md:text-base leading-relaxed max-w-lg">
            Clinevo Safety is a cloud based end-to-end Pharmacovigilance system. All-in-one system providing PV intake. Case Processing, Regulatory Submissions / AS2 Gateway, Analytics, and Safety Signals.
          </p>
        </div>

        {/* Right Column: Sign-in Card */}
        <div className="lg:w-1/2 flex justify-center lg:justify-end w-full">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-xl shadow-blue-900/5 border border-slate-100 p-8 md:p-10 space-y-6">
            <div className="space-y-1">
              <h3 className="text-base font-semibold text-slate-700">
                Welcome to <span className="text-brand-600 font-bold">OnePV</span>
              </h3>
              <h2 className="text-2xl font-bold text-slate-900">Sign in</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* User Name */}
              <div className="space-y-1.5">
                <label htmlFor="username" className="block font-medium text-slate-700">
                  User Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter Username"
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 bg-white"
                />
              </div>

              {/* Password with Eye Toggle */}
              <div className="space-y-1.5">
                <label htmlFor="password" className="block font-medium text-slate-700">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter Password"
                    className="w-full pl-3.5 pr-10 py-2.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 text-slate-400 hover:text-slate-600 p-1"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Enterprise */}
              <div className="space-y-1.5">
                <label htmlFor="enterprise" className="block font-medium text-slate-700">
                  Enterprise <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="enterprise"
                  name="enterprise"
                  value={enterprise}
                  onChange={(e) => setEnterprise(e.target.value)}
                  placeholder="Enter Enterprise Name"
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 bg-white"
                />
              </div>

              {/* Login Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 bg-[#6493b8] hover:bg-[#5282a8] text-white font-medium rounded-lg shadow-sm transition-all text-xs tracking-wide focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-1"
                >
                  Login
                </button>
              </div>

              {/* Forgot password link */}
              <div className="text-center pt-1">
                <a
                  href="#forgot"
                  onClick={(e) => {
                    e.preventDefault();
                    setErrorModal({
                      isOpen: true,
                      message: 'Please contact your system administrator to reset your enterprise password.',
                    });
                  }}
                  className="text-[11px] text-brand-600 hover:text-brand-800 hover:underline"
                >
                  Forgot password?
                </a>
              </div>
            </form>
          </div>
        </div>
      </main>

      {/* Footer matching image_4c6b7b.png */}
      <footer className="p-6 md:px-12 text-center text-xs text-slate-500">
        <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
          <span>&copy; Clinevo Technologies Copyright 2026</span>
          <span>|</span>
          <span>All rights reserved</span>
          <span>|</span>
          <span>Version 1.0</span>
          <span>|</span>
          <a href="#privacy" className="text-brand-600 hover:underline">Privacy</a>
          <span>|</span>
          <a href="#disclaimer" className="text-brand-600 hover:underline">Disclaimer</a>
        </div>
      </footer>

      {/* Error Validation Modal (OQ Scenarios 1-2, PQ 1-2) */}
      <ModalDialog
        isOpen={errorModal.isOpen}
        type="error"
        title="Validation Error"
        message={errorModal.message}
        confirmLabel="OK"
        onConfirm={() => setErrorModal({ isOpen: false, message: '' })}
      />

      {/* Persistent simulation bar */}
      <SimulationBar />
    </div>
  );
};
