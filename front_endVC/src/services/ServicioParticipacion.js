// Este es un ejemplo básico. Ajusta las URLs y los métodos según tu API real.
import axios from "axios";
const API_BASE_URL = 'http://127.0.0.1:8000/api'; // Cambia esto por la URL de tu backend

export async function checkSuscripcion(email) {
  try {
    const response = await fetch(`${API_BASE_URL}/suscritos?correo=${encodeURIComponent(email)}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    // Tu API debería devolver un array o un objeto.
    // Asumimos que si encuentra un suscriptor, devuelve un array con al menos un elemento.
    if (data && data.length > 0) {
      return data[0]; // Devuelve el primer suscriptor encontrado
    }
    return null; // No encontrado
  } catch (error) {
    console.error('Error al verificar suscripción:', error);
    throw error;
  }
}

// 🔹 Registrar la participación en una campaña
export const registerParticipante = async ({ nombre, apellido, correo, tipo_sangre, campaignId, createSubscription = false }) => {
  try {
    // Si createSubscription es true, el backend debe crear también la entrada en api_customuser
    const response = await axios.post(`${API_URL}/participacion/`, {
      nombre,
      apellido,
      correo,
      tipo_sangre,
      campaign: campaignId,
      create_subscription: createSubscription, // backend flag
    });
    return response.data;
  } catch (err) {
    console.error("Error registrando participación:", err);
    throw err;
  }
};

