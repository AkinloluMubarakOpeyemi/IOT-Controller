import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  FaBolt,
  FaCalendarAlt,
  FaCoins,
  FaPlug,
  FaPowerOff,
  FaTachometerAlt,
  FaWaveSquare,
} from 'react-icons/fa';
import PageHeader from '../components/common/PageHeader';
import RealtimeChart from '../components/charts/RealtimeChart';
import AlertsPanel from '../components/dashboard/AlertsPanel';
import ControlPanel from '../components/dashboard/ControlPanel';
import CostPanel from '../components/dashboard/CostPanel';
import MetricCard from '../components/dashboard/MetricCard';
import StatusPanel from '../components/dashboard/StatusPanel';
import { useFirebaseData } from '../hooks/useFirebaseData';
import { formatCurrency, formatDateTime, formatNumber } from '../utils/formatters';

function DashboardPage() {
  const [scheduleMessage, setScheduleMessage] = useState('');
  const lastScheduleActionRef = useRef('');
  const data = useFirebaseData();
  const {
    sensorData,
    deviceControl,
    deviceStatus,
    settings,
    history,
    costs,
    loading,
    error,
    setRelayState,
    setTimer,
    saveSchedule,
  } = data;

  const handleRelayChange = useCallback((relayState) => setRelayState(relayState), [setRelayState]);
  const handleTimerChange = useCallback((timer) => setTimer(timer), [setTimer]);
  const handleScheduleSave = useCallback((schedule) => saveSchedule(schedule), [saveSchedule]);

  useEffect(() => {
    const schedule = deviceControl.schedule;

    if (!schedule?.enabled || (!schedule.onTime && !schedule.offTime)) {
      return undefined;
    }

    const runScheduleCheck = () => {
      const now = new Date();
      const currentTime = now.toTimeString().slice(0, 5);
      const currentMinuteKey = now.toLocaleDateString('en-CA') + `-${currentTime}`;

      if (schedule.onTime === currentTime && lastScheduleActionRef.current !== `on-${currentMinuteKey}`) {
        lastScheduleActionRef.current = `on-${currentMinuteKey}`;
        setRelayState(true)
          .then(() => setScheduleMessage('Scheduled ON time reached. Relay command sent.'))
          .catch(() => setScheduleMessage('Scheduled ON time reached, but relay command failed.'));
      }

      if (schedule.offTime === currentTime && lastScheduleActionRef.current !== `off-${currentMinuteKey}`) {
        lastScheduleActionRef.current = `off-${currentMinuteKey}`;
        setRelayState(false)
          .then(() => setScheduleMessage('Scheduled OFF time reached. Relay command sent.'))
          .catch(() => setScheduleMessage('Scheduled OFF time reached, but relay command failed.'));
      }
    };

    runScheduleCheck();
    const intervalId = window.setInterval(runScheduleCheck, 5000);

    return () => window.clearInterval(intervalId);
  }, [deviceControl.schedule, setRelayState]);

  const metrics = useMemo(
    () => [
      {
        title: 'Voltage',
        value: formatNumber(sensorData.voltage, 0),
        unit: 'V',
        icon: FaBolt,
        tone: sensorData.voltage > settings.voltageLimit ? 'rose' : 'cyan',
        detail: `Limit ${settings.voltageLimit} V`,
      },
      {
        title: 'Current',
        value: formatNumber(sensorData.current, 2),
        unit: 'A',
        icon: FaWaveSquare,
        tone: sensorData.current > settings.currentLimit ? 'rose' : 'emerald',
        detail: `Limit ${settings.currentLimit} A`,
      },
      {
        title: 'Power',
        value: formatNumber(sensorData.power, 0),
        unit: 'W',
        icon: FaTachometerAlt,
        tone: sensorData.power > settings.powerLimit ? 'rose' : 'amber',
        detail: `Limit ${settings.powerLimit} W`,
      },
      {
        title: 'Energy',
        value: formatNumber(sensorData.energy, 2),
        unit: 'kWh',
        icon: FaPlug,
        tone: 'violet',
        detail: 'Cumulative reading',
      },
      {
        title: 'Energy Cost',
        value: formatCurrency(sensorData.cost || costs.currentCost),
        icon: FaCoins,
        tone: 'emerald',
        detail: `${formatCurrency(settings.costPerKWh)} per kWh`,
      },
      {
        title: 'Relay Status',
        value: deviceControl.relayState ? 'ON' : 'OFF',
        icon: FaPowerOff,
        tone: deviceControl.relayState ? 'emerald' : 'slate',
        detail: `Timer ${deviceControl.timer || 0}s`,
      },
    ],
    [
      costs.currentCost,
      deviceControl.relayState,
      deviceControl.timer,
      sensorData.cost,
      sensorData.current,
      sensorData.energy,
      sensorData.power,
      sensorData.voltage,
      settings.costPerKWh,
      settings.currentLimit,
      settings.powerLimit,
      settings.voltageLimit,
    ],
  );

  const activeAlerts = useMemo(
    () =>
      [
        sensorData.voltage > settings.voltageLimit && {
          id: 'active-voltage',
          message: `Voltage is above ${settings.voltageLimit} V`,
          severity: 'critical',
          time: sensorData.timestamp,
        },
        sensorData.current > settings.currentLimit && {
          id: 'active-current',
          message: `Current is above ${settings.currentLimit} A`,
          severity: 'critical',
          time: sensorData.timestamp,
        },
        sensorData.power > settings.powerLimit && {
          id: 'active-power',
          message: `Power is above ${settings.powerLimit} W`,
          severity: 'critical',
          time: sensorData.timestamp,
        },
        !deviceStatus.online && {
          id: 'active-device-offline',
          message: 'Device is offline',
          severity: 'warning',
          time: deviceStatus.lastSeen || sensorData.timestamp,
        },
        !deviceStatus.wifiConnected && {
          id: 'active-wifi-disconnected',
          message: 'Wi-Fi disconnected',
          severity: 'warning',
          time: deviceStatus.lastSeen || sensorData.timestamp,
        },
      ].filter(Boolean),
    [
      deviceStatus.lastSeen,
      deviceStatus.online,
      deviceStatus.wifiConnected,
      sensorData.current,
      sensorData.power,
      sensorData.timestamp,
      sensorData.voltage,
      settings.currentLimit,
      settings.powerLimit,
      settings.voltageLimit,
    ],
  );

  const headerActions = useMemo(
    () => (
      <div className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm dark:bg-slate-900 dark:text-slate-300">
        <FaCalendarAlt className="mr-2 inline" />
        {formatDateTime(sensorData.timestamp)}
      </div>
    ),
    [sensorData.timestamp],
  );

  return (
    <>
      <PageHeader
        eyebrow="Live Engineering Dashboard"
        title="IoT Smart Electrical Control"
        description="Real-time ESP32 energy telemetry, relay commands, protection alerts, and Nigerian Naira cost analysis."
        actions={headerActions}
      />

      {error ? <p className="mb-4 rounded-lg bg-rose-500/10 p-3 text-sm text-rose-600">{error}</p> : null}
      {loading ? <p className="mb-4 text-sm text-slate-500">Loading live Firebase data...</p> : null}
      {scheduleMessage ? (
        <p className="mb-4 rounded-lg bg-cyan-500/10 p-3 text-sm font-medium text-cyan-700 dark:text-cyan-300">
          {scheduleMessage}
        </p>
      ) : null}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {metrics.map((metric) => (
          <MetricCard key={metric.title} {...metric} />
        ))}
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <ControlPanel
          relayState={deviceControl.relayState}
          timer={deviceControl.timer}
          schedule={deviceControl.schedule}
          onRelayChange={handleRelayChange}
          onTimerChange={handleTimerChange}
          onScheduleSave={handleScheduleSave}
        />
        <StatusPanel deviceStatus={deviceStatus} timestamp={sensorData.timestamp} />
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <CostPanel costs={costs} costPerKWh={settings.costPerKWh} />
        <AlertsPanel activeAlerts={activeAlerts} />
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-2">
        <RealtimeChart data={history} dataKey="voltage" color="#06b6d4" label="Voltage" unit="V" />
        <RealtimeChart data={history} dataKey="current" color="#10b981" label="Current" unit="A" />
        <RealtimeChart data={history} dataKey="power" color="#f59e0b" label="Power" unit="W" />
        <RealtimeChart data={history} dataKey="energy" color="#8b5cf6" label="Energy Consumption" unit="kWh" />
      </section>
    </>
  );
}

export default DashboardPage;
