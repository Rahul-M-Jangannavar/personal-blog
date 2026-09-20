import { API_URL } from "./config";
import { ApiError } from "./errors";

const REFRESH_KEY = "blog.refresh";

let accessToken = null;
let refreshPromise = null;

export function getAccessToken() {
  return accessToken;
}

export function setAccessToken(token) {
  accessToken = token;
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH_KEY);
}

export function setRefreshToken(token) {
  if (token) localStorage.setItem(REFRESH_KEY, token);
  else localStorage.removeItem(REFRESH_KEY);
}

export function clearTokens() {
  accessToken = null;
  localStorage.removeItem(REFRESH_KEY);
}

async function parseBody(response) {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return { detail: text };
  }
}

async function refreshAccess() {
  const refresh = getRefreshToken();
  if (!refresh) throw new ApiError(401, { detail: "Not authenticated." });

  const response = await fetch(`${API_URL}/api/auth/token/refresh/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh }),
  });
  const body = await parseBody(response);
  if (!response.ok) {
    clearTokens();
    throw new ApiError(response.status, body);
  }
  accessToken = body.access;
  return accessToken;
}

function queuedRefresh() {
  if (!refreshPromise) {
    refreshPromise = refreshAccess().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

/**
 * All HTTP goes through here: base URL, JSON, multipart, Bearer token,
 * and a single retry after refresh on 401.
 */
export async function api(path, options = {}) {
  const { method = "GET", json, formData, auth = true, retry = true } = options;

  const headers = new Headers(options.headers);
  if (json !== undefined) headers.set("Content-Type", "application/json");
  if (auth && accessToken) headers.set("Authorization", `Bearer ${accessToken}`);

  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: formData ?? (json !== undefined ? JSON.stringify(json) : undefined),
  });

  if (response.status === 401 && auth && retry && getRefreshToken()) {
    try {
      await queuedRefresh();
      return api(path, { ...options, retry: false });
    } catch {
      /* fall through to throw the original 401 */
    }
  }

  const body = await parseBody(response);
  if (!response.ok) {
    throw new ApiError(response.status, body);
  }
  return body;
}

export function loginRequest(username, password) {
  return api("/api/auth/token/", {
    method: "POST",
    json: { username, password },
    auth: false,
  });
}
