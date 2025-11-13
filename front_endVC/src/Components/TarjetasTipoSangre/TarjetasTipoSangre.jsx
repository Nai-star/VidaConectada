import React, { useEffect, useState } from "react";
import "./TarjetasTipoSangre.css";
import { GetTiposSangre } from "../../services/Servicio_TS";


const badgeClass = (frecuencia = "") => {
  const f = frecuencia.toLowerCase();
  if (f.includes("muy")) return "badge badge-orange-strong";
  if (f.includes("raro")) return "badge badge-orange";
  if (f.includes("poco")) return "badge badge-yellow";
  return "badge badge-green";
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



  return (
 
    <section  className="ts2-container" id="tipos-sangre">
      <div id="info"  className="ts2-header">
        <h2 className="ts2-title">🩸 Tipos de Sangre</h2>
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
          {tipos.map((t) => (
            <article key={t.id_tipo_sangre} className="ts2-card">
              <header className="ts2-card-top">
                <h3 className="ts2-type">{t.blood_type}</h3>
                <span className={badgeClass(t.frecuencia)}>{t.frecuencia}</span>
              </header>

              <div className="ts2-body">
                <div className="ts2-row">
                  <span className="ts2-label">Población</span>
                  <span className="ts2-strong">
                    {typeof t.poblacion === "number"
                      ? `${t.poblacion}%`
                      : t.poblacion}
                  </span>
                </div>

                <div className="ts2-row">
                  <span className="ts2-label">Puede donar a:</span>
                  <span className="ts2-text">{t.donaA.join(", ")}</span>
                </div>

                <div className="ts2-row">
                  <span className="ts2-label">Puede recibir de:</span>
                  <span className="ts2-text">{t.recibeDe.join(", ")}</span>
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