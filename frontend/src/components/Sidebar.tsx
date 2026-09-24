import React from 'react';
import {
  LayoutDashboard,
  BarChart2,
  PlusCircle,
  User,
  Settings,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  currentPath: string;
  navigate: (path: string) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPath,
  navigate,
  isOpen = true,
  onClose,
}) => {
  const { logout } = useAuth();

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'My Polls', path: '/dashboard#my-polls', icon: BarChart2 },
    { label: 'Create Poll', path: '/polls/create', icon: PlusCircle },
    { label: 'Profile', path: '/profile', icon: User },
    { label: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && onClose && (
        <div
          className="fixed inset-0 z-30 bg-slate-900/30 backdrop-blur-xs md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed md:sticky top-0 md:top-16 z-30 h-[100vh] md:h-[calc(100vh-4rem)] w-60 shrink-0 bg-white border-r border-slate-200/80 flex flex-col justify-between py-6 px-4 transition-transform duration-200 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="space-y-1.5">
          <div className="px-3 pb-4 text-xs font-bold text-slate-400 uppercase tracking-wider hidden md:block">
            Menu
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPath === item.path || (item.path.startsWith('/dashboard') && currentPath === '/dashboard' && item.label === 'Dashboard');
            return (
              <button
                key={item.label}
                onClick={() => {
                  navigate(item.path);
                  if (onClose) onClose();
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all text-left ${
                  isActive
                    ? 'bg-blue-50 text-blue-600 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Bottom Logout */}
        <div className="pt-4 border-t border-slate-100">
          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors text-left"
          >
            <LogOut className="w-4 h-4 text-red-500" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};
