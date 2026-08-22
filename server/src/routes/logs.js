const express = require('express');
const DailyLog = require('../models/DailyLog');
const { auth } = require('../middleware/auth');
const { todayISO, isWorkday } = require('../utils/dates');
const { currentStreak, longestStreak } = require('../utils/streak');

const router = express.Router();
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function cleanStrings(list) {
  if (!Array.isArray(list)) return [];
  return list.map((item) => String(item).trim()).filter(Boolean);
}

function cleanSkills(list) {
  if (!Array.isArray(list)) return [];
  return list
    .map((item) => ({
      skill: String(item?.skill || '').trim(),
      type: item?.type === 'interpersonal' ? 'interpersonal' : 'technical',
    }))
    .filter((item) => item.skill);
}

function serialize(log) {
  return {
    id: log._id,
    date: log.date,
    tasksCompleted: log.tasksCompleted,
    skillsPracticed: log.skillsPracticed,
    winsLog: log.winsLog,
    challenges: log.challenges,
    moodRating: log.moodRating,
    followedUpOnTasks: log.followedUpOnTasks,
    notes: log.notes,
    createdAt: log.createdAt,
    updatedAt: log.updatedAt,
  };
}

router.use(auth);

router.get('/streak', async (req, res) => {
  const logs = await DailyLog.find({ userId: req.userId }).select('date').lean();
  const dates = logs.map((log) => log.date);
  const today = todayISO();
  res.json({
    current: currentStreak(dates, today),
    longest: longestStreak(dates),
    todayLogged: dates.includes(today),
    todayIsWorkday: isWorkday(today),
    today,
  });
});

router.get('/', async (req, res) => {
  const { date, page = '1', limit = '30', winsOnly } = req.query;
  const filter = { userId: req.userId };
  if (date) {
    if (!DATE_RE.test(date)) {
      return res.status(400).json({ message: 'Date must be YYYY-MM-DD.' });
    }
    filter.date = date;
  }

  const pageNum = Math.max(1, Number(page) || 1);
  const limitNum = Math.min(100, Math.max(1, Number(limit) || 30));

  if (winsOnly === 'true') {
    filter.winsLog = { $exists: true, $not: { $size: 0 } };
  }

  const [items, total] = await Promise.all([
    DailyLog.find(filter)
      .sort({ date: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    DailyLog.countDocuments(filter),
  ]);

  res.json({
    items: items.map(serialize),
    total,
    page: pageNum,
    pages: Math.ceil(total / limitNum) || 1,
  });
});

router.post('/', async (req, res) => {
  try {
    const date = DATE_RE.test(req.body?.date) ? req.body.date : todayISO();
    const payload = {
      userId: req.userId,
      date,
      tasksCompleted: cleanStrings(req.body?.tasksCompleted),
      skillsPracticed: cleanSkills(req.body?.skillsPracticed),
      winsLog: cleanStrings(req.body?.winsLog),
      challenges: String(req.body?.challenges || '').trim(),
      moodRating: req.body?.moodRating ? Number(req.body.moodRating) : null,
      followedUpOnTasks: Boolean(req.body?.followedUpOnTasks),
      notes: String(req.body?.notes || '').trim(),
    };

    if (payload.moodRating != null && (payload.moodRating < 1 || payload.moodRating > 5)) {
      return res.status(400).json({ message: 'Mood rating must be between 1 and 5.' });
    }

    const log = await DailyLog.create(payload);
    return res.status(201).json({ log: serialize(log) });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: 'A log for that date already exists. Edit it instead.' });
    }
    console.error(err);
    return res.status(500).json({ message: 'Could not save log.' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const log = await DailyLog.findOne({ _id: req.params.id, userId: req.userId });
    if (!log) return res.status(404).json({ message: 'Log not found.' });

    if (Array.isArray(req.body.tasksCompleted)) log.tasksCompleted = cleanStrings(req.body.tasksCompleted);
    if (Array.isArray(req.body.skillsPracticed)) log.skillsPracticed = cleanSkills(req.body.skillsPracticed);
    if (Array.isArray(req.body.winsLog)) log.winsLog = cleanStrings(req.body.winsLog);
    if (typeof req.body.challenges === 'string') log.challenges = req.body.challenges.trim();
    if (typeof req.body.notes === 'string') log.notes = req.body.notes.trim();
    if (typeof req.body.followedUpOnTasks === 'boolean') {
      log.followedUpOnTasks = req.body.followedUpOnTasks;
    }
    if (req.body.moodRating === null) log.moodRating = null;
    else if (req.body.moodRating != null) {
      const mood = Number(req.body.moodRating);
      if (mood < 1 || mood > 5) {
        return res.status(400).json({ message: 'Mood rating must be between 1 and 5.' });
      }
      log.moodRating = mood;
    }

    await log.save();
    return res.json({ log: serialize(log) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Could not update log.' });
  }
});

module.exports = router;
