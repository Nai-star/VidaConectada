/* const API_URL = "http://192.168.100.34:8000/api"; */
const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

/** Obtiene preguntas frecuentes activas (estado=true) */
export async function obtenerPreguntasFrecuentes() {
  const res = await fetch(`${API_URL}/respuestas/`);
  if (!res.ok) throw new Error("No se pudieron cargar las preguntas frecuentes");
  const data = await res.json();
  return (Array.isArray(data) ? data : [])
    .filter((q) => q.estado === true)
    .sort((a, b) => a.id - b.id);
}
