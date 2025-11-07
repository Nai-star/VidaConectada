
import React, { useEffect, useState } from "react";
import "./tiposSangreEscasez.css";
import { FaExclamationCircle } from "react-icons/fa";
import { obtenerTiposSangre } from "../../services/Servicio_TS";

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
    obtenerTiposSangre()
      .then(setItems)
      .catch((e) => setErr(e.message || "Error"))
      .finally(() => setLoading(false));
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
        Estos son nuestros tipos de sangre que necesitan donación urgente
      </p>

      <div className="tarjetas-container">
        {items.map((it) => (
          <div className="tarjeta-sangre" key={it.id} data-urgency={it.urgency}>
            <div className="gota"></div>
            <h3 className="tipo">{it.blood_type}</h3>
            <p className="urgente">{urgencyLabel[it.urgency] ?? "Urgente"}</p>
            <p className="prioridad">{it.note || "Se necesita con prioridad"}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default TiposSangreEscasez;
