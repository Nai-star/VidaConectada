// ==========================
// Obtener token del storage
// ==========================
export const getAccessToken = () => {
  return localStorage.getItem("token_access") || null;
};

// =======================================
// Fetch con autorización automática (JWT)
// =======================================
export const authorizedFetch = async (url, options = {}) => {
  const token = getAccessToken();

  let headers = {
    ...(options.headers || {}),
  };

  // ❗ Si el body NO es FormData, agregamos JSON
  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  // Token
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  return response;
};

// ==========================================
// Guardar tokens
// ==========================================
export const saveTokens = (access, refresh) => {
  if (access) localStorage.setItem("token_access", access);
  if (refresh) localStorage.setItem("token_refresh", refresh);
};

// ==========================================
// Cerrar sesión (limpiar tokens)
// ==========================================
export const logout = () => {
  localStorage.removeItem("token_access");
  localStorage.removeItem("token_refresh");
};
