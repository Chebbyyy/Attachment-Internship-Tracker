const COOKIE = 'attache.sid';
const TWO_WEEKS_MS = 14 * 24 * 60 * 60 * 1000;

function parseCookies(header) {
  const out = {};
  if (!header) return out;
  for (const part of header.split(';')) {
    const idx = part.indexOf('=');
    if (idx === -1) continue;
    const key = part.slice(0, idx).trim();
    const value = part.slice(idx + 1).trim();
    try {
      out[key] = decodeURIComponent(value);
    } catch {
      out[key] = value;
    }
  }
  return out;
}

function cookieBase() {
  return {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.COOKIE_SECURE === 'true',
    path: '/',
  };
}

function setSessionCookie(res, token, { remember = true } = {}) {
  res.cookie(COOKIE, token, {
    ...cookieBase(),
    maxAge: remember ? TWO_WEEKS_MS : undefined,
  });
}

function clearSessionCookie(res) {
  res.clearCookie(COOKIE, cookieBase());
}

function readSessionToken(req) {
  const cookies = parseCookies(req.headers.cookie || '');
  if (cookies[COOKIE]) return cookies[COOKIE];
  const header = req.headers.authorization || '';
  if (header.startsWith('Bearer ')) return header.slice(7);
  return null;
}

module.exports = {
  COOKIE,
  setSessionCookie,
  clearSessionCookie,
  readSessionToken,
};
