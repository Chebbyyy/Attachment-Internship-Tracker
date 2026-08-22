const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { signToken } = require('../middleware/auth');
const { todayISO, addDays } = require('../utils/dates');

function clientBase() {
  return (process.env.CLIENT_URL || 'http://localhost:5174').replace(/\/$/, '');
}

function googleEnabled() {
  return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
}

function linkedinEnabled() {
  return Boolean(process.env.LINKEDIN_CLIENT_ID && process.env.LINKEDIN_CLIENT_SECRET);
}

function signState(provider) {
  return jwt.sign({ p: provider }, process.env.JWT_SECRET, { expiresIn: '10m' });
}

function readState(state) {
  const payload = jwt.verify(state, process.env.JWT_SECRET);
  return payload.p;
}

function failRedirect(message) {
  return `${clientBase()}/login?error=${encodeURIComponent(message)}`;
}

function okRedirect(user) {
  const token = signToken(user._id.toString());
  return `${clientBase()}/oauth/callback?token=${encodeURIComponent(token)}`;
}

async function findOrCreateOAuth({ email, name, provider }) {
  const normalized = String(email || '').toLowerCase().trim();
  if (!normalized) {
    throw new Error('That account did not share an email address.');
  }
  let user = await User.findOne({ email: normalized });
  if (user) return user;
  const start = todayISO();
  user = await User.create({
    name: (name || 'Attachee').trim(),
    email: normalized,
    passwordHash: null,
    authProvider: provider,
    attachmentStartDate: start,
    attachmentEndDate: addDays(start, 90),
    organization: '',
  });
  return user;
}

function googleAuthUrl() {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID,
    redirect_uri: `${clientBase()}/api/auth/google/callback`,
    response_type: 'code',
    scope: 'openid email profile',
    state: signState('google'),
    prompt: 'select_account',
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
}

function linkedinAuthUrl() {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: process.env.LINKEDIN_CLIENT_ID,
    redirect_uri: `${clientBase()}/api/auth/linkedin/callback`,
    state: signState('linkedin'),
    scope: 'openid profile email',
  });
  return `https://www.linkedin.com/oauth/v2/authorization?${params}`;
}

async function exchangeGoogle(code) {
  const body = new URLSearchParams({
    code,
    client_id: process.env.GOOGLE_CLIENT_ID,
    client_secret: process.env.GOOGLE_CLIENT_SECRET,
    redirect_uri: `${clientBase()}/api/auth/google/callback`,
    grant_type: 'authorization_code',
  });
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  const tokenJson = await tokenRes.json();
  if (!tokenRes.ok || !tokenJson.access_token) {
    throw new Error('Google did not return an access token.');
  }
  const userRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: { Authorization: `Bearer ${tokenJson.access_token}` },
  });
  const profile = await userRes.json();
  if (!userRes.ok) throw new Error('Could not read the Google profile.');
  return findOrCreateOAuth({
    email: profile.email,
    name: profile.name || profile.given_name,
    provider: 'google',
  });
}

async function exchangeLinkedin(code) {
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    client_id: process.env.LINKEDIN_CLIENT_ID,
    client_secret: process.env.LINKEDIN_CLIENT_SECRET,
    redirect_uri: `${clientBase()}/api/auth/linkedin/callback`,
  });
  const tokenRes = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  const tokenJson = await tokenRes.json();
  if (!tokenRes.ok || !tokenJson.access_token) {
    throw new Error(tokenJson.error_description || 'LinkedIn did not return an access token.');
  }
  const userRes = await fetch('https://api.linkedin.com/v2/userinfo', {
    headers: { Authorization: `Bearer ${tokenJson.access_token}` },
  });
  const profile = await userRes.json();
  if (!userRes.ok) {
    throw new Error(profile.message || 'Could not read the LinkedIn profile.');
  }
  return findOrCreateOAuth({
    email: profile.email,
    name: profile.name || [profile.given_name, profile.family_name].filter(Boolean).join(' '),
    provider: 'linkedin',
  });
}

module.exports = {
  googleEnabled,
  linkedinEnabled,
  googleAuthUrl,
  linkedinAuthUrl,
  readState,
  exchangeGoogle,
  exchangeLinkedin,
  failRedirect,
  okRedirect,
};
