import { FaBell, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import { formatDateTime } from '../../utils/formatters';

function AlertsPanel({ alerts, activeAlerts = [], onAcknowledge }) {
  const historicalAlerts = alerts.filter(
    (alert) => !activeAlerts.some((activeAlert) => activeAlert.message === alert.message),
  );

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
      <div className="mt-4 max-h-80 space-y-4 overflow-auto pr-1">
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
            <p className="rounded-lg bg-emerald-500/10 p-4 text-sm text-emerald-700 dark:text-emerald-300">
              All protection checks are normal.
            </p>
          )}
        </div>

        {historicalAlerts.length ? (
          <div className="space-y-3 border-t border-slate-200 pt-4 dark:border-slate-800">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Recent history</p>
            {historicalAlerts.slice(0, 10).map((alert) => (
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
            ))}
          </div>
        ) : null}
        {!activeAlerts.length && !historicalAlerts.length ? (
          <p className="text-xs text-slate-500">No historical alerts recorded.</p>
        ) : null}
      </div>
    </div>
  );
}

export default AlertsPanel;
