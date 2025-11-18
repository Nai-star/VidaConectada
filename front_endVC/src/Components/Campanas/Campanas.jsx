import React, { useEffect, useMemo, useState } from "react";
import "./campanas.css";
import { obtenerCampanasActivas, obtenerLugaresCampana } from "../../services/ServicioCampanas";
import { FiCalendar, FiClock, FiMapPin } from "react-icons/fi";
import ParticiparModal from '../../Components/ParticiparModal/ParticiparModal'; // Importa el nuevo modal

function Campanas() {
  const [campanas, setCampanas] = useState([]);
  const [openId, setOpenId] = useState(null); 
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  
  // Nuevo estado para el modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null); // Para pasar la campaña al modal

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setLoading(true);
        const [campanasRaw, lugares] = await Promise.all([
          obtenerCampanasActivas(),
          obtenerLugaresCampana(),
        ]);

        if (!alive) return;

        const lugaresPorCampana = {};
        for (const l of lugares || []) {
          const cid = String(l.campanaId);
          if (!cid || cid === "0") continue;
          if (!lugaresPorCampana[cid]) lugaresPorCampana[cid] = [];
          lugaresPorCampana[cid].push(l);
        }

        const fused = (campanasRaw || []).map((c) => {
          const cid = String(c.id); 
          const asociados = cid && cid !== "0" ? (lugaresPorCampana[cid] ?? []) : [];

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

  // Función para abrir el modal
  const handleOpenModal = (campaign) => {
    setSelectedCampaign(campaign);
    setIsModalOpen(true);
  };

  // Función para cerrar el modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCampaign(null);
  };

  // Función que se ejecuta cuando la participación es exitosa en el modal
  const handleParticipationSuccess = (participatedCampaign) => {
    // Puedes hacer algo aquí si necesitas actualizar el estado de la campaña en Campanas.jsx
    // Por ejemplo, marcarla como "ya participado" o refrescar datos.
    console.log(`Participación exitosa en: ${participatedCampaign.titulo}`);
    // Opcional: Cierra también los detalles de la tarjeta.
    setOpenId(null); 
  };


  return (
    <section className="cmp-wrap" id="campanas">
      <h2 className="cmp-title">Campañas Activas</h2>
      <p className="cmp-subtitle">Encuentra una jornada de donación cerca de ti y participa</p>

      {loading && <div className="cmp-skeleton">Cargando campañas…</div>}
      {err && <div className="cmp-error">{err}</div>}
      {vacias && <div className="cmp-empty">No hay campañas activas de momento.</div>}

      <div className="cmp-grid">
        {campanas.map((c, index) => {
          const keyForToggle = String(c.id != null ? c.id : `fallback-${index}`); 
          const abierta = openId === keyForToggle;

          const cardKey = `camp-${keyForToggle}`;

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
                id={`detalles-${keyForToggle}`}
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
                        <li key={`req-${keyForToggle}-${i}`}>• {r}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                <div className="cmp-section">
                  <h4>Contacto</h4>
                  <p>{c.contacto}</p>
                </div>

                {/* {c.lugares?.length ? (
                  <div className="cmp-section">
                    <h4>Lugar(es) asociado(s)</h4>
                    <ul className="cmp-list">
                      {c.lugares.map((L, lugarIdx) => {
                        const lugarKey = L?.id != null ? `lug-${L.id}` : `lug-${keyForToggle}-${lugarIdx}`;
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
                ) : null} */}
              </div>

              {/* ÚNICO BOTÓN INTELIGENTE */}
              <div className="cmp-actions">
                <button
                  className={`cmp-btn ${abierta ? "primary" : "ghost"} full-width`} 
                  onClick={() => {
                    if (abierta) {
                      // Si el botón ya dice "Participar", abre el modal.
                      handleOpenModal(c);
                    } else {
                      // Si no está abierta, abre los detalles de la tarjeta.
                      setOpenId(keyForToggle);
                    }
                  }}
                  aria-controls={`detalles-${keyForToggle}`}
                >
                  {abierta ? "Participar en esta Campaña" : "Ver Detalles"}
                </button>
              </div>
            </article>
          );
        })}
      </div>

      {/* Renderizar el Modal aquí */}
      <ParticiparModal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        campaign={selectedCampaign} // Pasa la campaña seleccionada al modal
        onParticipateSuccess={handleParticipationSuccess}
      />
    </section>
  );
}

export default Campanas;