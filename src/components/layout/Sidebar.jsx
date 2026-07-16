import { NavLink } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { FaChartLine, FaCog, FaHistory, FaTimes, FaBolt } from 'react-icons/fa';

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: FaChartLine },
  { to: '/history', label: 'History', icon: FaHistory },
  { to: '/settings', label: 'Settings', icon: FaCog },
];

function NavItems({ onNavigate }) {
  return (
    <nav className="mt-8 space-y-2">
      {links.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          onClick={onNavigate}
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition ${
              isActive
                ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/25'
                : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
            }`
          }
        >
          <Icon />
          {label}
        </NavLink>
      ))}
    </nav>
  );
}

function SidebarContent({ onClose }) {
  return (
    <div className="flex h-full flex-col px-5 py-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-lg bg-cyan-500 text-white">
            <FaBolt />
          </div>
          <div>
            <p className="text-sm font-extrabold uppercase tracking-wide text-slate-950 dark:text-white">
              Smart Grid
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">ESP32 Energy Control</p>
          </div>
        </div>
        <button className="btn-secondary px-3 lg:hidden" onClick={onClose} aria-label="Close sidebar">
          <FaTimes />
        </button>
      </div>
      <NavItems onNavigate={onClose} />
      <div className="mt-auto rounded-lg border border-cyan-500/20 bg-cyan-500/10 p-4">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-700 dark:text-cyan-300">
          Hardware
        </p>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          ESP32 with ACS712 current sensing, ZMPT101B voltage sensing, and relay control.
        </p>
      </div>
    </div>
  );
}

function Sidebar({ open, onClose }) {
  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 lg:block">
        <SidebarContent onClose={onClose} />
      </aside>

      <AnimatePresence>
        {open ? (
          <>
            <motion.button
              aria-label="Close menu"
              className="fixed inset-0 z-40 bg-slate-950/50 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
            />
            <motion.aside
              className="fixed inset-y-0 left-0 z-50 w-72 border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 lg:hidden"
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: 'spring', damping: 28, stiffness: 260 }}
            >
              <SidebarContent onClose={onClose} />
            </motion.aside>
          </>
        ) : null}
      </AnimatePresence>
    </>
  );
}

export default Sidebar;
