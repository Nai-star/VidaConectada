import "./ModalEliminar.css";

export default function ModalConfirmar({ mensaje, onConfirmar, onCancelar }) {
  return (
    <div className="modal-confirm-overlay">
      <div className="modal-confirm-content">
        <h3>Confirmar acción</h3>
        <p>{mensaje}</p>

        <div className="confirm-buttons">
          <button className="btn-confirm" onClick={onConfirmar}>
            Sí, eliminar
          </button>

          <button className="btn-cancel" onClick={onCancelar}>
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
