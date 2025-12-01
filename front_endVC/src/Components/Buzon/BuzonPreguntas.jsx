import React, { useEffect, useRef, useState } from "react";
import "./BuzonPreguntas.css";
import { crearConsultaBuzon } from "../../services/ServicioBuzon";
import { FiMessageSquare } from "react-icons/fi";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;

function BuzonPreguntas({ isOpen, onClose }) {
  const [form, setForm] = useState({ nombre: "", correo: "", pregunta: "" });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: "", msg: "" });
  const overlayRef = useRef(null);
  const firstFieldRef = useRef(null);
  const previouslyFocused = useRef(null);

  const onChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const validate = () => {
    if (!form.nombre.trim()) return "El nombre es requerido.";
    if (!emailRegex.test(form.correo)) return "Ingresa un correo válido.";
    if (form.pregunta.trim().length < 10)
      return "La pregunta debe tener al menos 10 caracteres.";
    return "";
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) {
      setStatus({ type: "error", msg: err });
      return;
    }
    try {
      setLoading(true);
      setStatus({ type: "", msg: "" });
      await crearConsultaBuzon(form);
      setStatus({
        type: "success",
        msg: "¡Gracias! Tu consulta fue enviada al equipo. Te responderemos pronto.",
      });
      setForm({ nombre: "", correo: "", pregunta: "" });
    } catch (e2) {
      setStatus({
        type: "error",
        msg: e2?.message || "Ocurrió un error inesperado.",
      });
    } finally {
      setLoading(false);
    }
  };

  // close on ESC
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  // focus management
  useEffect(() => {
    if (isOpen) {
      previouslyFocused.current = document.activeElement;
      setTimeout(() => {
        firstFieldRef.current?.focus();
      }, 0);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      previouslyFocused.current?.focus?.();
    }
    // cleanup
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="bz-modal-overlay"
      ref={overlayRef}
      onMouseDown={(e) => {
        // click fuera del panel => cerrar
        if (e.target === overlayRef.current) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="bz-modal-title"
    >
      <div className="bz-modal-panel" onMouseDown={(e) => e.stopPropagation()}>
        <header className="bz-modal-header">
          <h3 id="bz-modal-title" className="bz-title modal-title">
            <FiMessageSquare className="bz-icon" />
            Buzón de Preguntas
          </h3>
          <button
            aria-label="Cerrar"
            className="bz-modal-close"
            onClick={onClose}
          >
            ✕
          </button>
        </header>

        <form className="bz-card modal-card" onSubmit={onSubmit} noValidate>
          <label className="bz-label" htmlFor="nombre">Nombre completo</label>
          <input
            id="nombre"
            name="nombre"
            ref={firstFieldRef}
            className="bz-input"
            placeholder="Tu nombre"
            value={form.nombre}
            onChange={onChange}
            disabled={loading}
            autoComplete="name"
          />
          <br />
          <label className="bz-label" htmlFor="correo">Correo electrónico</label>
          <input
            id="correo"
            name="correo"
            className="bz-input"
            placeholder="correo@ejemplo.com"
            value={form.correo}
            onChange={onChange}
            disabled={loading}
            autoComplete="email"
          />
          <br />
          <label className="bz-label" htmlFor="pregunta">Tu pregunta</label>
          <textarea
            id="pregunta"
            name="pregunta"
            className="bz-textarea"
            placeholder="Escribe tu pregunta aquí..."
            rows={5}
            value={form.pregunta}
            onChange={onChange}
            disabled={loading}
          />
            <br />
          <div className="bz-note">
            <strong>Nota:</strong>{" "}
            Las preguntas seleccionadas para publicar en la sección de FAQ serán
            mostradas de forma anónima para proteger tu privacidad.
          </div>

          {status.msg && (
            <div className={`bz-alert ${status.type}`}>
              {status.msg}
            </div>
          )}

          <div style={{ display: "flex", gap: 10 }}>
            <button className="bz-btn" type="submit" disabled={loading}>
              {loading ? "Enviando..." : "Enviar Consulta"}
            </button>
            {/* <button
              type="button"
              className="bz-btn outline"
              onClick={onClose}
              disabled={loading}
              style={{ width: 140 }}
            >
              Cancelar
            </button> */}
          </div>
        </form>
      </div>
    </div>
  );
}

export default BuzonPreguntas;
