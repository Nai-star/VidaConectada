/// ServicioCampanas.js
import { authorizedFetch } from "./auth";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

const CLOUDINARY_BASE = (import.meta.env.VITE_CLOUDINARY_BASE || "https://res.cloudinary.com/dfhdzszjp/")
  .replace(/\/+$/, "");

function buildCloudinaryUrl(publicId) {
  if (!publicId) return null;
  return `${CLOUDINARY_BASE}/image/upload/${publicId}`;
}

// ======================================
//  ✔️ OBTENER CAMPAÑAS
// ======================================
export async function obtenerCampanas() {
  const res = await authorizedFetch(`${API_URL}/campanas`);
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

// ======================================
//  🔥 AQUI ESTABA EL PROBLEMA
//  ✔️ FUNCIÓN PARA CREAR CAMPAÑA
// ======================================
export async function crearCampana(data) {
  // convertir fecha al formato DD-MM-YYYY
  const partes = data.fecha.split("-");
  const fechaFormateada = `${partes[2]}-${partes[1]}-${partes[0]}`;

  const body = {
    Titulo: data.titulo,
    Descripcion: data.subtitulo,
    Fecha_inicio: fechaFormateada,
    Fecha_fin: fechaFormateada,
    Hora_inicio: data.hora + ":00",
    Hora_fin: data.hora + ":00",
    direccion_exacta: data.lugar,
    Activo: true,
    Contacto: "info@vidaconectada.cr",
    Cantones: null
  };

  const res = await authorizedFetch(`${API_URL}/campanas`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error("Error al crear la campaña");
  }

  return await res.json();
}