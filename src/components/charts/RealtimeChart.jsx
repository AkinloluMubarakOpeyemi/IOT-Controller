import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

function RealtimeChart({ data, dataKey, color, label, unit }) {
  const chartData = data.slice(-30);

  return (
    <div className="panel p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">{label}</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Live Firebase stream</p>
        </div>
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
          {unit}
        </span>
      </div>
      <div className="h-64">
        {chartData.length ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id={`fill-${dataKey}`} x1="0" x2="0" y1="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.35} />
                  <stop offset="95%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.25)" />
              <XAxis dataKey="time" tick={{ fontSize: 11 }} minTickGap={28} stroke="#94a3b8" />
              <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" width={44} />
              <Tooltip
                formatter={(value) => [`${Number(value).toFixed(2)} ${unit}`, label]}
                labelFormatter={(value) => `Time: ${value}`}
                contentStyle={{ borderRadius: 8, border: '1px solid #cbd5e1' }}
              />
              <Area
                type="monotone"
                dataKey={dataKey}
                stroke={color}
                strokeWidth={2.5}
                fill={`url(#fill-${dataKey})`}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="grid h-full place-items-center rounded-lg border border-dashed border-slate-300 text-sm text-slate-500 dark:border-slate-700">
            Waiting for Firebase readings
          </div>
        )}
      </div>
    </div>
  );
}

export default RealtimeChart;
