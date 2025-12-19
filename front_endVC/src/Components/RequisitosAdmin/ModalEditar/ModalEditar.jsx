import React, { useState, useEffect } from "react";
import { actualizarRequisito } from "../../../services/ServicioRequisitos";
import "./ModalEditar.css";

export default function ModalEditarRequisito({ cerrar, recargar, requisito }) {
  const [form, setForm] = useState({
    requisitos: "",
    Estado: true,
  });

  useEffect(() => {
    if (requisito) {
      setForm({
        requisitos: requisito.requisitos,
        Estado: requisito.Estado,
        id: requisito.id,
      });
    }
  }, [requisito]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await actualizarRequisito(form.id, {
        requisitos: form.requisitos,
        Estado: form.Estado,
      });

      recargar();
      cerrar();
    } catch (error) {
      console.error("Error editando requisito", error);
    }
  };

  return (
    <div className="modal-admin-overlay">
      <div className="modal-admin-content">
        <h3>Editar Requisito</h3>

        <form onSubmit={handleSubmit}>
          <label className="label-text">Requisito:</label>
          <input
            type="text"
            name="requisitos"
            value={form.requisitos}
            onChange={handleChange}
            required
            className="input-text"
          />

          <label className="label-check">
            <input
              type="checkbox"
              name="Estado"
              checked={form.Estado}
              onChange={handleChange}
            />
            Visible
          </label>

          <div className="modal-buttons">
            <button type="submit" className="btn-save">Actualizar</button>
            <button type="button" className="btn-cancel1" onClick={cerrar}>
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
