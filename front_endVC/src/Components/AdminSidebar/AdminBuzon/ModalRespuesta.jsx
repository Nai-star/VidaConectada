// ModalRespuesta.jsx
import React, { useState } from "react";
import "./AdminBuzon.css";

export default function ModalRespuesta({ mensaje, onClose, onSave }) {
  const [text, setText] = useState(mensaje.respuesta || "");

  const guardar = () => {
    if (!text.trim()) return alert("Ingrese una respuesta");
    onSave(mensaje, text.trim());
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h2>Responder a {mensaje.Nombre_persona}</h2>

        <label>Pregunta:</label>
        <div className="pregunta-box">{mensaje.pregunta}</div>

        <label>Respuesta:</label>
        <textarea
          rows={5}
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        <div className="modal-actions">
          <button onClick={guardar}>Guardar</button>
          <button className="cancel" onClick={onClose}>
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
