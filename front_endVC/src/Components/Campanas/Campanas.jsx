import React, { useEffect, useMemo, useState } from "react";
import "./campanas.css";
import { obtenerCampanasActivas, obtenerLugaresCampana } from "../../services/ServicioCampanas";
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
        setLoading(true);
        // Traer campañas y lugares en paralelo
        const [campanasRaw, lugares] = await Promise.all([
          obtenerCampanasActivas(), // devuelve campañas normalizadas
          obtenerLugaresCampana(),  // devuelve lugares con campanaId (Campana_id)
        ]);

        if (!alive) return;

        // Agrupar lugares por campanaId (numérico si es posible)
        const lugaresPorCampana = {};
        for (const l of lugares || []) {
          const cid = Number(l.campanaId);
          if (!Number.isFinite(cid) || cid <= 0) continue;
          if (!lugaresPorCampana[cid]) lugaresPorCampana[cid] = [];
          lugaresPorCampana[cid].push(l);
        }

        // Fusionar: añadir campo .lugares (array) a cada campaña
        const fused = (campanasRaw || []).map((c) => {
          const cid = Number(c.id);
          const asociados = Number.isFinite(cid) && cid > 0 ? (lugaresPorCampana[cid] ?? []) : [];

          // fallback progreso si no existe
          const progresoFallback =
            typeof c.progreso === "number"
              ? c.progreso
              : c.fechaInicio && c.fechaFin
              ? Math.round(
                  ((Date.now() - new Date(c.fechaInicio).getTime()) /
                    (new Date(c.fechaFin).getTime() - new Date(c.fechaInicio).getTime())) *
                    100
                )
              : 0;

          // construir texto de la primera ubicacion si existe
          let ubicacionTexto = c.ubicacion ?? "Ubicación por confirmar";
          if (asociados.length) {
            const L = asociados[0];
            const partes = [L.nombre, L.canton, L.direccion].filter(Boolean);
            if (partes.length) ubicacionTexto = partes.join(", ");
          }

          return {
            ...c,
            ubicacion: ubicacionTexto,
            lugares: asociados,
            progreso: Math.max(0, Math.min(100, progresoFallback || 0)),
          };
        });

        setCampanas(fused);
        setErr("");
      } catch (e) {
        console.error("Error cargando campañas o lugares:", e);
        if (!alive) return;
        setErr("No se pudieron cargar las campañas o los lugares.");
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  const vacias = useMemo(() => !loading && !err && campanas.length === 0, [loading, err, campanas]);

  return (
    <section className="cmp-wrap" id="campanas">
      <h2 className="cmp-title">Campañas Activas</h2>
      <p className="cmp-subtitle">Encuentra una jornada de donación cerca de ti y participa</p>

      {loading && <div className="cmp-skeleton">Cargando campañas…</div>}
      {err && <div className="cmp-error">{err}</div>}
      {vacias && <div className="cmp-empty">No hay campañas activas de momento.</div>}

      <div className="cmp-grid">
        {campanas.map((c, index) => {
          const abierta = openId === c.id;
          // key seguro: si no existe id, usar índice con prefijo
          const cardKey = c?.id != null ? `camp-${c.id}` : `camp-fallback-${index}`;

          return (
            <article key={cardKey} className={`cmp-card ${c.urgencyClass ?? ""}`}>
              <header className="cmp-head">
                <h3 className="cmp-card-title">{c.titulo}</h3>
                {c.urgency && <span className={`cmp-badge ${c.urgencyClass ?? ""}`}>{c.urgency}</span>}
              </header>

              <ul className="cmp-meta" aria-hidden={false}>
                <li className="meta-item">
                  <FiCalendar className="ic" />
                  <span>{c.fechaTexto}</span>
                </li>
                <li className="meta-item">
                  <FiClock className="ic" />
                  <span>{c.horarioTexto}</span>
                </li>
                <li className="meta-item">
                  <FiMapPin className="ic" />
                  <span>{c.ubicacion}</span>
                </li>
              </ul>

              <div className="cmp-progress" aria-hidden>
                <div
                  className="cmp-progress-bar"
                  style={{ width: `${Math.max(0, Math.min(100, c.progreso || 0))}%` }}
                />
              </div>

              {/* Detalles colapsables */}
              <div
                id={`detalles-${c.id ?? index}`}
                className={`cmp-details ${abierta ? "open" : ""}`}
                aria-expanded={abierta}
              >
                <div className="cmp-section">
                  <h4>Descripción</h4>
                  <p>{c.descripcion || "No hay descripción disponible."}</p>
                </div>

                {c.requisitos?.length ? (
                  <div className="cmp-section">
                    <h4>Requisitos</h4>
                    <ul className="cmp-list">
                      {c.requisitos.map((r, i) => (
                        // para requisitos usamos índice (son estáticos por campaña)
                        <li key={`req-${c.id ?? index}-${i}`}>• {r}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                <div className="cmp-section">
                  <h4>Contacto</h4>
                  <p>{c.contacto}</p>
                </div>

                {/* Mostrar todos los lugares asociados (si hay más de uno) */}
                {c.lugares?.length ? (
                  <div className="cmp-section">
                    <h4>Lugar(es) asociado(s)</h4>
                    <ul className="cmp-list">
                      {c.lugares.map((L, lugarIdx) => {
                        const lugarKey = L?.id != null ? `lug-${L.id}` : `lug-${index}-${lugarIdx}`;
                        return (
                          <li key={lugarKey}>
                            <strong>{L.nombre || "Lugar sin nombre"}</strong>
                            {L.canton ? ` — ${L.canton}` : ""}
                            {L.direccion ? `, ${L.direccion}` : ""}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ) : null}
              </div>

              {/* Acciones */}
              <div className="cmp-actions">
                <button
                  className="cmp-btn ghost"
                  onClick={() => {
                    // si c.id nunca existe, usar índice como referencia para toggle
                    const keyForToggle = c.id != null ? c.id : `fallback-${index}`;
                    setOpenId((p) => (p === keyForToggle ? null : keyForToggle));
                    // opcional: scroll al abrir
                    // setTimeout(() => document.getElementById(`detalles-${c.id}`)?.scrollIntoView({ behavior: "smooth", block: "center" }), 200);
                  }}
                  aria-controls={`detalles-${c.id ?? index}`}
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
