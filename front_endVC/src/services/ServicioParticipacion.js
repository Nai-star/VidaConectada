import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://192.168.100.34:8000/api";

export const obtenerTiposSangre = async () => {
  const response = await axios.get(`${API_BASE_URL}/sangre/`);
  return response.data;
};

export const registerParticipante = async (data) => {
  try {
    console.log("DATA RECIBIDA:", data);

    const email = data.correo || data.email;
    const sangreTexto = (data.tipo_sangre || "").trim();
    const campana = data.campaignId || data.campana;
    const createSubscription = !!data.createSubscription; 
    const cedula = data.cedula || data.Numero_cedula || data.numero_cedula || "";

    if (!email) throw new Error("❌ Falta el correo");
    if (!sangreTexto) throw new Error("❌ Falta el tipo de sangre");
    if (!campana) throw new Error("❌ Falta el ID de campaña");

    const tipos = await obtenerTiposSangre();
    const tipo = tipos.find(t => 
      t.tipo_sangre === sangreTexto || t.tipo === sangreTexto || t.blood_type === sangreTexto || String(t.id) === String(sangreTexto)
    );

    if (!tipo) {
      console.log("Tipos recibidos:", tipos)
      throw new Error(`Tipo de sangre inválido: ${sangreTexto}`);
    }

    const payload = {
      nombre: data.nombre,
      apellido: data.apellido,
      // enviar ambos para compatibilidad
      email: email,
      correo: email,
      sangre: tipo.id,
      campana: campana,
      createSubscription: createSubscription,
      // campo que el backend te está pidiendo
      Numero_cedula: cedula,
      // opcional (por compatibilidad)
      cedula: cedula,
    };

    console.log("DATA ENVIADA:", payload);

    const response = await axios.post(`${API_BASE_URL}/participacion/`, payload);
    return response.data;

  } catch (error) {
    if (error.response && error.response.data) {
      console.error("Backend error response:", error.response.data);
      // re-lanzamos con detalle (tu modal ya maneja esto)
      throw new Error(JSON.stringify(error.response.data));
    }
    console.error("Error registrando participación:", error);
    throw error;
  }
};
