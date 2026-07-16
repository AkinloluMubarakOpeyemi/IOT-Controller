import { useMemo, useState } from 'react';
import PageHeader from '../components/common/PageHeader';
import HistoryReport from '../components/history/HistoryReport';
import { useFirebaseData } from '../hooks/useFirebaseData';

function buildReport(history, costPerKWh, mode) {
  const fallback = Array.from({ length: mode === 'monthly' ? 6 : mode === 'weekly' ? 7 : 12 }, (_, index) => ({
    label: mode === 'monthly' ? `Month ${index + 1}` : mode === 'weekly' ? `Day ${index + 1}` : `${index * 2}:00`,
    energy: 0,
    power: 0,
    cost: 0,
  }));

  const source = history.length ? history : fallback;
  return source.slice(-(mode === 'daily' ? 12 : mode === 'weekly' ? 7 : 6)).map((point, index) => ({
    label: point.time || point.label || `Row ${index + 1}`,
    energy: Number(point.energy) || 0,
    power: Number(point.power) || 0,
    cost: (Number(point.energy) || 0) * costPerKWh,
  }));
}

function HistoryPage() {
  const { history, settings } = useFirebaseData();
  const [mode, setMode] = useState('daily');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  const report = useMemo(
    () => buildReport(history, Number(settings.costPerKWh) || 75, mode),
    [history, mode, settings.costPerKWh],
  );

  return (
    <>
      <PageHeader
        eyebrow="Consumption Records"
        title="Historical Energy Data"
        description="Daily, weekly, and monthly energy reports are calculated from the live readings captured during the session."
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
