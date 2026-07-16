import { FaMicrochip, FaWifi } from 'react-icons/fa';
import { formatDateTime } from '../../utils/formatters';

function StatusPill({ active, label, icon: Icon }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-slate-200 p-4 dark:border-slate-800">
      <div className="flex items-center gap-3">
        <div
          className={`grid h-10 w-10 place-items-center rounded-lg ${
            active ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'
          }`}
        >
          <Icon />
        </div>
        <div>
          <p className="text-sm font-bold text-slate-900 dark:text-white">{label}</p>
          <p className="text-xs text-slate-500">{active ? 'Connected' : 'Disconnected'}</p>
        </div>
      </div>
      <span className={`h-3 w-3 rounded-full ${active ? 'bg-emerald-500' : 'bg-rose-500'}`} />
    </div>
  );
}

function StatusPanel({ deviceStatus, timestamp }) {
  return (
    <div className="panel p-5">
      <h2 className="text-lg font-bold text-slate-950 dark:text-white">Connection Status</h2>
      <div className="mt-4 grid gap-3">
        <StatusPill active={deviceStatus.wifiConnected} label="Wi-Fi Status" icon={FaWifi} />
        <StatusPill active={deviceStatus.online} label="Device Status" icon={FaMicrochip} />
      </div>
      <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
        Last sensor update: <span className="font-semibold">{formatDateTime(timestamp)}</span>
      </p>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Device last seen: <span className="font-semibold">{formatDateTime(deviceStatus.lastSeen)}</span>
      </p>
    </div>
  );
}

export default StatusPanel;
