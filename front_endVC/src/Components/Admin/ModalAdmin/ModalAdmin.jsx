import React, { useState } from "react";
import { crearBannerAdmin } from "../../../services/ServicioCarrusel";
import "./ModalAdmin.css";

export default function CaruselAdmin({ cerrar, recargar }) {
  const [form, setForm] = useState({
    imagen: null,
    texto: "",
    filtro_oscuro: false,
    mostrar_texto: true,
    estado: true,
  });

  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, type, value, checked, files } = e.target;

    if (type === "file") {
      setForm({ ...form, imagen: files[0] });
      setError(""); // limpia error si selecciona imagen
    } 
    else if (type === "checkbox") {
      setForm({ ...form, [name]: checked });
    } 
    else {
      setForm({ ...form, [name]: value });
    }
  };

  const guardar = async () => {
    // ✅ Validación imagen obligatoria
    if (!form.imagen) {
      setError("⚠️ Debes seleccionar una imagen antes de guardar.");
      return;
    }

    if (guardando) return; // 🛑 evita doble click

    try {
      setGuardando(true);
      setError("");

      await crearBannerAdmin({
        file: form.imagen,
        texto: form.texto ?? "",
        filtro_oscuro: form.filtro_oscuro ? "true" : "false",
        mostrar_texto: form.mostrar_texto ? "true" : "false",
      });

      recargar();
      cerrar();
    } catch (error) {
      console.error("Error guardando:", error);
      setError("❌ Ocurrió un error al guardar el banner.");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h2>Nuevo Banner</h2>
        <p>Configura un nuevo banner para tu carrusel</p>

        {/* MENSAJE ERROR */}
        {error && <p className="error-text">{error}</p>}

        {/* IMAGEN */}
        <label>Imagen *</label>
        <input 
          type="file" 
          name="imagen" 
          accept="image/*"
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
              onChange={(e) =>
                setForm({ ...form, estado: e.target.checked })
              }
            />
            <label htmlFor="switch-estado"></label>
          </div>
        </div>

        {/* BOTONES */}
        <div className="modal-footer">
          <button 
            className="btn-cancelar" 
            onClick={cerrar}
            disabled={guardando}
          >
            Cancelar
          </button>

          <button 
            className="btn-guardar" 
            onClick={guardar}
            disabled={guardando}
          >
            {guardando ? "Guardando..." : "Agregar Banner"}
          </button>
        </div>
      </div>
    </div>
  );
}
