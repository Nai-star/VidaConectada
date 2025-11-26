import { authorizedFetch } from "./auth";

const API_URL = (import.meta.env.VITE_API_URL || "http://192.168.100.34:8000").replace(/\/+$/, "");
const CLOUDINARY_BASE = (import.meta.env.VITE_CLOUDINARY_BASE || "https://res.cloudinary.com/dfhdzszjp/").replace(/\/+$/, "");

/** Une base + path evitando barras dobles */
function joinUrl(base, path) {
  if (!path) return "";
  return `${base}/${String(path).replace(/^\/+/, "")}`;
}

/** Normaliza y devuelve cadena */
function normalizeStringUrl(u) {
  if (!u && u !== 0) return "";
  return String(u).trim();
}

/** Extrae una URL desde distintos formatos posibles de 'imagen' */
function extractImageUrl(rawImagen) {
  if (rawImagen === null || rawImagen === undefined) return "";

  // arrays: toma el primero útil
  if (Array.isArray(rawImagen) && rawImagen.length > 0) {
    const first = rawImagen[0];
    if (!first) return "";
    if (typeof first === "string") return normalizeStringUrl(first);
    if (first.url) return normalizeStringUrl(first.url);
    if (first.secure_url) return normalizeStringUrl(first.secure_url);
    if (first.secureUrl) return normalizeStringUrl(first.secureUrl);
    return "";
  }

  // strings
  if (typeof rawImagen === "string") {
    const s = rawImagen.trim();
    if (!s) return "";
    if (/^https?:\/\//i.test(s) || /^\/\//.test(s)) return s; // absolute or protocol-relative
    if (s.startsWith("/")) return joinUrl(API_URL, s);
    return joinUrl(CLOUDINARY_BASE, s);
  }

  // objetos
  if (typeof rawImagen === "object" && rawImagen !== null) {
    if (rawImagen.url) return normalizeStringUrl(rawImagen.url);
    if (rawImagen.secure_url) return normalizeStringUrl(rawImagen.secure_url);
    if (rawImagen.secureUrl) return normalizeStringUrl(rawImagen.secureUrl);
  }

  return "";
}

function mapItem(raw) {
  const image = extractImageUrl(raw?.imagen ?? raw?.image ?? raw?.foto);

  return {
    id: raw?.id ?? null,
    image,
    text: raw?.texto ?? raw?.text ?? "",
    active: (raw?.estado ?? raw?.activo) !== false,
    darkFilter: raw?.filtro_oscuro ?? raw?.dark_filter ?? false,
    showText: raw?.mostrar_texto ?? raw?.show_text ?? true,
    raw,
  };
}

/**
 * Obtiene los slides del carrusel (solo activos).
 * Endpoint esperado: GET /api/carusel/
 */
export async function obtenerCarruselActivos() {
  const url = `${API_URL}/api/carusel/`;
  const fetcher = typeof authorizedFetch === "function" ? authorizedFetch : fetch;

  let res;
  try {
    res = await fetcher(url, { method: "GET" });
  } catch (err) {
    console.error("ServicioCarrusel: error de red", err);
    throw new Error("Error de red al cargar el carrusel");
  }

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    console.error("ServicioCarrusel: fetch error", res.status, body);
    throw new Error(body || `Error ${res.status} al cargar el carrusel`);
  }

  // manejar respuesta vacía / no JSON
  const contentType = res.headers?.get?.("content-type") ?? "";
  let data;
  try {
    if (res.status === 204) {
      data = [];
    } else if (contentType.includes("application/json")) {
      data = await res.json();
    } else {
      // intenta parsear texto por si el backend devuelve JSON con otro content-type
      const text = await res.text().catch(() => "");
      try {
        data = text ? JSON.parse(text) : [];
      } catch {
        console.error("ServicioCarrusel: respuesta no JSON:", contentType, text);
        throw new Error("Respuesta inesperada del servidor");
      }
    }
  } catch (err) {
    console.error("ServicioCarrusel: fallo al parsear respuesta", err);
    throw new Error("Error al procesar la respuesta del carrusel");
  }

  const items = Array.isArray(data) ? data : [];

  console.debug("ServicioCarrusel: items raw", items);

  return items
    .filter(i => (i?.estado ?? i?.activo ?? true) !== false)
    .map(mapItem);
}