import React, { useState, useEffect } from "react";
import {
  obtenerTodosRequisitos,
  eliminarRequisito,
} from "../../../services/ServicioRequisitos";
import ModalNuevo from "../ModalNuevo/ModalNuevo";
import ModalEditar from "../ModalEditar/ModalEditar";
import ModalEliminar from "../ModalEliminar/ModalEliminar";
import "./Requisito.css";

import { IoEye, IoEyeOff } from "react-icons/io5";
import { FiEdit, FiTrash2 } from "react-icons/fi";

export default function RequisitosPage() {
  const [requisitos, setRequisitos] = useState([]);

  // MODALES
  const [modalNuevo, setModalNuevo] = useState(false);
  const [modalEditar, setModalEditar] = useState(false);
  const [modalEliminar, setModalEliminar] = useState(false);

  // DATOS
  const [requisitoEdit, setRequisitoEdit] = useState(null);
  const [requisitoElim, setRequisitoElim] = useState(null);

  const cargarDatos = async () => {
    const data = await obtenerTodosRequisitos();
    setRequisitos(data);
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  // OJITO – SOLO CAMBIA FRONT
  const cambiarEstadoFront = (id) => {
    setRequisitos((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, Estado: !r.Estado } : r
      )
    );
  };

  // ABRIR MODAL ELIMINAR
  const abrirModalEliminar = (req) => {
    setRequisitoElim(req);
    setModalEliminar(true);
  };

  // CONFIRMAR ELIMINAR
  const handleEliminar = async () => {
    try {
      await eliminarRequisito(requisitoElim.id);
      cargarDatos();
      setModalEliminar(false);
      setRequisitoElim(null);
    } catch (error) {
      console.error("Error eliminando requisito", error);
    }
  };

  return (
    <div className="requisitos-admin-container">
      <h1>Requisitos para Donar</h1>
      <p>Gestiona los requisitos que se muestran en la página principal.</p>

      {/* PREVIEW */}
      <div className="preview-box">
        <h2>
          Vista Previa - Requisitos Visibles (
          {requisitos.filter((r) => r.Estado).length})
        </h2>

        <div className="requisitos-grid">
          {requisitos
            .filter((r) => r.Estado)
            .map((req) => (
              <div className="requisito-item" key={req.id}>
                <span className="requisito-icon">✔</span>
                {req.requisitos}
              </div>
            ))}
        </div>
      </div>

      {/* LISTA */}
      <div className="lista-box">
        <div className="lista-header">
          <h2>Todos los Requisitos ({requisitos.length})</h2>

          <button className="btn-nuevo" onClick={() => setModalNuevo(true)}>
            + Nuevo Requisito
          </button>
        </div>

        <table className="tabla-requisitos">
          <thead>
            <tr>
              <th>Requisito</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {requisitos.map((req) => (
              <tr key={req.id}>
                <td className={req.Estado ? "" : "inactivo-text"}>
                  {req.requisitos}
                </td>

                <td>
                  <span className={req.Estado ? "estado-activo" : "estado-inactivo"}>
                    {req.Estado ? "Activo" : "Inactivo"}
                  </span>
                </td>

                <td className="actions-cell">
                  {/* OJITO */}
                  <button
                    className={`btn-icon ojito-btn ${req.Estado ? "visible" : "oculto"}`}
                    onClick={() => cambiarEstadoFront(req.id)}
                  >
                    {req.Estado ? <IoEye size={22} /> : <IoEyeOff size={22} />}
                  </button>

                  {/* EDITAR */}
                  <button
                    className="btn-icon edit-icon"
                    onClick={() => {
                      setRequisitoEdit(req);
                      setModalEditar(true);
                    }}
                  >
                    <FiEdit size={20} />
                  </button>

                  {/* ELIMINAR */}
                  <button
                    className="btn-icon delete-icon"
                    onClick={() => abrirModalEliminar(req)}
                  >
                    <FiTrash2 size={20} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL NUEVO */}
      {modalNuevo && (
        <ModalNuevo cerrar={() => setModalNuevo(false)} recargar={cargarDatos} />
      )}

      {/* MODAL EDITAR */}
      {modalEditar && (
        <ModalEditar
          cerrar={() => setModalEditar(false)}
          recargar={cargarDatos}
          requisito={requisitoEdit}
        />
      )}

      {/* MODAL ELIMINAR */}
      {modalEliminar && (
  <ModalEliminar
    mensaje={`¿Seguro que deseas eliminar "${requisitoElim?.requisitos}"?`}
    onConfirmar={handleEliminar}
    onCancelar={() => setModalEliminar(false)}
  />
)}

    </div>
  );
}
