import React, { useState } from "react";

export default function ModalVideo({
  visible,
  onClose,
  onSubmit,
  form,
  onChange,
  editando
}) {
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  if (!visible) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ Validación video obligatorio solo al crear
    if (!editando && !form.Video) {
      setError("⚠️ Debes seleccionar un video.");
      return;
    }

    if (guardando) return;

    try {
      setGuardando(true);
      setError("");
      await onSubmit();
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <h3>{editando ? "Editar Video" : "Nuevo Video"}</h3>

        {error && <p className="error-text">{error}</p>}

        <form onSubmit={handleSubmit}>
          <input
            name="Descripcion"
            placeholder="Descripción breve"
            value={form.Descripcion}
            onChange={onChange}
            required
          />

          <input
            type="file"
            name="Video"
            accept="video/*"
            onChange={onChange}
          />

          <div className="modal-actions">
            <button type="button" onClick={onClose} disabled={guardando}>
              Cancelar
            </button>

            <button type="submit" disabled={guardando}>
              {guardando ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
