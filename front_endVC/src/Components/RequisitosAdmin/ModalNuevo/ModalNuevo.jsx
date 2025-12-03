import React, { useState } from "react";
import { crearRequisito } from "../../../services/ServicioRequisitos";
import "./ModalNuevo.css";

export default function ModalNuevoRequisito({ cerrar, recargar }) {
  const [form, setForm] = useState({
    requisitos: "",
    Estado: true,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await crearRequisito(form);
      recargar();
      cerrar();
    } catch (error) {
      console.error("Error creando requisito", error);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box">

        {/* Botón X arriba */}
        <button className="close-button" onClick={cerrar}>
          ×
        </button>

        <h2>Nuevo Requisito</h2>
        <p>Agrega un nuevo requisito para donar sangre.</p>

        <form onSubmit={handleSubmit}>

          <label>Requisito</label>
          <input
            type="text"
            name="requisitos"
            value={form.requisitos}
            onChange={handleChange}
            placeholder="Escribe el requisito"
            required
          />

          <label style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <input
              type="checkbox"
              name="Estado"
              checked={form.Estado}
              onChange={handleChange}
            />
            Visible
          </label>

          <div className="modal-footer">
            <button type="button" className="btn-cancelar" onClick={cerrar}>
              Cancelar
            </button>

            <button type="submit" className="btn-guardar">
              Agregar Requisito
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
