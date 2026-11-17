import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  ArrowDownLeft, ArrowLeftRight, ArrowUpRight, BarChart3, LayoutDashboard,
  LogOut, PiggyBank, ShieldCheck, Sparkles, Target, X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { initials } from '../../utils/format';

export const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/income', label: 'Income', icon: ArrowDownLeft },
  { to: '/expenses', label: 'Expenses', icon: ArrowUpRight },
  { to: '/budgets', label: 'Budgets', icon: Target },
  { to: '/savings', label: 'Savings Goals', icon: PiggyBank },
  { to: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
  { to: '/insights', label: 'Smart Insights', icon: Sparkles },
  { to: '/reports', label: 'Reports', icon: BarChart3 },
];

export default function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth();

  return (
    <>
      {open && <div className="sidebar-backdrop" onClick={onClose} />}
      <aside className={`sidebar ${open ? 'sidebar--open' : ''}`}>
        <div className="sidebar-brand">
          <div className="brand-mark">F</div>
          <div className="brand-text">
            <strong>FinTrack</strong>
            <span>SMART FINANCE</span>
          </div>
          <button type="button" className="icon-btn sidebar-close" onClick={onClose} aria-label="Close menu">
            <X size={18} />
          </button>
        </div>

        <div className="sidebar-section-label">WORKSPACE</div>
        <nav className="sidebar-nav">
          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => `nav-link ${isActive ? 'nav-link--active' : ''}`}
              onClick={onClose}
            >
              <Icon size={18} strokeWidth={1.9} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-section-label sidebar-section-label--second">ACCOUNT</div>
        <nav className="sidebar-nav">
          <NavLink to="/profile" className={({ isActive }) => `nav-link ${isActive ? 'nav-link--active' : ''}`} onClick={onClose}>
            <ShieldCheck size={18} strokeWidth={1.9} />
            <span>My Profile</span>
          </NavLink>
          <button type="button" className="nav-link nav-link--button" onClick={logout}>
            <LogOut size={18} strokeWidth={1.9} />
            <span>Sign Out</span>
          </button>
        </nav>

        <div className="sidebar-foot">
          <div className="sidebar-user">
            <div className="avatar avatar--sm">{initials(user?.name)}</div>
            <div className="sidebar-user-info">
              <strong>{user?.name || 'User'}</strong>
              <span>{user?.email || ''}</span>
            </div>
          </div>
          <div className="sidebar-status"><span className="status-dot" /> Secure session active</div>
        </div>
      </aside>
    </>
  );
}
