import React, { useEffect, useState } from "react";
import "./tiposSangreEscasez.css";
import { FaExclamationCircle } from "react-icons/fa";
import { obtenerTiposSangreUrgentes } from "../../services/Servicio_TS";

/**
 * Componente que muestra SOLO los registros urgentes activos.
 * Adapta distintos nombres/formatos que pueda devolver tu backend:
 *  - urgencia / urgency
 *  - activo (1/0) / is_active (true/false)
 *  - nota / note / descripcion
 *  - actualizado / updated_at
 */

const urgencyLabel = {
  urgent: "Urgente",
  urgente: "Urgente",
};

function normalize(str) {
  if (str == null) return "";
  return String(str).toLowerCase().trim();
}

function adaptRaw(raw) {
  // extraer urgencia (distintos nombres posibles)
  const urg = raw.urgencia ?? raw.urgency ?? raw.urg ?? raw.estado ?? "";
  const urgencyNorm = normalize(urg);

  // extraer activo (1/0 o true/false o strings)
  const activoRaw = raw.activo ?? raw.is_active ?? raw.active ?? raw.enabled ?? raw.active_flag ?? 0;
  const is_active =
    activoRaw === true ||
    String(activoRaw).toLowerCase() === "true" ||
    Number(activoRaw) === 1;

  // nota / note
  const note = raw.nota ?? raw.note ?? raw.descripcion ?? "";

  // fecha
  const updated_at = raw.actualizado ?? raw.updated_at ?? raw.updated ?? raw.fecha ?? null;

  // blood type
  const blood_type = raw.blood_type ?? raw.tipo_sangre ?? raw.tipo ?? raw.name ?? null;

  // id posible
  const id = raw.id ?? raw.pk ?? null;

  return {
    raw,
    id,
    blood_type,
    urgency: urgencyNorm, // 'urgente' / 'urgent' / 'baja disponibilidad' etc.
    is_active,
    note,
    updated_at,
  };
}

const TiposSangreEscasez = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      try {
        const data = await obtenerTiposSangreUrgentes();
        console.log("Datos crudos (obtenerTiposSangreUrgentes):", data);

        const arr = Array.isArray(data) ? data : [];
        const adaptados = arr.map(adaptRaw);

        console.log("Adaptados:", adaptados);

        // FILTRAR: activo truthy (1) y urgencia que contenga 'urg' (cubre 'urgente' y 'urgent')
        const soloUrgentes = adaptados.filter(
          (it) => it.is_active && (it.urgency.includes("urg") || it.urgency === "urgent" || it.urgency === "urgente")
        );

        console.log("Solo urgentes (filtrado):", soloUrgentes);

        if (!mounted) return;
        setItems(soloUrgentes);
        setErr("");
      } catch (e) {
        console.error("Error cargando urgentes:", e);
        if (!mounted) return;
        setErr(e?.message || "No se pudo cargar la información");
        setItems([]);
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    }

    load();

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <section className="tipos-sangre-container">
        <h2 className="titulo-seccion">
          <FaExclamationCircle className="icono-alerta" /> Tipos de Sangre en Escasez
        </h2>
        <p className="subtitulo">Cargando…</p>
      </section>
    );
  }

  if (err) {
    return (
      <section className="tipos-sangre-container">
        <h2 className="titulo-seccion">
          <FaExclamationCircle className="icono-alerta" /> Tipos de Sangre en Escasez
        </h2>
        <p className="subtitulo">Ocurrió un error: {err}</p>
      </section>
    );
  }

  if (!items.length) {
    return (
      <section className="tipos-sangre-container">
        <h2 className="titulo-seccion">
          <FaExclamationCircle className="icono-alerta" /> Tipos de Sangre en Escasez
        </h2>
        <p className="subtitulo">No hay tipos de sangre urgentes activos en este momento.</p>
      </section>
    );
  }

  return (
    <section className="tipos-sangre-container" id="escasez">
      <h2 className="titulo-seccion">
        <FaExclamationCircle className="icono-alerta" /> Tipos de Sangre en Escasez
      </h2>
      <p className="subtitulo">Estos tipos necesitan donación URGENTE</p>

      <div className="tarjetas-container">
        {items.map((it, i) => (
          <div
            className="tarjeta-sangre"
            key={it.id ?? `${it.blood_type ?? "unknown"}-${i}`}
            data-urgency={it.urgency}
          >
            <div className="gota" />
            <h3 className="tipo">{it.blood_type ?? "—"}</h3>
            <p className={`urgente urgente--urgent`}>{urgencyLabel[it.urgency] ?? "Urgente"}</p>
            <p className="prioridad">{it.note || "Se necesita con prioridad"}</p>
            {it.updated_at && (
              <small className="fecha-actualizacion">
                Actualizado: {new Date(it.updated_at).toLocaleString()}
              </small>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

export default TiposSangreEscasez;

