import { authorizedFetch } from "./auth"

const API_URL = "http://127.0.0.1:8000/api"

// Obtiene todas las campañas con sus imágenes y requisitos
export async function obtenerCampanas() {
  const res = await authorizedFetch(`${API_URL}/campanas`);
  const data = await res.json();

  return data.map((item) => ({
    ...item,
    imagenes: item.Imagen_campana || [],
    requisitos: item.DetalleRequisito?.map((r) => r.Requisitos) || []
  }));
}