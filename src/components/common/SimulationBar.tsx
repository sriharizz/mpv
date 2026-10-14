import React, { useState } from 'react';
import { useSimulation } from '../../context/SimulationContext';
import { Sliders, RotateCcw, AlertTriangle, ShieldCheck, ShieldAlert, ChevronDown, ChevronUp } from 'lucide-react';

export const SimulationBar: React.FC = () => {
  const { mode, setMode, resetDemoData } = useSimulation();
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  return (
    <div
      data-testid="simulation-control-bar"
      className="fixed bottom-3 left-3 z-50 flex flex-col items-start font-sans"
    >
      <div className="bg-slate-900/90 text-white backdrop-blur-md rounded-xl shadow-2xl border border-slate-700 p-2.5 transition-all duration-200">
        {/* Toggle header */}
        <div className="flex items-center justify-between gap-3 pb-1 border-b border-slate-800">
          <div className="flex items-center gap-1.5 text-xs font-semibold tracking-wide uppercase text-slate-300">
            <Sliders className="w-3.5 h-3.5 text-brand-400" />
            <span>Test Simulation Mode:</span>
            <span
              className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                mode === 'PASS'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : mode === 'FAIL'
                  ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                  : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              }`}
            >
              {mode}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-slate-400 hover:text-white p-0.5 rounded transition-colors"
            title={isExpanded ? 'Collapse control bar' : 'Expand control bar'}
            aria-label="Toggle simulation bar"
          >
            {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Collapsible content */}
        {isExpanded && (
          <div className="pt-2 flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setMode('PASS')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md flex items-center gap-1.5 transition-all ${
                mode === 'PASS'
                  ? 'bg-emerald-600 text-white shadow-sm ring-1 ring-emerald-400'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
              title="Normal application behavior conforming strictly to OQ/PQ specifications"
            >
              <ShieldCheck className="w-3 h-3 text-emerald-300" />
              PASS (Normal)
            </button>

            <button
              type="button"
              onClick={() => setMode('FAIL')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md flex items-center gap-1.5 transition-all ${
                mode === 'FAIL'
                  ? 'bg-red-600 text-white shadow-sm ring-1 ring-red-400'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
              title="Simulates validation defect: Empty submission error suppressed & product auto-population skipped"
            >
              <ShieldAlert className="w-3 h-3 text-red-300" />
              FAIL (Defect)
            </button>

            <button
              type="button"
              onClick={() => setMode('BLOCKED')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md flex items-center gap-1.5 transition-all ${
                mode === 'BLOCKED'
                  ? 'bg-amber-600 text-white shadow-sm ring-1 ring-amber-400'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
              title="Simulates broken UI control / 503 environment blocker on Primary Save"
            >
              <AlertTriangle className="w-3 h-3 text-amber-300" />
              BLOCKED
            </button>

            <div className="h-4 w-px bg-slate-700 mx-1" />

            <button
              type="button"
              onClick={resetDemoData}
              className="px-2 py-1 text-xs font-medium bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white rounded-md flex items-center gap-1 transition-all"
              title="Reset localStorage to pre-seeded clean state"
            >
              <RotateCcw className="w-3 h-3 text-brand-300" />
              Reset Data
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
