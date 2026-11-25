import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import { useAuth } from '../context/AuthContext';

function DashboardLayout({ pageTitle, children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { settings } = useAuth();

  const bgClass =
    settings?.theme === 'classic_white' ? 'bg-[#F8F9FA]' : 'bg-[#F7F4EC]';

  return (
    <div className={`min-h-screen flex ${bgClass} text-[#172B4D]`}>
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        <TopBar
          pageTitle={pageTitle}
          onOpenSidebar={() => setMobileOpen(true)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
