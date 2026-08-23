function clip(value, max) {
  return String(value ?? '').trim().slice(0, max);
}

function clipList(list, { itemMax, maxItems = 20 } = {}) {
  if (!Array.isArray(list)) return [];
  return list
    .map((item) => clip(item, itemMax))
    .filter(Boolean)
    .slice(0, maxItems);
}

function assertPassword(password) {
  if (typeof password !== 'string' || password.length < 8) {
    return 'Password must be at least 8 characters.';
  }
  if (password.length > 128) {
    return 'Password is too long.';
  }
  if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
    return 'Password must include a letter and a number.';
  }
  return null;
}

const LIMITS = {
  name: 80,
  organization: 120,
  email: 254,
  task: 300,
  skill: 80,
  win: 500,
  challenges: 2000,
  notes: 4000,
  goal: 200,
  reflection: 4000,
};

module.exports = { clip, clipList, assertPassword, LIMITS };
