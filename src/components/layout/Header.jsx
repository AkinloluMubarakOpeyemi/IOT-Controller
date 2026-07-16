import { FaBars, FaMoon, FaSignOutAlt, FaSun } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

function Header({ onMenuClick }) {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/85 backdrop-blur dark:border-slate-800 dark:bg-slate-950/85">
      <div className="flex h-16 items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <button className="btn-secondary px-3 lg:hidden" onClick={onMenuClick} aria-label="Open sidebar">
            <FaBars />
          </button>
          <div>
            <p className="text-sm font-semibold text-slate-900 dark:text-white">Control Center</p>
            <p className="hidden text-xs text-slate-500 dark:text-slate-400 sm:block">
              {user?.email || 'Authenticated operator'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="btn-secondary px-3" onClick={toggleTheme} aria-label="Toggle theme">
            {isDark ? <FaSun /> : <FaMoon />}
          </button>
          <button className="btn-secondary" onClick={logout}>
            <FaSignOutAlt />
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;
