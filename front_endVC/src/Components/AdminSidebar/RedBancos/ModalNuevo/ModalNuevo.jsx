// ModalNuevo.jsx
import React, { useState } from "react";
import { crearBanco } from "../../../../services/ServiciosHospitales";
import "../RedBancos.css"; // usa las reglas .rb-*

export default function ModalNuevo({ onClose, reloadData }) {
  const [form, setForm] = useState({
    nombre_hospi: "",
    horarios: "",
    hora: "",
    Contacto: "",
    Notas: ""
  });

  const [errores, setErrores] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));

    // limpia error tan pronto se escribe
    setErrores(prev => ({ ...prev, [name]: "" }));
  };

  const guardar = async () => {
    let nuevosErrores = {};

    // 🔴 VALIDACIONES (Notas NO se valida)
    if (!form.nombre_hospi.trim()) nuevosErrores.nombre_hospi = "Este campo es requerido";
    if (!form.horarios.trim()) nuevosErrores.horarios = "Este campo es requerido";
    if (!form.hora.trim()) nuevosErrores.hora = "Este campo es requerido";
    if (!form.Contacto.trim()) nuevosErrores.Contacto = "Este campo es requerido";

    // si hay errores, no envía nada
    if (Object.keys(nuevosErrores).length > 0) {
      setErrores(nuevosErrores);
      return;
    }

    setLoading(true);
    try {
      await crearBanco({
        nombre_hospi: form.nombre_hospi,
        horarios: form.horarios,
        hora: form.hora,
        Contacto: form.Contacto,
        Notas: form.Notas || ""
      });

      reloadData();
      onClose();
    } catch (error) {
      console.error("ModalNuevo: error creando banco:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rb-modal-overlay">
      <div className="rb-modal">
        <h3>Nuevo Banco / Hospital</h3>

        {/* Nombre */}
        <label>Nombre</label>
        <input
          type="text"
          name="nombre_hospi"
          value={form.nombre_hospi}
          onChange={handleChange}
        />
        {errores.nombre_hospi && <p className="rb-error">{errores.nombre_hospi}</p>}

        <div className="rb-row">
          <div>
            <label>Horarios</label>
            <input
              type="text"
              name="horarios"
              value={form.horarios}
              onChange={handleChange}
            />
            {errores.horarios && <p className="rb-error">{errores.horarios}</p>}
          </div>

          <div>
            <label>Hora</label>
            <input
              type="text"
              name="hora"
              value={form.hora}
              onChange={handleChange}
            />
            {errores.hora && <p className="rb-error">{errores.hora}</p>}
          </div>
        </div>

        <label>Contacto</label>
        <input
          type="text"
          name="Contacto"
          value={form.Contacto}
          onChange={handleChange}
        />
        {errores.Contacto && <p className="rb-error">{errores.Contacto}</p>}

        <label>Notas</label>
        <input
          type="text"
          name="Notas"
          value={form.Notas}
          onChange={handleChange}
        />

        <div className="rb-modal-actions">
          <button className="rb-btn-cancel" onClick={onClose} disabled={loading}>
            Cancelar
          </button>
          <button className="rb-btn-save" onClick={guardar} disabled={loading}>
            {loading ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
}
