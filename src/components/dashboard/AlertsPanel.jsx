import { FaBell, FaExclamationTriangle } from 'react-icons/fa';
import { formatDateTime } from '../../utils/formatters';

function AlertsPanel({ activeAlerts = [] }) {
  return (
    <div className="panel p-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-950 dark:text-white">Alerts & Protection</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Live Firebase threshold and connection checks.</p>
        </div>
        <div className="grid h-10 w-10 place-items-center rounded-lg bg-amber-500/10 text-amber-600">
          <FaBell />
        </div>
      </div>
      <div className="mt-4 max-h-80 space-y-3 overflow-auto pr-1">
        <div className="space-y-3">
          {activeAlerts.length ? (
            activeAlerts.map((alert) => (
              <div
                key={alert.id}
                className="rounded-lg border border-amber-300 bg-amber-500/10 p-3 dark:border-amber-500/40"
              >
                <div className="flex items-start gap-3">
                  <FaExclamationTriangle className="mt-1 text-amber-500" />
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{alert.message}</p>
                    <p className="mt-1 text-xs text-slate-500">{formatDateTime(alert.time)}</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-lg bg-emerald-500/10 p-4 text-sm text-emerald-700 dark:text-emerald-300">
              <p className="font-semibold">All protection checks are normal.</p>
              <p className="mt-1 text-xs">Voltage, current, power, device status, and Wi-Fi are within the saved Firebase limits.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AlertsPanel;
