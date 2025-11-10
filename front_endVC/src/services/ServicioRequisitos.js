const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

/** Obtiene requisitos activos (estado=true) desde JSON Server */
export async function obtenerRequisitos() {
  try {
    const res = await fetch(`${API_URL}/requisitos`);
    if (!res.ok) throw new Error("Error obteniendo requisitos");

    const data = await res.json();

    // Solo activos y ordenados por id asc
    return (Array.isArray(data) ? data : [])
      .filter((r) => r.estado === true)
      .sort((a, b) => a.id - b.id);
  } catch (error) {
    console.error("❌ Error cargando requisitos:", error);
    throw error;
  }
}
