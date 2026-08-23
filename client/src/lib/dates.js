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

export function addDays(dateStr, n) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d + n));
  return date.toISOString().slice(0, 10);
}

export function clampDate(dateStr, min, max) {
  if (min && dateStr < min) return min;
  if (max && dateStr > max) return max;
  return dateStr;
}
