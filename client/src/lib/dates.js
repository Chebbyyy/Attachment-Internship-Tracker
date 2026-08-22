export function todayISO() {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Africa/Nairobi' });
}

export function formatLong(dateStr) {
  return new Date(`${dateStr}T12:00:00+03:00`).toLocaleDateString('en-KE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Africa/Nairobi',
  });
}

export function formatShort(dateStr) {
  return new Date(`${dateStr}T12:00:00+03:00`).toLocaleDateString('en-KE', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'Africa/Nairobi',
  });
}

export function weekdayName(dateStr) {
  return new Date(`${dateStr}T12:00:00+03:00`).toLocaleDateString('en-KE', {
    weekday: 'long',
    timeZone: 'Africa/Nairobi',
  });
}
