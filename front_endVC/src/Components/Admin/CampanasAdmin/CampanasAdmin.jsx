import React, { useEffect, useState } from "react";
import {
  obtenerCampanas,
  actualizarEstadoCampana
} from "../../../services/ServicioCampanas";
import { crearCampana } from "../../../services/ServicioCampanas";
import { obtenerParticipaciones } from "../../../services/ServicioSuscripcion";
import { obtenerProvincias, obtenerCantones } from "../../../services/ServicioProvincias";
import { FaMapMarkerAlt, FaCalendarAlt, FaClock } from "react-icons/fa";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import ModalNuevoCampana from "./ModalNuevoCam/ModalNuevoCampana";
import ModalEditar from "./ModalEditarCam/ModalEditar";
import ModalEliminar from "./ModalEliminarCam/ModalEliminar";

import "./CampanasAdmin.css";

export default function GestionCampanas() {
  const [campanas, setCampanas] = useState([])
  const [cargando, setCargando] = useState(true)
  const [mostrarModal, setMostrarModal] = useState(false)
  const [mostrarModalEditar, setMostrarModalEditar] = useState(false)
  const [campanaSeleccionada, setCampanaSeleccionada] = useState(null)
  const [mostrarModalEliminar, setMostrarModalEliminar] = useState(false)
  const [campanaAEliminar, setCampanaAEliminar] = useState(null)
  const [rawMap, setRawMap] = useState({})
  const [provLookup, setProvLookup] = useState({})
  const [cantonLookup, setCantonLookup] = useState({})
  const [requisitosExpandido, setRequisitosExpandido] = useState({})
  const [busqueda, setBusqueda] = useState("")
  const [filtroEstado, setFiltroEstado] = useState("todos")



function obtenerEstadoCampana(c, raw) {
  if (raw?.Activo === false) return "vencida";

  const ahora = new Date();

  const inicio = construirFechaHora(c.fecha_inicio, c.hora_inicio);
  const fin = construirFechaHora(
    c.fecha_fin || c.fecha_inicio,
    c.hora_fin
  );

  if (!inicio || !fin) return "proxima";

  if (ahora < inicio) return "proxima";
  if (ahora >= inicio && ahora <= fin) return "activa";
  return "vencida";
}



function construirFechaHora(fecha, hora) {
  if (!fecha) return null;

  const [year, month, day] = fecha.split("-").map(Number);
  const [hh = 0, mm = 0] = (hora ?? "00:00").split(":").map(Number);

  // ⚠️ Importante:
  // month - 1 porque JS maneja meses de 0-11
  return new Date(year, month - 1, day, hh, mm, 0);
}





function abrirModalEditar(campanaId) {
  console.log("Abriendo modal editar:", campanaId);

  const raw = rawMap[campanaId];
  if (!raw) {
    console.warn("No existe raw para id:", campanaId);
    return;
  }

  setCampanaSeleccionada(raw);
  setMostrarModalEditar(true);
}


// Abrir modal eliminar
function abrirModalEliminar(campana) {
  setCampanaAEliminar(campana);
  setMostrarModalEliminar(true);
}

// Callback cuando se elimina
async function onDeletedCampana() {
  setMostrarModalEliminar(false);
  setCampanaAEliminar(null);
  await cargar();
}


  function contarSuscritosPorCampana(participaciones = []) {
    const map = {};
    participaciones.forEach(p => {
      const id =
        p.campana ??
        p.campana_id ??
        p.Campana ??
        p.Campana_id ??
        (typeof p.campana === "object" ? p.campana?.id : null);
      if (!id) return;
      map[id] = (map[id] || 0) + 1;
    });
    return map;
  }

  function toggleRequisitos(id) {
    setRequisitosExpandido(p => ({ ...p, [id]: !p[id] }));
  }

  function getCantonNombreFromRaw(raw) {
    if (!raw) return "—";
    const c = raw.Cantones;
    if (c && typeof c === "object") {
      return c.nombre_canton ?? c.nombre ?? "—";
    }
    return c ?? "—";
  }

  useEffect(() => {
    async function cargarUbicaciones() {
      const provincias = await obtenerProvincias();
      const cantones = await obtenerCantones();

      const provMap = {};
      provincias?.forEach(p => provMap[p.id] = p.nombre_p ?? p.nombre);
      setProvLookup(provMap);

      const cantonMap = {};
      cantones?.forEach(c => {
        cantonMap[c.id] = {
          name: c.nombre_canton ?? c.nombre,
          provId: c.Provincia?.id ?? null
        };
      });
      setCantonLookup(cantonMap);
    }

    cargarUbicaciones();
  }, []);

  async function cargar() {
    setCargando(true);
    try {
      const data = await obtenerCampanas();
      const participaciones = await obtenerParticipaciones();
      const suscritos = contarSuscritosPorCampana(participaciones);

      const map = {};
      data.forEach(c => map[c.id] = c);
      setRawMap(map);

      setCampanas(data.map(c => {
        const cantonId = typeof c.Cantones === "object" ? c.Cantones?.id : c.Cantones;
        const cantonInfo = cantonLookup[cantonId] ?? {};

        return {
          id: c.id,
          nombre_campana: c.Titulo,
          descripcion: c.Descripcion,
          contacto: c.Contacto ?? "",
          fecha_inicio: c.Fecha_inicio,
          fecha_fin: c.Fecha_fin,
          hora_inicio: c.Hora_inicio,
          hora_fin: c.Hora_fin,
          imagenes: (c.Imagen_campana ?? []).map(i =>
            typeof i === "string" ? i : i.imagen_url
          ),
          ubicacion: c.direccion_exacta,
          inscritos: suscritos[c.id] || 0,
          canton_nombre: cantonInfo.name ?? null,
          provincia_nombre: provLookup[cantonInfo.provId] ?? null,
          detalles_requisitos: c.DetalleRequisito ?? []
        };
      }));
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargar();
  }, [Object.keys(provLookup).length, Object.keys(cantonLookup).length]);
  
  useEffect(() => {
  if (!campanas.length) return;

  const intervalo = setInterval(async () => {
    const ahora = new Date();

    for (const c of campanas) {
      const raw = rawMap[c.id];
      if (!raw) continue;

      const inicio = construirFechaHora(c.fecha_inicio, c.hora_inicio);
      const fin = construirFechaHora(
        c.fecha_fin || c.fecha_inicio,
        c.hora_fin
      );

      if (!inicio || !fin) continue;

      const estadoCalculado = obtenerEstadoCampana(c, raw);

      // Estado guardado actualmente en backend
      const estadoBackend = raw.Activo === true ? "activa" : "vencida";

      // PROGRAMADA → ACTIVA
      if (
        estadoCalculado === "activa" &&
        estadoBackend !== "activa"
      ) {
        console.log("⏱ Activando campaña:", c.nombre_campana);
        await actualizarEstadoCampana(c.id, true);
        await cargar();
      }

      // ACTIVA → VENCIDA
      if (
        estadoCalculado === "vencida" &&
        estadoBackend !== "vencida"
      ) {
        console.log("⛔ Venciendo campaña:", c.nombre_campana);
        await actualizarEstadoCampana(c.id, false);
        await cargar();
      }
    }
  }, 60_000); // cada 1 minuto

  return () => clearInterval(intervalo);
}, [campanas, rawMap]);


async function cambiarEstadoCampana(c, raw, nuevoEstado) {
  const hoy = new Date();
  const inicio = new Date(c.fecha_inicio);
  const fin = new Date(c.fecha_fin || c.fecha_inicio);

  // Bloqueo REAL: vencida POR FECHA
  const vencidaPorFecha = hoy > fin;

  if (nuevoEstado === "activa" && vencidaPorFecha) {
   
    return;
  }

  const activo = nuevoEstado === "activa";

  try {
    await actualizarEstadoCampana(c.id, activo);
    await cargar();
  } catch (e) {
    console.error("Error actualizando estado", e);
   
  }
}


  const campanasFiltradas = campanas.filter(c => {
  const raw = rawMap[c.id];
  const estado = obtenerEstadoCampana(c, raw);
  const texto = busqueda.toLowerCase();

  const coincideBusqueda =
    c.nombre_campana?.toLowerCase().includes(texto) ||
    c.descripcion?.toLowerCase().includes(texto) ||
    c.ubicacion?.toLowerCase().includes(texto);

  const coincideEstado =
    filtroEstado === "todos" || estado === filtroEstado;

  return coincideBusqueda && coincideEstado;
});

  if (cargando) return <p>Cargando campañas...</p>;

    const generarLinkMapa = (direccion) => {
      if (!direccion) return null;

      const esUrl = /^https?:\/\//i.test(direccion);

      // Si ya es un link → se usa tal cual
      if (esUrl) return direccion;

      // Si es texto → generamos búsqueda en Google Maps
      return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(direccion)}`;
    };

    const textoDireccionVisible = (direccion) => {
      if (!direccion) return "";

      const esUrl = /^https?:\/\//i.test(direccion);
      const MAX_LARGO = 45;

      // Si es un link o es muy largo → texto genérico
      if (esUrl || direccion.length > MAX_LARGO) {
        return "Ver ubicación";
      }

      // Si es texto corto → mostrar tal cual
      return `${direccion}`;
    };


  return (
    <div className="campanas-container">
      <div className="header-container">
        <div className="title-section">
          <h1>Gestión de Campañas</h1>
          <p>Administra las campañas de donación de sangre</p>

          <br />
          <div className="filters-container">
            <input
              type="text"
              placeholder="Buscar campaña, ubicación, provincia..."
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              className="search-input"
            />

            <select
              value={filtroEstado}
              onChange={e => setFiltroEstado(e.target.value)}
              className="filter-select"
            >
              <option value="todos">Todas</option>
              <option value="activa">Activas</option>
              <option value="proxima">Programadas</option>
              <option value="vencida">Vencidas</option>
            </select>
          </div>
          
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
              <th>Fecha</th>
              <th>Hora</th>
              <th>Provincia</th>
              <th>Cantón</th>
              <th>Ubicación</th>
              <th>Contacto</th>
              <th>Inscritos</th>
              <th>Estado</th>
              <th>Requisitos</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            { campanasFiltradas.map(c => {
              const raw = rawMap[c.id] ?? {};
              const estado = obtenerEstadoCampana(c, raw);
              return (
                <tr key={c.id}>
                  <td>
                    {c.imagenes.length > 0 ? (
                      <img
                        src={`${c.imagenes[0]}?v=${c.id}-${Date.now()}`}
                        alt={c.nombre_campana}
                        className="campaign-image"
                      />
                    ) : (
                      <span>Sin imagen</span>
                    )}
                  </td>

                  <td>
                    <strong>{c.nombre_campana}</strong>
                    <div> {c.ubicacion ? (
                            <a
                              href={generarLinkMapa(c.ubicacion)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="map-link"
                              title={c.ubicacion}
                            >
                              {textoDireccionVisible(c.ubicacion)}
                            </a>
                          ) : (
                            <span>Dirección no disponible</span>
                          )}
                    </div>
                  </td>

                  <td >
                    <FaCalendarAlt /> {c.fecha_inicio} → {c.fecha_fin}
                  </td>
                  <td>
                    <FaClock /> {c.hora_inicio} → {c.hora_fin}
                  </td>

                  <td>{c.provincia_nombre ?? "—"}</td>
                  <td>{c.canton_nombre ?? getCantonNombreFromRaw(raw)}</td>

                  <td>
                    <FaMapMarkerAlt />{" "}
                    {c.ubicacion ? (
                      <a
                        href={generarLinkMapa(c.ubicacion)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="map-link"
                      >
                        {textoDireccionVisible(c.ubicacion)}
                      </a>
                    ) : (
                      "—"
                    )}
                  </td>


                  <td className="contacto-cell">
                    {c.contacto ? (
                      c.contacto.includes("@") ? (
                        <a href={`mailto:${c.contacto}`}>{c.contacto}</a>
                      ) : (
                        <a href={`tel:${c.contacto.replace(/\s+/g, "")}`}>
                          {c.contacto}
                        </a>
                      )
                    ) : (
                      "—"
                    )}
                  </td>


                  <td>{c.inscritos}</td>

                  <td>
                    <select
                      className="estado-select"
                      value={obtenerEstadoCampana(c, raw)}
                      disabled={obtenerEstadoCampana(c, raw) === "vencida"}
                      onChange={async (e) => {
                        const nuevoEstado = e.target.value === "activa";
                        await actualizarEstadoCampana(c.id, nuevoEstado);
                        await cargar();
                      }}
                    >

                      {/* <option
                        value="activa"
                        disabled={new Date() > new Date(c.fecha_fin || c.fecha_inicio)}
                      >
                        Activa
                      </option> */}
                      <option value="activa">Activa</option>
                      <option value="proxima" disabled>Programada</option>
                      <option value="vencida">Vencida</option>
                    </select>
                  </td>

            

                  <td className="requisitos-cell">
                    {(() => {
                      const requisitosActivos = c.detalles_requisitos.filter(
                        r => r.Estado === true
                      );

                      if (!requisitosActivos.length) return "—";

                      const expandido = requisitosExpandido[c.id];

                      return (
                        <>
                          {(expandido ? requisitosActivos : []).map(r => (
                            <div key={r.id} className="requisito-item">
                              {r.Requisitos?.requisitos ?? "—"}
                            </div>
                          ))}

                          <span
                            className="ver-mas"
                            onClick={() => toggleRequisitos(c.id)}
                          >
                            {expandido
                              ? "Ver menos"
                              : `Ver requisitos(${requisitosActivos.length})`}
                          </span>
                        </>
                      );
                    })()}
                  </td>



                  <td>
                    

                    <button
                      disabled={estado === "vencida"}
                      title={estado === "vencida" ? "Campaña vencida (solo eliminar)" : "Editar"}
                      onClick={() => abrirModalEditar(c.id)}
                    >
                      <FiEdit />
                    </button>

                    <button onClick={() => abrirModalEliminar(c)}> <FiTrash2 /> </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {mostrarModal && (
        <ModalNuevoCampana
          onClose={() => setMostrarModal(false)}
          onSave={async (formData) => {
          const nueva = await crearCampana(formData);
          await cargar();
          return nueva; 
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
