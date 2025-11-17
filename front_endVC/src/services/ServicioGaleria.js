import { authorizedFetch } from "./auth";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
const CLOUDINARY_BASE = import.meta.env.VITE_CLOUDINARY_BASE || "https://res.cloudinary.com/dfhdzszjp/";

/** Extrae URL usable desde distintos formatos */
function extractImageUrl(rawImagen) {
  if (!rawImagen) return "";
  if (typeof rawImagen === "string") {
    if (rawImagen.startsWith("http")) return rawImagen;
    if (rawImagen.startsWith("/")) return `${API_URL}${rawImagen}`;
    return `${CLOUDINARY_BASE}${rawImagen}`;
  }
  if (typeof rawImagen === "object") {
    if (rawImagen.url) return rawImagen.url;
    if (rawImagen.secure_url) return rawImagen.secure_url;
  }
  if (Array.isArray(rawImagen) && rawImagen.length) {
    const first = rawImagen[0];
    if (typeof first === "string") return first;
    if (first?.url) return first.url;
  }
  return "";
}

/** Normaliza un item de galería */
function mapItem(raw) {
  return {
    id: raw?.id ?? null,
    image: extractImageUrl(raw?.imagen ?? raw?.image ?? raw?.foto),
    title: raw?.titulo ?? raw?.title ?? "",
    caption: raw?.caption ?? raw?.descripcion ?? "",
    active: (raw?.activo ?? raw?.estado) !== false,
    raw,
  };
}

/** Obtiene todas las imágenes activas */
export async function obtenerGaleriaActiva() {
  const url = `${API_URL}/api/galeria/`; // Ajusta ruta si tu API es otra
  const fetcher = typeof authorizedFetch === "function" ? authorizedFetch : fetch;
  const res = await fetcher(url, { method: "GET" });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(body || "No se pudo cargar la galería");
  }
  const data = await res.json();
  const items = Array.isArray(data) ? data : [];
  return items.filter(i => (i?.activo ?? i?.estado ?? true) !== false).map(mapItem);
}

/** Obtener un ítem por id (opcional) */
export async function obtenerImagenPorId(id) {
  const url = `${API_URL}/api/galeria/${id}/`;
  const fetcher = typeof authorizedFetch === "function" ? authorizedFetch : fetch;
  const res = await fetcher(url, { method: "GET" });
  if (!res.ok) throw new Error("No se encontró la imagen");
  const raw = await res.json();
  return mapItem(raw);
}

/**
 * Obtener galería (paginada).
 * Backend ideal: GET /api/galeria/?page=1&page_size=24
 * Si tu API no soporta paginación, usar obtenerGaleriaAll()
 */
export async function obtenerGaleriaPaginada(page = 1, pageSize = 24) {
  const url = `${API_URL}/api/galeria/?page=${page}&page_size=${pageSize}`;
  const fetcher = typeof authorizedFetch === "function" ? authorizedFetch : fetch;
  const res = await fetcher(url, { method: "GET" });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(body || "No se pudo cargar la galería");
  }
  const json = await res.json();

  // Soportamos formatos: paginación tipo DRF {results: [...], count, next, previous}
  const itemsRaw = Array.isArray(json) ? json : (json?.results ?? []);
  return {
    items: itemsRaw.filter(i => (i?.activo ?? i?.estado ?? true) !== false).map(mapItem),
    next: json?.next ?? null,
    previous: json?.previous ?? null,
    count: json?.count ?? (Array.isArray(json) ? json.length : 0),
  };
}

/** Obtener todo (sin paginar) */
export async function obtenerGaleriaAll() {
  const url = `${API_URL}/api/galeria/`;
  const fetcher = typeof authorizedFetch === "function" ? authorizedFetch : fetch;
  const res = await fetcher(url, { method: "GET" });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(body || "No se pudo cargar la galería");
  }
  const data = await res.json();
  const items = Array.isArray(data) ? data : (data?.results ?? []);
  return items.filter(i => (i?.activo ?? i?.estado ?? true) !== false).map(mapItem);
}