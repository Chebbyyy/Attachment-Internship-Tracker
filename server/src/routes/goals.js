const express = require('express');
const WeeklyGoal = require('../models/WeeklyGoal');
const { auth } = require('../middleware/auth');
const { todayISO, mondayOf, sundayOf } = require('../utils/dates');

const router = express.Router();
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function serialize(doc) {
  return {
    id: doc._id,
    weekStartDate: doc.weekStartDate,
    weekEndDate: doc.weekEndDate,
    goals: doc.goals.map((goal) => ({ id: goal._id, text: goal.text, done: goal.done })),
    reflection: doc.reflection,
    completedCount: doc.goals.filter((goal) => goal.done).length,
    totalCount: doc.goals.length,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

function cleanGoals(list) {
  if (!Array.isArray(list)) return [];
  return list
    .map((item) => ({
      text: String(item?.text || '').trim(),
      done: Boolean(item?.done),
    }))
    .filter((item) => item.text);
}

router.use(auth);

router.get('/', async (req, res) => {
  const weekStart = DATE_RE.test(req.query.weekStart) ? req.query.weekStart : mondayOf(todayISO());
  if (req.query.weekStart || req.query.current === 'true') {
    const doc = await WeeklyGoal.findOne({ userId: req.userId, weekStartDate: weekStart });
    return res.json({ week: doc ? serialize(doc) : null, weekStartDate: weekStart, weekEndDate: sundayOf(weekStart) });
  }

  const items = await WeeklyGoal.find({ userId: req.userId }).sort({ weekStartDate: -1 }).limit(20);
  return res.json({ items: items.map(serialize) });
});

router.post('/', async (req, res) => {
  try {
    const today = todayISO();
    const weekStartDate = DATE_RE.test(req.body?.weekStartDate)
      ? mondayOf(req.body.weekStartDate)
      : mondayOf(today);
    const weekEndDate = sundayOf(weekStartDate);
    const goals = cleanGoals(req.body?.goals);

    if (goals.length < 3 || goals.length > 5) {
      return res.status(400).json({ message: 'Set between 3 and 5 goals for the week.' });
    }

    const week = await WeeklyGoal.create({
      userId: req.userId,
      weekStartDate,
      weekEndDate,
      goals,
      reflection: String(req.body?.reflection || '').trim(),
    });
    return res.status(201).json({ week: serialize(week) });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: 'Goals for this week already exist. Update them instead.' });
    }
    console.error(err);
    return res.status(500).json({ message: 'Could not save weekly goals.' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const week = await WeeklyGoal.findOne({ _id: req.params.id, userId: req.userId });
    if (!week) return res.status(404).json({ message: 'Weekly goals not found.' });

    if (req.body.goals) {
      const goals = cleanGoals(req.body.goals);
      if (goals.length < 3 || goals.length > 5) {
        return res.status(400).json({ message: 'Keep between 3 and 5 goals.' });
      }
      week.goals = goals;
    }
    if (typeof req.body.reflection === 'string') {
      week.reflection = req.body.reflection.trim();
    }

    await week.save();
    return res.json({ week: serialize(week) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Could not update weekly goals.' });
  }
});

module.exports = router;
