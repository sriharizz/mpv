import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { ChevronDown, ChevronRight, FilePlus, FolderSearch, History, Shield, BarChart3 } from 'lucide-react';

export const AppSidebar: React.FC = () => {
  const [intakeExpanded, setIntakeExpanded] = useState(true);
  const [reportsExpanded, setReportsExpanded] = useState(true);

  return (
    <aside className="w-64 bg-[#f8fafc] text-slate-700 flex-shrink-0 flex flex-col border-r border-slate-200 select-none shadow-sm h-full">
      <div className="p-3.5 border-b border-slate-200 bg-white flex items-center space-x-2">
        <Shield className="w-4 h-4 text-brand-600" />
        <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Navigation</span>
      </div>

      <nav className="flex-1 overflow-y-auto p-3 space-y-2">
        {/* Intake Group */}
        <div>
          <button
            type="button"
            onClick={() => setIntakeExpanded(!intakeExpanded)}
            className="w-full flex items-center justify-between px-3 py-2 text-xs font-bold text-slate-700 hover:text-brand-900 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <div className="flex items-center space-x-2">
              <FilePlus className="w-4 h-4 text-brand-600" />
              <span className="uppercase tracking-wider">Intake</span>
            </div>
            {intakeExpanded ? (
              <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
            )}
          </button>

          {intakeExpanded && (
            <div className="mt-1 ml-3 pl-3 border-l-2 border-slate-200 space-y-1">
              <NavLink
                to="/intake/manual-case-registration"
                className={({ isActive }) =>
                  `flex items-center space-x-2 px-3 py-2 text-xs rounded-md transition-colors ${
                    isActive
                      ? 'bg-brand-100/70 text-brand-800 font-semibold border border-brand-200 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
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
                      ? 'bg-brand-100/70 text-brand-800 font-semibold border border-brand-200 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`
                }
              >
                <FolderSearch className="w-3.5 h-3.5 text-brand-600" />
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
            className="w-full flex items-center justify-between px-3 py-2 text-xs font-bold text-slate-700 hover:text-brand-900 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4 text-brand-600" />
              <span className="uppercase tracking-wider">Reports</span>
            </div>
            {reportsExpanded ? (
              <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
            )}
          </button>

          {reportsExpanded && (
            <div className="mt-1 ml-3 pl-3 border-l-2 border-slate-200 space-y-1">
              <NavLink
                to="/reports/audit-history"
                className={({ isActive }) =>
                  `flex items-center space-x-2 px-3 py-2 text-xs rounded-md transition-colors ${
                    isActive
                      ? 'bg-brand-100/70 text-brand-800 font-semibold border border-brand-200 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`
                }
              >
                <History className="w-3.5 h-3.5 text-brand-600" />
                <span>Audit History</span>
              </NavLink>
            </div>
          )}
        </div>
      </nav>

      {/* Sidebar Footer info */}
      <div className="p-3 border-t border-slate-200 bg-white text-[11px] text-slate-500">
        <p className="font-semibold text-slate-700">OnePV Intake System 1.1</p>
        <p className="text-[10px] text-slate-500">Enterprise Edition • Validated</p>
      </div>
    </aside>
  );
};
