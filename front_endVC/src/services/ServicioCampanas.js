
import { authorizedFetch } from "./auth";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const CLOUDINARY_BASE = import.meta.env.VITE_CLOUDINARY_BASE || "https://res.cloudinary.com/dfhdzszjp/";

/** Formatea fecha/hora en es-CR */
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

/** Progreso visual: % del tiempo transcurrido entre inicio y fin */
function calcProgreso(d1, d2) {
  const start = d1.getTime();
  const end = d2.getTime();
  const now = Date.now();
  if (now <= start) return 15;      // antes de iniciar, 15% para que se vea
  if (now >= end) return 95;        // si terminó, casi lleno
  const pct = Math.round(((now - start) / (end - start)) * 100);
  return Math.max(15, Math.min(95, pct));
}

/** Urgencia simple: según la cercanía */
function calcUrgencia(d1) {
  const days = Math.ceil((d1.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  if (days <= 3) return { urgency: "Urgente", urgencyClass: "urgente" };
  if (days <= 10) return { urgency: "Media", urgencyClass: "media" };
  return { urgency: "", urgencyClass: "" };
}

/** Normaliza una campaña del backend a la UI */
function mapCampana(raw) {
  const inicio = new Date(raw.Fecha_inicio);
  const fin = new Date(raw.Fecha_fin);

  const { urgency, urgencyClass } = calcUrgencia(inicio);

  // Lugar: trata de tomar un nombre o dirección que venga del FK
  const lugar =
    raw.Lugar_campana?.nombre ||
    raw.Lugar_campana?.direccion ||
    raw.Lugar_campana?.ubicacion ||
    "Ubicación por confirmar";

  // Requisitos (si tu API no los trae aún, puedes derivar o dejar vacío)
  const requisitos = raw.requisitos || []; // opcional

  return {
    id: raw.id,
    titulo: raw.Titulo,
    descripcion: raw.Descripcion,
    fechaInicio: inicio,
    fechaFin: fin,
    fechaTexto: fmtFecha(inicio),
    horarioTexto: `${fmtHora(inicio)} - ${fmtHora(fin)}`,
    activo: raw.Activo !== false,
    contacto: raw.Contacto || "—",
    ubicacion: lugar,
    progreso: calcProgreso(inicio, fin),
    requisitos,
    urgency,
    urgencyClass,
  };
}

/** GET: campañas activas */
export async function obtenerCampanasActivas() {
  const url = `${API_URL}/api/campanas/`; // según tus rutas
  const res = await authorizedFetch(url, { method: "GET" });
  if (!res.ok) {
    const msg = await res.text().catch(() => "");
    throw new Error(msg || "No se pudieron cargar las campañas.");
  }
  const data = await res.json();
  const items = Array.isArray(data) ? data : [];
  return items.filter(i => i.Activo !== false).map(mapCampana);
}

/** (Opcional) CRUD para admin */
export async function crearCampana(payload) {
  const url = `${API_URL}/api/campanas/`;
  const res = await authorizedFetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function actualizarCampana(id, payload) {
  const url = `${API_URL}/api/campanas/${id}/`;
  const res = await authorizedFetch(url, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function eliminarCampana(id) {
  const url = `${API_URL}/api/campanas/${id}/`;
  const res = await authorizedFetch(url, { method: "DELETE" });
  if (!res.ok) throw new Error(await res.text());
  return true;
}



