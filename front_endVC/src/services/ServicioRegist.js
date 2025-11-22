// src/Services/AdminServices.js
const API_BASE = "http://127.0.0.1:8000/api"; // <- Cambia a la base real de tu API REST
const ADMIN_GROUP_ID = 1; // <- id del grupo admin en auth_group

/**
 * Crea un CustomUser. Ajusta los campos al serializer de tu backend.
 * Retorna el JSON del usuario creado (con su id).
 */
export async function createAdminUser(payload) {
  const res = await fetch(`${API_BASE}/usuarios/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const text = await res.text();

  if (!res.ok) {
    // intentar parsear JSON con detalle de errores
    try {
      const j = JSON.parse(text);
      // j puede ser { field: [msgs] } o { detail: "..." }
      let msg = "";
      if (j.detail) msg = j.detail;
      else {
        // concatena mensajes por campo
        msg = Object.entries(j).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`).join("; ");
      }
      throw new Error(msg || `HTTP ${res.status}`);
    } catch (e) {
      // no JSON
      throw new Error(text || `HTTP ${res.status}`);
    }
  }

  return JSON.parse(text);
}

/**
 * Inserta relación en api_customuser_groups o llama endpoint que tu backend provea.
 * body: { customuser_id, group_id }
 */
export async function assignUserToGroup(customuser_id, group_id = ADMIN_GROUP_ID) {
  const res = await fetch(`${API_BASE}/customuser-groups/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ customuser_id, group_id }),
  });

  if (!res.ok) {
    let errText = await res.text();
    try { errText = JSON.parse(errText).detail || errText; } catch (e) {}
    throw new Error(`Error asignando grupo: ${res.status} ${errText}`);
  }
  return res.json();
}
