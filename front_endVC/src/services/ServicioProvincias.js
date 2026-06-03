const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
// Obtener provincias
export async function obtenerProvincias() {
    const res = await fetch(`${API_URL}/api/provincia/`);
    if (!res.ok) throw new Error("Error obteniendo provincias");
    return res.json();
}

export async function obtenerCantones() {
    const res = await fetch(`${API_URL}/api/Cantones/`);
    if (!res.ok) throw new Error("Error obteniendo cantones");
    return res.json();
}