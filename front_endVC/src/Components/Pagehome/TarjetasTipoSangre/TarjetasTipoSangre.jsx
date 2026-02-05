import React, { useEffect, useState } from "react";
import "./TarjetasTipoSangre.css";
import { GetTiposSangre } from "../../../services/Servicio_TS";
import { FaTint } from "react-icons/fa";




const getFrecuenciaBadge = (poblacion) => {
  const porcentaje = Number(poblacion); 

  if (isNaN(porcentaje)) {
    return {
      text: "Desconocido",
      className: "badge badge-gray",
    };
  }

  if (porcentaje >= 20) {
    return {
      text: "Común",
      className: "badge badge-green",
    };
  }

  if (porcentaje >= 5) {
    return {
      text: "Poco común",
      className: "badge badge-yellow",
    };
  }

  return {
    text: "Muy raro",
    className: "badge badge-orange-strong",
  };
};



function TarjetasTipoSangre() {

    const [tipos, setTipos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState("");

    useEffect(() => {
        GetTiposSangre()
        .then((data) => setTipos(data))
        .catch((e) => setErr(e.message))
        .finally(() => setLoading(false));
    }, []);

    const formatPorcentaje = (value) => {
    const n = Number(value);
    return isNaN(n) ? value : `${n}%`;
  };

      


  return (
 
    <section  className="ts2-container" id="tipos-sangre">
      <div id="info"  className="ts2-header">
        <h2 className="ts2-title"> {/* <FaTint className="icono-gota"/> */}  Tipos de Sangre</h2>
        <p className="ts2-subtitle">
          Conoce los diferentes tipos sanguíneos y sus compatibilidades
        </p>
      </div>

      {/* Estados */}
      {loading && <p className="ts2-state">Cargando…</p>}
      {!!err && !loading && <p className="ts2-state">Error: {err}</p>}

      {/* Tarjetas */}
      {!loading && !err && (
        <div className="ts2-grid">
         {tipos.map((t, index) => (
  <article 
    key={t.id_tipo_sangre || `tipo-${index}`} 
    className="ts2-card"
  >
    <header className="ts2-card-top">
      <h3 className="ts2-type">{t.blood_type}</h3>
      {(() => {
        const badge = getFrecuenciaBadge(t.poblacion);
        return (
          <span className={badge.className}>
            {badge.text}
          </span>
        );
      })()}
    </header>

    <div className="ts2-body">
      <div className="ts2-row">
        <span className="ts2-label">Población</span>
        <span className="ts2-strong">
          {formatPorcentaje(t.poblacion)}
        </span>

      </div>

      <div className="ts2-row">
        <span className="ts2-label">Puede donar a:</span>
        <span className="ts2-text">{t.donaA}</span>
      </div>

      <div className="ts2-row">
        <span className="ts2-label">Puede recibir de:</span>
        <span className="ts2-text">{t.recibeDe}</span>
      </div>
    </div>
  </article>
))}

        </div>
      )}
    </section>

  )
}

export default TarjetasTipoSangre