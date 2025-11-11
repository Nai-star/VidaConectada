const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

/** Obtiene preguntas frecuentes activas (estado=true) */
export async function obtenerPreguntasFrecuentes() {
  const res = await fetch(`${API_URL}/Pregunta_frecuente`);
  if (!res.ok) throw new Error("No se pudieron cargar las preguntas frecuentes");
  const data = await res.json();
  return (Array.isArray(data) ? data : [])
    .filter((q) => q.estado === true)
    .sort((a, b) => a.id - b.id);
}
