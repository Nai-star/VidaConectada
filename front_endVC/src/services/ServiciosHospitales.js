// En un archivo como: 'hospitalesService.js'
const API_URL = (import.meta.env.VITE_API_URL || "http://127.0.0.1:8000") + "/api";

/* const API_URL = "http://192.168.100.34:8000/api"; */

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