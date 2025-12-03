// ServicioCustomUser.js
import axios from "axios";

const API_BASE_URL = (import.meta.env.VITE_API_URL || "http://127.0.0.1:8000").replace(/\/$/, "") + "/api";

/* const API_BASE_URL = import.meta.env.VITE_API_URL || "http://192.168.100.34:8000/api"; */

/**
 * Intenta obtener información del usuario por correo.
 * Devuelve el objeto user si existe, o null si no existe (404).
 * Lanza error si hay problema de red o servidor.
 *
 * Ajusta la URL del endpoint según tu backend:
 * - /customuser/?email=...
 * - /users/?email=...
 * - /auth/users/?email=...
 *
 * Si tu backend exige autenticación, añade headers o usa tu helper authorizedFetch.
 */
export async function checkCustomUser(email) {
  if (!email) return null;
  const encoded = encodeURIComponent(email.trim().toLowerCase());

  // Lista de endpoints a intentar (ordena por el que uses en tu backend)
  const endpoints = [
    `${API_BASE_URL}/customuser/?email=${encoded}`,
    `${API_BASE_URL}/users/?email=${encoded}`,
    `${API_BASE_URL}/auth/users/?email=${encoded}`,
    `${API_BASE_URL}/customuser/by-email/?email=${encoded}`,
    `${API_BASE_URL}/usuarios/?email=${encoded}`
  ];

  for (const url of endpoints) {
    try {
      const res = await axios.get(url);
      // Asumimos que si la respuesta trae lista devolvemos el primer elemento
      if (res.status === 200 && res.data) {
        const data = res.data;
        // Si API devuelve array con resultados: take first
        if (Array.isArray(data) && data.length > 0) return data[0];
        // Si devuelve objeto con resultados en 'results' (DRF paginado)
        if (data.results && Array.isArray(data.results) && data.results.length > 0) return data.results[0];
        // Si devuelve objeto único
        if (typeof data === "object" && !Array.isArray(data)) return data;
      }
    } catch (err) {
      // Si status 404 -> usuario no existe, probar siguiente endpoint
      if (err.response && err.response.status === 404) continue;
      // Si 400 u otro -> puede que endpoint no exista o no acepte ese filtro, probar siguiente
      // Si error de red (no response) o 500 -> parar y re-lanzar para que el UI lo capture
      if (!err.response || (err.response && err.response.status >= 500)) {
        console.error("checkCustomUser: error grave al consultar", url, err);
        throw err;
      }
      // en caso de 400/422/405 seguimos probando otros endpoints
      continue;
    }
  }

  // Si ninguno devolvió, retornamos null (no existe o no hay endpoint compatible)
  return null;
}

/* ============================================================
   🔹 5. CREAR Banner (Admin) — acepta archivo o URL
============================================================ */
export async function crearBannerAdminArchivoUrl(data) {
  const url = `${API_URL}/api/carusel/`;
  const fetcher = typeof authorizedFetch === "function" ? authorizedFetch : fetch;

  // data debe traer: { file?, url?, texto, filtro_oscuro, mostrar_texto }
  const formData = new FormData();

  // Si envía archivo (Blob/File)
  if (data.file instanceof File) {
    formData.append("imagen", data.file);
  }

  // Si envía URL (en string)
  if (data.url && !data.file) {
    formData.append("imagen", data.url);
  }

  formData.append("texto", data.texto || "");
  formData.append("filtro_oscuro", data.filtro_oscuro ? "true" : "false");
  formData.append("mostrar_texto", data.mostrar_texto ? "true" : "false");
  formData.append("estado", "true");

  try {
    const res = await fetcher(url, {
      method: "POST",
      body: formData, // NO JSON
    });

    if (!res.ok) {
      console.error("ServicioCarrusel (admin): error creando banner", await res.text());
      throw new Error("Error al crear banner (admin)");
    }

    return await res.json();
  } catch (error) {
    console.error("ServicioCarrusel: error interno creando banner admin", error);
    throw error;
  }
}

