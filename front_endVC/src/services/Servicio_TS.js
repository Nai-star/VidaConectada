
const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

/**
 * Obtiene los tipos de sangre desde el servidor JSON.
 * Filtra solo los que estén activos (si tu JSON tiene is_active = true).
 */
export async function obtenerTiposSangre() {
  try {
    const respuesta = await fetch(`${API_URL}/tipo_sangre`);
    if (!respuesta.ok) {
      throw new Error("Error al obtener los tipos de sangre");
    }

    const datos = await respuesta.json();

    // Filtramos si existe el campo `is_active`
    const activos = datos.filter((item) => item.is_active !== false);

    // Orden por urgencia o tipo
    /* const prioridad = { urgent: 3, priority: 2, normal: 1 };
    activos.sort(
      (a, b) =>
        (prioridad[b.urgency] || 0) - (prioridad[a.urgency] || 0) ||
        a.blood_type.localeCompare(b.blood_type)
    ); */

    return activos;
  } catch (error) {
    console.error("❌ Error cargando tipos de sangre:", error);
    throw error;
  }
}
