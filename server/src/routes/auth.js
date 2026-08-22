const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { auth, signToken } = require('../middleware/auth');
const oauth = require('../utils/oauth');

const router = express.Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function publicAuthPayload(user) {
  return { token: signToken(user._id.toString()), user: user.toPublic() };
}

router.post('/register', async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      attachmentStartDate,
      attachmentEndDate,
      organization = '',
    } = req.body || {};

    if (!name?.trim() || !email?.trim() || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required.' });
    }
    if (!EMAIL_RE.test(email)) {
      return res.status(400).json({ message: 'Enter a valid email address.' });
    }
    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters.' });
    }
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

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
      authProvider: 'local',
      attachmentStartDate,
      attachmentEndDate,
      organization: String(organization || '').trim(),
    });

    return res.status(201).json(publicAuthPayload(user));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Could not create account.' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({ message: 'Incorrect email or password.' });
    }
    if (!user.passwordHash) {
      return res.status(401).json({
        message: 'This account signs in with Google or LinkedIn. Use that button, or set a password under Forgot password.',
      });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ message: 'Incorrect email or password.' });
    }

    return res.json(publicAuthPayload(user));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Could not sign in.' });
  }
});

router.post('/forgot-password', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and a new password are required.' });
    }
    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters.' });
    }
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(404).json({ message: 'No account uses that email. Create one instead.' });
    }
    user.passwordHash = await bcrypt.hash(password, 12);
    await user.save();
    return res.json({ ok: true, message: 'Password updated. You can sign in now.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Could not update password.' });
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
    return res.redirect(oauth.okRedirect(user));
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
    return res.redirect(oauth.okRedirect(user));
  } catch (err) {
    console.error(err);
    return res.redirect(oauth.failRedirect(err.message || 'LinkedIn sign-in failed.'));
  }
});

router.get('/me', auth, async (req, res) => {
  const user = await User.findById(req.userId);
  if (!user) return res.status(404).json({ message: 'Account not found.' });
  return res.json({ user: user.toPublic() });
});

router.put('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'Account not found.' });

    const { name, attachmentStartDate, attachmentEndDate, organization } = req.body || {};
    if (name?.trim()) user.name = name.trim();
    if (typeof organization === 'string') user.organization = organization.trim();
    if (DATE_RE.test(attachmentStartDate || '')) user.attachmentStartDate = attachmentStartDate;
    if (DATE_RE.test(attachmentEndDate || '')) user.attachmentEndDate = attachmentEndDate;
    if (user.attachmentEndDate < user.attachmentStartDate) {
      return res.status(400).json({ message: 'End date must be on or after the start date.' });
    }

    await user.save();
    return res.json({ user: user.toPublic() });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Could not update profile.' });
  }
});

module.exports = router;
