// src/Pages/PreguntasFrecuentes/PreguntasFrecuentes.jsx
import React, { useEffect, useMemo, useState } from "react";
import "./PreguntasFrecuentes.css";
import { obtenerPreguntasFrecuentes } from "../../services/ServicioFaq";
import { obtenerUsuarioActual } from "../../services/ServicioBuzon";
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
  const [usuario, setUsuario] = useState(null);

  // Cargar preguntas frecuentes
  useEffect(() => {
    obtenerPreguntasFrecuentes()
      .then(setFaqs)
      .catch((e) => setErr(e.message))
      .finally(() => setLoading(false));
  }, []);

  // Cargar usuario actual
  useEffect(() => {
    const cargarUsuario = async () => {
      const u = await obtenerUsuarioActual();
      setUsuario(u);
    };
    cargarUsuario();
  }, []);

  const toggle = (id) => setOpenId((prev) => (prev === id ? null : id));

  // Ordenar FAQs por fecha si existe
  const sortedFaqs = useMemo(() => {
    if (!faqs || faqs.length === 0) return [];
    const dateKeys = ["created_at", "createdAt", "fecha", "fecha_creacion"];
    const hasDateKey = (item) =>
      dateKeys.find((k) => item?.[k] !== undefined && item?.[k] !== null);
    const anyHasDate = faqs.some(hasDateKey);
    if (!anyHasDate) return [...faqs];

    const getTime = (item) => {
      const key = dateKeys.find(
        (k) => item?.[k] !== undefined && item?.[k] !== null
      );
      const val = key ? item[key] : null;
      const t = val ? Date.parse(val) : NaN;
      return Number.isFinite(t) ? t : 0;
    };

    return [...faqs].sort((a, b) => getTime(b) - getTime(a));
  }, [faqs]);

  // Determinar FAQs visibles
  const visibleFaqs = useMemo(() => {
    if (showAll) return sortedFaqs;
    return sortedFaqs.slice(0, 5);
  }, [sortedFaqs, showAll]);

 
  
  const abrirModal = () => {
  setModalOpen(true);
};

  console.log(visibleFaqs);
  

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
                    <span>{q.pregunta ?? "Pregunta sin título"}</span>
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

          {/* Botón Ver más / Ver menos */}
          {sortedFaqs.length > 5 && (
            <div
              className="faq-subtitle"
              style={{ textAlign: "center", marginTop: 12 }}
            >
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
                {showAll ? (
                  <b>Ver menos</b>
                ) : (
                  <>
                    <b>Ver más</b> ({sortedFaqs.length - 5} restantes)
                  </>
                )}
              </button>
            </div>
          )}
        </>
      )}

      <p className="faq-subtitle" style={{ marginTop: 18 }}>
        ¿No encontraste tu respuesta?{" "}
        <button
          className="faq-open-buzon"
          onClick={abrirModal}
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
