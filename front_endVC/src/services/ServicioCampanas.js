// ServicioCampanas.js
import { authorizedFetch, getAccessToken } from "./auth";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";
const CLOUDINARY_BASE = (import.meta.env.VITE_CLOUDINARY_BASE || "https://res.cloudinary.com/dfhdzszjp/").replace(/\/+$/, "");

function buildCloudinaryUrl(publicId) {
  if (!publicId) return null;
  // usa la forma estándar; ajusta si tu carpeta/transformaciones son distintas
  return `${CLOUDINARY_BASE}/image/upload/${publicId}`;
}
// ================================
// Obtener usuario actual
// ================================
export async function obtenerUsuarioActual() {
  try {
    const id = localStorage.getItem("userId");
    const res = await authorizedFetch(`${API_URL}/usuarios/${id}/`);
    console.log("Status de usuario actual:", res.status);
    if (!res.ok) return null;
    const data = await res.json();
    console.log(data);
    
    console.log("Usuario actual:", data);
    return data?.id ?? data?.pk ?? null;
  } catch (e) {
    console.warn("No se pudo obtener usuario actual:", e);
    return null;
  }
}

// ================================
// Obtener campañas
// ================================
export async function obtenerCampanas() {
  const res = await authorizedFetch(`${API_URL}/campanas/`);
  if (!res.ok) throw new Error(`Error al obtener campañas: ${res.status}`);
  const data = await res.json();

  return (Array.isArray(data) ? data : []).map((item) => {
    const imagenesRaw = item.Imagen_campana || item.imagenes || [];

    const imagenes = (Array.isArray(imagenesRaw) ? imagenesRaw : []).map(img => {
      if (img?.imagen_url) return img.imagen_url;
      const publicId = img?.imagen_public_id || img?.imagen || img;
      if (typeof publicId === 'string' && publicId.startsWith("http")) return publicId;
      return buildCloudinaryUrl(publicId);
    }).filter(Boolean);

    return {
      ...item,
      imagenes
    };
  });
}

