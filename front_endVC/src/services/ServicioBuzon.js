// src/services/ServicioBuzon.js
const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

/* ==========================
   Obtener token del storage (normalizado)
   busca múltiples claves y limpia prefijos/comillas
   ========================== */
export const getAccessToken = () => {
  const keys = [
    "accessToken", // duplicado intencional, no importa
  ];

  let raw = null;
  for (const k of keys) {
    const v = localStorage.getItem(k);
    if (v) {
      raw = v;
      break;
    }
  }
  if (!raw) return null;

  // si guardaste un objeto JSON stringifyado accidentalmente -> intenta parsear
  try {
    if (raw.trim().startsWith("{")) {
      const parsed = JSON.parse(raw);
      // common shapes: { access: "..."} or { accessToken: "..." }
      if (parsed?.access) return parsed.access;
      if (parsed?.accessToken) return parsed.accessToken;
      if (parsed?.token) return parsed.token;
    }
  } catch (e) {
    // ignore parse errors
  }

  // quitar prefijo "Bearer " si existe
  let token = raw.trim();
  if (token.toLowerCase().startsWith("bearer ")) token = token.slice(7).trim();

  // quitar comillas alrededor si las tuviera
  if ((token.startsWith('"') && token.endsWith('"')) || (token.startsWith("'") && token.endsWith("'"))) {
    token = token.slice(1, -1);
  }

  return token || null;
};

function getAuthHeaders() {
  const token = getAccessToken();
  console.log("Token obtenido:", token);
  
  if (!token) return {};
  // log útil para depuración (solo en dev)
  if (typeof window !== "undefined" && window.location.hostname === "localhost") {
    console.log("Usando token (primeros 8 chars):", token ? token.slice(0, 8) + "..." : null);
  }
  return { Authorization: `Bearer ${token}` };
}


// ==========================
// Handler de respuestas (mejorado para debug)
// ==========================
async function handleResponse(response) {
  const text = await response.text();
  const type = (response.headers.get("content-type") || "").toLowerCase();

  // log para debug
  console.log("[ServicioBuzon] handleResponse - status:", response.status, "content-type:", type, "body:", text.slice(0, 2000));

  if (type.includes("application/json")) {
    const data = text ? JSON.parse(text) : null;
    if (!response.ok) {
      // mostrar cuerpo completo en consola para debug
      console.error("[ServicioBuzon] Error response JSON:", data);
      const err = data?.detail || JSON.stringify(data) || response.statusText;
      throw new Error(err);
    }
    return data;
  }

  if (!response.ok) {
    console.error("[ServicioBuzon] Error response text:", text);
    throw new Error(`Error ${response.status}: ${text.slice(0, 800)}`);
  }

  return text;
}

/* ==========================
   Crear respuesta (mejorado para debug)
   ========================== */
/* export async function crearRespuesta(payload) {
  const API_URL =
    (typeof process !== "undefined" && process.env && process.env.REACT_APP_API_URL) ||
    (typeof window !== "undefined" && window.__API_URL__) ||
    "http://127.0.0.1:8000/api";

  // Intenta obtener token de localStorage en varias claves posibles:
  const possibleKeys = ["token", "access", "authToken", "jwt"];
  let token = null;
  if (typeof localStorage !== "undefined") {
    for (const k of possibleKeys) {
      const t = localStorage.getItem(k);
      if (t) { token = t; break; }
    }
    // Algunas apps guardan objeto JSON (e.g. {access: "...", refresh: "..."})
    if (!token) {
      try {
        const stored = localStorage.getItem("auth") || localStorage.getItem("session");
        if (stored) {
          const parsed = JSON.parse(stored);
          token = parsed?.access || parsed?.token || parsed?.auth || null;
        }
      } catch (e) { }
    }
  }

 
  if (!token) {
    const err = new Error("No auth token found. Usuario no autenticado.");
    err.code = "NO_TOKEN";
    console.error("[ServicioBuzon] crearRespuesta abortado - no token in localStorage");
    throw err;
  }

  // Normaliza si token tiene prefijo "Bearer " ya incluido
  const normalizedToken = token.replace(/^Bearer\s+/i, "").replace(/^Token\s+/i, "");

  const headers = {
    "Content-Type": "application/json",
    // Cambia 'Bearer' por 'Token' si tu backend usa TokenAuthentication
    Authorization: `Bearer ${normalizedToken}`
  };

  // Normalizaciones de campos que usamos antes
  const body = { ...payload };
  if (body.Buzon_id && !body.Buzon) { body.Buzon = body.Buzon_id; delete body.Buzon_id; }
  if (body.respuesta && !body.Respuesta_P) { body.Respuesta_P = body.respuesta; delete body.respuesta; }
  if (body.estado !== undefined) body.estado = !!body.estado;

  console.log("[ServicioBuzon] POST", `${API_URL}/respuestas/ payload:`, body);

  let res;
  try {
    res = await fetch(`${API_URL}/respuestas/`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });
  } catch (networkErr) {
    console.error("[ServicioBuzon] Network error:", networkErr);
    const err = new Error("Network error creating respuesta");
    err.original = networkErr;
    throw err;
  }

  const text = await res.text().catch(() => "");
  let json = null;
  try { json = text ? JSON.parse(text) : null; } catch (e) { json = null; }

  if (!res.ok) {
    console.error("[ServicioBuzon] crearRespuesta - status:", res.status, "body:", json ?? text, "headers:", headers);
    const err = new Error("Crear respuesta falló");
    err.status = res.status;
    err.body = json ?? text;
    throw err;
  }

  return json;
} */
 



