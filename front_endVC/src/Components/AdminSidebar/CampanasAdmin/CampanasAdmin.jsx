import React, { useEffect, useState } from "react";
import { obtenerCampanas, crearCampana } from "../../../services/ServicioCampanas";
import { FaMapMarkerAlt, FaCalendarAlt, FaClock } from "react-icons/fa";
import "./CampanasAdmin.css";
import ModalNuevoCampana from "./ModalNuevoCam/ModalNuevoCampana";

export default function GestionCampanas() {
  const [campanas, setCampanas] = useState([]);
  const [cargando, setCargando] = useState(true);

  // 🔥 Estado para mostrar el modal
  const [mostrarModal, setMostrarModal] = useState(false);

  useEffect(() => {
    async function cargar() {
      try {
        const data = await obtenerCampanas();

        const normalizadas = data.map(c => ({
          id: c.id,
          nombre_campana: c.Titulo,
          descripcion: c.Descripcion,
          fecha_inicio: c.Fecha_inicio,
          fecha_fin: c.Fecha_fin,
          hora_inicio: c.Hora_inicio,
          hora_fin: c.Hora_fin,
          imagenes: c.Imagen_campana?.map(img => img.imagen_url) || [],
          ubicacion: c.direccion_exacta,
          inscritos: c.DetalleRequisito?.length || 0,
          estado: c.Activo ? "Activa" : "Inactiva"
        }));

        setCampanas(normalizadas);
      } catch (error) {
        console.error("Error obteniendo campañas", error);
      } finally {
        setCargando(false);
      }
    }

    cargar();
  }, []);

  if (cargando) return <p>Cargando campañas...</p>;

  const getEstado = (c) => {
    const hoy = new Date();
    const inicio = new Date(c.fecha_inicio);
    const fin = new Date(c.fecha_fin || c.fecha_inicio);

    if (hoy > fin) return "Expirada";
    if (hoy >= inicio && hoy <= fin) return "Activa";
    return "Próxima";
  };

  // 🔥 Ahora esta función sí guarda en la base de datos
  const guardarCampanaNueva = async (nueva) => {
    try {
      const payload = {
        Titulo: nueva.titulo,
        Descripcion: nueva.subtitulo,
        Fecha_inicio: nueva.fecha,
        Hora_inicio: nueva.hora,
        direccion_exacta: nueva.lugar,
        Imagen_url: nueva.imagen,
        Activo: true
      };

      const creada = await crearCampana(payload);

      // Agregar al estado para mostrarla en pantalla
      setCampanas(prev => [
        ...prev,
        {
          id: creada.id,
          nombre_campana: creada.Titulo,
          descripcion: creada.Descripcion,
          fecha_inicio: creada.Fecha_inicio,
          fecha_fin: creada.Fecha_fin,
          hora_inicio: creada.Hora_inicio,
          hora_fin: creada.Hora_fin,
          imagenes: creada.Imagen_campana?.map(i => i.imagen_url) || [],
          ubicacion: creada.direccion_exacta,
          inscritos: 0,
          estado: creada.Activo ? "Activa" : "Inactiva"
        }
      ]);

    } catch (e) {
      console.error("Error guardando campaña:", e);
      alert("No se pudo guardar la campaña");
    }
  };

  return (
    <div className="campanas-container">

      {/* HEADER */}
      <div className="header-container">
        <div className="title-section">
          <h1>Gestión de Campañas</h1>
          <p>Administra las campañas de donación de sangre</p>
        </div>

        {/* 🔥 ABRIR MODAL */}
        <button
          className="btn-new-campaign"
          onClick={() => setMostrarModal(true)}
        >
          Crear Nueva Campaña
        </button>
      </div>

      {/* TABLA */}
      <div className="campaign-table-container">
        <table className="campaign-table">
          <thead>
            <tr>
              <th>Imagen</th>
              <th>Campaña</th>
              <th>Fecha</th>
              <th>Ubicación</th>
              <th>Inscritos</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {campanas.map((c) => (
              <tr key={c.id}>
                <td>
                  {c.imagenes?.length ? (
                    <img
                      src={c.imagenes[0]}
                      className="campaign-image"
                      alt="campaña"
                    />
                  ) : (
                    <div
                      className="campaign-image"
                      style={{
                        background: "#ddd",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        fontSize: "10px"
                      }}
                    >
                      Sin Imagen
                    </div>
                  )}
                </td>

                <td>
                  <div className="campaign-details">
                    <strong>{c.nombre_campana}</strong>
                    <span>{c.descripcion || "Sin descripción"}</span>
                  </div>
                </td>

                <td>
                  <div className="date-time">
                    <span><FaCalendarAlt /></span>
                    {c.fecha_inicio}
                  </div>

                  <div className="date-time">
                    <span><FaClock /></span>
                    {c.hora_inicio || "00:00"}
                  </div>
                </td>

                <td>
                  <div className="location-text">
                    <span><FaMapMarkerAlt /></span>
                    {c.ubicacion || "Sin ubicación"}
                  </div>
                </td>

                <td>{c.inscritos || 0}</td>

                <td>
                  <span
                    className={
                      getEstado(c) === "Expirada"
                        ? "status-tag status-expired"
                        : "status-tag status-finished"
                    }
                  >
                    {getEstado(c)}
                  </span>
                </td>

                <td>
                  <div className="action-buttons">
                    <button className="action-button">✏️</button>
                    <button className="action-button">🗑️</button>
                  </div>
                </td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 🔥 MODAL */}
      {mostrarModal && (
        <ModalNuevoCampana
          onClose={() => setMostrarModal(false)}
          onSave={guardarCampanaNueva}
        />
      )}

    </div>
  );
}
