// RedBancos.jsx
import React, { useEffect, useState } from "react";
import { obtenerRedDeBancos, eliminarBanco } from "../../../services/ServiciosHospitales";
import RedBancosEditor from "./ModalEditar/RedBancosEditor";
import ModalNuevo from "./ModalNuevo/ModalNuevo"; 
import ModalEliminar from "./Modal eliminar/ModalEliminar";
import "./RedBancos.css";

// 🔵 Iconos bonitos
import { IoCreateOutline, IoTrashOutline } from "react-icons/io5";

export default function RedBancos() {
  const [bancos, setBancos] = useState([]);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modo, setModo] = useState("crear");
  const [seleccionado, setSeleccionado] = useState(null);

  // 🔴 nuevo estado para eliminar
  const [modalEliminar, setModalEliminar] = useState(false);
  const [bancoEliminar, setBancoEliminar] = useState(null);

  const cargar = async () => {
    try {
      const data = await obtenerRedDeBancos();
      setBancos(data);
    } catch (error) {
      console.error(error);
      alert("Error cargando red de bancos");
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const abrirCrear = () => {
    setModo("crear");
    setSeleccionado(null);
    setModalAbierto(true);
  };

  const abrirEditar = (banco) => {
    setModo("editar");
    setSeleccionado(banco);
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
  };

  // 🔴 abrir modal eliminar
  const abrirEliminar = (banco) => {
    setBancoEliminar(banco);
    setModalEliminar(true);
  };

  // 🔴 confirmar eliminación
  const confirmarEliminar = async () => {
    try {
      await eliminarBanco(bancoEliminar.id);
      await cargar();
      setModalEliminar(false);
    } catch (err) {
      console.error(err);
      alert("Error al eliminar");
    }
  };

  return (
    <div className="rb-container">

      {/* ---- HEADER ---- */}
      <div className="header">
        <h2>Red de Bancos y Hospitales</h2>
        <button className="btn-crear" onClick={abrirCrear}>+ Agregar</button>
      </div>

      {/* ---- TABLA ---- */}
      <div className="rb-table-wrapper">
        <table className="rb-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Días</th>
              <th>Hora</th>
              <th>Contacto</th>
              <th>Notas</th>
              <th className="rb-actions">Acciones</th>
            </tr>
          </thead>

          <tbody>
            {bancos.map((b) => (
              <tr key={b.id}>
                <td className="rb-name">{b.nombre_hospi}</td>
                <td className="rb-days">{b.horarios}</td>
                <td className="rb-hour">{b.hora}</td>
                <td className="rb-contacto">{b.Contacto}</td>
                <td className="rb-notas">{b.Notas}</td>

                <td className="rb-actions">

                  {/* ✏️ Editar → icono nuevo */}
                  <button className="rb-btn-edit" onClick={() => abrirEditar(b)}>
                    <IoCreateOutline size={22} />
                  </button>

                  {/* 🗑️ Eliminar → icono nuevo */}
                  <button className="rb-btn-delete" onClick={() => abrirEliminar(b)}>
                    <IoTrashOutline size={22} />
                  </button>

                </td>
              </tr>
            ))}
          </tbody>

        </table>
      </div>

      {/* ---- MODALES ---- */}
      {modalAbierto && (
        <>
          {modo === "crear" ? (
            <ModalNuevo onClose={cerrarModal} reloadData={cargar} />
          ) : (
            <RedBancosEditor
              banco={seleccionado}
              onClose={cerrarModal}
              reloadData={cargar}
            />
          )}
        </>
      )}

      {/* 🔴 MODAL ELIMINAR */}
      {modalEliminar && (
        <ModalEliminar
          nombre={bancoEliminar?.nombre_hospi}
          cerrar={() => setModalEliminar(false)}
          eliminar={confirmarEliminar}
        />
      )}

    </div>
  );
}
