import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Bell, ChevronDown, LogOut, Menu, Search, UserRound } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { greeting, initials } from '../../utils/format';
import { NAV_ITEMS } from './Sidebar';

export default function Topbar({ onMenu }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [query, setQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  const active = NAV_ITEMS.find((item) => (
    item.end ? location.pathname === item.to : location.pathname.startsWith(item.to)
  )) || (location.pathname === '/profile' ? { label: 'My Profile' } : { label: 'Dashboard' });

  useEffect(() => {
    const handleClick = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const submitSearch = (event) => {
    event.preventDefault();
    navigate(query.trim() ? `/transactions?search=${encodeURIComponent(query.trim())}` : '/transactions');
    setQuery('');
  };

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button type="button" className="icon-btn menu-trigger" onClick={onMenu} aria-label="Open menu">
          <Menu size={21} />
        </button>
        <div>
          <p className="topbar-greeting">{greeting()}, {user?.name?.split(' ')[0] || 'there'}</p>
          <h1 className="topbar-title">{active.label}</h1>
        </div>
      </div>

      <div className="topbar-right">
        <form className="topbar-search" onSubmit={submitSearch}>
          <Search size={17} />
          <input
            type="search"
            placeholder="Search transactions…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            aria-label="Search transactions"
          />
          <kbd>↵</kbd>
        </form>
        <button type="button" className="icon-btn notification-btn" onClick={() => navigate('/insights')} aria-label="View insights">
          <Bell size={19} />
          <span className="notification-dot" />
        </button>
        <div className="user-menu-wrap" ref={dropdownRef}>
          <button type="button" className="user-menu-trigger" onClick={() => setMenuOpen((v) => !v)}>
            <div className="avatar">{initials(user?.name)}</div>
            <ChevronDown size={15} />
          </button>
          {menuOpen && (
            <div className="user-dropdown">
              <div className="user-dropdown-head">
                <strong>{user?.name}</strong>
                <span>{user?.email}</span>
              </div>
              <button type="button" onClick={() => { navigate('/profile'); setMenuOpen(false); }}>
                <UserRound size={16} /> My Profile
              </button>
              <button type="button" onClick={logout} className="danger-text">
                <LogOut size={16} /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
