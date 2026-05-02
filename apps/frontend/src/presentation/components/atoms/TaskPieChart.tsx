interface TaskPieChartProps {
  completed: number;
  pending: number;
}

export function TaskPieChart({ completed, pending }: TaskPieChartProps) {
  const total = completed + pending;
  if (total === 0) {
    return (
      <div className="flex items-center justify-center py-6 text-xs text-gray-400">
        Sin tareas
      </div>
    );
  }

  const pct = (completed / total) * 100;
  const r = 36;
  const circ = 2 * Math.PI * r;
  const fillPct = Math.min(pct, 100);
  const dashOffset = circ - (fillPct / 100) * circ;

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width="90" height="90" viewBox="0 0 90 90" className="-rotate-90">
        <circle cx="45" cy="45" r={r} fill="none" stroke="#e5e7eb" strokeWidth="8" className="dark:stroke-gray-700" />
        <circle
          cx="45"
          cy="45"
          r={r}
          fill="none"
          stroke="#22c55e"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={dashOffset}
          className="transition-all duration-500"
        />
      </svg>
      <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
        {Math.round(pct)}% completa
      </span>
      <span className="text-[11px] text-gray-400 dark:text-gray-500">
        {completed} de {total} tareas
      </span>
    </div>
  );
}
