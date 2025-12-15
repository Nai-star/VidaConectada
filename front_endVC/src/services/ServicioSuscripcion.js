// /src/services/ServicioSuscripcion.js
import { authorizedFetch, getAccessToken } from "./auth";

const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:8000/api") ;

async function handleFetch(path, opts = {}) {
  const url = API_BASE.replace(/\/+$/, "") + path;
  const res = await authorizedFetch(url, opts);

  // Si authorizedFetch devolvió un fetch Response, parsear JSON si hay contenido.
  if (!res) throw new Error("No response from authorizedFetch");

  // Si res is a Response-like object:
  if (typeof res.json === "function") {
    // manejar errores HTTP
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      let payload = text;
      try { payload = JSON.parse(text); } catch {}
      const err = new Error(`HTTP ${res.status} ${res.statusText}`);
      err.status = res.status;
      err.server = payload;
      throw err;
    }
    // Si status 204 no tiene body
    if (res.status === 204) return null;
    return await res.json();
  }

  // Si authorizedFetch ya devolvió un objeto ya parseado (por compatibilidad)
  return res;
}

// Servicios exportados
export async function obtenerSuscritos(query = "") {
  const path = query ? `/suscritos/?${query}` : "/suscritos/";
  return handleFetch(path);
}

export async function obtenerSuscritoPorId(id) {
  return handleFetch(`/suscritos/${id}/`);
}

export async function crearSuscripcion(payload) {
  return handleFetch("/suscritos/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function actualizarSuscrito(id, payload) {
  return handleFetch(`/suscritos/${id}/`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function eliminarSuscrito(id) {
  try {
    return await handleFetch(`/suscritos/${id}/`, { method: "DELETE" });
  } catch (err) {
    // Si el servidor responde 404 -> devolver null (indica "no existía")
    if (err && err.status === 404) {
      return null;
    }
    throw err;
  }
}

export function buildSearchQuery({ q, page, page_size } = {}) {
  const params = new URLSearchParams();
  if (q) params.set("search", q);
  if (page) params.set("page", page);
  if (page_size) params.set("page_size", page_size);
  return params.toString();
}

// Participaciones
export async function obtenerParticipaciones(query = "") {
  const path = query ? `/participacion/?${query}` : "/participacion/";
  return handleFetch(path);
}

export async function obtenerParticipacionesPorSuscrito(suscritoId) {
  try {
    return await handleFetch(`/participacion/?suscrito=${suscritoId}`);
  } catch (err) {
    const all = await obtenerParticipaciones();
    return (Array.isArray(all) ? all : []).filter((p) => {
      const sid = p.suscrito ?? p.suscrito_id ?? p.Suscrito ?? p.usuario ?? null;
      return sid === suscritoId;
    });
  }
}


// calcularTipoDonante (mantener la versión robusta que ya tienes)
export function calcularTipoDonante(participaciones = []) {
  if (!Array.isArray(participaciones)) participaciones = [];

  const campanasSet = new Set();
  participaciones.forEach((p) => {
    const id = p.campana ?? p.campana_id ?? p.campaign ?? p.campaign_id ?? p.campaignId ?? null;
    const maybe = typeof id === "object" ? (id?.id ?? id?.pk ?? null) : id;
    if (maybe != null) campanasSet.add(String(maybe));
  });

  const count = campanasSet.size;

  if (count === 1) return "Primera vez";
  if (count > 8) return "Frecuente";
  if (count > 5) return "Regular";
  if (count > 1 && count <= 5) return "Ocasional";
  return "No Donante";
}