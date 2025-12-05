// src/services/ServicioBuzon.js
const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

/* ==========================
   Obtener token del storage
========================== */
export const getAccessToken = () => {
  // Cambia "token_access" por "access" si tu login guarda así
  return localStorage.getItem("token_access") || null;
};

/* ==========================
   Obtener headers con token
========================== */
function getAuthHeaders() {
  const token = getAccessToken();
  if (!token) return {}; // no enviar Authorization si no hay token
  return { Authorization: `Bearer ${token}` };
}

/* ==========================
   Handler de respuestas
========================== */
async function handleResponse(response) {
  const text = await response.text();
  const type = (response.headers.get("content-type") || "").toLowerCase();

  if (type.includes("application/json")) {
    const data = text ? JSON.parse(text) : null;
    if (!response.ok) {
      const err = data?.detail || JSON.stringify(data) || response.statusText;
      throw new Error(err);
    }
    return data;
  }

  if (!response.ok) {
    throw new Error(`Error ${response.status}: ${text.slice(0, 800)}`);
  }

  return text;
}

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
    if (!token) return null; // no token → null

    const res = await fetch(`${API_URL}/user/`, {
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
