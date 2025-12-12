// CampanasAdmin.jsx (versión corregida)
import React, { useEffect, useState } from "react";
import { obtenerCampanas, crearCampana, eliminarCampana } from "../../../services/ServicioCampanas";
import { FaMapMarkerAlt, FaCalendarAlt, FaClock } from "react-icons/fa";
import "./CampanasAdmin.css";
import ModalNuevoCampana from "./ModalNuevoCam/ModalNuevoCampana";
import ModalEditar from "./ModalEditarCam/ModalEditar";
import ModalEliminar from "./ModalEliminarCam/ModalEliminar";
import { obtenerProvincias, obtenerCantones } from "../../../services/ServicioProvincias";

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

  // Helper seguro para obtener nombre de cantón desde raw.Cantones
  function getCantonNombreFromRaw(raw) {
    if (!raw) return "—";
    const c = raw.Cantones;
    if (c && typeof c === "object") {
      return c.nombre_canton ?? c.nombre ?? "—";
    }
    return c ?? "—";
  }

  // Cargar provincias y cantones
  useEffect(() => {
    async function cargarUbicaciones() {
      try {
        const p = await obtenerProvincias();
        const provData = Array.isArray(p) ? p : (p?.data ?? []);
        const provMap = {};
        (provData || []).forEach(item => {
          const id = item.id ?? item.ID ?? item.value;
          const name = item.nombre_p ?? item.nombre ?? item.name ?? String(id);
          if (id != null) provMap[String(id)] = name;
        });
        setProvLookup(provMap);
      } catch (e) {
        console.error("Error cargando provincias:", e);
        setProvLookup({});
      }

      try {
        const c = await obtenerCantones();
        const cantData = Array.isArray(c) ? c : (c?.data ?? []);
        const cantonMap = {};
        (cantData || []).forEach(item => {
          const id = item.id ?? item.ID ?? item.value;
          const name = item.nombre_canton ?? item.nombre ?? item.name ?? String(id);
          const provObj = item.Provincia ?? item.provincia ?? item.ProvinciaId ?? item.provincia_id;
          const provId = provObj ? (typeof provObj === "object" ? (provObj.id ?? provObj) : provObj) : null;
          if (id != null) cantonMap[String(id)] = { name, provId: provId != null ? String(provId) : null };
        });
        setCantonLookup(cantonMap);
      } catch (e) {
        console.error("Error cargando cantones:", e);
        setCantonLookup({});
      }
    }
    cargarUbicaciones();
  }, []);

  async function cargar() {
    setCargando(true);
    try {
      const data = await obtenerCampanas();

      const map = {};
      (Array.isArray(data) ? data : []).forEach(item => {
        if (item && item.id != null) map[item.id] = item;
      });
      setRawMap(map);

      const normalizadas = (Array.isArray(data) ? data : []).map(c => {
        let cantonId = null;
        try {
          if (c.Cantones) {
            if (typeof c.Cantones === "object" && c.Cantones !== null) {
              cantonId = c.Cantones.id ?? c.Cantones;
            } else {
              cantonId = c.Cantones;
            }
          }
        } catch (e) { cantonId = null; }

        let cantonName = null;
        let provinceName = null;
        if (cantonId != null) {
          const key = String(cantonId);
          const entry = cantonLookup[key];
          if (entry) {
            cantonName = entry.name;
            if (entry.provId) provinceName = provLookup[String(entry.provId)] ?? null;
          } else {
            if (typeof c.Cantones === "object" && c.Cantones !== null) {
              cantonName = c.Cantones.nombre_canton ?? c.Cantones.nombre ?? null;
              const provObj = c.Cantones.Provincia ?? c.Cantones.provincia ?? c.Cantones.ProvinciaId ?? c.Cantones.provincia_id;
              const provId = provObj ? (typeof provObj === "object" ? (provObj.id ?? provObj) : provObj) : null;
              if (provId != null) provinceName = provLookup[String(provId)] ?? null;
            }
          }
        }

        if (!provinceName && c.Provincia) {
          provinceName = c.Provincia.nombre_p ?? c.Provincia.nombre ?? c.Provincia.name ?? null;
        }

        return {
          id: c.id,
          nombre_campana: c.Titulo,
          descripcion: c.Descripcion,
          fecha_inicio: c.Fecha_inicio,
          fecha_fin: c.Fecha_fin,
          hora_inicio: c.Hora_inicio,
          hora_fin: c.Hora_fin,
          imagenes: (c.Imagen_campana ?? c.imagenes ?? []).map(img => {
            if (!img) return null;
            if (typeof img === "string") return img;
            return img.imagen_url ?? img.url ?? img.secure_url ?? img.imagen ?? null;
          }).filter(Boolean),
          ubicacion: c.direccion_exacta,
          inscritos: c.DetalleRequisito?.length || 0,
          estado: c.Activo ? "Activa" : "Inactiva",
          canton_id: cantonId,
          canton_nombre: cantonName,
          provincia_nombre: provinceName
        };
      });

      setCampanas(normalizadas);
    } catch (error) {
      console.error("Error obteniendo campañas", error);
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  function abrirModalEditar(id) {
    const raw = rawMap[id];
    if (!raw) {
      alert("No se encontró la campaña para editar");
      return;
    }
    setCampanaSeleccionada(raw);
    setMostrarModalEditar(true);
  }

  function abrirModalEliminar(campana) {
    setCampanaAEliminar(campana);
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

  const guardarCampanaNueva = async (nueva) => {
    try {
      const payload = {
        titulo: nueva.titulo ?? "",
        subtitulo: nueva.subtitulo ?? "",
        fecha: nueva.fecha ?? null,
        fechaFin: nueva.fechaFin ?? nueva.fecha ?? null,
        hora: nueva.hora ?? null,
        horaFin: nueva.horaFin ?? nueva.hora ?? null,
        lugar: nueva.lugar ?? "",
        Cantones: (nueva.Cantones === undefined || nueva.Cantones === null) ? null : Number(nueva.Cantones),
        imagen: nueva.imagen ?? null
      };

      const creada = await crearCampana(payload);

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
          imagenes: (creada.Imagen_campana ?? creada.imagenes ?? []).map(i => {
            if (!i) return null;
            if (typeof i === "string") return i;
            return i.imagen_url ?? i.url ?? i.imagen;
          }).filter(Boolean),
          ubicacion: creada.direccion_exacta,
          inscritos: 0,
          estado: creada.Activo ? "Activa" : "Inactiva",
          canton_id: creada.Cantones ?? null,
          canton_nombre: (creada.Cantones && typeof creada.Cantones === "object") ? (creada.Cantones.nombre_canton ?? creada.Cantones.nombre) : null,
          provincia_nombre: null
        }
      ]);

      setRawMap(prev => ({ ...prev, [creada.id]: creada }));
    } catch (e) {
      console.error("Error guardando campaña:", e);
      alert("No se pudo guardar la campaña: " + (e.message || e));
    }
  };

  return (
    <div className="campanas-container" style={{ padding: 12 }}>
      <div className="header-container" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div>
          <h1 style={{ margin: 0 }}>Gestión de Campañas</h1>
          <p style={{ margin: "4px 0 0 0", color: "#666" }}>Administra las campañas de donación de sangre</p>
        </div>

        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <div style={{ display: "flex", gap: 6, border: "1px solid #e6e6e6", borderRadius: 8, padding: 6, background: "#fff" }}>
            {sections.map(s => (
              <button
                key={s}
                onClick={() => setActiveSection(s)}
                style={{
                  padding: "8px 12px",
                  borderRadius: 6,
                  border: "none",
                  background: activeSection === s ? "#007bff" : "transparent",
                  color: activeSection === s ? "#fff" : "#333",
                  cursor: "pointer"
                }}
              >
                {s}
              </button>
            ))}
          </div>

          <button className="btn-new-campaign" onClick={() => setMostrarModal(true)}>Crear Nueva Campaña</button>
        </div>
      </div>

      <div className="campaign-table-container" style={{ overflowX: "auto" }}>
        <table className="campaign-table" style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ textAlign: "left", borderBottom: "1px solid #ddd" }}>
              <th style={{ padding: 8 }}>Imagen</th>
              <th style={{ padding: 8 }}>Campaña</th>
              <th style={{ padding: 8 }}>Fecha / Hora</th>
              <th style={{ padding: 8 }}>Provincia</th>
              <th style={{ padding: 8 }}>Cantón</th>
              <th style={{ padding: 8 }}>Ubicación</th>
              <th style={{ padding: 8 }}>Inscritos</th>
              <th style={{ padding: 8 }}>Estado</th>
              <th style={{ padding: 8 }}>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {campanas.length === 0 && (
              <tr>
                <td colSpan={9} style={{ padding: 12, textAlign: "center", color: "#666" }}>No hay campañas</td>
              </tr>
            )}

            {campanas.map((c) => {
              const raw = rawMap[c.id] ?? {};
              return (
                <React.Fragment key={c.id}>
                  <tr style={{ borderBottom: "1px solid #f0f0f0" }}>
                    <td style={{ padding: 8, verticalAlign: "middle", width: 140 }}>
                      {c.imagenes && c.imagenes.length > 0 ? (
                        <img src={c.imagenes[0]} alt={c.nombre_campana} style={{ width: 120, height: 70, objectFit: "cover", borderRadius: 6, border: "1px solid #e6e6e6" }} onError={(e)=> e.currentTarget.src="/placeholder.png"} />
                      ) : (
                        <div style={{ width: 120, height: 70, background: "#fafafa", display: "flex", alignItems: "center", justifyContent: "center", color: "#999", borderRadius: 6, border: "1px dashed #eee" }}>Sin Imagen</div>
                      )}
                    </td>

                    <td style={{ padding: 8, verticalAlign: "middle" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        <strong>{c.nombre_campana}</strong>
                        <span style={{ color: "#555", fontSize: 13 }}>{c.descripcion ?? "Sin descripción"}</span>
                        {raw.Contacto && <span style={{ color: "#333", fontSize: 12 }}>📧 {raw.Contacto}</span>}
                      </div>
                    </td>

                    <td style={{ padding: 8, verticalAlign: "middle" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <FaCalendarAlt /> <span>{c.fecha_inicio} {c.fecha_fin ? `→ ${c.fecha_fin}` : ""}</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <FaClock /> <span>{c.hora_inicio ?? "—"} {c.hora_fin ? `→ ${c.hora_fin}` : ""}</span>
                        </div>
                      </div>
                    </td>

                    <td style={{ padding: 8, verticalAlign: "middle" }}>
                      <div>{c.provincia_nombre ?? (raw && raw.Cantones && raw.Cantones.Provincia ? (raw.Cantones.Provincia.nombre_p ?? raw.Cantones.Provincia.nombre ?? raw.Provincia?.nombre_p) : raw?.Provincia?.nombre_p) ?? "—"}</div>
                    </td>

                    <td style={{ padding: 8, verticalAlign: "middle" }}>
                      <div>{c.canton_nombre ?? getCantonNombreFromRaw(raw)}</div>
                    </td>

                    <td style={{ padding: 8, verticalAlign: "middle" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <FaMapMarkerAlt />
                        <div style={{ display: "flex", flexDirection: "column" }}>
                          <span>{c.ubicacion ?? "Sin ubicación"}</span>
                          {raw.direccion_exacta && <small style={{ color: "#666" }}>{raw.direccion_exacta}</small>}
                        </div>
                      </div>
                    </td>

                    <td style={{ padding: 8, verticalAlign: "middle" }}>{c.inscritos || 0}</td>

                    <td style={{ padding: 8, verticalAlign: "middle" }}>
                      <span className={getEstado(c) === "Expirada" ? "status-tag status-expired" : "status-tag status-finished"}>{getEstado(c)}</span>
                      <div style={{ marginTop: 6, fontSize: 12, color: raw.Activo === false ? "#c00" : "#0a0" }}>
                        {raw.Activo === false ? "Inactiva (flag)" : raw.Activo === true ? "Activa (flag)" : ""}
                      </div>
                    </td>

                    <td style={{ padding: 8, verticalAlign: "middle" }}>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button className="action-button" onClick={() => abrirModalEditar(c.id)}>✏️</button>
                        <button className="action-button" onClick={() => abrirModalEliminar({ id: c.id, nombre_campana: c.nombre_campana })}>🗑️</button>                        <button className="action-button" onClick={() => toggleExpand(c.id)}>{expandedIds.has(c.id) ? "Ocultar" : "Ver"}</button>
                      </div>
                    </td>
                  </tr>

                  {expandedIds.has(c.id) && (
                    <tr>
                      <td colSpan={9} style={{ padding: 12, background: "#fafafa" }}>
                        {activeSection === "Resumen" && (
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                            <div>
                              <h4 style={{ margin: "0 0 8px 0" }}>Resumen</h4>
                              <p style={{ margin: 0 }}><strong>Título:</strong> {raw.Titulo ?? c.nombre_campana}</p>
                              <p style={{ margin: 0 }}><strong>Descripción:</strong> {raw.Descripcion ?? c.descripcion ?? "—"}</p>
                              <p style={{ margin: 0 }}><strong>Contacto:</strong> {raw.Contacto ?? "—"}</p>
                              <p style={{ margin: 0 }}><strong>Activo:</strong> {String(raw.Activo ?? "—")}</p>
                            </div>

                            <div>
                              <h4 style={{ margin: "0 0 8px 0" }}>Fechas & Horas</h4>
                              <p style={{ margin: 0 }}><strong>Fecha inicio:</strong> {raw.Fecha_inicio ?? c.fecha_inicio}</p>
                              <p style={{ margin: 0 }}><strong>Fecha fin:</strong> {raw.Fecha_fin ?? c.fecha_fin}</p>
                              <p style={{ margin: 0 }}><strong>Hora inicio:</strong> {raw.Hora_inicio ?? c.hora_inicio}</p>
                              <p style={{ margin: 0 }}><strong>Hora fin:</strong> {raw.Hora_fin ?? c.hora_fin}</p>
                            </div>
                          </div>
                        )}

                        {activeSection === "Ubicación" && (
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                            <div>
                              <h4 style={{ margin: "0 0 8px 0" }}>Ubicación</h4>
                              <p style={{ margin: 0 }}><strong>Provincia:</strong> {c.provincia_nombre ?? raw.Provincia?.nombre_p ?? "—"}</p>
                              <p style={{ margin: 0 }}><strong>Cantón:</strong> {c.canton_nombre ?? getCantonNombreFromRaw(raw)}</p>
                              <p style={{ margin: 0 }}><strong>Dirección exacta:</strong> {raw.direccion_exacta ?? c.ubicacion ?? "—"}</p>
                            </div>

                            <div>
                              <h4 style={{ margin: "0 0 8px 0" }}>Mapa / Nota</h4>
                              <p style={{ margin: 0 }}>{raw.map_note ?? "—"}</p>
                            </div>
                          </div>
                        )}

                        {activeSection === "Detalles" && (
                          <div>
                            <h4 style={{ margin: "0 0 8px 0" }}>Detalles completos</h4>

                            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                              {(raw.Imagen_campana ?? raw.imagenes ?? []).map((img, idx) => {
                                const src = typeof img === "string" ? img : (img?.imagen_url ?? img?.url ?? img?.imagen ?? null);
                                if (!src) return null;
                                return (
                                  <a key={idx} href={src} target="_blank" rel="noreferrer">
                                    <img src={src} alt={`img-${idx}`} style={{ width: 140, height: 90, objectFit: "cover", borderRadius: 6, border: "1px solid #ddd" }} onError={(e)=> e.currentTarget.src="/placeholder.png"} />
                                  </a>
                                );
                              })}
                            </div>

                            <h5 style={{ marginTop: 12 }}>Requisitos</h5>
                            {Array.isArray(raw.detalles_requisitos) && raw.detalles_requisitos.length > 0 ? (
                              <ul>
                                {raw.detalles_requisitos.map((dr, i) => (
                                  <li key={i}>{typeof dr === "string" ? dr : JSON.stringify(dr)}</li>
                                ))}
                              </ul>
                            ) : <div>—</div>}

                            <h5 style={{ marginTop: 12 }}>Objeto raw</h5>
                            <pre style={{ maxHeight: 240, overflow: "auto", background: "#fff", border: "1px solid #eee", padding: 8, borderRadius: 6 }}>
                              {JSON.stringify(raw, null, 2)}
                            </pre>
                          </div>
                        )}
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
          onSave={guardarCampanaNueva}
        />
      )}

      {mostrarModalEditar && campanaSeleccionada && (
        <ModalEditar
          campana={campanaSeleccionada}
          onClose={() => { setMostrarModalEditar(false); setCampanaSeleccionada(null); }}
          onSaved={async () => { await cargar(); setMostrarModalEditar(false); setCampanaSeleccionada(null); }}
        />
      )}

      {mostrarModalEliminar && campanaAEliminar && (
        <ModalEliminar
          isOpen={mostrarModalEliminar}
          onClose={() => { setMostrarModalEliminar(false); setCampanaAEliminar(null); }}
          campanaId={campanaAEliminar.id}
          campanaTitulo={campanaAEliminar.nombre_campana ?? campanaAEliminar.Titulo ?? ""}
          onDeleted={(id) => {
            onDeletedCampana(id);
            setMostrarModalEliminar(false);
            setCampanaAEliminar(null);
          }}
        />
      )}
    </div>
  );
}
