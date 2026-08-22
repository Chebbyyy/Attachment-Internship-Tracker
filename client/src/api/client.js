const TOKEN_KEY = 'attache.token';
const SESSION_KEY = 'attache.token.session';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(SESSION_KEY);
}

export function setToken(token, remember = true) {
  localStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(SESSION_KEY);
  if (!token) return;
  if (remember) localStorage.setItem(TOKEN_KEY, token);
  else sessionStorage.setItem(SESSION_KEY, token);
}

async function request(path, { method = 'GET', body, token = getToken() } = {}) {
  let res;
  try {
    res = await fetch(path, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    const error = new Error('Cannot reach the Attache API. Make sure the server is running.');
    error.status = 0;
    throw error;
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const error = new Error(data.message || `Request failed (${res.status})`);
    error.status = res.status;
    throw error;
  }
  return data;
}

export async function api(path, options = {}) {
  let lastError;
  for (let attempt = 0; attempt < 5; attempt += 1) {
    try {
      return await request(path, options);
    } catch (err) {
      lastError = err;
      const retryable = err.status === 502 || err.status === 503 || err.status === 0;
      if (!retryable || attempt === 4) throw err;
      await new Promise((resolve) => setTimeout(resolve, 400 * (attempt + 1)));
    }
  }
  throw lastError;
}
