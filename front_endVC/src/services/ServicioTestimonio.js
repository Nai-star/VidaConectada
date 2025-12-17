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
          id: video.id,                // 🔥 ESTE ERA EL ERROR
          Descripcion: video.Descripcion,
          Video: video.Video,
        },
      };
    });
  } catch (error) {
    console.error("Error al obtener testimonios video:", error);
    return [];
  }
};

/* ===================== CREAR ===================== */
export const crearTestimonioTexto = async (data) => {
  const formData = new FormData();
  formData.append("Nombre", data.Nombre);
  formData.append("Frase", data.Frase);
  formData.append("Foto_P", data.Foto_P);
  formData.append("CustomUser", data.CustomUser);
  formData.append("Estado", true);

  return axios.post(API_URL_TEXTO, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const crearTestimonioVideo = async (data) => {
  const formData = new FormData();
  formData.append("Descripcion", data.Descripcion);
  formData.append("Video", data.Video);
  formData.append("CustomUser", data.CustomUser);
  formData.append("Estado", true);

  return axios.post(API_URL_VIDEO, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};
export const editarTestimonioTexto = (id, data) => {
  const formData = new FormData();
  formData.append("Nombre", data.Nombre);
  formData.append("Frase", data.Frase);

  if (data.Foto_P instanceof File) {
    formData.append("Foto_P", data.Foto_P);
  }

  return axios.put(`${API_URL_TEXTO}${id}/`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

/* ================= VIDEO ================= */
/* ================= VIDEO ================= */

// ELIMINAR TESTIMONIO (borra también el video por cascade)
export const eliminarTestimonioVideo = (id) => {
  return axios.delete(`${API_URL_VIDEO}${id}/`);
};

// EDITAR TESTIMONIO + VIDEO
export const editarTestimonioVideo = (id, data) => {
  const formData = new FormData();
  formData.append("Descripcion", data.Descripcion);

  if (data.Video instanceof File) {
    formData.append("Video", data.Video);
  }

  return axios.put(`${API_URL_VIDEO}${id}/`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const eliminarTestimonioTexto = (id) => {
  return axios.delete(`${API_URL_TEXTO}${id}/`);
};
