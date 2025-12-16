/* const API_URL = "http://192.168.100.34:8000/api"; */
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

/** Obtiene preguntas frecuentes activas (estado=true) */
export async function obtenerPreguntasFrecuentes() {
  const res = await fetch(`${API_URL}/faq/`);

  if (!res.ok) {
    throw new Error("No se pudieron cargar las preguntas frecuentes");
  }

  return await res.json();
}