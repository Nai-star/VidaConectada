const API_URL = (import.meta.env.VITE_API_URL || "http://127.0.0.1:8000") + "/api";
/* const API_URL = "http://192.168.100.34:8000/api"; */

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
export async function obtenerTodosRequisitos() {
  try {
    const res = await fetch(`${API_URL}/requisitos/`);
    if (!res.ok) throw new Error("Error obteniendo todos los requisitos");

    return await res.json();
  } catch (error) {
    console.error("❌ Error obteniendo todos los requisitos:", error);
    throw error;
  }
}

/** 🔹 Crear un nuevo requisito */
export async function crearRequisito(data) {
  try {
    const res = await fetch(`${API_URL}/requisitos/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) throw new Error("Error creando requisito");
    return await res.json();
  } catch (error) {
    console.error("❌ Error creando requisito:", error);
    throw error;
  }
}

/** 🔹 Editar requisito existente */
export async function actualizarRequisito(id, data) {
  try {
    const res = await fetch(`${API_URL}/requisitos/${id}/`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) throw new Error("Error actualizando requisito");
    return await res.json();
  } catch (error) {
    console.error("❌ Error actualizando requisito:", error);
    throw error;
  }
}

/** 🔹 Eliminar requisito */
export async function eliminarRequisito(id) {
  try {
    const res = await fetch(`${API_URL}/requisitos/${id}/`, {
      method: "DELETE",
    });

    if (!res.ok) throw new Error("Error eliminando requisito");
    return true;
  } catch (error) {
    console.error("❌ Error eliminando requisito:", error);
    throw error;
  }
}

const cambiarEstado = async (req) => {
  try {
    await actualizarEstadoRequisito(req.id, !req.Estado); // alterna estado
    cargarDatos(); // refresca tabla y vista previa
  } catch (error) {
    console.error("Error actualizando estado:", error);
  }
};
