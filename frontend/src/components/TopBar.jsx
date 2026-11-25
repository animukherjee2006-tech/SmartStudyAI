import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Menu,
  Search,
  Bell,
  Settings,
  LogOut,
  ChevronDown,
  User as UserIcon,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

function TopBar({ onOpenSidebar, pageTitle }) {
  const { user, logout } = useAuth();
  const notify = useNotification();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const dropdownRef = useRef(null);
  const notifRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    navigate(`/history?search=${encodeURIComponent(searchQuery.trim())}`);
    setSearchQuery('');
  };

  const handleLogout = async () => {
    setDropdownOpen(false);
    await logout();
    notify.info('Signed out successfully.');
    navigate('/', { replace: true });
  };

  const initials = (user?.name || 'S')
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="h-16 bg-white border-b border-[#E5E1D8] px-4 sm:px-6 flex items-center justify-between gap-4 sticky top-0 z-30">
      {/* Left: Hamburger + Page Title */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onOpenSidebar}
          className="lg:hidden p-2 rounded-md text-[#172B4D] hover:bg-[#F7F4EC] border border-[#E5E1D8]"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <h1 className="font-serif font-bold text-lg sm:text-xl text-[#172B4D] truncate">
          {pageTitle}
        </h1>
      </div>

      {/* Right: Search + Notifications + Profile */}
      <div className="flex items-center gap-2 sm:gap-4">
        <form onSubmit={handleSearch} className="hidden md:flex items-center relative">
          <Search className="w-4 h-4 text-[#6B7280] absolute left-3 pointer-events-none" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search study history..."
            aria-label="Search study history"
            className="w-56 lg:w-64 pl-9 pr-3 py-1.5 text-sm bg-[#F7F4EC] border border-[#E5E1D8] rounded-md text-[#172B4D] placeholder-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#294C73]/40 focus:bg-white transition"
          />
        </form>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={() => setNotifOpen((prev) => !prev)}
            className="p-2 rounded-md text-[#172B4D] hover:bg-[#F7F4EC] border border-transparent hover:border-[#E5E1D8] transition relative"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
          </button>

          {notifOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-white border border-[#E5E1D8] rounded-lg shadow-lg py-2 z-40">
              <div className="px-4 py-2 border-b border-[#E5E1D8]">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#6B7280]">
                  Academic Reminders
                </p>
              </div>
              <div className="px-4 py-3 text-sm text-[#374151]">
                <p className="font-medium text-[#172B4D]">Stay consistent today</p>
                <p className="text-xs text-[#6B7280] mt-1">
                  Generate AI notes or complete a quick quiz to keep your study streak active.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setDropdownOpen((prev) => !prev)}
            className="flex items-center gap-2.5 py-1.5 px-2 rounded-md hover:bg-[#F7F4EC] transition"
            aria-expanded={dropdownOpen}
            aria-label="User profile menu"
          >
            <div className="w-8 h-8 rounded-full bg-[#172B4D] text-[#C49A45] font-semibold text-xs flex items-center justify-center border border-[#C49A45]/40">
              {initials}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-semibold text-[#172B4D] leading-none">
                {user?.name || 'Student'}
              </p>
              <p className="text-[11px] text-[#6B7280] mt-0.5 leading-none">
                {user?.academicLevel || 'Scholar'}
              </p>
            </div>
            <ChevronDown className="w-4 h-4 text-[#6B7280] hidden sm:block" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-[#E5E1D8] rounded-lg shadow-lg py-1.5 z-40">
              <div className="px-4 py-2.5 border-b border-[#E5E1D8]">
                <p className="text-sm font-semibold text-[#172B4D] truncate">{user?.name}</p>
                <p className="text-xs text-[#6B7280] truncate">{user?.email}</p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setDropdownOpen(false);
                  navigate('/settings');
                }}
                className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-[#172B4D] hover:bg-[#F7F4EC] transition"
              >
                <UserIcon className="w-4 h-4 text-[#6B7280]" />
                <span>Profile</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setDropdownOpen(false);
                  navigate('/settings');
                }}
                className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-[#172B4D] hover:bg-[#F7F4EC] transition"
              >
                <Settings className="w-4 h-4 text-[#6B7280]" />
                <span>Settings</span>
              </button>

              <div className="border-t border-[#E5E1D8] my-1" />

              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-[#B94A48] hover:bg-[#B94A48]/5 font-medium transition"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default TopBar;
