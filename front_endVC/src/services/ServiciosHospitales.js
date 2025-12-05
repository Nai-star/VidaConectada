// En un archivo como: 'hospitalesService.js'
const API_URL = (import.meta.env.VITE_API_URL || "http://127.0.0.1:8000") + "/api";

/** Obtiene la lista de hospitales y sus horarios desde la API */
export async function obtenerRedDeBancos() {
// El endpoint debe coincidir con la ruta GET en tu backend de Django/Express
 const res = await fetch(`${API_URL}/banco/`); 
 
 // Verifica si la respuesta HTTP es exitosa (código 200-299)
 if (!res.ok) {
// Lanza un error si hay un problema en el servidor o la red
 throw new Error("No se pudo cargar la red de bancos y horarios"); 
 }
 
 const data = await res.json();

 // Retorna el arreglo de hospitales. Opcionalmente, puedes ordenar aquí.
  return Array.isArray(data) ? data : [];
}
// ----------------------------------------------
// ACTUALIZAR PARCIAL (PATCH) - actualizarBancoPatch
// ----------------------------------------------
export async function actualizarBanco(id, datos) {
  const res = await fetch(`${API_URL}/banco/${id}/`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(datos),
  });

  if (!res.ok) {
    throw new Error("No se pudo actualizar el banco");
  }

  return await res.json();
}

export async function eliminarBanco(id) {
  const res = await fetch(`${API_URL}/banco/${id}/`, {
    method: "DELETE",
  });

  if (!res.ok) {
    throw new Error("Error al eliminar el banco");
  }

  return true;
}
export async function crearBanco(datos) {
  const body = { ...datos };

  // convertir vacío → null para evitar errores en DRF
  Object.keys(body).forEach(key => {
    if (body[key] === "") {
      body[key] = null;
    }
  });

  const res = await fetch(`${API_URL}/banco/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errorBody = await res.text();
    console.error("Backend dice:", errorBody);
    throw new Error("No se pudo crear el banco");
  }

  return await res.json();
}
