import { authorizedFetch } from "./auth";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
// puedes definir en .env: VITE_CLOUDINARY_BASE=https://res.cloudinary.com/tu_cloud_name/
const CLOUDINARY_BASE = import.meta.env.VITE_CLOUDINARY_BASE || "https://res.cloudinary.com/dfhdzszjp/";

/** Extrae una URL desde distintos formatos posibles de 'imagen' */
function extractImageUrl(rawImagen) {
  if (!rawImagen) return "";

  // si ya es string (url)
  if (typeof rawImagen === "string" && rawImagen.trim()) {
    // ruta relativa devuelta por el backend (ej: "image/upload/..")
    if (rawImagen.startsWith("http")) return rawImagen;
    if (rawImagen.startsWith("/")) return `${API_URL}${rawImagen}`;
    // si parece la ruta de Cloudinary que devuelve tu backend: añade el prefijo
    return `${CLOUDINARY_BASE}${rawImagen}`;
  }

  // objeto con url o secure_url
  if (typeof rawImagen === "object") {
    if (rawImagen.url) return rawImagen.url;
    if (rawImagen.secure_url) return rawImagen.secure_url;
    if (rawImagen.secureUrl) return rawImagen.secureUrl;
  }

  // array: [{url:...}, ...]
  if (Array.isArray(rawImagen) && rawImagen.length) {
    const first = rawImagen[0];
    if (typeof first === "string") return first;
    if (first?.url) return first.url;
    if (first?.secure_url) return first.secure_url;
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
  // Si no tienes authorizedFetch (auth), reemplaza por fetch(url)
  const fetcher = typeof authorizedFetch === "function" ? authorizedFetch : fetch;

  const res = await fetcher(url, { method: "GET" });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    console.error("ServicioCarrusel: fetch error", res.status, body);
    throw new Error(body || "No se pudo cargar el carrusel");
  }

  const data = await res.json();
  const items = Array.isArray(data) ? data : [];

  // guarda log para depurar
  console.debug("ServicioCarrusel: items raw", items);

  return items
    .filter(i => (i?.estado ?? i?.activo ?? true) !== false)
    .map(mapItem);
}
