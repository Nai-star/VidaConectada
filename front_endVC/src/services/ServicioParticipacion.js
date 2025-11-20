import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

export const obtenerTiposSangre = async () => {
  const response = await axios.get(`${API_BASE_URL}/sangre/`);
  return response.data;
};

export const registerParticipante = async (data) => {
  try {
    console.log("DATA RECIBIDA:", data);

    const email = data.correo;
    const sangreTexto = (data.tipo_sangre || "").trim();
    const campana = data.campaignId;
    const createSubscription = !!data.createSubscription; // true/false

    if (!email) throw new Error("❌ Falta el correo");
    if (!sangreTexto) throw new Error("❌ Falta el tipo de sangre");
    if (!campana) throw new Error("❌ Falta el ID de campaña");

    const tipos = await obtenerTiposSangre();

    // Ajusta según tu API: muchos de tus endpoints usan 'tipo_sangre' como clave
    const tipo = tipos.find(t => t.tipo_sangre === sangreTexto || t.tipo === sangreTexto || t.blood_type === sangreTexto);

    if (!tipo) {
      console.log("Tipos recibidos:", tipos);
      throw new Error(`Tipo de sangre inválido: ${sangreTexto}`);
    }

    const payload = {
      nombre: data.nombre,
      apellido: data.apellido,
      email: email,
      sangre: tipo.id,
      campana: campana,
      createSubscription: createSubscription, // <-- Asegúrate de enviarlo
    };

    console.log("DATA ENVIADA:", payload);

    const response = await axios.post(`${API_BASE_URL}/participacion/`, payload);
    return response.data;

  } catch (error) {
    // MUESTRA el body del error devuelto por Django/DRF si existe (útil para debug)
    if (error.response && error.response.data) {
      console.error("Backend error response:", error.response.data);
      // re-lanzar con ese detalle para que el modal pueda mostrarlo si quieres
      throw new Error(JSON.stringify(error.response.data));
    }

    console.error("Error registrando participación:", error);
    throw error;
  }
};
