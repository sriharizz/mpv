import React from 'react';
import { Outlet } from 'react-router-dom';
import { AppHeader } from './AppHeader';
import { AppSidebar } from './AppSidebar';
import { SimulationBar } from '../common/SimulationBar';

export const AppLayout: React.FC = () => {
  return (
    <div className="h-screen overflow-hidden flex flex-col bg-[#f4f7fb]">
      <AppHeader />
      <div className="flex-1 flex overflow-hidden">
        <AppSidebar />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-24 relative">
          <Outlet />
        </main>
      </div>
      <SimulationBar />
    </div>
  );
};
