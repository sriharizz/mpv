import React, { useState } from 'react';
import { useSimulation } from '../../context/SimulationContext';
import { Settings, RotateCcw, AlertTriangle, ShieldCheck, ShieldAlert, ChevronDown, ChevronUp } from 'lucide-react';

export const SimulationBar: React.FC = () => {
  const { mode, setMode, resetDemoData } = useSimulation();
  // Collapsed by default into a subtle badge in bottom-right corner
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  return (
    <div
      data-testid="simulation-control-bar"
      className="fixed bottom-3 right-3 z-50 flex flex-col items-end font-sans select-none"
    >
      {/* Expanded Menu Panel */}
      {isExpanded && (
        <div className="mb-2 bg-slate-900/95 text-white backdrop-blur-md rounded-xl shadow-2xl border border-slate-700 p-3 w-72 animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-200">
              <Settings className="w-3.5 h-3.5 text-brand-400" />
              <span>Simulation Mode</span>
            </div>
            <button
              type="button"
              onClick={() => setIsExpanded(false)}
              className="text-slate-400 hover:text-white p-0.5 rounded"
              aria-label="Collapse simulation bar"
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="pt-2 space-y-1.5 text-xs">
            <button
              type="button"
              onClick={() => {
                setMode('PASS');
                setIsExpanded(false);
              }}
              className={`w-full px-2.5 py-1.5 rounded-md flex items-center justify-between transition-colors ${
                mode === 'PASS'
                  ? 'bg-emerald-600 text-white font-medium shadow-sm'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <span className="flex items-center space-x-2">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                <span>PASS (Normal Behavior)</span>
              </span>
              {mode === 'PASS' && <span className="text-[10px] bg-emerald-700 px-1.5 py-0.5 rounded">Active</span>}
            </button>

            <button
              type="button"
              onClick={() => {
                setMode('FAIL');
                setIsExpanded(false);
              }}
              className={`w-full px-2.5 py-1.5 rounded-md flex items-center justify-between transition-colors ${
                mode === 'FAIL'
                  ? 'bg-red-600 text-white font-medium shadow-sm'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <span className="flex items-center space-x-2">
                <ShieldAlert className="w-3.5 h-3.5 text-red-300" />
                <span>FAIL (Simulate Defect)</span>
              </span>
              {mode === 'FAIL' && <span className="text-[10px] bg-red-700 px-1.5 py-0.5 rounded">Active</span>}
            </button>

            <button
              type="button"
              onClick={() => {
                setMode('BLOCKED');
                setIsExpanded(false);
              }}
              className={`w-full px-2.5 py-1.5 rounded-md flex items-center justify-between transition-colors ${
                mode === 'BLOCKED'
                  ? 'bg-amber-600 text-white font-medium shadow-sm'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <span className="flex items-center space-x-2">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-300" />
                <span>BLOCKED (503 Lockout)</span>
              </span>
              {mode === 'BLOCKED' && <span className="text-[10px] bg-amber-700 px-1.5 py-0.5 rounded">Active</span>}
            </button>

            <div className="pt-2 border-t border-slate-800 flex justify-between items-center">
              <button
                type="button"
                onClick={resetDemoData}
                className="w-full px-2.5 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md flex items-center justify-center space-x-1.5 transition-colors"
                title="Reset localStorage demo data"
              >
                <RotateCcw className="w-3.5 h-3.5 text-brand-300" />
                <span>Reset Demo Data</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Subtle Collapsed Badge */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white text-xs font-medium shadow-lg border border-slate-700 backdrop-blur-md transition-all hover:scale-105"
        title="Toggle Simulation Control Bar"
        aria-label="Simulation Mode"
      >
        <Settings className="w-3.5 h-3.5 text-brand-400" />
        <span className="text-slate-300">Sim:</span>
        <span
          className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
            mode === 'PASS'
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
              : mode === 'FAIL'
              ? 'bg-red-500/20 text-red-400 border border-red-500/40'
              : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
          }`}
        >
          {mode}
        </span>
        {isExpanded ? <ChevronDown className="w-3 h-3 text-slate-400" /> : <ChevronUp className="w-3 h-3 text-slate-400" />}
      </button>
    </div>
  );
};
