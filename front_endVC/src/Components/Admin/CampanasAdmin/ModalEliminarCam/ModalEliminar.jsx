// ModalEliminarCampana.jsx
import React, { useState, useEffect } from "react";
import "./ModalEliminar.css";
import { eliminarCampana } from "../../../../services/ServicioCampanas"; // ajusta la ruta si hace falta

/**
 * Props:
 * - isOpen: boolean
 * - onClose: () => void
 * - campanaId: number|string (id de la campaña a eliminar)
 * - campanaTitulo: string (opcional, para mostrar en la confirmación)
 * - onDeleted: (id) => void  // callback cuando se elimina correctamente
 */
export default function ModalEliminarCampana({
  isOpen,
  onClose,
  campanaId,
  campanaTitulo = "",
  onDeleted
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);


  // cerrar con ESC
  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") onClose && onClose();
    }
    if (isOpen) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  async function handleDelete() {
    if (!campanaId) {
      setError("ID de campaña inválido");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await eliminarCampana(campanaId);
      onDeleted && onDeleted(campanaId);
      onClose && onClose();
    } catch (err) {
      console.error("Error eliminando campaña:", err);
      // intentar extraer mensaje legible
      const msg = err?.message ?? (typeof err === "string" ? err : "Error al eliminar");
      setError(String(msg));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-eliminar-overlay" onMouseDown={onClose}>
      <div className="modal-eliminar-container" onMouseDown={(e) => e.stopPropagation()}>
        <h3 className="modal-eliminar-title">Eliminar campaña</h3>

        <p className="modal-eliminar-text">
          ¿Estás seguro de que deseas eliminar la campaña
          {campanaTitulo ? <strong> «{campanaTitulo}»</strong> : " seleccionada"}?
          <br />
          Esta acción es irreversible.
        </p>

        {error && <div className="modal-eliminar-error">{error}</div>}

        <div className="modal-eliminar-actions">
          <button className="btn-cancel" onClick={onClose} disabled={loading}>
            Cancelar
          </button>
          <button className="btn-delete1" onClick={handleDelete} disabled={loading}>
            {loading ? "Eliminando..." : "Eliminar"}
          </button>
        </div>
      </div>
    </div>
  );
}
