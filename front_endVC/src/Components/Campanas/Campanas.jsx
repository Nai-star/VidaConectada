import React, { useEffect, useMemo, useState } from "react";
import "./campanas.css";
import { obtenerCampanasActivas } from "../../services/ServicioCampanas";
import { FiCalendar, FiClock, FiMapPin } from "react-icons/fi";

function Campanas() {
  const [campanas, setCampanas] = useState([]);
  const [openId, setOpenId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const data = await obtenerCampanasActivas();
        if (!alive) return;
        setCampanas(data);
      } catch (e) {
        if (!alive) return;
        setErr("No se pudieron cargar las campañas.");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => (alive = false);
  }, []);

  const vacias = useMemo(() => !loading && !err && campanas.length === 0, [loading, err, campanas]);

  return (
    <section className="cmp-wrap" id="campanas">
      <h2 className="cmp-title">Campañas Activas</h2>
      <p className="cmp-subtitle">
        Encuentra una jornada de donación cerca de ti y participa
      </p>

      {loading && <div className="cmp-skeleton">Cargando campañas…</div>}
      {err && <div className="cmp-error">{err}</div>}
      {vacias && <div className="cmp-empty">No hay campañas activas de momento.</div>}

      <div className="cmp-grid">
        {campanas.map((c) => {
          const abierta = openId === c.id;
          return (
            <article key={c.id} className={`cmp-card ${c.urgencyClass}`}>
              <header className="cmp-head">
                <h3 className="cmp-card-title">{c.titulo}</h3>
                {c.urgency && <span className={`cmp-badge ${c.urgencyClass}`}>{c.urgency}</span>}
              </header>

              <ul className="cmp-meta">
                <li className="meta-item">
                  <FiCalendar className="ic" />
                  {c.fechaTexto}
                </li>
                <li className="meta-item">
                  <FiClock className="ic" />
                  {c.horarioTexto}
                </li>
                <li className="meta-item">
                  <FiMapPin className="ic" />
                  {c.ubicacion}
                </li>
              </ul>

              <div className="cmp-progress">
                <div className="cmp-progress-bar" style={{ width: `${c.progreso}%` }} />
              </div>

              {/* Detalles colapsables */}
              <div className={`cmp-details ${abierta ? "open" : ""}`}>
                <div className="cmp-section">
                  <h4>Descripción</h4>
                  <p>{c.descripcion}</p>
                </div>

                {c.requisitos?.length ? (
                  <div className="cmp-section">
                    <h4>Requisitos</h4>
                    <ul className="cmp-list">
                      {c.requisitos.map((r, i) => (
                        <li key={i}>• {r}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                <div className="cmp-section">
                  <h4>Contacto</h4>
                  <p>{c.contacto}</p>
                </div>
              </div>

              {/* Acciones */}
              <div className="cmp-actions">
                <button
                  className={`cmp-btn ghost`}
                  onClick={() => setOpenId((p) => (p === c.id ? null : c.id))}
                >
                  {abierta ? "Ocultar Detalles" : "Ver Detalles"}
                </button>

                <button
                  className="cmp-btn primary"
                  onClick={() => alert("¡Gracias por participar! (aquí enlazas tu flujo)")}
                >
                  Participar en esta Campaña
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export default Campanas;

