const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { readSessionToken, setSessionCookie, clearSessionCookie } = require('../utils/session');

async function auth(req, res, next) {
  const token = readSessionToken(req);
  if (!token) {
    return res.status(401).json({ message: 'Sign in to continue.' });
  }
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.userId).select('tokenVersion');
    if (!user || Number(user.tokenVersion || 0) !== Number(payload.tv || 0)) {
      return res.status(401).json({ message: 'Session expired. Please sign in again.' });
    }
    req.userId = user._id.toString();
    return next();
  } catch {
    return res.status(401).json({ message: 'Session expired. Please sign in again.' });
  }
}

function signToken(user) {
  return jwt.sign(
    { userId: user._id.toString(), tv: Number(user.tokenVersion || 0) },
    process.env.JWT_SECRET,
    { expiresIn: '14d' }
  );
}

function issueSession(res, user, { remember = true } = {}) {
  setSessionCookie(res, signToken(user), { remember });
}

function revokeSession(res) {
  clearSessionCookie(res);
}

module.exports = { auth, signToken, issueSession, revokeSession };
