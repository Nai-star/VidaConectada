// src/Services/AdminServices.js
const API_BASE = (import.meta.env.VITE_API_URL || "http://192.168.100.34:8000").replace(/\/$/, "") + "/api";
const ADMIN_GROUP_ID = 1; // id del grupo admin en auth_group (ajusta si es otro)

/**
 * Helper: parsea respuesta de error del backend (DRF) y devuelve un mensaje legible.
 */
async function parseErrorResponse(response) {
  const text = await response.text();
  try {
    const j = JSON.parse(text);
    if (j.detail) return String(j.detail);
    if (j.non_field_errors && Array.isArray(j.non_field_errors)) return j.non_field_errors.join(" ");
    // concatena mensajes por campo
    const parts = Object.entries(j).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`);
    if (parts.length) return parts.join(" | ");
    return JSON.stringify(j);
  } catch (e) {
    return text || `HTTP ${response.status}`;
  }
}

/**
 * createAdminUser(payload)
 * - POST a /api/usuarios/
 * - payload debe incluir: username, first_name, last_name, email, password, is_staff?, is_active?
 * - Lanzará Error con mensaje legible si la API responde !ok.
 *
 * Nota importante: por seguridad es preferible que el backend asigne el grupo 'admin' y marque is_staff.
 */
export async function createAdminUser(payload, useCredentials = false) {
  const url = `${API_BASE}/usuarios/`;
  const opts = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  };

  // Si tu backend requiere sesión/cookies (NO recomendado para APIs públicas),
  // llama a createAdminUser(payload, true) y activa withCredentials/credentials.
  if (useCredentials) {
    opts.credentials = "include";
  }

  const res = await fetch(url, opts);

  if (!res.ok) {
    const msg = await parseErrorResponse(res);
    throw new Error(msg || `Error ${res.status}`);
  }
  return res.json();
}

/**
 * assignUserToGroup(customuser_id, group_id)
 * - Llama a un endpoint POST /api/customuser-groups/ si lo tienes.
 * - Si tu backend NO expone ese endpoint, NO uses esta función: mejor que el backend asigne el grupo automáticamente en create().
 *
 * IMPORTANTE: por defecto no usamos credentials. Si tu endpoint requiere sesión, pasa useCredentials = true.
 */
export async function assignUserToGroup(customuser_id, group_id = ADMIN_GROUP_ID, useCredentials = false) {
  const url = `${API_BASE}/customuser-groups/`;
  const opts = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ customuser_id, group_id }),
  };
  if (useCredentials) opts.credentials = "include";

  const res = await fetch(url, opts);

  if (!res.ok) {
    const text = await res.text();
    // intenta parsear error y devolver algo legible
    let errMsg = "";
    try {
      const j = JSON.parse(text);
      errMsg = j.detail || JSON.stringify(j);
    } catch (e) {
      errMsg = text || `HTTP ${res.status}`;
    }
    throw new Error(`Error asignando grupo: ${res.status} ${errMsg}`);
  }
  return res.json();
}

/**
 * checkEmailExists(email)
 * - GET /api/usuarios/?email=<email>
 * - Retorna true si existe al menos un usuario con ese email; false si no existe.
 * - Si el check falla (500/CORS/404), devuelve false para no bloquear la UX;
 *   el POST final seguirá validando en backend (DB unique + serializer).
 *
 * Nota: asegúrate de que en el backend tu view soporte filtrar por ?email=<email>.
 */
export async function checkEmailExists(email, useCredentials = false) {
  const url = `${API_BASE}/usuarios/?email=${encodeURIComponent(email)}`;
  const opts = { method: "GET", headers: { "Content-Type": "application/json" } };
  if (useCredentials) opts.credentials = "include";

  try {
    const res = await fetch(url, opts);
    if (!res.ok) return false;
    const data = await res.json();
    return Array.isArray(data) ? data.length > 0 : Boolean(data && data.id);
  } catch (e) {
    // fallo de red/CORS -> no bloquear
    console.warn("checkEmailExists error:", e);
    return false;
  }
}

/**
 * Exporta la ruta local de la imagen mockup (si la usas en el frontend).
 * Ruta subida: /mnt/data/e7ad0832-a7b5-4fda-9782-6ce462809582.png
 */
export const MOCKUP_IMAGE_PATH = "/mnt/data/e7ad0832-a7b5-4fda-9782-6ce462809582.png";

export default {
  createAdminUser,
  assignUserToGroup,
  checkEmailExists,
};
