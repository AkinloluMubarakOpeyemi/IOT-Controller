import { useMemo, useState } from 'react';
import PageHeader from '../components/common/PageHeader';
import HistoryReport from '../components/history/HistoryReport';
import { useFirebaseData } from '../hooks/useFirebaseData';

function formatBucketLabel(date, mode) {
  if (mode === 'daily') {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  if (mode === 'weekly') {
    return date.toLocaleDateString('en-NG', { weekday: 'short', day: 'numeric' });
  }

  return date.toLocaleDateString('en-NG', { month: 'short', day: 'numeric' });
}

function bucketKey(date, mode) {
  if (mode === 'daily') {
    return `${date.toLocaleDateString('en-CA')} ${String(date.getHours()).padStart(2, '0')}:00`;
  }

  if (mode === 'weekly') {
    return date.toLocaleDateString('en-CA');
  }

  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function buildReport(history, costPerKWh, mode, selectedDate) {
  const selected = new Date(`${selectedDate}T00:00:00`);
  const rows = history
    .map((point) => ({ ...point, date: new Date(point.timestamp) }))
    .filter((point) => Number.isFinite(point.date.getTime()));

  const filteredRows = rows.filter((point) => {
    if (mode === 'daily') {
      return point.date.toLocaleDateString('en-CA') === selectedDate;
    }

    if (mode === 'weekly') {
      const start = new Date(selected);
      start.setDate(selected.getDate() - selected.getDay());
      const end = new Date(start);
      end.setDate(start.getDate() + 7);
      return point.date >= start && point.date < end;
    }

    return point.date.getFullYear() === selected.getFullYear() && point.date.getMonth() === selected.getMonth();
  });

  const buckets = new Map();

  filteredRows.forEach((point) => {
    const key = bucketKey(point.date, mode);
    const current = buckets.get(key) || {
      label: formatBucketLabel(point.date, mode),
      energy: 0,
      power: 0,
      cost: 0,
      count: 0,
    };

    current.energy += Number(point.energy) || 0;
    current.power += Number(point.power) || 0;
    current.cost += (Number(point.energy) || 0) * costPerKWh;
    current.count += 1;
    buckets.set(key, current);
  });

  return Array.from(buckets.values()).map((row) => ({
    ...row,
    power: row.count ? row.power / row.count : 0,
  }));
}

function HistoryPage() {
  const { history, settings } = useFirebaseData();
  const [mode, setMode] = useState('daily');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  const report = useMemo(
    () => buildReport(history, Number(settings.costPerKWh) || 75, mode, date),
    [date, history, mode, settings.costPerKWh],
  );

  return (
    <>
      <PageHeader
        eyebrow="Consumption Records"
        title="Historical Energy Data"
        description="Daily, weekly, and monthly reports are calculated from Firebase logs for the selected date."
        actions={
          <>
            <input className="input w-auto" type="date" value={date} onChange={(event) => setDate(event.target.value)} />
            <select className="input w-auto" value={mode} onChange={(event) => setMode(event.target.value)}>
              <option value="daily">Daily Report</option>
              <option value="weekly">Weekly Report</option>
              <option value="monthly">Monthly Report</option>
            </select>
          </>
        }
      />
      <HistoryReport title={`${mode[0].toUpperCase()}${mode.slice(1)} Report for ${date}`} data={report} />
    </>
  );
}

export default HistoryPage;
