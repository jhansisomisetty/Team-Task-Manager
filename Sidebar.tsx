import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { 
  LayoutDashboard, 
  FolderKanban, 
  CheckSquare, 
  User, 
  ShieldAlert, 
  LogOut, 
  Building2,
  Lock
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();

  const links = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/projects', label: 'Projects', icon: FolderKanban },
    { to: '/tasks', label: 'Tasks', icon: CheckSquare },
    { to: '/profile', label: 'My Profile', icon: User },
  ];

  if (user?.role === 'admin') {
    links.push({ to: '/admin', label: 'Admin Board', icon: ShieldAlert });
  }

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 bg-slate-900 border-r border-slate-800 text-slate-200 w-64 z-40 transform lg:translate-x-0 lg:static lg:h-screen transition-transform duration-300 ease-in-out flex flex-col justify-between ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Logo Branding */}
          <div className="h-20 flex items-center px-6 bg-slate-950 border-b border-slate-950/50">
            <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center mr-2 shrink-0">
              <div className="w-4 h-4 bg-white rounded-sm"></div>
            </div>
            <span className="text-white font-bold text-xl tracking-tight">TeamTask</span>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 py-8 space-y-2">
            {links.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium border transition-all ${
                      isActive
                        ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                        : 'text-slate-400 border-transparent hover:text-white hover:bg-slate-800'
                    }`
                  }
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  <span>{link.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* User Session card */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/10">
          <div className="flex items-center gap-3 p-2 bg-slate-800/30 rounded-xl mb-3">
            <img
              src={user?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user?.name || '')}`}
              alt="avatar"
              referrerPolicy="no-referrer"
              className="w-10 h-10 rounded-full border border-slate-700 bg-slate-800 object-cover shrink-0"
            />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-white truncate leading-tight">
                {user?.name}
              </p>
              <div className="flex items-center gap-1 mt-0.5">
                {user?.role === 'admin' && <Lock className="w-3 h-3 text-emerald-400" />}
                <p className="text-xs font-mono text-slate-400 uppercase tracking-widest leading-none">
                  {user?.role}
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              logout();
              onClose();
            }}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-medium border border-slate-800 hover:border-slate-700 text-rose-400 hover:text-rose-300 hover:bg-rose-500/5 transition-all outline-none"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};
