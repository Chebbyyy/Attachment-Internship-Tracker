const express = require('express');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const User = require('../models/User');
const DailyLog = require('../models/DailyLog');
const WeeklyGoal = require('../models/WeeklyGoal');
const { auth, issueSession, revokeSession } = require('../middleware/auth');
const { loginLimit, registerLimit, passwordLimit, isLocked, noteFail, clearFails } = require('../middleware/rateLimit');
const oauth = require('../utils/oauth');
const { clip, assertPassword, LIMITS } = require('../utils/limits');

const router = express.Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function publicUser(user) {
  return { user: user.toPublic() };
}

router.post('/register', registerLimit, async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      attachmentStartDate,
      attachmentEndDate,
      organization = '',
      remember = true,
    } = req.body || {};

    if (!clip(name, LIMITS.name) || !clip(email, LIMITS.email) || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required.' });
    }
    if (!EMAIL_RE.test(email)) {
      return res.status(400).json({ message: 'Enter a valid email address.' });
    }
    const passwordError = assertPassword(password);
    if (passwordError) return res.status(400).json({ message: passwordError });
    if (!DATE_RE.test(attachmentStartDate || '') || !DATE_RE.test(attachmentEndDate || '')) {
      return res.status(400).json({ message: 'Start and end dates are required.' });
    }
    if (attachmentEndDate < attachmentStartDate) {
      return res.status(400).json({ message: 'End date must be on or after the start date.' });
    }

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(409).json({ message: 'An account with that email already exists.' });
    }

    const user = await User.create({
      name: clip(name, LIMITS.name),
      email: clip(email, LIMITS.email).toLowerCase(),
      passwordHash: await bcrypt.hash(password, 12),
      authProvider: 'local',
      attachmentStartDate,
      attachmentEndDate,
      organization: clip(organization, LIMITS.organization),
    });

    issueSession(res, user, { remember: Boolean(remember) });
    return res.status(201).json(publicUser(user));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Could not create account.' });
  }
});

router.post('/login', loginLimit, async (req, res) => {
  try {
    const { email, password, remember = true } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const normalized = clip(email, LIMITS.email).toLowerCase();
    if (isLocked(normalized)) {
      return res.status(429).json({ message: 'Too many failed sign-ins. Try again in 15 minutes.' });
    }

    const user = await User.findOne({ email: normalized });
    if (!user || !user.passwordHash) {
      noteFail(normalized);
      return res.status(401).json({ message: 'Incorrect email or password.' });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      noteFail(normalized);
      return res.status(401).json({ message: 'Incorrect email or password.' });
    }

    clearFails(normalized);
    issueSession(res, user, { remember: Boolean(remember) });
    return res.json(publicUser(user));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Could not sign in.' });
  }
});

router.post('/forgot-password', (_req, res) => {
  return res.status(410).json({
    message: 'Password reset by email is disabled. Sign in and change your password in Settings.',
  });
});

router.post('/logout', (_req, res) => {
  revokeSession(res);
  return res.json({ ok: true });
});

router.post('/password', auth, passwordLimit, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'Account not found.' });

    const { currentPassword, newPassword } = req.body || {};
    const passwordError = assertPassword(newPassword);
    if (passwordError) return res.status(400).json({ message: passwordError });

    if (user.passwordHash) {
      if (!currentPassword) {
        return res.status(400).json({ message: 'Current password is required.' });
      }
      const ok = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!ok) return res.status(401).json({ message: 'Current password is incorrect.' });
    }

    user.passwordHash = await bcrypt.hash(newPassword, 12);
    user.tokenVersion = Number(user.tokenVersion || 0) + 1;
    await user.save();
    issueSession(res, user, { remember: true });
    return res.json({ ok: true, user: user.toPublic() });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Could not update password.' });
  }
});

router.delete('/account', auth, passwordLimit, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'Account not found.' });

    const { password, confirmEmail } = req.body || {};
    if (user.passwordHash) {
      const ok = password && (await bcrypt.compare(password, user.passwordHash));
      if (!ok) return res.status(401).json({ message: 'Password is incorrect.' });
    } else if (clip(confirmEmail, LIMITS.email).toLowerCase() !== user.email) {
      return res.status(400).json({ message: 'Type your account email to confirm deletion.' });
    }

    const id = user._id;
    await Promise.all([
      DailyLog.deleteMany({ userId: id }),
      WeeklyGoal.deleteMany({ userId: id }),
      User.deleteOne({ _id: id }),
    ]);
    revokeSession(res);
    return res.json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Could not delete account.' });
  }
});

