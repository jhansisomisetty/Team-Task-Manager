import React, { useState, useEffect } from 'react';
import { Menu, Wifi, Sparkles, User, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';

interface NavbarProps {
  onToggleSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const { user } = useAuth();
  const [timeStr, setTimeStr] = useState('');

  useEffect(() => {
    const updateUTC = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };
    updateUTC();
    const interval = setInterval(updateUTC, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-20 bg-white border-b border-slate-200 px-6 sm:px-10 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center gap-3">
        {/* Toggle trigger button for sidebar */}
        <button
          onClick={onToggleSidebar}
          className="p-2 -ml-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 lg:hidden transition-all outline-none"
          title="Open Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Welcome indicator */}
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-500" />
          <span className="text-sm font-medium text-slate-650 hidden sm:inline-block">
            Welcome to the Active Workspace,{' '}
            <strong className="text-indigo-600 font-semibold">{user?.name}</strong>
          </span>
          <span className="text-sm font-medium text-indigo-600 font-semibold sm:hidden">
            {user?.name}
          </span>
        </div>
      </div>

      {/* Right details */}
      <div className="flex items-center gap-4">
        {/* Clock */}
        {timeStr && (
          <div className="text-xs font-mono text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 hidden md:block">
            {timeStr}
          </div>
        )}

        {/* Telemetry Status badge */}
        <div className="flex items-center gap-1.5 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full shrink-0">
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-[10px] font-mono text-indigo-600 font-bold uppercase tracking-wider">
            Connected
          </span>
        </div>
      </div>
    </header>
  );
};
