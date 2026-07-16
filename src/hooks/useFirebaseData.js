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

const defaultFirebaseControl = {
  relay: false,
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

const numericSettingKeys = ['voltageLimit', 'currentLimit', 'powerLimit', 'costPerKWh'];

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
    relayState: Boolean(value.relayState ?? value.relay),
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
    timestamp: value.timestamp || value.time || new Date().toISOString(),
  };
}

function timestampFromLogItem(item = {}) {
  if (item.timestamp) {
    return item.timestamp;
  }

  if (item.isoTime) {
    return item.isoTime;
  }

  if (typeof item.id === 'string' && item.id.includes('T')) {
    const repaired = item.id.replace(/-(\d{3})Z$/, '.$1Z');
    if (Number.isFinite(new Date(repaired).getTime())) {
      return repaired;
    }
  }

  const numericId = toNumber(item.id, NaN);
  if (Number.isFinite(numericId)) {
    return new Date(numericId < 10000000000 ? numericId * 1000 : numericId).toISOString();
  }

  return new Date().toISOString();
}

function normalizeSettings(value = {}) {
  return {
    voltageLimit: toNumber(value.voltageLimit, defaultSettings.voltageLimit),
    currentLimit: toNumber(value.currentLimit, defaultSettings.currentLimit),
    powerLimit: toNumber(value.powerLimit, defaultSettings.powerLimit),
    costPerKWh: toNumber(value.costPerKWh, defaultSettings.costPerKWh),
  };
}

function normalizeWifiConfig(value = {}) {
  return {
    wifiSsid: value.wifiSsid ?? value.wifi_ssid ?? '',
    wifiPassword: value.wifiPassword ?? value.wifi_password ?? '',
  };
}

function normalizeObjectList(value = {}) {
  return Object.entries(value || {})
    .map(([id, item]) => ({ id, ...item }))
    .sort((a, b) => {
      const left = Date.parse(a.time || a.timestamp);
      const right = Date.parse(b.time || b.timestamp);

      if (Number.isFinite(left) && Number.isFinite(right)) {
        return right - left;
      }

      return toNumber(b.id) - toNumber(a.id);
    });
}

function historyKeyFromSensor(sensorData) {
  const timestamp = sensorData.timestamp || new Date().toISOString();
  return timestamp.replace(/[.#$\/[\]]/g, '-');
}

function pointFromSensor(sensorData) {
  const timestamp = sensorData.timestamp || new Date().toISOString();
  const date = new Date(timestamp);
  const hasValidDate = Number.isFinite(date.getTime());

  return {
    timestamp,
    time: hasValidDate
      ? date.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      : String(timestamp),
    voltage: sensorData.voltage,
    current: sensorData.current,
    power: sensorData.power,
    energy: sensorData.energy,
    cost: sensorData.cost,
    dateKey: hasValidDate ? date.toLocaleDateString('en-CA') : '',
  };
}

function normalizeDeviceStatus(value = {}) {
  const lastSeen = value.lastSeen || value.last_updated || null;
  const statusOnline = value.online ?? (value.status ? value.status === 'NORMAL' : true);
  const wifiOnline = value.wifiConnected ?? (value.wifi_rssi !== undefined ? toNumber(value.wifi_rssi, -100) > -90 : statusOnline);

  return {
    online: statusOnline,
    wifiConnected: wifiOnline,
    lastSeen,
    status: value.status || '',
    wifiRssi: value.wifi_rssi ?? value.wifiRssi ?? null,
  };
}

export function useFirebaseData() {
  const [sensorData, setSensorData] = useState(defaultSensorData);
  const [deviceControl, setDeviceControl] = useState(defaultDeviceControl);
  const [deviceStatus, setDeviceStatus] = useState(defaultDeviceStatus);
  const [settings, setSettings] = useState(defaultSettings);
  const [liveHistory, setLiveHistory] = useState([]);
  const [persistedHistory, setPersistedHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const lastHistoryKeyRef = useRef('');

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
            setLoading(false);
            return;
          }

          const nextSensorData = normalizeSensorData(snapshot.val() || {});
          const historyKey = historyKeyFromSensor(nextSensorData);

          setSensorData((current) => (shallowEqual(current, nextSensorData) ? current : nextSensorData));
          setLiveHistory((current) => {
            if (current[current.length - 1]?.timestamp === nextSensorData.timestamp) {
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
            set(ref(database, paths.deviceControl), defaultFirebaseControl).catch((writeError) => {
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
          const nextDeviceStatus = { ...defaultDeviceStatus, ...normalizeDeviceStatus(snapshot.val() || {}) };
          setDeviceStatus((current) => (shallowEqual(current, nextDeviceStatus) ? current : nextDeviceStatus));
        },
        (listenerError) => setError(reportMessage(listenerError, 'Unable to read device status data.')),
      ),
      onValue(
        ref(database, paths.settings),
        (snapshot) => {
          if (!snapshot.exists()) {
            set(ref(database, paths.settings), normalizeSettings(defaultSettings)).catch((writeError) => {
              setError(reportMessage(writeError, 'Unable to create default settings.'));
            });
          }

          const nextSettings = normalizeSettings(snapshot.val() || defaultSettings);
          setSettings((current) => {
            const merged = { ...current, ...nextSettings };
            return shallowEqual(current, merged) ? current : merged;
          });
        },
        (listenerError) => setError(reportMessage(listenerError, 'Unable to read settings data.')),
      ),
      onValue(
        ref(database, paths.wifiConfig),
        (snapshot) => {
          const nextWifiConfig = normalizeWifiConfig(snapshot.val() || {});
          setSettings((current) => {
            const merged = { ...current, ...nextWifiConfig };
            return shallowEqual(current, merged) ? current : merged;
          });
        },
        (listenerError) => setError(reportMessage(listenerError, 'Unable to read Wi-Fi config.')),
      ),
      onValue(
        ref(database, paths.history),
        (snapshot) => {
          const rows = normalizeObjectList(snapshot.val())
            .map((item) => pointFromSensor(normalizeSensorData({ ...item, timestamp: timestampFromLogItem(item) })))
            .reverse();
          setPersistedHistory(rows.slice(-500));
        },
        (listenerError) => setError(reportMessage(listenerError, 'Unable to read history.')),
      ),
    ];

    return () => unsubscribers.forEach((unsubscribe) => unsubscribe());
  }, []);

  const setRelayState = useCallback(
    (relayState) => update(ref(database, paths.deviceControl), { relay: relayState }),
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
        updatedAt: new Date().toISOString(),
      }),
    [],
  );

  const saveSettings = useCallback((payload) => {
    const thresholdPayload = numericSettingKeys.reduce((result, key) => {
      result[key] = toNumber(payload[key], defaultSettings[key]);
      return result;
    }, {});

    return Promise.all([
      update(ref(database, paths.settings), thresholdPayload),
      update(ref(database, paths.wifiConfig), {
        wifi_ssid: payload.wifiSsid || '',
        wifi_password: payload.wifiPassword || '',
      }),
    ]);
  }, []);

  const seedDemoHistoryPoint = useCallback((payload) => push(ref(database, paths.history), payload), []);

  const replaceControl = useCallback(
    (payload) =>
      set(ref(database, paths.deviceControl), {
        ...payload,
        relay: payload.relay ?? payload.relayState ?? false,
      }),
    [],
  );

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
    seedDemoHistoryPoint,
    replaceControl,
  };
}
