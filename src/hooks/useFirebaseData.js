import { onValue, push, ref, set, update } from 'firebase/database';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { database, paths } from '../firebase/config';

const defaultSensorData = {
  voltage: 0,
  current: 0,
  power: 0,
  energy: 0,
  cost: 0,
  timestamp: null,
};

const defaultDeviceControl = {
  relayState: false,
  timer: 0,
  schedule: {
    enabled: false,
    onTime: '',
    offTime: '',
  },
};

const defaultDeviceStatus = {
  online: false,
  wifiConnected: false,
  lastSeen: null,
};

const defaultSettings = {
  voltageLimit: 250,
  currentLimit: 10,
  powerLimit: 2500,
  costPerKWh: 75,
  wifiSsid: '',
  wifiPassword: '',
};

function reportMessage(error, fallback = 'Firebase operation failed.') {
  return error?.message || fallback;
}

function toNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function shallowEqual(left, right) {
  const leftKeys = Object.keys(left || {});
  const rightKeys = Object.keys(right || {});

  if (leftKeys.length !== rightKeys.length) {
    return false;
  }

  return leftKeys.every((key) => left[key] === right[key]);
}

function normalizeDeviceControl(value = {}) {
  return {
    relayState: Boolean(value.relayState),
    timer: toNumber(value.timer),
    schedule: {
      enabled: Boolean(value.schedule?.enabled),
      onTime: value.schedule?.onTime || '',
      offTime: value.schedule?.offTime || '',
    },
  };
}

function deviceControlEqual(left, right) {
  return (
    left.relayState === right.relayState &&
    left.timer === right.timer &&
    left.schedule?.enabled === right.schedule?.enabled &&
    left.schedule?.onTime === right.schedule?.onTime &&
    left.schedule?.offTime === right.schedule?.offTime
  );
}

function normalizeSensorData(value = {}) {
  const energy = toNumber(value.energy);
  const costPerKWh = toNumber(value.costPerKWh);

  return {
    voltage: toNumber(value.voltage),
    current: toNumber(value.current),
    power: toNumber(value.power),
    energy,
    cost: toNumber(value.cost, energy * costPerKWh),
    timestamp: value.timestamp || new Date().toISOString(),
  };
}

function normalizeObjectList(value = {}) {
  return Object.entries(value || {})
    .map(([id, item]) => ({ id, ...item }))
    .sort((a, b) => new Date(b.time || b.timestamp || 0) - new Date(a.time || a.timestamp || 0));
}

function historyKeyFromSensor(sensorData) {
  const timestamp = sensorData.timestamp || new Date().toISOString();
  return timestamp.replace(/[.#$\/[\]]/g, '-');
}

function pointFromSensor(sensorData) {
  const timestamp = sensorData.timestamp || new Date().toISOString();
  return {
    timestamp,
    time: new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }),
    voltage: sensorData.voltage,
    current: sensorData.current,
    power: sensorData.power,
    energy: sensorData.energy,
    cost: sensorData.cost,
  };
}

