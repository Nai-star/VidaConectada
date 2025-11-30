
import axios from "axios";

const candidates = [
  import.meta.env.VITE_API_URL || "http://192.168.100.34:8000/api",
  "http://127.0.0.1:8000/api",
  "http://localhost:8000/api"
];

export const registrarParticipacion = async ({ cedula, nombre, email, campaignId }) => {
  const payload = {
    Numero_cedula: cedula,
    nombre: nombre || "",
    email: email || "",
    campana: campaignId,
  };

  console.log("PAYLOAD PARTICIPACION:", payload);

  for (const base of candidates) {
    try {
      console.log("Intentando POST en:", base + "/participacion/");
      const response = await axios.post(`${base}/participacion/`, payload, { timeout: 8000 });
      console.log("registrarParticipacion - success:", base, response.status, response.data);
      return response.data;
    } catch (error) {
      console.error("Error al intentar con", base, error?.message || error);
      if (error.response) {
        console.error("server response:", error.response.status, error.response.data);
        const err = new Error("Error al registrar participación");
        err.status = error.response.status;
        err.server = error.response.data;
        throw err;
      }
      // si es fallo de conexión seguimos al siguiente candidate
    }
  }

  const err = new Error("No se pudo conectar con el backend (timeout/conn refused). Revisa API_BASE_URL y que Django esté corriendo.");
  throw err;
};
