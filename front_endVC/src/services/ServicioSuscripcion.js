// ServicioSuscritos.axios.js
import axios from "axios";

import { getAccessToken, refreshJWT, setAuthTokens, getAuthTokens } from "./auth";
const API_BASE = (import.meta.env.VITE_API_URL || "http://127.0.0.1:8000") + "/api";

/* const API_BASE = (import.meta.env.VITE_API_URL || "http://192.168.100.34:8000") + "/api"; */

const client = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
  // timeout: 10000,
});

// Request interceptor: añade Authorization si hay access token
client.interceptors.request.use((config) => {
  const access = getAccessToken();
  if (access) config.headers.Authorization = `Bearer ${access}`;
  return config;
});

// Response interceptor: si 401 y tenemos refresh, intentamos refresh y reintentar una vez
client.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    const status = error.response?.status;
    // Evitar bucles: solo reintentar una vez por petición
    if (status === 401 && !original._retry) {
      original._retry = true;
      try {
        // refreshJWT() en tu auth.js actualiza localStorage con nuevos tokens
        const newAccess = await refreshJWT();
        // axios no lee automáticamente el localStorage para esta instancia,
        // así que actualizo header y reintento
        original.headers.Authorization = `Bearer ${newAccess}`;
        return client(original);
      } catch (errRefresh) {
        // si refresh falla, limpiar tokens y propagar error
        setAuthTokens(null);
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);

// Servicios
export async function obtenerSuscritos(query = "") {
  const url = query ? `/suscritos/?${query}` : "/suscritos/";
  const res = await client.get(url);
  return res.data;
}

export async function obtenerSuscritoPorId(id) {
  const res = await client.get(`/suscritos/${id}/`);
  return res.data;
}

// in ServicioSuscritos.axios.js
export async function crearSuscripcion(payload) {
  try {
    const res = await client.post("/suscritos/", payload);
    return res.data;
  } catch (error) {
    // Re-throw the axios error but ensure response data is attached for UI
    if (error.response) {
      // include the server payload for the component
      const serverData = error.response.data;
      console.error("crearSuscripcion - server responded:", error.response.status, serverData);
      // create a new error that keeps response property
      const err = new Error("Validation error from server");
      err.response = error.response;
      throw err;
    }
    console.error("crearSuscripcion - request error:", error);
    throw error;
  }
}


export async function actualizarSuscrito(id, payload) {
  const res = await client.put(`/suscritos/${id}/`, payload);
  return res.data;
}

export async function eliminarSuscrito(id) {
  const res = await client.delete(`/suscritos/${id}/`);
  return res.status === 204 ? null : res.data;
}

export function buildSearchQuery({ q, page, page_size } = {}) {
  const params = new URLSearchParams();
  if (q) params.set("search", q);
  if (page) params.set("page", page);
  if (page_size) params.set("page_size", page_size);
  return params.toString();
}