// ================================
// Helper: YYYY-MM-DD -> DD-MM-YYYY
// ================================
function toBackendDate(fecha) {
  if (!fecha) return null;

  // Si es objeto Date
  if (fecha instanceof Date) {
    if (isNaN(fecha)) return null;
    const yyyy = fecha.getFullYear();
    const mm = String(fecha.getMonth() + 1).padStart(2, "0");
    const dd = String(fecha.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`; // <-- EL FORMATO CORRECTO
  }

  // Si no es string, intentar convertir a Date y formatear
  if (typeof fecha !== "string") {
    const d = new Date(fecha);
    if (!isNaN(d)) return toBackendDate(d);
    return null;
  }

  const s = fecha.trim();

  // Ya en formato YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;

  // DD-MM-YYYY -> convertir
  if (/^\d{2}-\d{2}-\d{4}$/.test(s)) {
    const [dd, mm, yyyy] = s.split("-");
    return `${yyyy}-${mm}-${dd}`;
  }

  // YYYY/MM/DD -> YYYY-MM-DD
  if (/^\d{4}\/\d{2}\/\d{2}$/.test(s)) {
    return s.replace(/\//g, "-");
  }

  // DD/MM/YYYY -> convertir
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(s)) {
    const [dd, mm, yyyy] = s.split("/");
    return `${yyyy}-${mm}-${dd}`;
  }

  // Intentar parsear cualquier otra cosa y formatear
  const parsed = new Date(s);
  if (!isNaN(parsed)) return toBackendDate(parsed);

  return null;
}


// ================================
// Crear campaña
// ================================
export async function crearCampana(data) {
  console.log("crearCampana - Datos de entrada:", data);

  if (!data.titulo || !String(data.titulo).trim()) throw new Error("El titulo es requerido");
  if (!data.fecha) throw new Error("La fecha es requerida");
  if (!data.Cantones && data.Cantones !== 0) throw new Error("Debe seleccionar un canton");

  let canton = Array.isArray(data.Cantones) ? data.Cantones[0] : data.Cantones;
  canton = typeof canton === "string" ? parseInt(canton, 10) : canton;
  if (Number.isNaN(canton)) throw new Error("Cantón inválido");

  const Fecha_inicio = toBackendDate(data.fecha);
  const Fecha_fin = toBackendDate(data.fechaFin || data.fecha);

  if (!Fecha_inicio || !Fecha_fin) throw new Error("Formato de fecha inválido");

  const formatHora = (h) => h ? (h.split(":").length === 3 ? h : `${h}:00`) : null;
  const Hora_inicio = formatHora(data.hora);
  const Hora_fin = formatHora(data.horaFin || data.hora);

  const usuarioId = await obtenerUsuarioActual();
  console.log("Usuario ID obtenido:", usuarioId);
  if (!usuarioId) throw new Error("Usuario no autenticado (CustomUser requerido en backend)");

  const tieneArchivo = data.imagen instanceof File;

  if (tieneArchivo) {
    const form = new FormData();
    form.append("Titulo", String(data.titulo).trim());
    form.append("Descripcion", String(data.subtitulo ?? ""));
    form.append("Fecha_inicio", Fecha_inicio);
    form.append("Fecha_fin", Fecha_fin);
    if (Hora_inicio) form.append("Hora_inicio", Hora_inicio);
    if (Hora_fin) form.append("Hora_fin", Hora_fin);
    form.append("direccion_exacta", String(data.lugar ?? ""));
    form.append("Activo", String(data.Activo !== undefined ? data.Activo : true));
    form.append("Contacto", String(data.contacto ?? "info@vidaconectada.cr"));
    form.append("Cantones", String(canton));
    //form.append("CustomUser", String(usuarioId));
    form.append("imagen", data.imagen);

    console.log(form);
    

    console.log("[ServicioCampanas] Enviando FormData (multipart) con imagen");

    const res = await authorizedFetch(`${API_URL}/campanas/`, {
      method: "POST",
      body: form // NO poner Content-Type, browser lo hace
    });

    const texto = await res.text();
    if (!res.ok) {
      try { throw new Error(`Error ${res.status}: ${JSON.stringify(JSON.parse(texto))}`); }
      catch { throw new Error(`Error ${res.status}: ${texto}`); }
    }
    return JSON.parse(texto);
  }

  // JSON normal si no hay archivo
  const body = {
    Titulo: String(data.titulo).trim(),
    Descripcion: String(data.subtitulo ?? ""),
    Fecha_inicio,
    Fecha_fin,
    Hora_inicio,
    Hora_fin,
    direccion_exacta: String(data.lugar ?? ""),
    Activo: data.Activo !== undefined ? data.Activo : true,
    Contacto: String(data.contacto ?? "info@vidaconectada.cr"),
    Cantones: canton,
    //CustomUser: usuarioId
  };

  console.log("Body a enviar:", body);

  const res = await authorizedFetch(`${API_URL}/campanas/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  const texto = await res.text();
  if (!res.ok) {
    try { throw new Error(`Error ${res.status}: ${JSON.stringify(JSON.parse(texto))}`); }
    catch { throw new Error(`Error ${res.status}: ${texto}`); }
  }

  return JSON.parse(texto);
}

// ================================
// Actualizar campaña
// ================================
export async function actualizarCampana(id, data) {
  const fechaInicio = data.Fecha_inicio ? toBackendDate(data.Fecha_inicio) : null;
  const fechaFin = data.Fecha_fin ? toBackendDate(data.Fecha_fin) : null;

  let canton = Array.isArray(data.Cantones) ? data.Cantones[0] : data.Cantones;
  canton = typeof canton === "string" ? parseInt(canton, 10) : canton;

  const body = { ...data, Fecha_inicio: fechaInicio, Fecha_fin: fechaFin, Cantones: canton };

  const res = await authorizedFetch(`${API_URL}/campanas/${id}/`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(JSON.stringify(error));
  }

  return await res.json();
}

// ================================
// Eliminar campaña
// ================================
export async function eliminarCampana(id) {
  const res = await authorizedFetch(`${API_URL}/campanas/${id}/`, { method: "DELETE" });
  if (!res.ok) throw new Error("No se pudo eliminar la campaña");
  return true;
}
