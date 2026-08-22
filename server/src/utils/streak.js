const { isWorkday, previousWorkday, nextWorkday, todayISO } = require('./dates');

function uniqueSorted(dates) {
  return [...new Set(dates)].filter(isWorkday).sort();
}

function currentStreak(logDates, today = todayISO()) {
  const set = new Set(uniqueSorted(logDates));
  let cursor = today;

  if (!isWorkday(today) || !set.has(today)) {
    cursor = previousWorkday(today);
  }

  let streak = 0;
  while (set.has(cursor)) {
    streak += 1;
    cursor = previousWorkday(cursor);
  }
  return streak;
}

function longestStreak(logDates) {
  const days = uniqueSorted(logDates);
  if (days.length === 0) return 0;

  let longest = 1;
  let run = 1;
  for (let i = 1; i < days.length; i += 1) {
    if (days[i] === nextWorkday(days[i - 1])) {
      run += 1;
      if (run > longest) longest = run;
    } else {
      run = 1;
    }
  }
  return longest;
}

module.exports = { currentStreak, longestStreak };