export function useFirebaseData() {
  const [sensorData, setSensorData] = useState(defaultSensorData);
  const [deviceControl, setDeviceControl] = useState(defaultDeviceControl);
  const [deviceStatus, setDeviceStatus] = useState(defaultDeviceStatus);
  const [settings, setSettings] = useState(defaultSettings);
  const [alerts, setAlerts] = useState([]);
  const [liveHistory, setLiveHistory] = useState([]);
  const [persistedHistory, setPersistedHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const lastAlertKeyRef = useRef('');
  const lastHistoryKeyRef = useRef('');
  const loadedPathsRef = useRef({
    sensorData: false,
    deviceStatus: false,
    settings: false,
  });

  useEffect(() => {
    if (!database) {
      setError('Firebase Realtime Database is not initialized.');
      setLoading(false);
      return undefined;
    }

    const unsubscribers = [
      onValue(
        ref(database, paths.sensorData),
        (snapshot) => {
          if (!snapshot.exists()) {
            loadedPathsRef.current.sensorData = true;
            setLoading(false);
            return;
          }

          const nextSensorData = normalizeSensorData(snapshot.val() || {});
          const historyKey = historyKeyFromSensor(nextSensorData);

          loadedPathsRef.current.sensorData = true;
          setSensorData((current) => (shallowEqual(current, nextSensorData) ? current : nextSensorData));
          setLiveHistory((current) => {
            if (current.at(-1)?.timestamp === nextSensorData.timestamp) {
              return current;
            }

            return [...current.slice(-79), pointFromSensor(nextSensorData)];
          });

          if (lastHistoryKeyRef.current !== historyKey) {
            lastHistoryKeyRef.current = historyKey;
            set(ref(database, `${paths.history}/${historyKey}`), pointFromSensor(nextSensorData)).catch((writeError) => {
              setError(reportMessage(writeError, 'Unable to store sensor reading history.'));
            });
          }

          setLoading(false);
          setError('');
        },
        (listenerError) => {
          setLoading(false);
          setError(reportMessage(listenerError, 'Unable to read sensor data.'));
        },
      ),
      onValue(
        ref(database, paths.deviceControl),
        (snapshot) => {
          if (!snapshot.exists()) {
            set(ref(database, paths.deviceControl), defaultDeviceControl).catch((writeError) => {
              setError(reportMessage(writeError, 'Unable to create default device control data.'));
            });
          }

          const nextDeviceControl = normalizeDeviceControl(snapshot.val() || defaultDeviceControl);
          setDeviceControl((current) => (deviceControlEqual(current, nextDeviceControl) ? current : nextDeviceControl));
        },
        (listenerError) => setError(reportMessage(listenerError, 'Unable to read device control data.')),
      ),
      onValue(
        ref(database, paths.deviceStatus),
        (snapshot) => {
          const nextDeviceStatus = { ...defaultDeviceStatus, ...(snapshot.val() || {}) };
          loadedPathsRef.current.deviceStatus = true;
          setDeviceStatus((current) => (shallowEqual(current, nextDeviceStatus) ? current : nextDeviceStatus));
        },
        (listenerError) => setError(reportMessage(listenerError, 'Unable to read device status data.')),
      ),
      onValue(
        ref(database, paths.settings),
        (snapshot) => {
          if (!snapshot.exists()) {
            set(ref(database, paths.settings), defaultSettings).catch((writeError) => {
              setError(reportMessage(writeError, 'Unable to create default settings.'));
            });
          }

          const nextSettings = { ...defaultSettings, ...(snapshot.val() || {}) };
          loadedPathsRef.current.settings = true;
          setSettings((current) => (shallowEqual(current, nextSettings) ? current : nextSettings));
        },
        (listenerError) => setError(reportMessage(listenerError, 'Unable to read settings data.')),
      ),
      onValue(
        ref(database, paths.alerts),
        (snapshot) => {
          setAlerts(normalizeObjectList(snapshot.val()).slice(0, 50));
        },
        (listenerError) => setError(reportMessage(listenerError, 'Unable to read alerts.')),
      ),
      onValue(
        ref(database, paths.history),
        (snapshot) => {
          const rows = normalizeObjectList(snapshot.val())
            .map((item) => pointFromSensor(normalizeSensorData(item)))
            .reverse();
          setPersistedHistory(rows.slice(-500));
        },
        (listenerError) => setError(reportMessage(listenerError, 'Unable to read history.')),
      ),
    ];

    return () => unsubscribers.forEach((unsubscribe) => unsubscribe());
  }, []);

  const addAlert = useCallback(async (message, severity = 'warning') => {
    if (!database) {
      throw new Error('Firebase Realtime Database is not initialized.');
    }

    const time = new Date().toISOString();
    const key = `${message}-${severity}-${time.slice(0, 16)}`;

    if (lastAlertKeyRef.current === key) {
      return;
    }

    lastAlertKeyRef.current = key;
    await push(ref(database, paths.alerts), { message, severity, time });
  }, []);

  useEffect(() => {
    const readyForProtectionChecks =
      loadedPathsRef.current.sensorData &&
      loadedPathsRef.current.deviceStatus &&
      loadedPathsRef.current.settings;

    if (!readyForProtectionChecks) {
      return;
    }

    const checks = [
      sensorData.voltage > settings.voltageLimit && 'Voltage exceeded safe limit',
      sensorData.current > settings.currentLimit && 'Current exceeded safe limit',
      sensorData.power > settings.powerLimit && 'Power exceeded safe limit',
      !deviceStatus.online && 'Device is offline',
      !deviceStatus.wifiConnected && 'Wi-Fi disconnected',
    ].filter(Boolean);

    checks.forEach((message) => {
      addAlert(message).catch(() => {});
    });
  }, [addAlert, deviceStatus.online, deviceStatus.wifiConnected, sensorData, settings]);

  const setRelayState = useCallback(
    (relayState) => update(ref(database, paths.deviceControl), { relayState }),
    [],
  );

  const setTimer = useCallback(
    (timer) => update(ref(database, paths.deviceControl), { timer: Math.max(0, toNumber(timer)) }),
    [],
  );

  const saveSchedule = useCallback(
    (schedule) =>
      update(ref(database, `${paths.deviceControl}/schedule`), {
        enabled: Boolean(schedule.enabled),
        onTime: schedule.onTime || '',
        offTime: schedule.offTime || '',
      }),
    [],
  );

  const saveSettings = useCallback((payload) => update(ref(database, paths.settings), payload), []);

  const acknowledgeAlert = useCallback(
    (id) => update(ref(database, `${paths.alerts}/${id}`), { acknowledged: true }),
    [],
  );

  const seedDemoHistoryPoint = useCallback((payload) => push(ref(database, paths.history), payload), []);

  const replaceControl = useCallback((payload) => set(ref(database, paths.deviceControl), payload), []);

  const costs = useMemo(() => {
    const costPerKWh = toNumber(settings.costPerKWh, 75);
    const currentCost = sensorData.energy * costPerKWh;
    const activeHistory = persistedHistory.length ? persistedHistory : liveHistory;
    const dailyEnergy = activeHistory.reduce((sum, point) => sum + toNumber(point.energy), 0);

    return {
      currentCost,
      dailyCost: dailyEnergy * costPerKWh,
      monthlyCost: dailyEnergy * costPerKWh * 30,
    };
  }, [liveHistory, persistedHistory, sensorData.energy, settings.costPerKWh]);

  return {
    sensorData,
    deviceControl,
    deviceStatus,
    settings,
    alerts,
    history: persistedHistory.length ? persistedHistory : liveHistory,
    liveHistory,
    persistedHistory,
    loading,
    error,
    costs,
    setRelayState,
    setTimer,
    saveSchedule,
    saveSettings,
    acknowledgeAlert,
    seedDemoHistoryPoint,
    replaceControl,
  };
}
