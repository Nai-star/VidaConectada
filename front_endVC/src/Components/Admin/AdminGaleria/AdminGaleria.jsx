import React, { useEffect, useState } from "react";
import {
  crearGaleriaAdmin,
  listarGaleriaAdmin,
  eliminarGaleriaAdmin,
  cambiarEstadoGaleriaAdmin,
  actualizarDescripcionGaleria, 
} from "../../../services/ServicioGaleriaAdmin";
import "./AdminGaleria.css";
import { FiTrash2, FiToggleLeft, FiToggleRight, FiEdit } from "react-icons/fi";
import AlertModal from "../../Alertmodal/AlertModal";
import GaleriaEditModal from "../../Admin/AdminGaleria/Modal-editar/GaleriaEditModal";


function AdminGaleria() {
  const [items, setItems] = useState([]);
  const [file, setFile] = useState(null);
  const [descripcion, setDescripcion] = useState("");
  const [activo, setActivo] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [itemAEliminar, setItemAEliminar] = useState(null);
  const [subiendo, setSubiendo] = useState(false);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [itemAEditar, setItemAEditar] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();

    if (!file || subiendo) return;   // 🚫 Bloquea doble click

    try {
      setSubiendo(true);             // 🔒 Bloquea botón

      await crearGaleriaAdmin({ file, descripcion, activo });

      setFile(null);
      setDescripcion("");
      setActivo(true);
      await cargar();

    } catch (error) {
      console.error("Error creando galería:", error);
    } finally {
      setSubiendo(false);            // 🔓 Libera botón
    }
  }


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

    
    function abrirModalEliminar(item) {
    setItemAEliminar(item);
    setModalOpen(true);
  }

  function cerrarModal() {
    setModalOpen(false);
    setItemAEliminar(null);
  }

  async function confirmarEliminar() {
    if (!itemAEliminar) return;

    try {
      await eliminarGaleriaAdmin(itemAEliminar.id);
      cargar();
    } catch (err) {
      console.error("Error eliminando:", err);
    } finally {
      cerrarModal();
    }
  }

function abrirModalEditar(item) {
  setItemAEditar(item);
  setEditModalOpen(true);
}

function cerrarModalEditar() {
  setEditModalOpen(false);
  setItemAEditar(null);
}

async function confirmarEdicion(nuevaDescripcion) {
  if (!itemAEditar) return;

  try {
    await actualizarDescripcionGaleria(
      itemAEditar.id,
      nuevaDescripcion
    );
    cargar();
  } catch (err) {
    console.error("Error actualizando descripción:", err);
  } finally {
    cerrarModalEditar();
  }
}

const esVideo = (url) => {
  return url?.match(/\.(mp4|webm|ogg|mov)$/i);
};


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

    <button 
      type="submit" 
      className="admin-btn"
      disabled={subiendo}
    >
      {subiendo ? "Subiendo..." : "Guardar"}
    </button>

  </form>



      <div className="admin-list">
        {items.map((it) => (
          <div className="admin-card" key={it.id}>
            {esVideo(it.imagen_g) ? (
              <video src={it.imagen_g} controls className="media-preview" />
            ) : (
              <img src={it.imagen_g} alt="" className="media-preview" />
            )}

            <div className="admin-card-body">
              <p>{it.descripcion}</p>
            <button
                className="icon-btn delete-btn"
                title="Eliminar"
                onClick={() => abrirModalEliminar(it)}
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

            <button
              className="icon-btn edit-btn"
              title="Editar descripción"
              onClick={() => abrirModalEditar(it)}
            >
              <FiEdit />
            </button>


            </div>
          </div>
        ))}
      </div>


      <AlertModal
        open={modalOpen}
        title="Eliminar elemento"
        message="¿Seguro que deseas eliminar este elemento de la galería?"
        onConfirm={confirmarEliminar}
        onCancel={cerrarModal}
      />

      <GaleriaEditModal
        open={editModalOpen}
        title="Editar descripción"
        initialValue={itemAEditar?.descripcion}
        onConfirm={confirmarEdicion}
        onCancel={cerrarModalEditar}
      />


    
    </div>
  );
}

export default AdminGaleria;
