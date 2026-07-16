import { FaDatabase, FaShieldAlt } from 'react-icons/fa';

function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white/80 px-4 py-5 text-sm text-slate-500 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80 dark:text-slate-400 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <p>
          © 2026 Akinlolu Mubarak Electrical Control and Energy Monitoring System. All rights reserved.
        </p>
        <div className="flex flex-wrap items-center gap-4">
          <span className="inline-flex items-center gap-2">
            <FaDatabase className="text-cyan-600 dark:text-cyan-300" />
            Firebase Realtime Database
          </span>
          <span className="inline-flex items-center gap-2">
            <FaShieldAlt className="text-emerald-600 dark:text-emerald-300" />
            Protected relay control
          </span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
