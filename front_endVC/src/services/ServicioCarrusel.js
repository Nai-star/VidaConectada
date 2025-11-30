import { authorizedFetch } from "./auth";

/* const API_URL = (import.meta.env.VITE_API_URL || "http://192.168.100.90:8000").replace(/\/+$/, ""); */
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

  // arrays
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

    if (/^https?:\/\//i.test(s) || /^\/\//.test(s)) return s;
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

/* ============================================================
   🔹 1. OBTENER SOLO ACTIVOS (tu función original)
============================================================ */
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

  const contentType = res.headers?.get?.("content-type") ?? "";
  let data;

  try {
    if (res.status === 204) {
      data = [];
    } else if (contentType.includes("application/json")) {
      data = await res.json();
    } else {
      const text = await res.text().catch(() => "");
      data = text ? JSON.parse(text) : [];
    }
  } catch (err) {
    console.error("ServicioCarrusel: fallo al parsear respuesta", err);
    throw new Error("Error al procesar la respuesta del carrusel");
  }

  const items = Array.isArray(data) ? data : [];
  return items
    .filter(i => (i?.estado ?? i?.activo ?? true) !== false)
    .map(mapItem);
}

/* ============================================================
   🔹 2. OBTENER TODOS los banners (Activos + Inactivos)
============================================================ */
export async function obtenerTodosLosBanners() {
  const url = `${API_URL}/api/carusel/`;
  const fetcher = typeof authorizedFetch === "function" ? authorizedFetch : fetch;

  let res;
  
  try {
    res = await fetcher(url, { method: "GET" });
  } catch (err) {
    console.error("ServicioCarrusel: error de red", err);
    throw new Error("Error de red al cargar los banners");
  }

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    console.error("ServicioCarrusel: fetch error", res.status, txt);
    throw new Error(`Error ${res.status}`);
  }

  const data = await res.json().catch(() => []);
  return Array.isArray(data) ? data.map(mapItem) : [];
}

/* ============================================================
   🔹 3. CREAR Banner
============================================================ */
export async function crearBanner(data) {
  const url = `${API_URL}/api/carusel/`;
  const fetcher = typeof authorizedFetch === "function" ? authorizedFetch : fetch;

  const res = await fetcher(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      imagen: data.imagen,
      texto: data.texto,
      filtro_oscuro: data.filtro_oscuro ?? false,
      mostrar_texto: data.mostrar_texto ?? true,
      estado: true
    }),
  });

  if (!res.ok) {
    console.error("ServicioCarrusel: error creando banner", await res.text());
    throw new Error("Error al crear banner");
  }

  return mapItem(await res.json());
}

/* ============================================================
   🔹 4. ELIMINAR Banner
============================================================ */
export async function eliminarBanner(id) {
  const url = `${API_URL}/api/carusel/${id}/`;
  const fetcher = typeof authorizedFetch === "function" ? authorizedFetch : fetch;

  const res = await fetcher(url, {
    method: "DELETE"
  });

  if (!res.ok) {
    console.error("ServicioCarrusel: error eliminando", await res.text());
    throw new Error("Error al eliminar banner");
  }

  return true;
}
