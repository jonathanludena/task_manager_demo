import { useEffect, useState } from 'react';

const WORK_START = 9; // 9 AM
const WORK_END = 17; // 5 PM
const TOTAL_HOURS = WORK_END - WORK_START;

export function WorkHoursClock() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  const hour = now.getHours() + now.getMinutes() / 60;
  const isWorkHours = hour >= WORK_START && hour < WORK_END;

  const elapsed = isWorkHours ? hour - WORK_START : 0;
  const pct = Math.min((elapsed / TOTAL_HOURS) * 100, 100);

  const statusLabel = isWorkHours
    ? `${Math.round(elapsed)}h de ${TOTAL_HOURS}h`
    : hour < WORK_START
      ? 'Fuera del horario laboral'
      : 'Jornada finalizada';

  const barColor = isWorkHours
    ? pct < 50
      ? 'bg-blue-500'
      : pct < 80
        ? 'bg-yellow-500'
        : 'bg-green-500'
    : 'bg-gray-300 dark:bg-gray-600';

  return (
    <div className="flex flex-col gap-2">
      {/* Barra de progreso */}
      <div className="relative h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
        <div
          className={`h-full rounded-full transition-all duration-1000 ${barColor}`}
          style={{ width: `${isWorkHours ? pct : 0}%` }}
        />
      </div>

      {/* Hora inicio | estado centrado | hora fin */}
      <div className="grid grid-cols-3 items-center text-xs text-gray-500 dark:text-gray-400">
        <span className="text-left">{WORK_START}:00</span>
        <span className="text-center font-medium text-gray-700 dark:text-gray-200">
          {statusLabel}
        </span>
        <span className="text-right">{WORK_END}:00</span>
      </div>

      {/* Hora actual */}
      <div className="text-center text-xs text-gray-400 dark:text-gray-500">
        {now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
      </div>
    </div>
  );
}
