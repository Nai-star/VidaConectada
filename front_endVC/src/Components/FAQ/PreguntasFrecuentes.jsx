import React, { useEffect, useMemo, useState } from "react";
import "./PreguntasFrecuentes.css";
import { obtenerPreguntasFrecuentes } from "../../services/ServicioFaq";
import { FaQuestionCircle } from "react-icons/fa";
import { FiChevronDown } from "react-icons/fi";
import BuzonPreguntas from "../../Components/Buzon/BuzonPreguntas";

function PreguntasFrecuentes() {
  const [faqs, setFaqs] = useState([]);
  const [openId, setOpenId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [isModalOpen, setModalOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    obtenerPreguntasFrecuentes()
      .then(setFaqs)
      .catch((e) => setErr(e.message))
      .finally(() => setLoading(false));
  }, []);

  const toggle = (id) => setOpenId((prev) => (prev === id ? null : id));

  // Intentamos ordenar por fecha si existe alguno de estos campos
  const sortedFaqs = useMemo(() => {
    if (!faqs || faqs.length === 0) return [];
    const dateKeys = ["created_at", "createdAt", "fecha", "fecha_creacion"];
    const hasDateKey = (item) =>
      dateKeys.find((k) => item?.[k] !== undefined && item?.[k] !== null);
    // si ninguna pregunta tiene fecha, devolvemos tal cual
    const anyHasDate = faqs.some(hasDateKey);
    if (!anyHasDate) return [...faqs];

    // función para obtener timestamp o 0 si no hay fecha
    const getTime = (item) => {
      const key = dateKeys.find((k) => item?.[k] !== undefined && item?.[k] !== null);
      const val = key ? item[key] : null;
      // intentar parsear string o número
      const t = val ? Date.parse(val) : NaN;
      return Number.isFinite(t) ? t : 0;
    };

    // ordenar descendente (más reciente primero)
    return [...faqs].sort((a, b) => getTime(b) - getTime(a));
  }, [faqs]);

  // Determina la lista que se renderiza según showAll
  const visibleFaqs = useMemo(() => {
    if (showAll) return sortedFaqs;
    return sortedFaqs.slice(0, 5);
  }, [sortedFaqs, showAll]);

  return (
    <section className="faq-wrap" id="faq">
      <h2 className="faq-title">
        <FaQuestionCircle className="faq-icon" /> Preguntas Frecuentes
      </h2>
      <p className="faq-subtitle">
        Resolvemos las dudas más comunes sobre donación de sangre
      </p>

      {loading && <p className="faq-state">Cargando…</p>}
      {!!err && !loading && <p className="faq-state">Error: {err}</p>}

      {!loading && !err && (
        <>
          <div className="faq-list">
            {visibleFaqs.map((q) => {
              const isOpen = q.id === openId;
              return (
                <article
                  key={q.id}
                  className={`faq-item ${isOpen ? "open" : ""}`}
                >
                  <button
                    className="faq-q"
                    onClick={() => toggle(q.id)}
                    aria-expanded={isOpen}
                    aria-controls={`faq-panel-${q.id}`}
                  >
                    <span>{q.Buzon?.pregunta ?? "Pregunta sin título"}</span>
                    <FiChevronDown className="chev" />
                  </button>

                  <div
                    id={`faq-panel-${q.id}`}
                    className="faq-a"
                    role="region"
                    aria-hidden={!isOpen}
                    style={
                      isOpen
                        ? { maxHeight: "400px", opacity: 1 }
                        : { maxHeight: 0, opacity: 0 }
                    }
                  >
                    <p>{q.Respuesta_P ?? "Sin respuesta disponible."}</p>
                  </div>
                </article>
              );
            })}
          </div>

          {/* Botón Ver más / Ver menos: solo si hay más de 5 preguntas */}
          {sortedFaqs.length > 5 && (
            <div className="faq-subtitle" style={{ textAlign: "center", marginTop: 12 }}>
              <button
                className="faq-open-buzon"
                onClick={() => setShowAll((s) => !s)}
                aria-expanded={showAll}
                aria-controls="faq-list"
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  fontSize: 14,
                  textDecoration: "underline",
                  textUnderlineOffset: 3,
                  padding: 6,
                }}
              >
                {showAll ? <b>Ver menos</b> : <><b>Ver más</b> ({sortedFaqs.length - 5} restantes)</>}
              </button>
            </div>
          )}
        </>
      )}

      <p className="faq-subtitle" style={{ marginTop: 18 }}>
        ¿No encontraste tu respuesta?{" "}
        <button
          className="faq-open-buzon"
          onClick={() => setModalOpen(true)}
          aria-haspopup="dialog"
        >
          <b>Envíanos tu pregunta</b>
        </button>
      </p>

      <BuzonPreguntas
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
      />
    </section>
  );
}

export default PreguntasFrecuentes;
