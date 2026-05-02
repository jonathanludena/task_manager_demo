import { useEffect, useState, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { TaskPieChart } from './TaskPieChart';
import { WorkHoursClock } from './WorkHoursClock';
import { taskApi } from '@/core/api/taskApi';
import { onTasksUpdated } from '@/lib/taskEvents';

export function Sidebar() {
  const location = useLocation();
  const [stats, setStats] = useState({ completed: 0, pending: 0 });

  const fetchStats = useCallback(async () => {
    try {
      const tasks = await taskApi.fetchTasks();
      const completed = tasks.filter((t) => t.completed).length;
      const pending = tasks.length - completed;
      setStats({ completed, pending });
    } catch {
      // Silently ignore sidebar fetch errors
    }
  }, []);

  /* eslint-disable react-hooks/set-state-in-effect --
   * Carga inicial de estadísticas y reactividad al cambiar de ruta.
   * El async handler es llamado desde useEffect, pero no causa cascada
   * porque los updates son controlados por dependencias explícitas. */
  useEffect(() => {
    fetchStats();
  }, [fetchStats, location.pathname]);

  // Reactivo: escucha cambios en las tareas (creación, toggle)
  useEffect(() => {
    return onTasksUpdated(fetchStats);
  }, [fetchStats]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const navItems = [
    { to: '/', label: 'Tareas', icon: '📋' },
    { to: '/create', label: 'Nueva Tarea', icon: '➕' },
  ];

  return (
    <aside className="sticky top-0 hidden h-screen w-64 flex-shrink-0 border-r border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900 sm:flex sm:flex-col">
      <div className="mb-6">
        <Link to="/" className="text-base font-bold text-gray-900 dark:text-white">
          Task Manager
        </Link>
      </div>

      {/* Navigation */}
      <nav className="mb-8 flex flex-col gap-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`cursor-pointer rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white'
                  : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800'
              }`}
            >
              <span className="mr-2">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Pie chart */}
      <div className="mb-6 rounded-lg border border-gray-100 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
        <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
          Progreso
        </h4>
        <TaskPieChart completed={stats.completed} pending={stats.pending} />
      </div>

      {/* Work hours */}
      <div className="rounded-lg border border-gray-100 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
        <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
          Jornada Laboral
        </h4>
        <WorkHoursClock />
      </div>
    </aside>
  );
}
