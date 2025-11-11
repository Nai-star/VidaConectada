import React, { useEffect, useState } from "react";
import "./PreguntasFrecuentes.css";
import { obtenerPreguntasFrecuentes } from "../../services/servicioFaq";
import { FaQuestionCircle } from "react-icons/fa";
import { FiChevronDown } from "react-icons/fi";





function PreguntasFrecuentes() {

    const [faqs, setFaqs] = useState([]);
    const [openId, setOpenId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState("");

    useEffect(() => {
        obtenerPreguntasFrecuentes()
        .then(setFaqs)
        .catch((e) => setErr(e.message))
        .finally(() => setLoading(false));
    }, []);

    const toggle = (id) => setOpenId((prev) => (prev === id ? null : id));




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
        <div className="faq-list">
          {faqs.map((q) => {
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
                  <span>{q.pregunta}</span>
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
                  <p>{q.respuesta}</p>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  )
}

export default PreguntasFrecuentes