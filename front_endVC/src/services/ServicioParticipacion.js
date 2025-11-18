// Este es un ejemplo básico. Ajusta las URLs y los métodos según tu API real.

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

export async function registerParticipante(participanteData) {
  try {
    const response = await fetch(`${API_BASE_URL}/participantes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(participanteData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    return response.json();
  } catch (error) {
    console.error('Error al registrar participante:', error);
    throw error;
  }
}

