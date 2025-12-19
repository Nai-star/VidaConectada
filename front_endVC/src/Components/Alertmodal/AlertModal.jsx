// AlertModal.jsx
import React from "react";
import "./AlertModal.css";

export default function AlertModal({
  open,
  title,
  message,
  onConfirm,
  onCancel,
}) {
  if (!open) return null;

  return (
    <div className="alert-overlay">
      <div className="alert-modal">
        <h3>{title || "Confirmación"}</h3>
        <p>{message}</p>

        <div className="alert-actions">
          <button className="alert-btn cancel" onClick={onCancel}>
            Cancelar
          </button>
          <button className="alert-btn confirm" onClick={onConfirm}>
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}
