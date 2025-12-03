import React from "react";
import "./ModalEliminar.css";
import { eliminarBanner } from "../../../services/ServicioCarrusel";

export default function ModalEliminar({ cerrar, bannerId, recargar }) {
  const handleEliminar = async () => {
    try {
      await eliminarBanner(bannerId); // llama a tu servicio
      recargar(); // recarga la lista de banners
      cerrar(); // cierra el modal
    } catch (error) {
      console.error("Error eliminando banner:", error);
      alert("No se pudo eliminar el banner. Intenta de nuevo.");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h2>Eliminar Banner</h2>
        <p>¿Seguro que deseas eliminar este banner?</p>

        <div className="modal-actions">
          <button className="btn-cancelar" onClick={cerrar}>
            Cancelar
          </button>
          <button className="btn-eliminar" onClick={handleEliminar}>
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}
