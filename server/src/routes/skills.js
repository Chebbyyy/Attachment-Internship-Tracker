const express = require('express');
const DailyLog = require('../models/DailyLog');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.use(auth);

router.get('/summary', async (req, res) => {
  const logs = await DailyLog.find({ userId: req.userId }).select('date skillsPracticed').lean();

  const counts = { technical: 0, interpersonal: 0 };
  const bySkill = new Map();

  for (const log of logs) {
    for (const entry of log.skillsPracticed || []) {
      const name = String(entry.skill || '').trim();
      const category = entry.type === 'interpersonal' ? 'interpersonal' : 'technical';
      if (!name) continue;
      counts[category] += 1;
      const key = `${name.toLowerCase()}::${category}`;
      const existing = bySkill.get(key) || {
        skillName: name,
        category,
        timesLogged: 0,
        lastPracticed: log.date,
      };
      existing.timesLogged += 1;
      if (log.date > existing.lastPracticed) existing.lastPracticed = log.date;
      bySkill.set(key, existing);
    }
  }

  const skills = [...bySkill.values()].sort((a, b) => {
    if (b.timesLogged !== a.timesLogged) return b.timesLogged - a.timesLogged;
    return b.lastPracticed.localeCompare(a.lastPracticed);
  });

  const total = counts.technical + counts.interpersonal;
  res.json({
    counts,
    total,
    technicalPct: total ? Math.round((counts.technical / total) * 100) : 0,
    interpersonalPct: total ? Math.round((counts.interpersonal / total) * 100) : 0,
    skills,
  });
});

module.exports = router;
