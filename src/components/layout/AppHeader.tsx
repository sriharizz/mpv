import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { LogOut, User, LogOut as ExitIcon, ChevronDown } from 'lucide-react';
import { ModalDialog } from '../common/ModalDialog';

export const AppHeader: React.FC = () => {
  const { session, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [showExitModal, setShowExitModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Show Case Exit icon when inside Case Registration or Case Processing
  const isInsideCase = location.pathname.includes('/intake/manual-case-registration') ||
                       location.pathname.includes('/intake/case-processing');

  const handleConfirmExit = () => {
    setShowExitModal(false);
    navigate('/intake/open-case');
  };

  const handleConfirmLogout = () => {
    setShowLogoutModal(false);
    logout();
    navigate('/login');
  };

  return (
    <>
      <header className="h-14 bg-white border-b border-slate-200 px-4 flex items-center justify-between sticky top-0 z-30 shadow-sm">
        {/* Left: Branding & Environment */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            {/* Brain circuit logo */}
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-600 via-indigo-500 to-pink-500 flex items-center justify-center shadow-sm">
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-2.04Z" />
                <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-2.04Z" />
              </svg>
            </div>
            <span className="font-bold text-lg text-brand-900 tracking-tight">OnePV Intake</span>
          </div>

          <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-blue-50 text-brand-700 border border-brand-200">
            {session?.environment ? `${session.environment} Environment` : 'Validation Environment'}
          </span>
        </div>

        {/* Right: Username, timestamp, exit button, user menu */}
        <div className="flex items-center space-x-4">
          <div className="hidden md:flex flex-col text-right text-xs">
            <span className="text-slate-800 font-semibold" data-testid="header-username">
              {session?.username || 'Harikrishna S'}
            </span>
            <span className="text-slate-500 text-[11px]" data-testid="header-timestamp">
              {session?.loginTimestamp || '14-Oct-2026 14:00:00'}
            </span>
          </div>

          {/* Case Exit Icon Button (Visible when inside case) */}
          {isInsideCase && (
            <button
              type="button"
              aria-label="Exit"
              data-testid="case-exit-icon"
              onClick={() => setShowExitModal(true)}
              className="p-1.5 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg border border-slate-200 transition-colors flex items-center gap-1 text-xs font-medium"
              title="Exit from case"
            >
              <ExitIcon className="w-4 h-4 text-slate-600" />
              <span className="hidden sm:inline">Exit Case</span>
            </button>
          )}

          {/* User Profile Menu */}
          <div className="relative">
            <button
              type="button"
              aria-label="User Profile"
              data-testid="user-profile-icon"
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center space-x-1.5 p-1.5 rounded-lg hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-colors"
            >
              <div className="w-7 h-7 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-xs">
                <User className="w-4 h-4" />
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-40 animate-in fade-in slide-in-from-top-1">
                <div className="px-3 py-2 border-b border-slate-100 text-xs">
                  <p className="font-semibold text-slate-800">{session?.username || 'User'}</p>
                  <p className="text-slate-500">{session?.enterprise || 'Clinevo'}</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowProfileMenu(false);
                    setShowLogoutModal(true);
                  }}
                  className="w-full text-left px-3 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center space-x-2 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Exit Case Confirmation Modal (OQ Scenarios 40, 41, PQ Scenario 17) */}
      <ModalDialog
        isOpen={showExitModal}
        type="yesno"
        title="Exit Case Confirmation"
        message="Are you sure you want to exit from the case?"
        confirmLabel="Yes"
        cancelLabel="No"
        showCancel={true}
        onConfirm={handleConfirmExit}
        onCancel={() => setShowExitModal(false)}
      />

      {/* Logout Confirmation Modal (OQ Scenarios 42, 50, PQ Scenario 18) */}
      <ModalDialog
        isOpen={showLogoutModal}
        type="yesno"
        title="Logout Confirmation"
        message="Are you sure you want to logout?"
        confirmLabel="Yes"
        cancelLabel="No"
        showCancel={true}
        onConfirm={handleConfirmLogout}
        onCancel={() => setShowLogoutModal(false)}
      />
    </>
  );
};
