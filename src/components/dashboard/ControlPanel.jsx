import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { FaClock, FaPowerOff, FaStopwatch, FaToggleOff, FaToggleOn } from 'react-icons/fa';
import { secondsToClock } from '../../utils/formatters';

function ControlPanel({ relayState, timer, schedule, onRelayChange, onTimerChange, onScheduleSave }) {
  const [timerInput, setTimerInput] = useState(() => Number(timer) || 300);
  const [scheduleForm, setScheduleForm] = useState(() => ({
    enabled: Boolean(schedule?.enabled),
    onTime: schedule?.onTime || '',
    offTime: schedule?.offTime || '',
  }));
  const [running, setRunning] = useState(false);
  const [message, setMessage] = useState('');
  const completionHandledRef = useRef(false);
  const lastPersistedTimerRef = useRef(Number(timer) || 0);

  useEffect(() => {
    if (!running) {
      setTimerInput(Number(timer) || 0);
      lastPersistedTimerRef.current = Number(timer) || 0;
    }
  }, [running, timer]);

  useEffect(() => {
    setScheduleForm({
      enabled: Boolean(schedule?.enabled),
      onTime: schedule?.onTime || '',
      offTime: schedule?.offTime || '',
    });
  }, [schedule?.enabled, schedule?.offTime, schedule?.onTime]);

  useEffect(() => {
    if (!running) {
      return undefined;
    }

    completionHandledRef.current = false;
    const intervalId = window.setInterval(() => {
      setTimerInput((current) => Math.max(0, Number(current) - 1));
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [running]);

  useEffect(() => {
    if (!running) return undefined;

    const nextTimer = Math.max(0, Number(timerInput) || 0);

    if (lastPersistedTimerRef.current !== nextTimer) {
      lastPersistedTimerRef.current = nextTimer;
      onTimerChange(nextTimer).catch(() => {
        setMessage('Unable to sync timer with Firebase.');
      });
    }

    if (nextTimer === 0 && !completionHandledRef.current) {
      completionHandledRef.current = true;
      setRunning(false);
      onRelayChange(false)
        .then(() => {
          setMessage('Timer completed. Appliance turned OFF.');
        })
        .catch(() => {
          setMessage('Timer completed, but relay update failed.');
        });
    }

    return undefined;
  }, [onRelayChange, onTimerChange, running, timerInput]);

  const updateRelay = useCallback(
    async (state) => {
      try {
        await onRelayChange(state);
        setMessage(`Appliance turned ${state ? 'ON' : 'OFF'} successfully.`);
      } catch {
        setMessage('Unable to update relay state.');
      }
    },
    [onRelayChange],
  );

  const startTimer = useCallback(async () => {
    const nextTimer = Math.max(0, Number(timerInput) || 0);

    try {
      await onTimerChange(nextTimer);
      await onRelayChange(true);
      lastPersistedTimerRef.current = nextTimer;
      setRunning(nextTimer > 0);
      setMessage(nextTimer > 0 ? 'Countdown timer started.' : 'Enter a timer value greater than zero.');
    } catch {
      setMessage('Unable to start countdown timer.');
    }
  }, [onRelayChange, onTimerChange, timerInput]);

  const stopTimer = useCallback(async () => {
    setRunning(false);

    try {
      await onTimerChange(Math.max(0, Number(timerInput) || 0));
      setMessage('Countdown timer stopped.');
    } catch {
      setMessage('Timer stopped locally, but Firebase sync failed.');
    }
  }, [onTimerChange, timerInput]);

  const resetTimer = useCallback(async () => {
    setRunning(false);
    setTimerInput(0);
    lastPersistedTimerRef.current = 0;

    try {
      await onTimerChange(0);
      setMessage('Timer reset.');
    } catch {
      setMessage('Unable to reset timer in Firebase.');
    }
  }, [onTimerChange]);

  const handleTimerInputChange = useCallback((event) => {
    setTimerInput(Math.max(0, Number(event.target.value) || 0));
  }, []);

  const handleToggleRelay = useCallback(() => {
    updateRelay(!relayState);
  }, [relayState, updateRelay]);

  const handleRelayOn = useCallback(() => {
    updateRelay(true);
  }, [updateRelay]);

  const handleRelayOff = useCallback(() => {
    updateRelay(false);
  }, [updateRelay]);

  const handleScheduleFieldChange = useCallback((field) => {
    return (event) => {
      const value = field === 'enabled' ? event.target.checked : event.target.value;
      setScheduleForm((current) => ({ ...current, [field]: value }));
    };
  }, []);

  const saveSchedule = useCallback(async () => {
    try {
      await onScheduleSave(scheduleForm);
      setMessage('ON/OFF schedule saved to Firebase.');
    } catch {
      setMessage('Unable to save ON/OFF schedule.');
    }
  }, [onScheduleSave, scheduleForm]);

  const clearSchedule = useCallback(async () => {
    const emptySchedule = { enabled: false, onTime: '', offTime: '' };
    setScheduleForm(emptySchedule);

    try {
      await onScheduleSave(emptySchedule);
      setMessage('ON/OFF schedule cleared.');
    } catch {
      setMessage('Unable to clear ON/OFF schedule.');
    }
  }, [onScheduleSave]);

  return (
    <div className="panel p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-950 dark:text-white">Device Control</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Relay command writes to Firebase.</p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-bold ${
            relayState
              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300'
              : 'bg-slate-500/10 text-slate-600 dark:text-slate-300'
          }`}
        >
          Relay {relayState ? 'ON' : 'OFF'}
        </span>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <button className="btn-primary bg-emerald-600 hover:bg-emerald-500" onClick={handleRelayOn}>
          <FaPowerOff /> ON
        </button>
        <button className="btn-primary bg-rose-600 hover:bg-rose-500" onClick={handleRelayOff}>
          <FaPowerOff /> OFF
        </button>
        <button className="btn-secondary" onClick={handleToggleRelay}>
          {relayState ? <FaToggleOn /> : <FaToggleOff />} Toggle
        </button>
      </div>

      {message ? (
        <p className="mt-4 rounded-lg bg-cyan-500/10 p-3 text-sm font-medium text-cyan-700 dark:text-cyan-300">
          {message}
        </p>
      ) : null}

      <div className="mt-6 border-t border-slate-200 pt-5 dark:border-slate-800">
        <div className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
          <FaStopwatch /> Timer Control
        </div>
        <div className="grid gap-3 md:grid-cols-[1fr_auto]">
          <label>
            <span className="mb-1.5 block text-xs font-semibold text-slate-500">Countdown seconds</span>
            <input
              className="input"
              type="number"
              min="0"
              value={timerInput}
              onChange={handleTimerInputChange}
            />
          </label>
          <div className="flex items-end">
            <div className="grid h-10 min-w-24 place-items-center rounded-lg bg-slate-100 px-4 text-sm font-bold dark:bg-slate-800">
              {secondsToClock(timerInput)}
            </div>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <button className="btn-primary" onClick={startTimer}>
            Start
          </button>
          <button className="btn-secondary" onClick={stopTimer}>
            Stop
          </button>
          <button className="btn-secondary" onClick={resetTimer}>
            Reset
          </button>
        </div>
      </div>

      <div className="mt-6 border-t border-slate-200 pt-5 dark:border-slate-800">
        <div className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
          <FaClock /> Scheduled ON/OFF
        </div>
        <div className="mb-4 rounded-lg bg-slate-100 p-3 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">
          {scheduleForm.enabled ? (
            <span>
              Firebase schedule active: ON {scheduleForm.onTime || '--:--'} / OFF {scheduleForm.offTime || '--:--'}
            </span>
          ) : (
            <span>Schedule is disabled in Firebase.</span>
          )}
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <label>
            <span className="mb-1.5 block text-xs font-semibold text-slate-500">ON time</span>
            <input
              className="input"
              type="time"
              value={scheduleForm.onTime}
              onChange={handleScheduleFieldChange('onTime')}
            />
          </label>
          <label>
            <span className="mb-1.5 block text-xs font-semibold text-slate-500">OFF time</span>
            <input
              className="input"
              type="time"
              value={scheduleForm.offTime}
              onChange={handleScheduleFieldChange('offTime')}
            />
          </label>
        </div>
        <label className="mt-4 flex items-center gap-3 text-sm font-semibold text-slate-700 dark:text-slate-200">
          <input
            className="h-4 w-4 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
            type="checkbox"
            checked={scheduleForm.enabled}
            onChange={handleScheduleFieldChange('enabled')}
          />
          Enable daily schedule
        </label>
        <div className="mt-3 flex flex-wrap gap-2">
          <button className="btn-primary" onClick={saveSchedule}>
            Save schedule
          </button>
          <button className="btn-secondary" onClick={clearSchedule}>
            Clear
          </button>
        </div>
        <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
          Saved to Firebase at <code>control.schedule</code> for the ESP32 firmware and dashboard to read.
        </p>
      </div>
    </div>
  );
}

export default memo(ControlPanel);
