const API_URL = "http://192.168.100.34:8000/api";


/**
 * Une Urgente_Tip_Sang con tipo_sangre usando id_tipo_sangre.
 * Filtra solo los activos.
 */
export async function obtenerTiposSangreUrgentes() {
  try {
    // 1️⃣ Obtener las urgencias
    const rUrg = await fetch(`${API_URL}/urgente_tip_sang/`);
    if (!rUrg.ok) throw new Error("Error al obtener Urgente_Tip_Sang");
    const urgentes = await rUrg.json();

    // 2️⃣ Filtrar los registros activos (usa 'activo' según tu modelo)
    const urgentesActivos = urgentes.filter((u) => u.activo === true);

    // 3️⃣ Obtener el catálogo de tipos de sangre
    const rTipos = await fetch(`${API_URL}/sangre/`);
    if (!rTipos.ok) throw new Error("Error al obtener tipo_sangre");
    const tipos = await rTipos.json();

    // 4️⃣ Crear un índice por ID de sangre
    const indexTipos = new Map(tipos.map((t) => [Number(t.id), t]));

    // 5️⃣ Unir los datos
    const resultado = urgentesActivos
      .map((u) => {
        const tipo = indexTipos.get(Number(u.Sangre));
        if (!tipo) return null;
        return {
          blood_type: tipo.tipo_sangre, // datos del tipo de sangre
          urgencia: u.urgencia,
          nota: u.nota,
          actualizado: u.actualizado,
        };
      })
      .filter(Boolean);

   /*  console.log("✅ Resultado final (solo urgentes):", resultado); */
    return resultado;
  } catch (error) {
    console.error("❌ Error obteniendo tipos de sangre urgentes:", error);
    throw error;
  }
}

/**
 * Servicio que obtiene todos los tipos de sangre del JSON Server.
 */
export async function GetTiposSangre() {
  try {
    const response = await fetch(`${API_URL}/sangre/`);
    if (!response.ok) {
      throw new Error("Error al obtener los tipos de sangre");
    }

    const data = await response.json();

    // Mapeo de los nombres del backend a los que usa el frontend
    const adaptado = data.map((t) => ({
      id_tipo_sangre: t.id,
      blood_type: t.tipo_sangre,
      frecuencia: t.frecuencia,
      poblacion: t.poblacion,
      donaA: t.donaA,
      recibeDe: t.recibeDe,
    }));

    /* console.log("✅ Resultado final:", adaptado); */
    return adaptado;
  } catch (error) {
    console.error("❌ Error cargando tipos de sangre:", error);
    throw error;
  }
}
