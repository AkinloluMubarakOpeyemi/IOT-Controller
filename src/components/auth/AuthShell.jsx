import { Link } from 'react-router-dom';
import { FaBolt } from 'react-icons/fa';

function AuthShell({ title, subtitle, children, footer }) {
  return (
    <div className="grid min-h-screen bg-slate-950 text-white lg:grid-cols-[1.05fr_0.95fr]">
      <section className="hidden bg-[radial-gradient(circle_at_25%_20%,rgba(34,211,238,0.35),transparent_32%),linear-gradient(135deg,#0f172a,#155e75_48%,#111827)] p-10 lg:flex lg:flex-col lg:justify-between">
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-lg bg-white text-cyan-700">
            <FaBolt />
          </div>
          <div>
            <p className="font-extrabold uppercase tracking-wide">Smart Electrical Control</p>
            <p className="text-sm text-cyan-100">Energy monitoring for ESP32 relay systems</p>
          </div>
        </div>
        <div className="max-w-xl">
          <p className="text-sm font-bold uppercase tracking-[0.22em] text-cyan-100">
            ACS712 + ZMPT101B + Firebase
          </p>
          <h1 className="mt-5 text-5xl font-extrabold leading-tight">
            Real-time control, protection, and cost visibility.
          </h1>
          <p className="mt-5 text-base text-cyan-50">
            Monitor voltage, current, power, energy, relay state, Wi-Fi health, and operating cost from
            one engineering-grade dashboard.
          </p>
        </div>
      </section>

      <section className="grid place-items-center px-4 py-10">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="grid h-11 w-11 place-items-center rounded-lg bg-cyan-500 text-white">
              <FaBolt />
            </div>
            <div>
              <p className="font-bold">Smart Grid</p>
              <p className="text-xs text-slate-400">Energy Control</p>
            </div>
          </div>
          <div className="rounded-lg border border-white/10 bg-white p-6 text-slate-950 shadow-2xl dark:bg-slate-900 dark:text-white">
            <h2 className="text-2xl font-bold">{title}</h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>
            <div className="mt-6">{children}</div>
            {footer ? <div className="mt-6 text-center text-sm text-slate-500">{footer}</div> : null}
          </div>
          <p className="mt-6 text-center text-xs text-slate-400">
            Firebase Authentication protects the control dashboard.
          </p>
        </div>
      </section>
    </div>
  );
}

export function AuthLink({ to, children }) {
  return (
    <Link className="font-semibold text-cyan-600 hover:text-cyan-500 dark:text-cyan-300" to={to}>
      {children}
    </Link>
  );
}

export default AuthShell;
