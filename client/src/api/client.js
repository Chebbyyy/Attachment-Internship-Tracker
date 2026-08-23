const LEGACY_TOKEN = 'attache.token';
const LEGACY_SESSION = 'attache.token.session';

export function clearLegacyTokens() {
  localStorage.removeItem(LEGACY_TOKEN);
  sessionStorage.removeItem(LEGACY_SESSION);
}

async function request(path, { method = 'GET', body } = {}) {
  let res;
  try {
    res = await fetch(path, {
      method,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
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
