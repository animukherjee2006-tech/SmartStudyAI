import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderOpen,
  BookText,
  ClipboardCheck,
  Layers,
  History,
  Settings,
  HelpCircle,
  LogOut,
  GraduationCap,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/materials', label: 'My Study Materials', icon: FolderOpen },
  { to: '/notes', label: 'AI Notes', icon: BookText },
  { to: '/quiz', label: 'AI Quiz', icon: ClipboardCheck },
  { to: '/flashcards', label: 'Flashcards', icon: Layers },
  { to: '/history', label: 'Study History', icon: History },
  { to: '/settings', label: 'Settings', icon: Settings },
  { to: '/help', label: 'Help & Support', icon: HelpCircle },
];

function Sidebar({ mobileOpen, onClose }) {
  const { logout } = useAuth();
  const notify = useNotification();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    notify.info('You have been signed out.');
    navigate('/', { replace: true });
  };

  const navContent = (
    <div className="flex flex-col h-full bg-[#10213A] text-white w-64 select-none">
      {/* Brand */}
      <div className="h-16 px-5 flex items-center justify-between border-b border-white/10">
        <NavLink
          to="/dashboard"
          onClick={onClose}
          className="flex items-center gap-2.5 group"
        >
          <div className="w-9 h-9 rounded-md bg-[#172B4D] border border-[#C49A45]/60 flex items-center justify-center text-[#C49A45]">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <span className="font-serif font-bold text-base tracking-tight block leading-none text-white">
              StudyBuddy AI
            </span>
            <span className="text-[11px] text-[#C49A45] tracking-wider uppercase font-medium">
              Academic Portal
            </span>
          </div>
        </NavLink>

        <button
          type="button"
          onClick={onClose}
          className="lg:hidden text-slate-300 hover:text-white p-1"
          aria-label="Close navigation menu"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto px-3 py-5 space-y-1">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3.5 py-2.5 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-[#294C73] text-white border-l-2 border-[#C49A45]'
                  : 'text-slate-300 hover:bg-white/5 hover:text-white'
              }`
            }
          >
            <Icon className="w-4 h-4 shrink-0" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-white/10">
        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-md text-sm font-medium text-slate-300 hover:bg-[#B94A48]/20 hover:text-white transition-colors"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block shrink-0 border-r border-[#172B4D]/20">
        {navContent}
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden flex">
          <div
            className="fixed inset-0 bg-[#10213A]/60"
            onClick={onClose}
            aria-hidden="true"
          />
          <div className="relative z-50 flex h-full">{navContent}</div>
        </div>
      )}
    </>
  );
}

export default Sidebar;
