import { motion } from 'framer-motion';

function MetricCard({ title, value, unit, icon: Icon, tone = 'cyan', detail }) {
  const tones = {
    cyan: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-300',
    emerald: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300',
    amber: 'bg-amber-500/10 text-amber-600 dark:text-amber-300',
    rose: 'bg-rose-500/10 text-rose-600 dark:text-rose-300',
    violet: 'bg-violet-500/10 text-violet-600 dark:text-violet-300',
    slate: 'bg-slate-500/10 text-slate-600 dark:text-slate-300',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3 }}
      className="panel p-5"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
          <div className="mt-3 flex items-end gap-2">
            <span className="text-2xl font-bold text-slate-950 dark:text-white">{value}</span>
            {unit ? <span className="pb-1 text-sm font-semibold text-slate-500">{unit}</span> : null}
          </div>
        </div>
        <div className={`grid h-11 w-11 place-items-center rounded-lg ${tones[tone] || tones.cyan}`}>
          <Icon className="text-xl" />
        </div>
      </div>
      {detail ? <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">{detail}</p> : null}
    </motion.div>
  );
}

export default MetricCard;
