import React, { useState } from "react";
import { crearBanner } from "../../services/ServicioCarrusel";
import "./ModalAdmin.css";

export default function ModalNuevoBanner({ cerrar, recargar }) {
  const [form, setForm] = useState({
    imagen: "",
    texto: "",
    filtro_oscuro: false,
    mostrar_texto: true,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    // Manejo de checkboxes y campos de texto
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const guardar = async () => {
    try {
      await crearBanner(form);
      recargar();
      cerrar();
    } catch (err) {
      console.error("Error al crear el banner:", err);
      alert("No se pudo agregar el banner. Revisa la consola.");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        {/* Botón para cerrar (Cruz "x" si se quiere añadir después con CSS) */}
        {/* Por ahora, usaremos el botón de Cancelar en el footer */}
        
        <h2>Nuevo Banner</h2>
        <p>Configura un nuevo banner para el carrusel</p>

        {/* URL de la Imagen */}
        <label htmlFor="imagen-url">URL de la Imagen *</label>
        <input
          id="imagen-url"
          type="text"
          name="imagen"
          placeholder="https://ejemplo.com/imagen.jpg"
          onChange={handleChange}
        />
        <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '-15px', marginBottom: '20px' }}>
          Sube la imagen a un servidor y pega la URL aquí
        </p>

        {/* Título del Banner */}
        <label htmlFor="banner-title">Título del Banner</label>
        <input
          id="banner-title"
          type="text"
          name="texto"
          placeholder="Ej: Ser donante es ser héroe sin capa"
          onChange={handleChange}
        />
        <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '-15px', marginBottom: '20px' }}>
          Ej: Ser donante es ser héroe sin capa
        </p>

        {/* Switch: Mostrar filtro oscuro */}
        <div className="switch-row">
          <span>
            **Mostrar filtro oscuro**
            <small>Overlay negro sobre la imagen para mejor legibilidad del texto</small>
          </span>
          {/* Se envuelve el input en <label> para el CSS del switch */}
          <label>
            <input 
              type="checkbox" 
              name="filtro_oscuro" 
              onChange={handleChange} 
              checked={form.filtro_oscuro}
            />
          </label>
        </div>

        {/* Switch: Mostrar texto */}
        <div className="switch-row">
          <span>
            **Mostrar texto**
            <small>Si se desactiva, solo se mostrará la imagen</small>
          </span>
          {/* Se envuelve el input en <label> para el CSS del switch */}
          <label>
            <input 
              type="checkbox" 
              name="mostrar_texto" 
              onChange={handleChange} 
              checked={form.mostrar_texto} 
            />
          </label>
        </div>

        {/* Footer y botones */}
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
