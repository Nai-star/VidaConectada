// ModalEliminar.jsx
import React from "react";
import "./ModalEliminar.css";

export default function ModalEliminar({ cerrar, eliminar, nombre }) {
  return (
    <div className="modal-eliminar-overlay">
      <div className="modal-eliminar">
        <h3>Confirmar eliminación</h3>

        <p>
          ¿Seguro que deseas eliminar <strong>{nombre}</strong>?  
          Esta acción no se puede deshacer.
        </p>

        <div className="modal-eliminar-btns">
          <button className="btn-cancelar" onClick={cerrar}>
            Cancelar
          </button>

          <button className="btn-eliminar" onClick={eliminar}>
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}
