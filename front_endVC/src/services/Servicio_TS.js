const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

/**
 * Une Urgente_Tip_Sang con tipo_sangre usando id_tipo_sangre.
 * Filtra solo los activos.
 */
export async function obtenerTiposSangre() {
  try {
    // 1) Obtener urgencias
    const rUrg = await fetch(`${API_URL}/Urgente_Tip_Sang`);
    if (!rUrg.ok) throw new Error("Error al obtener Urgente_Tip_Sang");
    const urgentes = await rUrg.json();

    // Filtrar activos
    const activos = urgentes.filter((u) => u.is_active !== false);

    // 2) Obtener catálogo de tipos de sangre
    const rTipos = await fetch(`${API_URL}/tipo_sangre`);
    if (!rTipos.ok) throw new Error("Error al obtener tipo_sangre");
    const tipos = await rTipos.json();

    // 3) Crear índice por id_tipo_sangre
    const indexTipos = new Map(
      tipos.map((t) => [Number(t.id_tipo_sangre), t])
    );

    // 4) Unión real SIN fallback
    const resultado = activos.map((u) => {
      const tipo = indexTipos.get(Number(u.id_tipo_sangre));

      // Si no encuentra coincidencia, es un error en el JSON
      if (!tipo) {
        console.error(
          `❌ No se encontró el tipo de sangre con id_tipo_sangre = ${u.id_tipo_sangre}`
        );
        return u; 
      }

      return {
        ...u,
        ...tipo, // aquí llega blood_type, frecuencia, donaA, etc.
      };
    });

    console.log("✅ Resultado final:", resultado);
    return resultado;
  } catch (error) {
    console.error("❌ Error obteniendo tipos de sangre:", error);
    throw error;
  }
}


/**
 * Servicio que obtiene todos los tipos de sangre del JSON Server.
 */
export async function GetTiposSangre() {
  try {
    const response = await fetch(`${API_URL}/tipo_sangre`);
    if (!response.ok) {
      throw new Error("Error al obtener los tipos de sangre");
    }

    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("❌ Error cargando tipos de sangre:", error);
    throw error;
  }
}
