const TZ_OFFSET = '+03:00'; // Africa/Nairobi (EAT, no DST)

function todayISO() {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Africa/Nairobi' });
}

function addDays(dateStr, n) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d + n));
  return date.toISOString().slice(0, 10);
}

function weekday(dateStr) {
  const date = new Date(`${dateStr}T12:00:00${TZ_OFFSET}`);
  return date.getUTCDay();
}

function isWorkday(dateStr) {
  const day = weekday(dateStr);
  return day !== 0 && day !== 6;
}

function previousWorkday(dateStr) {
  let cursor = addDays(dateStr, -1);
  while (!isWorkday(cursor)) cursor = addDays(cursor, -1);
  return cursor;
}

function nextWorkday(dateStr) {
  let cursor = addDays(dateStr, 1);
  while (!isWorkday(cursor)) cursor = addDays(cursor, 1);
  return cursor;
}

function mondayOf(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  const wd = date.getUTCDay();
  const diff = wd === 0 ? -6 : 1 - wd;
  date.setUTCDate(date.getUTCDate() + diff);
  return date.toISOString().slice(0, 10);
}

function sundayOf(dateStr) {
  return addDays(mondayOf(dateStr), 6);
}

function countWorkdays(from, to) {
  if (!from || !to || from > to) return 0;
  let count = 0;
  for (let cursor = from; cursor <= to; cursor = addDays(cursor, 1)) {
    if (isWorkday(cursor)) count += 1;
  }
  return count;
}

function daysBetween(from, to) {
  const a = new Date(`${from}T12:00:00${TZ_OFFSET}`);
  const b = new Date(`${to}T12:00:00${TZ_OFFSET}`);
  return Math.round((b - a) / 86400000);
}

function formatLong(dateStr) {
  const date = new Date(`${dateStr}T12:00:00${TZ_OFFSET}`);
  return date.toLocaleDateString('en-KE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Africa/Nairobi',
  });
}

module.exports = {
  todayISO,
  addDays,
  weekday,
  isWorkday,
  previousWorkday,
  nextWorkday,
  mondayOf,
  sundayOf,
  countWorkdays,
  daysBetween,
  formatLong,
};
