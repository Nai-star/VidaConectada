import React, { useEffect, useState } from "react";
import "./requisitosDonacion.css";
import { obtenerRequisitos } from "../../services/ServicioRequisitos";
import { FaClipboardList, FaCheckCircle } from "react-icons/fa";

function RequisitosDonacion() {
  const [requisitos, setRequisitos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    obtenerRequisitos()
      .then(setRequisitos)
      .catch((e) => setErr(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section id="requisitos" className="req-container">
      <h2 className="req-title">
        <FaClipboardList className="req-icon" /> Requisitos para Donar
      </h2>
      <p className="req-subtitle">
        Verifica que cumples con los requisitos básicos para ser donante
      </p>

      {loading && <p className="req-state">Cargando requisitos…</p>}
      {err && <p className="req-state">Error: {err}</p>}

      {!loading && !err && (
        <div className="req-card">
          <div className="req-grid">
            {requisitos.map((r, index) => (
              <div key={r.id?? index} className="req-item">
                <FaCheckCircle className="req-check" />
                <span>{r.requisitos}</span>
              </div>
            ))}
          </div>

          <div className="req-warning">
            <strong>Importante:</strong> Es fundamental que hayas comido bien antes de donar
            y que te mantengas hidratado. Evita alimentos grasosos el día de la donación.
          </div>

          <button className="req-btn">Ver Guía Completa</button>
        </div>
      )}

      <p className="req-footer">
        ¿Tienes dudas sobre si puedes donar?{" "}
        <a href="/contacto">Contacta con nosotros</a>
      </p>
    </section>
  );
}

export default RequisitosDonacion