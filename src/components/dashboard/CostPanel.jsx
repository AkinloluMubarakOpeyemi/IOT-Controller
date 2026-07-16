import { FaCoins } from 'react-icons/fa';
import { formatCurrency } from '../../utils/formatters';

function CostPanel({ costs, costPerKWh }) {
  const rows = [
    ['Current cost', costs.currentCost],
    ['Daily cost', costs.dailyCost],
    ['Monthly cost', costs.monthlyCost],
  ];

  return (
    <div className="panel p-5">
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-lg bg-emerald-500/10 text-emerald-600">
          <FaCoins />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-950 dark:text-white">Energy Cost Analysis</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">{formatCurrency(costPerKWh)} per kWh</p>
        </div>
      </div>
      <div className="mt-5 space-y-3">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-center justify-between rounded-lg bg-slate-100 p-3 dark:bg-slate-800">
            <span className="text-sm text-slate-600 dark:text-slate-300">{label}</span>
            <span className="text-sm font-bold text-slate-950 dark:text-white">{formatCurrency(value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CostPanel;
