import React, { useEffect, useState } from "react";
import "./tiposSangreEscasez.css";
import { FaExclamationCircle } from "react-icons/fa";
import { obtenerTiposSangre } from "../../services/Servicio_TS"; 
// ⚠️ Este servicio debe devolver cada item con: 
// { id, id_tipo_sangre, blood_type, urgency, is_active, note, updated_at }

const urgencyLabel = {
  normal: "Normal",
  priority: "Prioridad",
  urgent: "Urgente",
};

const TiposSangreEscasez = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const data = await obtenerTiposSangre(); // ya filtrado is_active !== false
        setItems(Array.isArray(data) ? data : []);
      } catch (e) {
        setErr(e?.message || "No se pudo cargar la información");
      } finally {
        setLoading(false);
      }
    })();
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
        <p className="subtitulo">¡Excelente! No hay tipos en escasez por ahora.</p>
      </section>
    );
  }

  return (
    <section className="tipos-sangre-container" id="escasez">
      <h2 className="titulo-seccion">
        <FaExclamationCircle className="icono-alerta" /> Tipos de Sangre en Escasez
      </h2>
      <p className="subtitulo">
        Estos son los tipos de sangre que necesitan donación urgente
      </p>

      <div className="tarjetas-container">
        {items.map((it) => (
          <div
            className="tarjeta-sangre"
            key={it.id ?? `${it.id_tipo_sangre}-${it.updated_at}`}
            data-urgency={it.urgency}     // Útil para CSS: [data-urgency="urgent"] { ... }
            aria-label={`Tipo ${it.blood_type} - ${urgencyLabel[it.urgency] || "Urgente"}`}
          >
            <div className="gota" aria-hidden="true"></div>

            <h3 className="tipo">{it.blood_type || "—"}</h3>

            <p className={`urgente urgente--${it.urgency || "urgent"}`}>
              {urgencyLabel[it.urgency] ?? "Urgente"}
            </p>

            <p className="prioridad">
              {it.note || "Se necesita con prioridad"}
            </p>

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
