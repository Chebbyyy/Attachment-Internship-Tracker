const buckets = new Map();

function prune(list, windowMs, now) {
  return list.filter((ts) => now - ts < windowMs);
}

function rateLimit({ windowMs, max, keyFn, message }) {
  return (req, res, next) => {
    const now = Date.now();
    const key = keyFn(req);
    const recent = prune(buckets.get(key) || [], windowMs, now);
    if (recent.length >= max) {
      return res.status(429).json({
        message: message || 'Too many attempts. Wait a minute and try again.',
      });
    }
    recent.push(now);
    buckets.set(key, recent);
    return next();
  };
}

function clientKey(req) {
  return req.ip || req.socket?.remoteAddress || 'unknown';
}

const loginLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 12,
  keyFn: (req) => `login:${clientKey(req)}`,
  message: 'Too many sign-in attempts. Try again in a few minutes.',
});

const registerLimit = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 8,
  keyFn: (req) => `register:${clientKey(req)}`,
  message: 'Too many accounts from this connection. Try later.',
});

const passwordLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 8,
  keyFn: (req) => `password:${clientKey(req)}`,
  message: 'Too many password attempts. Try again in a few minutes.',
});

const failures = new Map();

function isLocked(email) {
  const rec = failures.get(email);
  if (!rec) return false;
  if (rec.until && Date.now() < rec.until) return true;
  if (rec.until && Date.now() >= rec.until) {
    failures.delete(email);
    return false;
  }
  return false;
}

function noteFail(email) {
  const rec = failures.get(email) || { n: 0, until: 0 };
  rec.n += 1;
  if (rec.n >= 8) rec.until = Date.now() + 15 * 60 * 1000;
  failures.set(email, rec);
}

function clearFails(email) {
  failures.delete(email);
}

module.exports = {
  loginLimit,
  registerLimit,
  passwordLimit,
  isLocked,
  noteFail,
  clearFails,
};
