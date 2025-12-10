// AlertModal.jsx
import React from "react";
import "./AlertModal.css";

export default function AlertModal({ open, title, message, onClose }) {
  if (!open) return null;

  return (
    <div className="alert-overlay">
      <div className="alert-modal">
        <h3>{title || "Mensaje"}</h3>
        <p>{message}</p>

        <button className="alert-btn" onClick={onClose}>
          OK
        </button>
      </div>
    </div>
  );
}
