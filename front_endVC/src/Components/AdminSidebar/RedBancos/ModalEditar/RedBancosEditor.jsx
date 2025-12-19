import React, { useState, useEffect } from "react";
import {
  crearBanco,
  actualizarBanco
} from "../../../../services/ServiciosHospitales"; 
import "./RedBancos.css";

export default function RedBancosEditor({ banco, onClose, reloadData }) {
  const [form, setForm] = useState({
    nombre_hospi: "",
    horarios: "",
    hora: "",
    Contacto: "",
    Notas: "",
  });

  useEffect(() => {
    if (banco) {
      setForm({
        nombre_hospi: banco.nombre_hospi || "",
        horarios: banco.horarios || "",
        hora: banco.hora || "",
        Contacto: banco.Contacto || "",
        Notas: banco.Notas || "",
      });
    }
  }, [banco]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const guardar = async () => {
    try {
      if (banco) {
        // PATCH
        await actualizarBanco(banco.id, form);
      } else {
        // POST
        await crearBanco(form);
      }

      reloadData();
      onClose();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="rb-modal-overlay">
      <div className="rb-modal">
        <h3>{banco ? "Editar Banco / Hospital" : "Nuevo Banco / Hospital"}</h3>

        <label>Nombre del Hospital o Banco</label>
        <input
          type="text"
          name="nombre_hospi"
          value={form.nombre_hospi}
          onChange={handleChange}
        />

        <div className="rb-row">
          <div>
            <label>Horarios</label>
            <input
              type="text"
              name="horarios"
              value={form.horarios}
              onChange={handleChange}
            />
          </div>

          <div>
            <label>Hora</label>
            <input
              type="text"
              name="hora"
              value={form.hora}
              onChange={handleChange}
            />
          </div>
        </div>

        <label>Contacto</label>
        <input
          type="text"
          name="Contacto"
          value={form.Contacto}
          onChange={handleChange}
        />

        <label>Notas</label>
        <input
          type="text"
          name="Notas"
          value={form.Notas}
          onChange={handleChange}
        />

        <div className="rb-modal-actions">
          <button className="rb-btn-cancel" onClick={onClose}>
            Cancelar
          </button>

          <button className="rb-btn-save" onClick={guardar}>
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}
