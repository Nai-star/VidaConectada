// ServicioGaleriaAdmin.js
import { authorizedFetch } from "./auth";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

// URL de subida a Cloudinary
const CLOUDINARY_BASE = "https://api.cloudinary.com/v1_1/dfhdzszjp/image/upload";
// Preset de subida (debes crearlo en tu panel Cloudinary)
const CLOUDINARY_UPLOAD_PRESET = "galeria_unsigned"; 

/**
 * Crear un item en la galería (admin)
 * @param {File} file - Archivo a subir (imagen o video)
 * @param {string} descripcion - Descripción del item
 * @param {boolean} activo - Si el item está activo
 */
export async function crearGaleriaAdmin({ file, descripcion = "", activo = true }) {
  if (!file) throw new Error("Debe proporcionar un archivo");

  // 1️⃣ Obtener el usuario logueado
 const userId = localStorage.getItem("userId"); // devuelve "3" como string
 if (!userId) throw new Error("No se encontró el usuario logueado");

  // 2️⃣ Subir a Cloudinary
  const formCloud = new FormData();
  formCloud.append("file", file);
  formCloud.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

  const cloudRes = await fetch(CLOUDINARY_BASE, {
    method: "POST",
    body: formCloud,
  });

  if (!cloudRes.ok) {
    const body = await cloudRes.text().catch(() => "");
    throw new Error(body || "No se pudo subir el archivo a Cloudinary");
  }

  const cloudData = await cloudRes.json();
  const urlDeCloudinary = cloudData.secure_url; // URL pública del archivo

  // 3️⃣ Enviar al backend
  const formData = new FormData();
  formData.append("imagen_g", urlDeCloudinary); // ahora es una URL
  formData.append("descripcion", descripcion);
  formData.append("activo", activo);
  formData.append("CustomUser", userId);

  const res = await authorizedFetch(`${API_URL}/api/galeria/`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(body || "No se pudo crear el elemento de galería");
  }

  return await res.json();
}

/** Listar items de galería (admin) */
export async function listarGaleriaAdmin() {
  const res = await authorizedFetch(`${API_URL}/api/galeria/`, {
    method: "GET",
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(body || "No se pudo cargar la galería");
  }
  const data = await res.json();
  return Array.isArray(data) ? data : data?.results ?? [];
}

/** Eliminar un item de la galería (admin) */
export async function eliminarGaleriaAdmin(id) {
  if (!id) throw new Error("Debe proporcionar un id");
  const res = await authorizedFetch(`${API_URL}/api/galeria/${id}/`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(body || "No se pudo eliminar el elemento de galería");
  }
  return true;
}


/** Cambiar el estado activo de un item de galería */
export async function cambiarEstadoGaleriaAdmin(id, nuevoEstado) {
  if (!id) throw new Error("Debe proporcionar un id");
  
  const formData = new FormData();
  formData.append("activo", nuevoEstado);

  const res = await authorizedFetch(`${API_URL}/api/galeria/${id}/`, {
    method: "PATCH",
    body: formData,
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(body || "No se pudo actualizar el estado del item");
  }

  return await res.json();
}
