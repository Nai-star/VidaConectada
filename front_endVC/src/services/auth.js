// ==========================
// Obtener token del storage
// ==========================
export const getAccessToken = () => {
  return localStorage.getItem("accessToken") || null;
};

export const authorizedFetch = async (url, options = {}) => {
  const opts = { ...(options || {}) };
  const method = (opts.method || "GET").toString().toUpperCase();
  const headers = { ...(opts.headers || {}) };
  const body = opts.body;

  // solo setear Content-Type si no es FormData y si no viene ya en headers
  if (body !== undefined && !(body instanceof FormData) && !("Content-Type" in headers)) {
    headers["Content-Type"] = "application/json";
  }

  const token = getAccessToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const fetchOptions = { ...opts, headers };

  // eliminar body para GET/HEAD
  if ((method === "GET" || method === "HEAD") && fetchOptions.body !== undefined) {
    delete fetchOptions.body;
  }

  return fetch(url, fetchOptions);
};

export const saveTokens = (access, refresh) => {
  if (access) localStorage.setItem("token_access", access);
  if (refresh) localStorage.setItem("token_refresh", refresh);
};
export const logout = () => {
  localStorage.removeItem("token_access");
  localStorage.removeItem("token_refresh");
};