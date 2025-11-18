// src/services/ServicioCampanas.js
import { authorizedFetch } from "./auth";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
const CLOUDINARY_BASE = import.meta.env.VITE_CLOUDINARY_BASE || "https://res.cloudinary.com/dfhdzszjp/";

/* ---------- Helpers para Cloudinary / URL de imágenes ---------- */
function extractImageUrl(rawImagen) {
  if (!rawImagen) return "";

  // string
  if (typeof rawImagen === "string" && rawImagen.trim()) {
    if (rawImagen.startsWith("http")) return rawImagen;
    if (rawImagen.startsWith("/")) return `${API_URL}${rawImagen}`;
    return `${CLOUDINARY_BASE}${rawImagen}`;
  }

  // objeto con url
  if (typeof rawImagen === "object") {
    if (rawImagen.url) return rawImagen.url;
    if (rawImagen.secure_url) return rawImagen.secure_url;
    if (rawImagen.secureUrl) return rawImagen.secureUrl;
    // En Cloudinary a veces está dentro de 'imagen' => { 'url': ... } o 'imagen': '...'
  }

  // array
  if (Array.isArray(rawImagen) && rawImagen.length) {
    const first = rawImagen[0];
    return extractImageUrl(first);
  }

  return "";
}

/* ---------- Utilidades de fecha / UI ---------- */
function fmtFecha(date) {
  try {
    return new Intl.DateTimeFormat("es-CR", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(date);
  } catch {
    return date.toISOString().slice(0, 10);
  }
}
function fmtHora(date) {
  try {
    return new Intl.DateTimeFormat("es-CR", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(date);
  } catch {
    return date.toTimeString().slice(0, 5);
  }
}
function calcProgreso(d1, d2) {
  const start = d1.getTime();
  const end = d2.getTime();
  const now = Date.now();
  if (now <= start) return 15;
  if (now >= end) return 95;
  const pct = Math.round(((now - start) / (end - start)) * 100);
  return Math.max(15, Math.min(95, pct));
}
function calcUrgencia(d1) {
  const days = Math.ceil((d1.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  if (days <= 3) return { urgency: "Urgente", urgencyClass: "urgente" };
  if (days <= 10) return { urgency: "Media", urgencyClass: "media" };
  return { urgency: "", urgencyClass: "" };
}

/* ---------- Normalizador de campañas (mapea el raw del backend a UI) ---------- */
function normalizeLugar(lugarRaw) {
  if (!lugarRaw) return null;

  // Si viene como array (related_name suele devolver lista), tomar el primero
  const lugar = Array.isArray(lugarRaw) ? lugarRaw[0] : lugarRaw;

  const nombre = lugar?.Nombre_lugar ?? lugar?.nombre ?? "";
  const canton = lugar?.Canton ?? lugar?.canton ?? "";
  const direccion = lugar?.Direcion ?? lugar?.Direccion ?? lugar?.direccion ?? "";

  const ubicacionParts = [];
  if (nombre) ubicacionParts.push(nombre);
  if (canton) ubicacionParts.push(canton);
  if (direccion) ubicacionParts.push(direccion);

  return {
    raw: lugar,
    nombre,
    canton,
    direccion,
    texto: ubicacionParts.join(", ") || "Ubicación por confirmar",
  };
}

function mapCampana(raw) {
  const inicio = raw?.Fecha_inicio ? new Date(raw.Fecha_inicio) : null;
  const fin = raw?.Fecha_fin ? new Date(raw.Fecha_fin) : null;

  const { urgency, urgencyClass } = inicio ? calcUrgencia(inicio) : { urgency: "", urgencyClass: "" };

  // LUGAR: el related_name en tu modelo es "Lugar_campana" — puede venir como lista
  const lugarInfo = normalizeLugar(raw?.Lugar_campana ?? raw?.lugar_campana ?? null);
  const ubicacionTexto = lugarInfo?.texto ?? "Ubicación por confirmar";

  // IMAGENES: related_name "Imagen_campana" -> normalmente es un array de objetos
  // Cada objeto probablemente tiene la propiedad 'imagen' (CloudinaryField)
  let imgUrl = "";

  // 1) Si la campaña tiene campo directo (por seguridad)
  if (raw?.imagen) imgUrl = extractImageUrl(raw.imagen);

  // 2) Si hay relación Imagen_campana (array u objeto)
  if (!imgUrl && raw?.Imagen_campana) {
    const imgs = Array.isArray(raw.Imagen_campana) ? raw.Imagen_campana : [raw.Imagen_campana];
    if (imgs.length) {
      // cada item puede ser { imagen: "image/upload/..." } o { imagen: { url: "..." } }
      const first = imgs[0];
      // buscar la propiedad que contenga la ruta
      const candidate = first?.imagen ?? first?.image ?? first?.foto ?? first;
      imgUrl = extractImageUrl(candidate);
    }
  }

  // 3) si aún no hay imagen, intentar en lugar (por si el lugar tiene foto)
  if (!imgUrl && lugarInfo?.raw) {
    const lugarImgCandidate = lugarInfo.raw?.imagen ?? lugarInfo.raw?.foto ?? lugarInfo.raw?.imagen_url;
    imgUrl = extractImageUrl(lugarImgCandidate);
  }

  // Requisitos: soportar string o array
  let requisitos = [];
  if (Array.isArray(raw?.requisitos)) requisitos = raw.requisitos;
  else if (typeof raw?.requisitos === "string" && raw.requisitos.trim()) {
    requisitos = raw.requisitos.split(/\r?\n|,/).map(s => s.trim()).filter(Boolean);
  } else if (Array.isArray(raw?.Requisitos)) requisitos = raw.Requisitos;

  return {
    id: raw?.id ?? null,
    titulo: raw?.Titulo ?? raw?.titulo ?? "Campaña sin título",
    descripcion: raw?.Descripcion ?? raw?.descripcion ?? "",
    fechaInicio: inicio,
    fechaFin: fin,
    fechaTexto: inicio ? fmtFecha(inicio) : "",
    horarioTexto: inicio && fin ? `${fmtHora(inicio)} - ${fmtHora(fin)}` : "",
    activo: (raw?.Activo ?? raw?.activo) !== false,
    contacto: raw?.Contacto ?? raw?.contacto ?? "—",
    ubicacion: ubicacionTexto,
    progreso: inicio && fin ? calcProgreso(inicio, fin) : 0,
    requisitos,
    urgency,
    urgencyClass,
    imagen: imgUrl,   // URL ya lista para usar en <img src=...>
    raw,
  };
}

/* ---------- Servicios públicos ---------- */
export async function obtenerCampanasActivas() {
  const url = `${API_URL}/api/campanas/`;
  const fetcher = typeof authorizedFetch === "function" ? authorizedFetch : fetch;
  const res = await fetcher(url, { method: "GET" });
  console.log(res);
  

  if (!res.ok) {
    const msg = await res.text().catch(() => "");
    console.error("ServicioCampanas: error al obtener campañas:", res.status, msg);
    throw new Error(msg || "No se pudieron cargar las campañas.");
  }

  const data = await res.json();
  const items = Array.isArray(data) ? data : (data?.results ?? []);
  const activos = items.filter(i => (i?.Activo ?? i?.activo ?? true) !== false);
  const mapped = activos.map(mapCampana);
  console.debug("ServicioCampanas: campañas mapeadas", mapped);
  return mapped;
}

/* ---------- CRUD para admin (opcional) ---------- */
export async function crearCampana(payload) {
  const url = `${API_URL}/api/campanas/`;
  const fetcher = typeof authorizedFetch === "function" ? authorizedFetch : fetch;
  const res = await fetcher(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(body || "Error creando campaña");
  }
  return res.json();
}

export async function actualizarCampana(id, payload) {
  const url = `${API_URL}/api/campanas/${id}/`;
  const fetcher = typeof authorizedFetch === "function" ? authorizedFetch : fetch;
  const res = await fetcher(url, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(body || "Error actualizando campaña");
  }
  return res.json();
}

export async function eliminarCampana(id) {
  const url = `${API_URL}/api/campanas/${id}/`;
  const fetcher = typeof authorizedFetch === "function" ? authorizedFetch : fetch;
  const res = await fetcher(url, { method: "DELETE" });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(body || "Error eliminando campaña");
  }
  return true;
}

/* ---------- Obtener lugares de campaña (tabla Lugar_campana) ---------- */
/**
 * Obtiene todos los lugares de campaña.
 * Endpoint esperado: GET /api/lugares-campana/
 * Cada ítem: { id, Nombre_lugar, Canton, Direcion, Campana_id, ... }
 */
export async function obtenerLugaresCampana() {
  const url = `${API_URL}/api/lugares-campana`;
  const fetcher = typeof authorizedFetch === "function" ? authorizedFetch : fetch;
  const res = await fetcher(url, { method: "GET" });

  if (!res.ok) {
    const msg = await res.text().catch(() => "");
    console.error("ServicioCampanas: error al obtener lugares:", res.status, msg);
    throw new Error(msg || "No se pudieron cargar los lugares de campaña.");
  }

  const data = await res.json();
  const items = Array.isArray(data) ? data : (data?.results ?? []);

  // Normalizamos los campos para el frontend
  return items.map(l => ({
    id: l.id ?? null,
    nombre: l.Nombre_lugar ?? l.nombre ?? "",
    canton: l.Canton ?? l.canton ?? "",
    direccion: l.Direcion ?? l.Direccion ?? l.direccion ?? "",
    // 🔹 Aquí está el cambio importante:
    campanaId: l.Campana_id ?? l.campana_id ?? null,
    raw: l,
  }));
}
