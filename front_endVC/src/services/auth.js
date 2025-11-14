// Manejo de tokens JWT (SimpleJWT): guardar/leer/refresh

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const TOKENS_KEY = "vc_tokens"; // {access, refresh}

/** Guarda ambos tokens en localStorage */
export function setAuthTokens(tokens) {
  if (!tokens) {
    localStorage.removeItem(TOKENS_KEY);
    return;
  }
  localStorage.setItem(TOKENS_KEY, JSON.stringify(tokens));
}

/** Lee tokens actuales */
export function getAuthTokens() {
  try {
    return JSON.parse(localStorage.getItem(TOKENS_KEY)) || null;
  } catch {
    return null;
  }
}

/** Devuelve el access token actual (o null) */
export function getAccessToken() {
  const t = getAuthTokens();
  return t?.access || null;
}

/** Login con SimpleJWT */
export async function loginJWT({ username, password }) {
  const res = await fetch(`${API_URL}/api/auth/login/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) {
    const msg = await res.text();
    throw new Error(msg || "Login failed");
  }
  const data = await res.json(); // { access, refresh }
  setAuthTokens(data);
  return data;
}

/** Refresh del access token con SimpleJWT */
export async function refreshJWT() {
  const tokens = getAuthTokens();
  if (!tokens?.refresh) throw new Error("No refresh token");

  const res = await fetch(`${API_URL}/api/auth/refresh/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh: tokens.refresh }),
  });
  if (!res.ok) throw new Error("Refresh failed");

  const data = await res.json(); // { access }
  const newTokens = { ...tokens, access: data.access };
  setAuthTokens(newTokens);
  return newTokens.access;
}

/**
 * Fetch con Bearer auto y reintento si 401 (auto-refresh).
 * Si no hay token, llama sin Authorization.
 */
export async function authorizedFetch(input, init = {}) {
  const headers = new Headers(init.headers || {});
  const access = getAccessToken();
  if (access) headers.set("Authorization", `Bearer ${access}`);

  let res = await fetch(input, { ...init, headers });

  if (res.status === 401 && getAuthTokens()?.refresh) {
    // intentamos refrescar y repetir
    try {
      const newAccess = await refreshJWT();
      headers.set("Authorization", `Bearer ${newAccess}`);
      res = await fetch(input, { ...init, headers });
    } catch {
      // refresh falló: limpiar y devolver 401 original
      setAuthTokens(null);
    }
  }
  return res;
}
