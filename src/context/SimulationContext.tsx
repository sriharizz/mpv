import React, { createContext, useContext, useState, useEffect } from 'react';
import { SimulationMode } from '../types/onepv';

interface SimulationContextType {
  mode: SimulationMode;
  setMode: (mode: SimulationMode) => void;
  resetDemoData: () => void;
}

const SimulationContext = createContext<SimulationContextType | undefined>(undefined);

export const SimulationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setModeState] = useState<SimulationMode>(() => {
    // Check URL query parameters first (?simMode=pass|fail|blocked)
    const urlParams = new URLSearchParams(window.location.search);
    const paramMode = urlParams.get('simMode')?.toUpperCase();
    if (paramMode === 'PASS' || paramMode === 'FAIL' || paramMode === 'BLOCKED') {
      return paramMode as SimulationMode;
    }
    const saved = localStorage.getItem('onepv_sim_mode');
    if (saved === 'PASS' || saved === 'FAIL' || saved === 'BLOCKED') {
      return saved as SimulationMode;
    }
    return 'PASS';
  });

  const setMode = (newMode: SimulationMode) => {
    setModeState(newMode);
    localStorage.setItem('onepv_sim_mode', newMode);
    // Update URL param without refreshing
    const url = new URL(window.location.href);
    url.searchParams.set('simMode', newMode.toLowerCase());
    window.history.replaceState({}, '', url.toString());
  };

  useEffect(() => {
    localStorage.setItem('onepv_sim_mode', mode);
  }, [mode]);

  const resetDemoData = () => {
    localStorage.removeItem('onepv_cases');
    localStorage.removeItem('onepv_audit_history');
    localStorage.removeItem('onepv_current_case');
    window.location.reload();
  };

  return (
    <SimulationContext.Provider value={{ mode, setMode, resetDemoData }}>
      {children}
    </SimulationContext.Provider>
  );
};

export const useSimulation = () => {
  const context = useContext(SimulationContext);
  if (!context) {
    throw new Error('useSimulation must be used within a SimulationProvider');
  }
  return context;
};
