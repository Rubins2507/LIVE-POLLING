import React, { useState } from 'react';
import { LivePollLogo } from './LivePollLogo';
import { useAuth } from '../context/AuthContext';
import { User, LogOut, ChevronDown, Menu, X, PlusCircle, LayoutDashboard } from 'lucide-react';

interface NavbarProps {
  currentPath: string;
  navigate: (path: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPath, navigate }) => {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (id: string) => {
    if (currentPath !== '/') {
      navigate('/');
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-100 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <button
          onClick={() => navigate('/')}
          className="cursor-pointer focus:outline-none flex items-center"
        >
          <LivePollLogo size="md" />
        </button>

        {/* Center Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
          <button
            onClick={() => { navigate('/'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            className={`hover:text-blue-600 transition-colors ${currentPath === '/' ? 'text-blue-600 font-semibold' : ''}`}
          >
            Home
          </button>
          <button
            onClick={() => scrollToSection('features')}
            className="hover:text-blue-600 transition-colors"
          >
            Features
          </button>
          <button
            onClick={() => scrollToSection('how-it-works')}
            className="hover:text-blue-600 transition-colors"
          >
            How It Works
          </button>
          <button
            onClick={() => scrollToSection('about')}
            className="hover:text-blue-600 transition-colors"
          >
            About
          </button>
        </nav>

        {/* Right CTA */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-full hover:bg-slate-100 transition-colors text-sm font-medium text-slate-700"
              >
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span>{user.name}</span>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </button>

              {dropdownOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-100 py-1.5 z-20 animate-in fade-in zoom-in-95">
                    <div className="px-3 py-2 border-b border-slate-100">
                      <p className="text-xs font-semibold text-slate-900 truncate">{user.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                    </div>
                    <button
                      onClick={() => { navigate('/dashboard'); setDropdownOpen(false); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors text-left"
                    >
                      <LayoutDashboard className="w-4 h-4 text-slate-400" />
                      Dashboard
                    </button>
                    <button
                      onClick={() => { navigate('/polls/create'); setDropdownOpen(false); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors text-left"
                    >
                      <PlusCircle className="w-4 h-4 text-slate-400" />
                      Create Poll
                    </button>
                    <button
                      onClick={() => { navigate('/profile'); setDropdownOpen(false); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors text-left"
                    >
                      <User className="w-4 h-4 text-slate-400" />
                      Profile
                    </button>
                    <div className="my-1 border-t border-slate-100" />
                    <button
                      onClick={() => { logout(); setDropdownOpen(false); navigate('/'); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors text-left"
                    >
                      <LogOut className="w-4 h-4 text-red-500" />
                      Logout
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <>
              <button
                onClick={() => navigate('/login')}
                className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-blue-600 transition-colors"
              >
                Login
              </button>
              <button
                onClick={() => navigate('/signup')}
                className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs hover:shadow transition-all"
              >
                Sign Up
              </button>
            </>
          )}
        </div>

        {/* Mobile menu trigger */}
        <div className="md:hidden flex items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 pt-3 pb-6 space-y-3 shadow-lg">
          <div className="flex flex-col space-y-2">
            <button
              onClick={() => { navigate('/'); setMobileMenuOpen(false); }}
              className="text-left px-3 py-2 text-sm font-medium text-slate-700 rounded-lg hover:bg-slate-50"
            >
              Home
            </button>
            <button
              onClick={() => scrollToSection('features')}
              className="text-left px-3 py-2 text-sm font-medium text-slate-700 rounded-lg hover:bg-slate-50"
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection('how-it-works')}
              className="text-left px-3 py-2 text-sm font-medium text-slate-700 rounded-lg hover:bg-slate-50"
            >
              How It Works
            </button>
            <button
              onClick={() => scrollToSection('about')}
              className="text-left px-3 py-2 text-sm font-medium text-slate-700 rounded-lg hover:bg-slate-50"
            >
              About
            </button>
          </div>

          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            {user ? (
              <>
                <button
                  onClick={() => { navigate('/dashboard'); setMobileMenuOpen(false); }}
                  className="w-full py-2 px-3 text-center text-sm font-semibold bg-blue-50 text-blue-600 rounded-lg"
                >
                  Go to Dashboard
                </button>
                <button
                  onClick={() => { logout(); setMobileMenuOpen(false); navigate('/'); }}
                  className="w-full py-2 px-3 text-center text-sm font-medium text-red-600"
                >
                  Logout ({user.name})
                </button>
              </>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => { navigate('/login'); setMobileMenuOpen(false); }}
                  className="flex-1 py-2 text-center text-sm font-semibold text-slate-700 border border-slate-200 rounded-lg"
                >
                  Login
                </button>
                <button
                  onClick={() => { navigate('/signup'); setMobileMenuOpen(false); }}
                  className="flex-1 py-2 text-center text-sm font-semibold text-white bg-blue-600 rounded-lg shadow-xs"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