router.get('/google', (req, res) => {
  if (!oauth.googleEnabled()) {
    return res.redirect(oauth.failRedirect('Google sign-in is not configured on this server.'));
  }
  return res.redirect(oauth.googleAuthUrl());
});

router.get('/google/callback', async (req, res) => {
  try {
    if (req.query.error) {
      return res.redirect(oauth.failRedirect('Google sign-in was cancelled.'));
    }
    oauth.readState(req.query.state);
    const user = await oauth.exchangeGoogle(req.query.code);
    issueSession(res, user, { remember: true });
    return res.redirect(oauth.okRedirect());
  } catch (err) {
    console.error(err);
    return res.redirect(oauth.failRedirect(err.message || 'Google sign-in failed.'));
  }
});

router.get('/linkedin', (req, res) => {
  if (!oauth.linkedinEnabled()) {
    return res.redirect(oauth.failRedirect('LinkedIn sign-in is not configured on this server.'));
  }
  return res.redirect(oauth.linkedinAuthUrl());
});

router.get('/linkedin/callback', async (req, res) => {
  try {
    if (req.query.error) {
      return res.redirect(oauth.failRedirect('LinkedIn sign-in was cancelled.'));
    }
    oauth.readState(req.query.state);
    const user = await oauth.exchangeLinkedin(req.query.code);
    issueSession(res, user, { remember: true });
    return res.redirect(oauth.okRedirect());
  } catch (err) {
    console.error(err);
    return res.redirect(oauth.failRedirect(err.message || 'LinkedIn sign-in failed.'));
  }
});

router.get('/me', auth, async (req, res) => {
  const user = await User.findById(req.userId);
  if (!user) return res.status(404).json({ message: 'Account not found.' });
  return res.json(publicUser(user));
});

router.put('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'Account not found.' });

    const { name, attachmentStartDate, attachmentEndDate, organization } = req.body || {};
    if (name?.trim()) user.name = clip(name, LIMITS.name);
    if (typeof organization === 'string') user.organization = clip(organization, LIMITS.organization);
    if (DATE_RE.test(attachmentStartDate || '')) user.attachmentStartDate = attachmentStartDate;
    if (DATE_RE.test(attachmentEndDate || '')) user.attachmentEndDate = attachmentEndDate;
    if (user.attachmentEndDate < user.attachmentStartDate) {
      return res.status(400).json({ message: 'End date must be on or after the start date.' });
    }

    await user.save();
    return res.json(publicUser(user));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Could not update profile.' });
  }
});

router.get('/export', auth, async (req, res) => {
  if (!mongoose.isValidObjectId(req.userId)) {
    return res.status(400).json({ message: 'Invalid account.' });
  }
  const [user, logs, weeks] = await Promise.all([
    User.findById(req.userId),
    DailyLog.find({ userId: req.userId }).sort({ date: 1 }).lean(),
    WeeklyGoal.find({ userId: req.userId }).sort({ weekStartDate: 1 }).lean(),
  ]);
  if (!user) return res.status(404).json({ message: 'Account not found.' });

  res.json({
    exportedAt: new Date().toISOString(),
    user: user.toPublic(),
    logs: logs.map((log) => ({
      date: log.date,
      tasksCompleted: log.tasksCompleted,
      skillsPracticed: log.skillsPracticed,
      winsLog: log.winsLog,
      challenges: log.challenges,
      moodRating: log.moodRating,
      followedUpOnTasks: log.followedUpOnTasks,
      notes: log.notes,
    })),
    weeks: weeks.map((week) => ({
      weekStartDate: week.weekStartDate,
      weekEndDate: week.weekEndDate,
      goals: week.goals.map((goal) => ({ text: goal.text, done: goal.done })),
      reflection: week.reflection,
    })),
  });
});

module.exports = router;