/* ==========================
   Crear consulta del buzón (público)
   ========================== */
export async function crearConsultaBuzon(payload) {
  const res = await fetch(`${API_URL}/buzon/`, {
    method: "POST",
    headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  return handleResponse(res);
}

/* ==========================
   Listar buzón (requiere token)
   ========================== */
export async function listarBuzon() {
  const res = await fetch(`${API_URL}/buzon/`, {
    headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
  });
  return handleResponse(res);
}

/* ==========================
   Eliminar pregunta
   ========================== */
export async function eliminarPregunta(id) {
  const res = await fetch(`${API_URL}/buzon/${id}/`, {
    method: "DELETE",
    headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Error eliminando pregunta: ${res.status} ${text}`);
  }
  return true;
}

/* ==========================
   Listar respuestas
   ========================== */
export async function listarRespuestas() {
  const res = await fetch(`${API_URL}/respuestas/`, {
    headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
  });

  if (res.status === 404) return [];
  return handleResponse(res);
}

/* ==========================
   Obtener respuestas por buzón
   ========================== */
export async function obtenerRespuestasPorBuzon(buzonId) {
  const res = await fetch(`${API_URL}/respuestas/?buzon_id=${buzonId}`, {
    headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
  });

  if (res.status === 404) return [];
  return handleResponse(res);
}

/* ==========================
   Crear respuesta
   ========================== */
export async function crearRespuesta(payload) {
  console.log(payload);
  
  const res = await fetch(`${API_URL}/respuestas/`, {
    method: "POST",
    headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const text = await res.text();
  const type = (res.headers.get("content-type") || "").toLowerCase();

  if (!res.ok) {
    if (type.includes("application/json")) {
      throw new Error(JSON.stringify(JSON.parse(text)));
    } else {
      throw new Error(`Respuesta no-JSON: ${text.slice(0, 1000)}`);
    }
  }

  return type.includes("application/json") ? JSON.parse(text) : text;
}
 
/* ==========================
   Obtener usuario logueado
   ========================== */
export async function obtenerUsuarioActual() {
  try {
    const token = getAccessToken();
    console.log(token);
    
    if (!token) return null; // no token → null

    const res = await fetch(`${API_URL}/usuarios/`, {
      headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
    });

    if (res.status === 401) {
      // token inválido o expirado
      console.warn("Token inválido o expirado");
      return null;
    }

    if (!res.ok) return null;

    return await res.json();
  } catch (e) {
    console.error("Error en obtenerUsuarioActual:", e);
    return null;
  }
} 

/* Alias */
export const listarRespuestasAlias = listarRespuestas;


/* ==========================
   PATCH: cambiar estado de una respuesta (activar/desactivar)
   ========================== */
export async function cambiarEstadoRespuesta(id, payload) {
  if (!id) throw new Error("ID de respuesta requerido para cambiar estado.");
  const res = await fetch(`${API_URL}/respuesta/${id}/`, {
    method: "PATCH",
    headers: {
      ...getAuthHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  // Si el backend devuelve 404, lo tratamos explícitamente (útil en dev)
  if (res.status === 404) {
    throw new Error(`No se encontró la respuesta con id ${id} (404).`);
  }

  return handleResponse(res);
}

/* ==========================
   PUT: actualizar una respuesta completa (opcional)
   ========================== */
export async function actualizarRespuesta(id, payload) {
  if (!id) throw new Error("ID de respuesta requerido para actualizar.");
  const res = await fetch(`${API_URL}/respuesta/${id}/`, {
    method: "PUT",
    headers: {
      ...getAuthHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (res.status === 404) {
    throw new Error(`No se encontró la respuesta con id ${id} (404).`);
  }

  return handleResponse(res);
}

/* ==========================
   GET: obtener respuesta por id (opcional)
   ========================== */
export async function obtenerRespuestaPorId(id) {
  if (!id) return null;
  const res = await fetch(`${API_URL}/respuesta/${id}/`, {
    headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
  });

  if (res.status === 404) return null;
  return handleResponse(res);
}



/* ==========================
   Obtener usuario logueado (robusto)
   - intenta varios endpoints "comunes"
   - si la respuesta es una lista, intenta extraer el id desde el JWT y buscarlo
   - si no hay token o no puede resolver, retorna null
   ========================== */
function parseJwt(token) {
  try {
    const part = token.split(".")[1];
    if (!part) return null;
    // atob con manejos de URL-safe
    const json = atob(part.replace(/-/g, "+").replace(/_/g, "/"));
    // decodeURIComponent/escape para soportar unicode
    return JSON.parse(decodeURIComponent(escape(json)));
  } catch (e) {
    console.warn("[parseJwt] no se pudo parsear token:", e);
    return null;
  }
}




// Ver qué claves de auth hay
console.log('localStorage keys:', Object.keys(localStorage).filter(k => /token|auth|access|session/i.test(k)));

// Ver valores más comunes
console.log('token:', localStorage.getItem('token'));
console.log('access:', localStorage.getItem('access'));
console.log('auth:', localStorage.getItem('auth'));
console.log('session:', localStorage.getItem('session'));

// (Si no hay token y quieres probar) — pega tu token real entre comillas:
localStorage.setItem('access', 'eyJ...TU_TOKEN_DE_PRUEBA...');
// o
localStorage.setItem('token', 'eyJ...TU_TOKEN_DE_PRUEBA...');
console.log('Now access=', localStorage.getItem('access'));
