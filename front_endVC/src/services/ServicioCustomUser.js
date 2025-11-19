import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

// Verifica un usuario por correo en /usuarios/?correo=...
// - Si correo es vacío -> retorna null (evita traer toda la tabla).
// - Normaliza respuesta: si backend devuelve array, buscamos coincidencia exacta (case-insensitive).
export const checkCustomUser = async (correo) => {
  try {
    const email = (correo || "").trim();
    if (!email) return null;

    const resp = await axios.get(`${API_URL}/usuarios/`, {
      params: { correo: email },
      // opcional: timeout: 5000
    });

    const data = resp.data;

    // Si backend devuelve un objeto individual
    if (!data) return null;
    if (!Array.isArray(data)) {
      // Puede ser objeto o estructura con detalles
      return data;
    }

    // Si devuelve array, buscar coincidencia exacta por email (case-insensitive)
    const found = data.find((u) => {
      const uEmail = (u.correo ?? u.email ?? "").toString().toLowerCase();
      return uEmail === email.toLowerCase();
    });

    return found ?? null;
  } catch (err) {
    console.error("Error verificando usuario:", err);
    // re-lanzar para que el componente pueda mostrar un mensaje
    throw err;
  }
};

// Si necesitas crear usuario manualmente (opcional)
export const createCustomUser = async ({ nombre, apellido, correo, tipo_sangre }) => {
  try {
    const resp = await axios.post(`${API_URL}/usuarios/`, {
      nombre,
      apellido,
      correo,
      tipo_sangre,
    });
    return resp.data;
  } catch (err) {
    console.error("Error creando custom user:", err);
    throw err;
  }
};
