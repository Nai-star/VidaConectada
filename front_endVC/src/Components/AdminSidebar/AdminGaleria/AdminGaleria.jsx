import React, { useEffect, useState } from "react";
import {
  crearGaleriaAdmin,
  listarGaleriaAdmin,
  eliminarGaleriaAdmin,
  cambiarEstadoGaleriaAdmin, 
} from "../../../services/ServicioGaleriaAdmin";
import "./AdminGaleria.css";
import { FiTrash2, FiToggleLeft, FiToggleRight } from "react-icons/fi";


function AdminGaleria() {
  const [items, setItems] = useState([]);
  const [file, setFile] = useState(null);
  const [descripcion, setDescripcion] = useState("");
  const [activo, setActivo] = useState(true);

  async function cargar() {
    try {
      const data = await listarGaleriaAdmin();
      setItems(data);
    } catch (error) {
      console.error("Error cargando galería:", error);
    }
  }

  useEffect(() => {
    cargar();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!file) return

    try {
      await crearGaleriaAdmin({ file, descripcion, activo });
      setFile(null);
      setDescripcion("");
      setActivo(true);
      cargar();
    } catch (error) {
      console.error("Error creando galería:", error);
  
    }
  }

  return (
<div className="admin-box">
  <div className="title-section">
  <h2>Galería</h2>
  <p >Sube y administra imágenes o videos que se mostrarán en la galería de la página principal.</p>
  </div>
  <br />

  <form onSubmit={handleSubmit} className="admin-form">

    {/* Input de archivo personalizado */}
    <div className="file-input-wrapper">
      <label className="file-input-label">
        {file ? "Cambiar archivo" : "Seleccionar archivo"}
        <input
          type="file"
          accept="image/*,video/*"
          onChange={(e) => setFile(e.target.files[0])}
        />
      </label>
      {file && <div className="file-input-name">{file.name}</div>}
    </div>

    {/* Textarea de descripción */}
    <textarea
      className="admin-textarea"
      placeholder="Descripción"
      value={descripcion}
      onChange={(e) => setDescripcion(e.target.value)}
    />

    {/* Checkbox de activo */}
    <label className="admin-checkbox">
      <input
        type="checkbox"
        checked={activo}
        onChange={(e) => setActivo(e.target.checked)}
      />
      Activo
    </label>

    <button type="submit" className="admin-btn">Guardar</button>
  </form>



      <div className="admin-list">
        {items.map((it) => (
          <div className="admin-card" key={it.id}>
            {it.video_url ? (
              <video src={it.video_url} controls />
            ) : (
              <img src={it.imagen_g} alt="" />
            )}

            <div className="admin-card-body">
              <p>{it.descripcion}</p>
            <button
                className="icon-btn delete-btn"
                title="Eliminar"
                onClick={async () => {
                if (window.confirm("¿Seguro que quieres eliminar este item?")) {
                    try {
                    await eliminarGaleriaAdmin(it.id);
                    cargar();
                    } catch (err) {
                    console.error("Error eliminando:", err);
                    }
                }
                }}
            >
                <FiTrash2 />
            </button>

            <button
                className={`icon-btn toggle-btn ${it.activo ? "activo" : "inactivo"}`}
                title={it.activo ? "Desactivar" : "Activar"}
                onClick={async () => {
                try {
                    await cambiarEstadoGaleriaAdmin(it.id, !it.activo);
                    cargar();
                } catch (err) {
                    console.error("Error cambiando estado:", err);
                }
                }}
            >
                {it.activo ? <FiToggleRight /> : <FiToggleLeft />}
            </button>

            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AdminGaleria;
