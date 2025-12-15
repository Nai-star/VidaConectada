// CampanasAdmin.jsx
import React, { useEffect, useState } from "react";
import { obtenerCampanas, crearCampana } from "../../../services/ServicioCampanas";
import { obtenerParticipaciones } from "../../../services/ServicioSuscripcion";
import { obtenerProvincias, obtenerCantones } from "../../../services/ServicioProvincias";
import { FaMapMarkerAlt, FaCalendarAlt, FaClock } from "react-icons/fa";

import "./CampanasAdmin.css";
import ModalNuevoCampana from "./ModalNuevoCam/ModalNuevoCampana";
import ModalEditar from "./ModalEditarCam/ModalEditar";
import ModalEliminar from "./ModalEliminarCam/ModalEliminar";

export default function GestionCampanas() {
  const [campanas, setCampanas] = useState([]);
  const [cargando, setCargando] = useState(true);

  const [mostrarModal, setMostrarModal] = useState(false);
  const [mostrarModalEditar, setMostrarModalEditar] = useState(false);
  const [campanaSeleccionada, setCampanaSeleccionada] = useState(null);

  const [mostrarModalEliminar, setMostrarModalEliminar] = useState(false);
  const [campanaAEliminar, setCampanaAEliminar] = useState(null);

  const [rawMap, setRawMap] = useState({});
  const [expandedIds, setExpandedIds] = useState(new Set());

  const sections = ["Resumen", "Ubicación", "Detalles"];
  const [activeSection, setActiveSection] = useState(sections[0]);

  const [provLookup, setProvLookup] = useState({});
  const [cantonLookup, setCantonLookup] = useState({});

  /* ============================
     SUSCRITOS
  ============================ */
  function contarSuscritosPorCampana(participaciones = []) {
    const map = {};
    participaciones.forEach(p => {
      const campanaId =
        p.campana ??
        p.campana_id ??
        p.Campana ??
        p.Campana_id ??
        (typeof p.campana === "object" ? p.campana?.id : null);

      if (!campanaId) return;
      map[campanaId] = (map[campanaId] || 0) + 1;
    });
    return map;
  }

  function getCantonNombreFromRaw(raw) {
    if (!raw) return "—";
    const c = raw.Cantones;
    if (c && typeof c === "object") {
      return c.nombre_canton ?? c.nombre ?? "—";
    }
    return c ?? "—";
  }

  /* ============================
     CARGAR PROVINCIAS / CANTONES
  ============================ */
  useEffect(() => {
    async function cargarUbicaciones() {
      try {
        const provincias = await obtenerProvincias();
        const provMap = {};
        (Array.isArray(provincias) ? provincias : []).forEach(p => {
          if (p?.id != null) {
            provMap[String(p.id)] = p.nombre_p ?? p.nombre;
          }
        });
        setProvLookup(provMap);
      } catch {}

      try {
        const cantones = await obtenerCantones();
        const cantonMap = {};
        (Array.isArray(cantones) ? cantones : []).forEach(c => {
          if (c?.id != null) {
            cantonMap[String(c.id)] = {
              name: c.nombre_canton ?? c.nombre,
              provId: c.Provincia?.id ?? null
            };
          }
        });
        setCantonLookup(cantonMap);
      } catch {}
    }

    cargarUbicaciones();
  }, []);

  /* ============================
     CARGAR CAMPAÑAS + SUSCRITOS
  ============================ */
  async function cargar() {
    setCargando(true);
    try {
      const data = await obtenerCampanas();
      const participaciones = await obtenerParticipaciones();
      const suscritosPorCampana = contarSuscritosPorCampana(
        Array.isArray(participaciones) ? participaciones : []
      );

      const map = {};
      (Array.isArray(data) ? data : []).forEach(c => {
        if (c?.id != null) map[c.id] = c;
      });
      setRawMap(map);

      const normalizadas = (Array.isArray(data) ? data : []).map(c => {
        const cantonId =
          typeof c.Cantones === "object" ? c.Cantones?.id : c.Cantones;

        const cantonInfo = cantonLookup[String(cantonId)] ?? {};

        return {
          id: c.id,
          nombre_campana: c.Titulo,
          descripcion: c.Descripcion,
          fecha_inicio: c.Fecha_inicio,
          fecha_fin: c.Fecha_fin,
          hora_inicio: c.Hora_inicio,
          hora_fin: c.Hora_fin,
          imagenes: (c.Imagen_campana ?? c.imagenes ??
            []).map(img => { if (!img) return null; if (typeof img === "string")
              return img;
                return img.imagen_url ?? img.url ?? img.secure_url ?? img.imagen ?? null; 
              }).filter(Boolean),
          ubicacion: c.direccion_exacta,
          inscritos: suscritosPorCampana[c.id] || 0,
          estado: c.Activo ? "Activa" : "Inactiva",
          canton_id: cantonId,
          canton_nombre: cantonInfo.name ?? null,
          provincia_nombre: provLookup[String(cantonInfo.provId)] ?? null
        };
      });

      setCampanas(normalizadas);
    } catch (e) {
      console.error("Error cargando campañas:", e);
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargar();
  }, [Object.keys(cantonLookup).length, Object.keys(provLookup).length]);

  if (cargando) return <p>Cargando campañas...</p>;

  const getEstado = (c) => {
    const hoy = new Date();
    const inicio = new Date(c.fecha_inicio);
    const fin = new Date(c.fecha_fin || c.fecha_inicio);
    if (hoy > fin) return "Expirada";
    if (hoy >= inicio && hoy <= fin) return "Activa";
    return "Próxima";
  };

  function toggleExpand(id) {
    setExpandedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function abrirModalEditar(id) {
    const raw = rawMap[id];
    if (!raw) return;
    setCampanaSeleccionada(raw);
    setMostrarModalEditar(true);
  }

  function abrirModalEliminar(c) {
    setCampanaAEliminar(c);
    setMostrarModalEliminar(true);
  }

  function onDeletedCampana(id) {
    setCampanas(prev => prev.filter(c => c.id !== id));
    setRawMap(prev => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
  }

  /* ============================
     RENDER
  ============================ */
  return (
    <div className="campanas-container">
      <div className="header-container">
        <div className="title-section">
          <h1>Gestión de Campañas</h1>
          <p>Administra las campañas de donación de sangre</p>
        </div>

        <button
          className="btn-new-campaign"
          onClick={() => setMostrarModal(true)}
        >
          Crear Nueva Campaña
        </button>
      </div>

      <div className="campaign-table-container">
        <table className="campaign-table">
          <thead>
            <tr>
              <th>Imagen</th>
              <th>Campaña</th>
              <th>Fecha / Hora</th>
              <th>Provincia</th>
              <th>Cantón</th>
              <th>Ubicación</th>
              <th>Inscritos</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {campanas.length === 0 && (
              <tr>
                <td colSpan={9}>No hay campañas</td>
              </tr>
            )}

            {campanas.map(c => {
              const raw = rawMap[c.id] ?? {};
              return (
                <React.Fragment key={c.id}>
                  <tr>
                    <td>
                      {c.imagenes.length > 0 ? (
                        <img
                          src={c.imagenes[0]}
                          alt={c.nombre_campana}
                          className="campaign-image"
                        />
                      ) : (
                        <span>Sin imagen</span>
                      )}
                    </td>

                    <td>
                      <div className="campaign-details">
                        <strong>{c.nombre_campana}</strong>
                        <span>{c.descripcion}</span>
                      </div>
                    </td>

                    <td>
                      <div className="date-time">
                        <FaCalendarAlt />
                        <span>{c.fecha_inicio} → {c.fecha_fin}</span>
                      </div>
                      <div className="date-time">
                        <FaClock />
                        <span>{c.hora_inicio} → {c.hora_fin}</span>
                      </div>
                    </td>

                    <td>{c.provincia_nombre ?? "—"}</td>
                    <td>{c.canton_nombre ?? getCantonNombreFromRaw(raw)}</td>

                    <td className="location-text">
                      <FaMapMarkerAlt />
                      <span>{c.ubicacion}</span>
                    </td>

                    <td>{c.inscritos}</td>

                    <td>
                      <span className={`status-tag ${
                        getEstado(c) === "Expirada"
                          ? "status-expired"
                          : "status-finished"
                      }`}>
                        {getEstado(c)}
                      </span>
                    </td>

                    <td>
                      <div className="action-buttons">
                        <button
                          className="action-button"
                          onClick={() => abrirModalEditar(c.id)}
                        >
                          ✏️
                        </button>
                        <button
                          className="action-button"
                          onClick={() => abrirModalEliminar(c)}
                        >
                          🗑️
                        </button>
                        <button
                          className="action-button"
                          onClick={() => toggleExpand(c.id)}
                        >
                          {expandedIds.has(c.id) ? "Ocultar" : "Ver"}
                        </button>
                      </div>
                    </td>
                  </tr>

                  {expandedIds.has(c.id) && (
                    <tr>
                      <td colSpan={9}>
                        <pre>
                          {JSON.stringify(raw, null, 2)}
                        </pre>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {mostrarModal && (
        <ModalNuevoCampana
          onClose={() => setMostrarModal(false)}
          onSave={async () => {
            await cargar();
            setMostrarModal(false);
          }}
        />
      )}

      {mostrarModalEditar && campanaSeleccionada && (
        <ModalEditar
          campana={campanaSeleccionada}
          onClose={() => setMostrarModalEditar(false)}
          onSaved={async () => {
            await cargar();
            setMostrarModalEditar(false);
          }}
        />
      )}

      {mostrarModalEliminar && campanaAEliminar && (
        <ModalEliminar
          isOpen={mostrarModalEliminar}
          onClose={() => setMostrarModalEliminar(false)}
          campanaId={campanaAEliminar.id}
          campanaTitulo={campanaAEliminar.nombre_campana}
          onDeleted={onDeletedCampana}
        />
      )}
    </div>
  );
}
