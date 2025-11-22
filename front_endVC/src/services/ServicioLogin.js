// src/services/ServicioLogin.js
import axios from "axios";

const BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
const LOGIN_API_URL = `${BASE.replace(/\/$/, "")}/api/login/admin/`;

/**
 * Envía { email, password } al endpoint /api/login/admin/
 * Normaliza los errores para que el frontend muestre mensajes amigables.
 */
export const loginAdmin = async (email, password) => {
  try {
    const response = await axios.post(
      LOGIN_API_URL,
      { email, password },
      {
        headers: { "Content-Type": "application/json" },
        // Si tu backend usa cookies HttpOnly (sesión), habilita withCredentials: true
        // withCredentials: true,
        timeout: 10000,
      }
    );

    const { access, refresh, user_id, user_email } = response.data || {};

    // Almacena tokens (si usas JWT en el frontend). Considera alternativas seguras.
    if (access) localStorage.setItem("accessToken", access);
    if (refresh) localStorage.setItem("refreshToken", refresh);
    if (user_email) localStorage.setItem("userEmail", user_email);
    if (user_id) localStorage.setItem("userId", String(user_id));

    return {
      userId: user_id,
      email: user_email,
      accessToken: access,
    };
  } catch (error) {
    console.error("loginAdmin error:", error);

    // No response -> problema de red / CORS / servidor caído
    if (!error.response) {
      throw new Error(
        "No hay respuesta del servidor. ¿Está corriendo el backend en http://127.0.0.1:8000?"
      );
    }

    const data = error.response.data;

    // 1) Si la API devuelve { detail: "..." }
    if (data?.detail) {
      throw new Error(String(data.detail));
    }

    // 2) DRF suele devolver { non_field_errors: [...] } para errores de autenticación
    if (data?.non_field_errors && Array.isArray(data.non_field_errors)) {
      throw new Error(data.non_field_errors.join(" "));
    }

    // 3) Errores por campo: { email: [...], password: [...] } -> concatenar
    if (typeof data === "object") {
      const messages = [];
      for (const [k, v] of Object.entries(data)) {
        if (Array.isArray(v)) messages.push(`${k}: ${v.join(", ")}`);
        else if (typeof v === "string") messages.push(`${k}: ${v}`);
        else messages.push(`${k}: ${JSON.stringify(v)}`);
      }
      if (messages.length) throw new Error(messages.join(" | "));
    }

    // 4) fallback
    throw new Error("Error al autenticar. Revisa las credenciales o el servidor.");
  }
};

export const logout = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("userEmail");
  localStorage.removeItem("userId");
};
