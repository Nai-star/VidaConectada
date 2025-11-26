// ServicioTestimonio.js
import axios from "axios";

const API_URL_TEXTO = "http://localhost:8000/api/Testimonio_texto/";
const API_URL_VIDEO = "http://localhost:8000/api/Testimonio_video/";

// Ajusta tu Cloudinary Cloud Name aquí
const CLOUDINARY_BASE_URL = "https://res.cloudinary.com/vida-conectada/"; 

function normalizarUrl(url) {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  return `${CLOUDINARY_BASE_URL}${url}`;
}

export const getTestimoniosTexto = async () => {
  try {
    const res = await axios.get(API_URL_TEXTO);
    const data = res.data || [];

    return data.map((t) => {
      return {
        id: t.id,
        CustomUser: t.CustomUser,
        Estado: t.Estado,
        fecha_publicacion: t.fecha_publicacion,
        Nombre: t.Nombre || "",
        Frase: t.Frase || "",
        Foto_P: normalizarUrl(t.Foto_P),
      };
    });
  } catch (error) {
    console.error("Error al obtener testimonios de texto:", error);
    return [];
  }
};

export const getTestimoniosVideo = async () => {
  try {
    const res = await axios.get(API_URL_VIDEO);
    const data = res.data || [];

    return data.map((v) => {
      const video = v.Testimonio_video?.[0] || {};
      return {
        id: v.id,
        CustomUser: v.CustomUser,
        Estado: v.Estado,
        fecha_publicacion: v.fecha_publicacion,
        video: {
          Descripcion: video.Descripcion,
          Video: video.Video, // deja tal cual, sin normalizar
        },
      };
    });
  } catch (error) {
    console.error("Error al obtener testimonios video:", error);
    return [];
  }
};
