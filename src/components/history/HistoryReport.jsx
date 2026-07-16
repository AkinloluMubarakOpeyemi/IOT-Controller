import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { formatCurrency, formatNumber } from '../../utils/formatters';

function HistoryReport({ title, data }) {
  return (
    <div className="panel p-5">
      <h2 className="text-lg font-bold text-slate-950 dark:text-white">{title}</h2>
      <div className="mt-4 h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.25)" />
            <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="#94a3b8" />
            <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
            <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #cbd5e1' }} />
            <Bar dataKey="energy" fill="#06b6d4" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-5 overflow-auto">
        <table className="w-full min-w-[520px] text-left text-sm">
          <thead className="text-xs uppercase text-slate-500">
            <tr>
              <th className="py-2">Period</th>
              <th className="py-2">Energy</th>
              <th className="py-2">Avg Power</th>
              <th className="py-2">Cost</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {data.map((row) => (
              <tr key={row.label}>
                <td className="py-3 font-semibold text-slate-900 dark:text-white">{row.label}</td>
                <td className="py-3">{formatNumber(row.energy, 2)} kWh</td>
                <td className="py-3">{formatNumber(row.power, 0)} W</td>
                <td className="py-3">{formatCurrency(row.cost)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default HistoryReport;
