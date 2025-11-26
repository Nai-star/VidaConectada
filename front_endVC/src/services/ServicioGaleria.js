// ServicioGaleria.js
import { authorizedFetch } from "./auth";

const API_URL = import.meta.env.VITE_API_URL || "http://192.168.100.34:8000";
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
    // Cloudinary and other object shapes
    if (rawImagen.url) return rawImagen.url;
    if (rawImagen.secure_url) return rawImagen.secure_url;
    if (rawImagen.path) return rawImagen.path;
  }
  if (Array.isArray(rawImagen) && rawImagen.length) {
    const first = rawImagen[0];
    if (typeof first === "string") return first;
    if (first?.url) return first.url;
    if (first?.secure_url) return first.secure_url;
  }
  return "";
}

/** Normaliza un item de galería (admite campos en español e inglés) */
function mapItem(raw) {
  if (!raw) return null;

  // posibles nombres donde se puede almacenar la imagen
  const candidateImage = raw.image_url ?? raw.imagen_g ?? raw.imagen ?? raw.image ?? raw.foto ?? raw.file;
  const image_url = extractImageUrl(candidateImage);

  // posibles nombres para video
  const video_url = raw.video_url ?? raw.video ?? raw.videoUrl ?? "";

  // posibles nombres para la descripción/texto
  const caption = raw.caption ?? raw.descripcion ?? raw.description ?? raw.text ?? "";

  // posibles nombres para título
  const title = raw.title ?? raw.titulo ?? raw.name ?? "";

  // si no hay media, ignorar
  if (!image_url && !video_url) return null;

  return {
    id: raw.id ?? null,
    title,
    caption,
    image_url,
    video_url,
    raw, // útil para debugging
  };
}

/** Obtiene todas las imágenes activas */
export async function obtenerGaleriaActiva() {
  const url = `${API_URL}/api/galeria/`;
  const fetcher = typeof authorizedFetch === "function" ? authorizedFetch : fetch;
  const res = await fetcher(url, { method: "GET" });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(body || "No se pudo cargar la galería");
  }
  const data = await res.json();
  const items = Array.isArray(data) ? data : (data?.results ?? []);
  // mapear y filtrar nulos y activos
  return items
    .map(mapItem)
    .filter(Boolean)
    .filter(i => (i?.raw?.activo ?? i?.raw?.estado ?? true) !== false);
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

/** Obtener galería (paginada). */
export async function obtenerGaleriaPaginada(page = 1, pageSize = 24) {
  const url = `${API_URL}/api/galeria/?page=${page}&page_size=${pageSize}`;
  const fetcher = typeof authorizedFetch === "function" ? authorizedFetch : fetch;
  const res = await fetcher(url, { method: "GET" });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(body || "No se pudo cargar la galería");
  }
  const json = await res.json();
  const itemsRaw = Array.isArray(json) ? json : (json?.results ?? []);
  const mapped = itemsRaw.map(mapItem).filter(Boolean);
  const visible = mapped.filter(i => (i?.raw?.activo ?? i?.raw?.estado ?? true) !== false);
  return {
    items: visible,
    next: json?.next ?? null,
    previous: json?.previous ?? null,
    count: json?.count ?? (Array.isArray(json) ? json.length : mapped.length),
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
  return items.map(mapItem).filter(Boolean);
}
