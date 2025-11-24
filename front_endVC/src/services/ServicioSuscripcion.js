import axios from "axios";
const API_URL = "http://localhost:8000/api";

export async function crearSuscripcion(data) {
  try {

    console.log(data);
    
    const res = await axios.post(`${API_URL}/suscritos/`, data);
    return res.data;
    
  } catch (error) {
    console.error("Error creando suscripción:", error);
    throw error;
  }
}
