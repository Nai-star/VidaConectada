import React, { useEffect, useState } from "react";
import "./galeriaeditmodal.css";

export default function GaleriaEditModal({
  open,
  title,
  initialValue = "",
  onConfirm,
  onCancel,
}) {
  const [value, setValue] = useState("");

  useEffect(() => {
    if (open) {
      setValue(initialValue);
    }
  }, [open, initialValue]);

  if (!open) return null;

  return (
    <div className="alert-overlay">
      <div className="alert-modal">
        <h3>{title || "Editar descripción"}</h3>

        <textarea
          className="edit-textarea"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          rows={4}
        />

        <div className="alert-actions">
          <button className="alert-btn cancel" onClick={onCancel}>
            Cancelar
          </button>
          <button
            className="alert-btn confirm"
            onClick={() => onConfirm(value)}
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}
