import { event } from './data.js';

// True once event.apiUrl in src/data.js points at your deployed Apps Script web app.
export const apiEnabled = () => Boolean(event.apiUrl);

// POST as plain text so the browser sends a "simple" request (no CORS preflight),
// which is what Google Apps Script web apps expect.
export async function call(action, payload = {}) {
  const res = await fetch(event.apiUrl, {
    method: 'POST',
    redirect: 'follow',
    body: JSON.stringify({ action, ...payload }),
  });
  if (!res.ok) throw new Error(`Request failed (${res.status})`);
  return res.json();
}

/* Session token is kept only for this browser tab (cleared when the tab closes). */
const KEY = 'newgrs-session';

export function getSession() {
  try {
    return JSON.parse(sessionStorage.getItem(KEY) || 'null');
  } catch {
    return null;
  }
}

export function setSession(s) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    /* storage blocked: user simply signs in again next time */
  }
}

export function clearSession() {
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}
