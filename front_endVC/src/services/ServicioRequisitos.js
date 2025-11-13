const API_URL = "http://127.0.0.1:8000/api";

/** Obtiene requisitos activos (estado=true) desde JSON Server */
export async function obtenerRequisitos() {
  try {
    const res = await fetch(`${API_URL}/requisitos/`);
    if (!res.ok) throw new Error("Error obteniendo requisitos");

    const data = await res.json();

    // Solo activos y ordenados por id asc
    return (Array.isArray(data) ? data : [])
      .filter((r) => r.Estado === true)
      .sort((a, b) => a.id - b.id);
  } catch (error) {
    console.error("❌ Error cargando requisitos:", error);
    throw error;
  }
}
