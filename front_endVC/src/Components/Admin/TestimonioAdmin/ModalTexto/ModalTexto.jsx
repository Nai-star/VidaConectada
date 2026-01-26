import React, { useState } from "react";

export default function ModalTexto({
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

    // ✅ Validación imagen obligatoria solo al crear
    if (!editando && !form.Foto_P) {
      setError("⚠️ Debes seleccionar una imagen.");
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
        <h3>{editando ? "Editar Testimonio" : "Nuevo Testimonio"}</h3>

        {error && <p className="error-text">{error}</p>}

        <form onSubmit={handleSubmit}>
          <input
            name="Nombre"
            placeholder="Nombre"
            value={form.Nombre}
            onChange={onChange}
            required
          />

          <input
            name="Frase"
            placeholder="Mensaje testimonio"
            value={form.Frase}
            onChange={onChange}
            required
          />

          <input
            type="file"
            name="Foto_P"
            accept="image/*"
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
