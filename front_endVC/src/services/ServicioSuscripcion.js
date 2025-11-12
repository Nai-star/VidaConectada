const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export async function crearSuscripcion({ nombre, apellido, correo, tipo_sangre }) {
  const payload = {
    nombre: nombre.trim(),
    apellido: apellido.trim(),
    correo: correo.trim().toLowerCase(),
    tipo_sangre,
    estado: "activo",
    created_at: new Date().toISOString(),
  };

  const res = await fetch(`${API_URL}/suscripciones`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw new Error("No se pudo registrar la suscripción.");
  return res.json();
}
