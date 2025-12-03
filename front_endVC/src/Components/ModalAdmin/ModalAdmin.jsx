import React, { useState } from "react";
import { crearBannerAdmin } from "../../services/ServicioCarrusel";
import "./ModalAdmin.css";

export default function CaruselAdmin({ cerrar, recargar }) {
  const [form, setForm] = useState({
    imagen: "",
    texto: "",
    filtro_oscuro: false,
    mostrar_texto: true,
    estado: true,
  });

  const handleChange = (e) => {
    const { name, type, value, checked, files } = e.target;

    if (type === "file") {
      setForm({ ...form, imagen: files[0] });
    } else if (type === "checkbox") {
      setForm({ ...form, [name]: checked });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const guardar = async () => {
    try {
      const formData = new FormData();

      // 🔥 ARCHIVO O URL (si no hay archivo)
      formData.append("imagen", form.imagen ?? "");

      // 🔥 CAMPOS TEXTO
      formData.append("texto", form.texto ?? "");

      // 🔥 BOOLEANS DEBEN SER STRINGS (DRF NO ACEPTA BOOLEANOS DIRECTOS)
      formData.append("filtro_oscuro", form.filtro_oscuro ? "true" : "false");
      formData.append("mostrar_texto", form.mostrar_texto ? "true" : "false");

      // 🔥 SIEMPRE GUARDARLO ACTIVO AL CREAR
      formData.append("estado", "true");

      await crearBannerAdmin(formData);

      recargar();
      cerrar();
    } catch (error) {
      console.error("Error guardando:", error);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box">

        <h2>Nuevo Banner</h2>
        <p>Configura un nuevo banner para tu carrusel</p>

        {/* IMAGEN */}
        <label>Imagen</label>
        <input 
          type="file" 
          name="imagen" 
          onChange={handleChange} 
        />

        {/* TEXTO */}
        <label>Texto</label>
        <input 
          type="text" 
          name="texto" 
          value={form.texto} 
          onChange={handleChange} 
          placeholder="Escribe un texto opcional"
        />

        {/* SWITCH: FILTRO OSCURO */}
        <div className="switch-row">
          <span>
            Filtro oscuro
            <small>Oscurece la imagen para resaltar el texto</small>
          </span>

          <div>
            <input 
              id="switch-filtro" 
              type="checkbox" 
              name="filtro_oscuro" 
              checked={form.filtro_oscuro}
              onChange={handleChange}
            />
            <label htmlFor="switch-filtro"></label>
          </div>
        </div>

        {/* SWITCH: MOSTRAR TEXTO */}
        <div className="switch-row">
          <span>
            Mostrar texto
            <small>Activa o desactiva la visualización del texto</small>
          </span>

          <div>
            <input 
              id="switch-texto" 
              type="checkbox" 
              name="mostrar_texto" 
              checked={form.mostrar_texto}
              onChange={handleChange}
            />
            <label htmlFor="switch-texto"></label>
          </div>
        </div>

        {/* SWITCH: ESTADO */}
        <div className="switch-row">
          <span>
            Estado
            <small>Define si el banner estará activo o inactivo</small>
          </span>

          <div>
            <input 
              id="switch-estado" 
              type="checkbox" 
              name="estado" 
              checked={form.estado}
              onChange={(e) => setForm({ ...form, estado: e.target.checked })}
            />
            <label htmlFor="switch-estado"></label>
          </div>
        </div>

        {/* BOTONES */}
        <div className="modal-footer">
          <button className="btn-cancelar" onClick={cerrar}>
            Cancelar
          </button>
          <button className="btn-guardar" onClick={guardar}>
            Agregar Banner
          </button>
        </div>

      </div>
    </div>
  );
}
