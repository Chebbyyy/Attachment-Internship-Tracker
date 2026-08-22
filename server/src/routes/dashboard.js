const express = require('express');
const DailyLog = require('../models/DailyLog');
const WeeklyGoal = require('../models/WeeklyGoal');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const { todayISO, countWorkdays, daysBetween, mondayOf, sundayOf, isWorkday, addDays } = require('../utils/dates');
const { currentStreak, longestStreak } = require('../utils/streak');

const router = express.Router();

router.use(auth);

router.get('/', async (req, res) => {
  const user = await User.findById(req.userId);
  if (!user) return res.status(404).json({ message: 'Account not found.' });

  const today = todayISO();
  const start = user.attachmentStartDate;
  const end = user.attachmentEndDate;
  const elapsedEnd = today < start ? start : today > end ? end : today;

  const [logs, currentWeek] = await Promise.all([
    DailyLog.find({ userId: req.userId }).select('date followedUpOnTasks winsLog').lean(),
    WeeklyGoal.findOne({ userId: req.userId, weekStartDate: mondayOf(today) }),
  ]);

  const dates = logs.map((log) => log.date);
  const loggedSet = new Set(dates);
  const workdaysElapsed = today < start ? 0 : countWorkdays(start, elapsedEnd);
  const workdaysLogged = dates.filter((date) => date >= start && date <= elapsedEnd && isWorkday(date)).length;
  const totalWorkdays = countWorkdays(start, end);
  const daysIn = today < start ? 0 : daysBetween(start, elapsedEnd) + 1;
  const daysRemaining = today > end ? 0 : daysBetween(today, end);
  const consistencyPct = workdaysElapsed
    ? Math.round((workdaysLogged / workdaysElapsed) * 100)
    : 0;

  const followUps = logs.filter((log) => log.followedUpOnTasks).length;
  const winsCount = logs.reduce((sum, log) => sum + (log.winsLog?.length || 0), 0);
  const latestWithWin = [...logs]
    .filter((log) => log.winsLog?.length)
    .sort((a, b) => b.date.localeCompare(a.date))[0];
  const ticker = buildTicker(start, elapsedEnd, loggedSet);

  const weekStart = mondayOf(today);
  const weekEnd = sundayOf(today);
  const friday = addFriday(weekStart);
  const needsGoals = !currentWeek;
  const isLateWeek = today >= friday;
  const needsReflection = Boolean(currentWeek && !currentWeek.reflection && isLateWeek);

  res.json({
    user: user.toPublic(),
    today,
    todayIsWorkday: isWorkday(today),
    todayLogged: loggedSet.has(today),
    daysIn,
    daysRemaining,
    totalWorkdays,
    workdaysElapsed,
    workdaysLogged,
    consistencyPct,
    followUpPct: logs.length ? Math.round((followUps / logs.length) * 100) : 0,
    winsCount,
    streak: {
      current: currentStreak(dates, today),
      longest: longestStreak(dates),
    },
    week: {
      weekStartDate: weekStart,
      weekEndDate: weekEnd,
      needsGoals,
      needsReflection,
      isLateWeek,
      goalsCompleted: currentWeek ? currentWeek.goals.filter((g) => g.done).length : 0,
      goalsTotal: currentWeek ? currentWeek.goals.length : 0,
      hasReflection: Boolean(currentWeek?.reflection),
      goals: currentWeek
        ? currentWeek.goals.map((g) => ({ text: g.text, done: g.done }))
        : [],
    },
    latestWin: latestWithWin
      ? { date: latestWithWin.date, text: latestWithWin.winsLog[0] }
      : null,
    ticker,
  });
});

function buildTicker(start, elapsedEnd, loggedSet) {
  if (!start || !elapsedEnd || start > elapsedEnd) return [];
  const points = [];
  let index = 100;
  let logged = 0;
  let elapsed = 0;
  for (let cursor = start; cursor <= elapsedEnd; cursor = addDays(cursor, 1)) {
    if (!isWorkday(cursor)) continue;
    elapsed += 1;
    const did = loggedSet.has(cursor);
    if (did) {
      logged += 1;
      index += 1;
    } else {
      index -= 1;
    }
    points.push({
      date: cursor,
      value: index,
      logged: did,
      consistency: Math.round((logged / elapsed) * 100),
    });
  }
  return points;
}

function addFriday(monday) {
  const [y, m, d] = monday.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d + 4));
  return date.toISOString().slice(0, 10);
}

module.exports = router;
