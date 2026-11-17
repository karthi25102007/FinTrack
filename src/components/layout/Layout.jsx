import React, { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  return (
    <div className="app-shell">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="main-column">
        <Topbar onMenu={() => setSidebarOpen(true)} />
        <main className="page-content">
          <Outlet />
        </main>
        <footer className="app-footer">
          <span>© {new Date().getFullYear()} FinTrack. Built for smarter money decisions.</span>
          <span>All your data stays private and secure.</span>
        </footer>
      </div>
    </div>
  );
}
