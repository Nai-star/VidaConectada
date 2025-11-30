/* const API_URL =  "http://192.168.100.34:8000/api"; */
const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";


/** Crea una nueva consulta en el buzón (llega al admin) */
export async function crearConsultaBuzon({ nombre, correo, pregunta }) {
  const payload = {
    Nombre_persona: nombre.trim(),
    correo: correo.trim().toLowerCase(),
    pregunta: pregunta.trim()
  };

  const res = await fetch(`${API_URL}/buzon/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error("No se pudo enviar la consulta. Inténtalo de nuevo.");
  }

  return res.json();
}
