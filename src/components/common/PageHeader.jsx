import { motion } from 'framer-motion';

function PageHeader({ eyebrow, title, description, actions }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"
    >
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-600 dark:text-cyan-400">
          {eyebrow}
        </p>
        <h1 className="mt-2 text-2xl font-bold text-slate-950 dark:text-white md:text-3xl">{title}</h1>
        {description ? (
          <p className="mt-2 max-w-3xl text-sm text-slate-600 dark:text-slate-400">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </motion.div>
  );
}

export default PageHeader;
