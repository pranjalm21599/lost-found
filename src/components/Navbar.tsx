import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  Search,
  FileText,
  User as UserIcon,
  LogOut,
  Sun,
  Moon,
  Menu,
  X,
  Compass,
  GraduationCap
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link
          to={isAuthenticated ? '/dashboard' : '/'}
          className="flex items-center gap-2.5 group transition-transform focus:outline-none"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-sky-600 dark:from-indigo-500 dark:to-sky-400 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-all">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white block leading-tight">
              Campus Lost &amp; Found
            </span>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 hidden sm:block">
              Official University Portal
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1.5">
          {isAuthenticated ? (
            <>
              <Link
                to="/dashboard"
                id="nav-dashboard"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  isActive('/dashboard')
                    ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Compass className="w-4 h-4" />
                Dashboard
              </Link>
              <Link
                to="/search"
                id="nav-search"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  isActive('/search')
                    ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Search className="w-4 h-4" />
                Search
              </Link>
              <Link
                to="/my-reports"
                id="nav-my-reports"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  isActive('/my-reports')
                    ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <FileText className="w-4 h-4" />
                My Reports
              </Link>
              <Link
                to="/profile"
                id="nav-profile"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  isActive('/profile')
                    ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <UserIcon className="w-4 h-4" />
                Profile
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/search"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  isActive('/search')
                    ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Search className="w-4 h-4" />
                Browse Items
              </Link>
            </>
          )}
        </nav>

        {/* Right side controls: Theme + Auth */}
        <div className="flex items-center gap-2.5">
          {/* Theme Toggle */}
          <button
            id="theme-toggle-btn"
            onClick={toggleTheme}
            aria-label="Toggle Theme"
            className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
          </button>

          {isAuthenticated && user ? (
            <div className="hidden md:flex items-center gap-3 pl-2 border-l border-slate-200 dark:border-slate-700">
              <Link
                to="/profile"
                className="flex items-center gap-2 group text-left"
              >
                <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-semibold text-xs flex items-center justify-center border border-indigo-200 dark:border-indigo-800">
                  {user.profile_photo ? (
                    <img
                      src={user.profile_photo}
                      alt={user.full_name}
                      className="w-full h-full rounded-full object-cover"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    user.full_name.slice(0, 2).toUpperCase()
                  )}
                </div>
                <div className="text-xs leading-tight">
                  <span className="font-semibold text-slate-800 dark:text-slate-200 block group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {user.full_name}
                  </span>
                  <span className="text-slate-400 dark:text-slate-500 font-mono text-[10px]">
                    {user.student_id}
                  </span>
                </div>
              </Link>

              <button
                id="logout-btn"
                onClick={handleLogout}
                title="Logout"
                className="p-2 text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Link
                to="/login"
                id="nav-login-btn"
                className="px-3.5 py-1.5 text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                id="nav-register-btn"
                className="px-3.5 py-1.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm shadow-indigo-600/20 transition-colors"
              >
                Create Account
              </Link>
            </div>
          )}

          {/* Mobile hamburger button */}
          <button
            id="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 pt-3 pb-5 space-y-2">
          {isAuthenticated && user ? (
            <div className="pb-3 mb-2 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <p className="font-semibold text-sm text-slate-900 dark:text-white">{user.full_name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{user.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="text-xs text-rose-600 dark:text-rose-400 font-medium px-2 py-1 rounded bg-rose-50 dark:bg-rose-950/60"
              >
                Sign Out
              </button>
            </div>
          ) : null}

          {/* Mobile Theme Toggle */}
          <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
              {theme === 'dark' ? <Moon className="w-4 h-4 text-indigo-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
              Appearance
            </span>
            <button
              onClick={toggleTheme}
              className="text-xs font-semibold px-2.5 py-1 rounded-md bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 shadow-xs hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors"
            >
              Switch to {theme === 'dark' ? 'Light' : 'Dark'} Mode
            </button>
          </div>

          {isAuthenticated ? (
            <>
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Dashboard
              </Link>
              <Link
                to="/search"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Search
              </Link>
              <Link
                to="/my-reports"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                My Reports
              </Link>
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Profile
              </Link>
            </>
          ) : (
            <div className="space-y-2 pt-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center w-full px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 rounded-lg"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg shadow-sm"
              >
                Create Account
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
