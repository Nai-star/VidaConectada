import { authorizedFetch } from "./auth";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

/** Normaliza CloudinaryField y flags opcionales del backend */
function mapItem(raw) {
  // CloudinaryField puede venir como string o como objeto {url: "..."}
  const image =
    typeof raw?.imagen === "string"
      ? raw.imagen
      : raw?.imagen?.url || raw?.imagen?.secure_url || "";

  return {
    id: raw.id,
    image,
    text: raw?.texto ?? "",
    active: raw?.estado !== false,
    darkFilter: raw?.filtro_oscuro ?? false,
    showText: raw?.mostrar_texto ?? true,
  };
}

/**
 * Obtiene los slides del carrusel (solo activos).
 * Endpoint esperado: GET /api/carusel/
 * Si tu backend ya filtra activos (?estado=true), puedes agregar el query.
 */
export async function obtenerCarruselActivos() {
  const url = `${API_URL}/api/carusel/`;
  // Con JWT usamos authorizedFetch (NO credentials: "include")
  const res = await authorizedFetch(url, { method: "GET" });

  if (!res.ok) {
    const msg = await res.text().catch(() => "");
    throw new Error(msg || "No se pudo cargar el carrusel");
  }

  const data = await res.json();
  const items = Array.isArray(data) ? data : [];
  return items.filter(i => i?.estado !== false).map(mapItem);
}
