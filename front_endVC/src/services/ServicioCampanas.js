// ServicioCampanas.js
import { authorizedFetch } from "./auth";

/* const API_URL = "http://192.168.100.34:8000/api"; */
const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

const CLOUDINARY_BASE = (import.meta.env.VITE_CLOUDINARY_BASE || "https://res.cloudinary.com/dfhdzszjp/").replace(/\/+$/, "");

function buildCloudinaryUrl(publicId) {
  if (!publicId) return null;
  // usa la forma estándar; ajusta si tu carpeta/transformaciones son distintas
  return `${CLOUDINARY_BASE}/image/upload/${publicId}`;
}

export async function obtenerCampanas() {
  const res = await authorizedFetch(`${API_URL}/campanas`);
  const data = await res.json();

  // Normaliza cada campaña
  return (Array.isArray(data) ? data : []).map((item) => {
    // Normalizar imágenes: la API puede devolver Imagen_campana como [{imagen, imagen_public_id, imagen_url}, ...]
    const imagenesRaw = item.Imagen_campana || item.imagenes || [];
    const imagenes = (Array.isArray(imagenesRaw) ? imagenesRaw : []).map(img => {
      // si API ya dio imagen_url, úsala
      if (img?.imagen_url) return img.imagen_url;

      // si la API devolvió public_id u otro string en 'imagen' o 'imagen_public_id'
      const publicId = img?.imagen_public_id || img?.imagen || img;
      // si ya es URL completa (empieza con http), retornarla
      if (typeof publicId === 'string' && publicId.startsWith('http')) return publicId;

      // construir con cloudinary base
      const url = buildCloudinaryUrl(publicId);
      return url;
    }).filter(Boolean);

    // Normalizar requisitos:
    // - Si DetalleRequisito viene como [{ Requisitos: {id, requisitos, Estado}, ... }]
    // - o si vienen ya como array de strings
    const detallesRaw = item.DetalleRequisito || item.detalle_requisito || item.DetalleRequisitos || [];
    const requisitosObj = (Array.isArray(detallesRaw) ? detallesRaw : []).map(d => {
      const r = d?.Requisitos ?? d; // si d es ya el objeto requisito o si está anidado
      if (!r) return null;
      // devolver un objeto sencillo y primitivo que sea fácil de renderizar
      return {
        id: r.id ?? null,
        texto: r.requisitos ?? r.texto ?? r.requerimiento ?? String(r.id ?? ''),
        estado: r.Estado ?? r.estado ?? null
      };
    }).filter(Boolean);

    // También permitir que item.requisitos ya exista como array de strings/objetos
    let requisitosFinal = [];
    if (Array.isArray(item.requisitos) && item.requisitos.length > 0) {
      requisitosFinal = item.requisitos.map(r => {
        if (typeof r === 'string') return { id: null, texto: r, estado: null };
        return { id: r.id ?? null, texto: r.requisitos ?? r.texto ?? String(r.id ?? ''), estado: r.Estado ?? null };
      });
    } else {
      requisitosFinal = requisitosObj;
    }

    return {
      ...item,
      imagenes,
      requisitos: requisitosFinal, // array uniforme: [{id, texto, estado}, ...]
      // mantengo estructuras originales por compatibilidad si las usas en otro sitio:
      Imagen_campana: item.Imagen_campana || [],
      DetalleRequisito: item.DetalleRequisito || []
    };
  });
}
