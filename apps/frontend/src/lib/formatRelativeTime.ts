const MINUTE = 60_000;
const HOUR = 3_600_000;
const THREE_HOURS = 10_800_000;

export function formatRelativeTime(isoString: string): string {
  const now = Date.now();
  const date = new Date(isoString).getTime();
  const diff = now - date;

  if (diff < MINUTE) {
    return 'Ahora mismo';
  }

  if (diff < HOUR) {
    const mins = Math.floor(diff / MINUTE);
    return mins === 1 ? 'Hace 1 minuto' : `Hace ${mins} minutos`;
  }

  if (diff < THREE_HOURS) {
    const hours = Math.floor(diff / HOUR);
    return hours === 1 ? 'Hace 1 hora' : `Hace ${hours} horas`;
  }

  // More than 3 hours: show date with time
  const d = new Date(isoString);
  const today = new Date();
  const isToday =
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear();

  const timeStr = d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

  if (isToday) {
    return `Hoy ${timeStr}`;
  }

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday =
    d.getDate() === yesterday.getDate() &&
    d.getMonth() === yesterday.getMonth() &&
    d.getFullYear() === yesterday.getFullYear();

  if (isYesterday) {
    return `Ayer ${timeStr}`;
  }

  return `${d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })} ${timeStr}`;
}

export function formatRelativeTimeShort(isoString: string): string {
  const now = Date.now();
  const date = new Date(isoString).getTime();
  const diff = now - date;

  if (diff < MINUTE) return 'Ahora';
  if (diff < HOUR) return `${Math.floor(diff / MINUTE)}m`;
  if (diff < THREE_HOURS) return `${Math.floor(diff / HOUR)}h`;
  return new Date(isoString).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
}
