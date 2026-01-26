// ModalRespuesta.jsx
import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import "./AdminBuzon.css"; // asegúrate de la ruta correcta

export default function ModalRespuesta({ mensaje, respuestaExistente, onClose, onSave }) {
  const [texto, setTexto] = useState(respuestaExistente?.Respuesta_P || "");
  const textareaRef = useRef(null);
  const mount = typeof document !== "undefined" ? document.body : null;

  useEffect(() => {
    setTexto(respuestaExistente?.Respuesta_P || "");
  }, [respuestaExistente]);

  // bloquear scroll de body mientras el modal esté abierto
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previous; };
  }, []);

  useEffect(() => { if (textareaRef.current) textareaRef.current.focus(); }, []);

  function handleSubmit(e) {
    e.preventDefault();
    if (!texto || texto.trim() === "") {
      return;
    }
    try { onSave(texto.trim()); } catch (err) { console.error("Error onSave:", err); }
  }

  const modalContent = (
    <div className="rb-modal-backdrop" onMouseDown={(e) => {
      if (e.target.classList && e.target.classList.contains("rb-modal-backdrop")) onClose();
    }}>
      <div className="rb-modal" onMouseDown={(e) => e.stopPropagation()}>
        <div className="rb-modal-header">
          <h3 style={{ margin: 0 }}>{mensaje?.pregunta ? "Responder" : "Crear respuesta"}</h3>
          <button className="rb-modal-close" onClick={onClose} aria-label="Cerrar">✕</button>
        </div>

        <div className="rb-modal-body">
          <div style={{ marginBottom: 12 }}>
            <strong>Pregunta:</strong>
            <div style={{ marginTop: 6, color: "#333" }}>{mensaje?.pregunta || "— sin pregunta —"}</div>
          </div>

          <form onSubmit={handleSubmit}>
            <textarea
              ref={textareaRef}
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              rows={7}
              className="rb-modal-textarea"
            />

            <div className="rb-modal-footer">
              <button
                type="button"
                onClick={onClose}
                className="btn"
                style={{ background: "#f3f4f6", color: "#111827" }}
              >
                Cancelar
              </button>
              <button type="submit" className="btn primary">
                Guardar respuesta
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );

  if (!mount) return null;
  return createPortal(modalContent, mount);
}
