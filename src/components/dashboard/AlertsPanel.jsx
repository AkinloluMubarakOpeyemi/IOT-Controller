import { FaBell, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import { formatDateTime } from '../../utils/formatters';

function AlertsPanel({ alerts, onAcknowledge }) {
  return (
    <div className="panel p-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-950 dark:text-white">Alerts & Protection</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Threshold and connectivity events.</p>
        </div>
        <div className="grid h-10 w-10 place-items-center rounded-lg bg-amber-500/10 text-amber-600">
          <FaBell />
        </div>
      </div>
      <div className="mt-4 max-h-80 space-y-3 overflow-auto pr-1">
        {alerts.length ? (
          alerts.map((alert) => (
            <div
              key={alert.id}
              className="rounded-lg border border-slate-200 p-3 dark:border-slate-800"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex gap-3">
                  <FaExclamationTriangle className="mt-1 text-amber-500" />
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{alert.message}</p>
                    <p className="mt-1 text-xs text-slate-500">{formatDateTime(alert.time)}</p>
                  </div>
                </div>
                {alert.acknowledged ? (
                  <FaCheckCircle className="text-emerald-500" />
                ) : (
                  <button className="text-xs font-bold text-cyan-600" onClick={() => onAcknowledge(alert.id)}>
                    Ack
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <p className="rounded-lg bg-emerald-500/10 p-4 text-sm text-emerald-700 dark:text-emerald-300">
            No alerts recorded.
          </p>
        )}
      </div>
    </div>
  );
}

export default AlertsPanel;
