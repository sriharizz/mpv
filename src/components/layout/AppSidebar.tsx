import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { ChevronDown, ChevronRight, FilePlus, FolderSearch, History, Shield, BarChart3 } from 'lucide-react';

export const AppSidebar: React.FC = () => {
  const [intakeExpanded, setIntakeExpanded] = useState(true);
  const [reportsExpanded, setReportsExpanded] = useState(true);

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex-shrink-0 flex flex-col border-r border-slate-800 select-none">
      <div className="p-3.5 border-b border-slate-800/80 flex items-center space-x-2">
        <Shield className="w-4 h-4 text-brand-400" />
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Navigation</span>
      </div>

      <nav className="flex-1 overflow-y-auto p-2 space-y-2">
        {/* Intake Group */}
        <div>
          <button
            type="button"
            onClick={() => setIntakeExpanded(!intakeExpanded)}
            className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <div className="flex items-center space-x-2">
              <FilePlus className="w-4 h-4 text-brand-400" />
              <span className="uppercase tracking-wider">Intake</span>
            </div>
            {intakeExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          </button>

          {intakeExpanded && (
            <div className="mt-1 ml-3 pl-3 border-l border-slate-800 space-y-1">
              <NavLink
                to="/intake/manual-case-registration"
                className={({ isActive }) =>
                  `flex items-center space-x-2 px-3 py-2 text-xs rounded-md transition-colors ${
                    isActive
                      ? 'bg-brand-600 text-white font-medium shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`
                }
              >
                <span>Manual Case Registration</span>
              </NavLink>

              <NavLink
                to="/intake/open-case"
                className={({ isActive }) =>
                  `flex items-center space-x-2 px-3 py-2 text-xs rounded-md transition-colors ${
                    isActive
                      ? 'bg-brand-600 text-white font-medium shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`
                }
              >
                <FolderSearch className="w-3.5 h-3.5" />
                <span>Open Case</span>
              </NavLink>
            </div>
          )}
        </div>

        {/* Reports Group */}
        <div>
          <button
            type="button"
            onClick={() => setReportsExpanded(!reportsExpanded)}
            className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4 text-brand-400" />
              <span className="uppercase tracking-wider">Reports</span>
            </div>
            {reportsExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          </button>

          {reportsExpanded && (
            <div className="mt-1 ml-3 pl-3 border-l border-slate-800 space-y-1">
              <NavLink
                to="/reports/audit-history"
                className={({ isActive }) =>
                  `flex items-center space-x-2 px-3 py-2 text-xs rounded-md transition-colors ${
                    isActive
                      ? 'bg-brand-600 text-white font-medium shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`
                }
              >
                <History className="w-3.5 h-3.5" />
                <span>Audit History</span>
              </NavLink>
            </div>
          )}
        </div>
      </nav>

      {/* Sidebar Footer info */}
      <div className="p-3 border-t border-slate-800 text-[11px] text-slate-500">
        <p>OnePV Intake System 1.1</p>
        <p className="text-[10px] text-slate-600">Enterprise Edition</p>
      </div>
    </aside>
  );
};
