// src/pages/AdminBuzon/AdminBuzon.jsx
import React, { useEffect, useState, useMemo } from "react";
import {
  listarBuzon,
  listarRespuestas,
  crearRespuesta,
  obtenerUsuarioActual,
  actualizarRespuesta,
  cambiarEstadoRespuesta,
  
} from "../../../services/ServicioBuzon";
import ModalRespuesta from "./ModalRespuesta";
import AlertModal from "../../Alertmodal/AlertModal";
import "./AdminBuzon.css";
import { FiEdit, FiMessageSquare, FiSearch, FiX, FiCalendar } from "react-icons/fi";

export default function AdminBuzon() {
  const [preguntas, setPreguntas] = useState([]);
  const [respuestas, setRespuestas] = useState([]);
  const [usuario, setUsuario] = useState(null);
  const [preguntaSeleccionada, setPreguntaSeleccionada] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [tab, setTab] = useState("pendientes");
  const [loading, setLoading] = useState(false);

  const [query, setQuery] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [searchField, setSearchField] = useState("all");

  const [alertOpen, setAlertOpen] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");

  useEffect(() => { cargarDatos(); }, []);

  async function cargarDatos() {
    setLoading(true);
    try {
      const u = await obtenerUsuarioActual();
      console.log("Usuario actual:", u);
      
      setUsuario(u);
      const [pq, rs] = await Promise.all([listarBuzon(), listarRespuestas()]);
      setPreguntas(Array.isArray(pq) ? pq : []);
      setRespuestas(Array.isArray(rs) ? rs : []);
    } catch (err) {
      console.error("Error cargando datos:", err);
      showAlert("Error", "No se pudieron cargar los datos. Revisa la consola.");
    } finally {
      setLoading(false);
    }
  }

  function showAlert(title, message) {
    setAlertTitle(title || "Mensaje");
    setAlertMessage(message || "");
    setAlertOpen(true);
  }

  // --- helpers de datos / nombres ---
  function obtenerIdDesdeUsuario(u) {
    if (!u) return null;
    return u.id ?? u.pk ?? u.user_id ?? u.usuario_id ?? u._id ?? null;
  }

  function obtenerRespuestaDePregunta(p) {
    // asegurar múltiples formas posibles del enlace entre respuesta y pregunta
    return respuestas.find((r) => {
      try {
        if (!r) return false;
        if (r?.Buzon?.id !== undefined) return Number(r.Buzon.id) === Number(p.id);
        if (r?.Buzon_id !== undefined) return Number(r.Buzon_id) === Number(p.id);
        if (r?.buzon_id !== undefined) return Number(r.buzon_id) === Number(p.id);
        if (r?.buzon?.id !== undefined) return Number(r.buzon.id) === Number(p.id);
        // a veces viene como número directamente
        if (Number(r?.Buzon) === Number(p.id)) return true;
        if (Number(r?.buzon) === Number(p.id)) return true;
        // otros alias
        if (r?.pregunta_id !== undefined) return Number(r.pregunta_id) === Number(p.id);
        return false;
      } catch (e) {
        return false;
      }
    });
  }

  function abrirModalParaResponder(p) {
    console.log(p);
    
   
    const resp = obtenerRespuestaDePregunta(p) || null;
    setPreguntaSeleccionada({ ...p, respuestaExistente: resp });
    setModalOpen(true);
  }

  // --- función principal para guardar ---
  async function handleSaveFromModal(texto) {
  console.log("Guardar respuesta para:", preguntaSeleccionada);

  if (!preguntaSeleccionada) return;

  // obtener userId preferible desde el estado `usuario`, con fallback a localStorage
  const userId = obtenerIdDesdeUsuario(usuario) || (localStorage.getItem("userId") ? Number(localStorage.getItem("userId")) : null);

  if (!userId) {
    showAlert("Atención", "No se encontró id del usuario. Inicia sesión correctamente.");
    return;
  }

  const respExistente = preguntaSeleccionada.respuestaExistente || null;

  try {
    if (respExistente && respExistente.id && tab === "respondidas") {
      // actualizar respuesta existente
      const payload = {
        Respuesta_P: texto,
        // mantener el estado actual si existe; si no, dejar activo
        estado: respExistente.estado !== undefined ? Number(respExistente.estado) : 1,
        // enviar campos que tu backend podría aceptar (sé tolerante)
        Buzon: Number(preguntaSeleccionada.id),
        Buzon_id: Number(preguntaSeleccionada.id),
        CustomUser: userId,
        CustomUser_id: userId,
      };

      console.log("Actualizar respuesta (payload):", payload);
      // suponiendo que actualizarRespuesta recibe (id, payload)
      await actualizarRespuesta(respExistente.id, payload);
      showAlert("Éxito", "Respuesta actualizada correctamente.");
    } else {
      // crear nueva respuesta
      const payloadCreate = {
        Respuesta_P: texto,
        estado: 1, // por defecto activa; usa true si tu API lo requiere
        Buzon: Number(preguntaSeleccionada.id),
        Buzon_id: Number(preguntaSeleccionada.id),
        CustomUser: userId,
        CustomUser_id: userId,
      };

      console.log("Crear respuesta (payload):", payloadCreate);
      await crearRespuesta(payloadCreate);
      showAlert("Éxito", "Respuesta creada correctamente.");
    }

    // cerrar modal y recargar datos
    setModalOpen(false);
    setPreguntaSeleccionada(null);
    await cargarDatos();
  } catch (err) {
    console.error("Error en handleSaveFromModal:", err);
    const detail = typeof err === "string" ? err : (err?.message ?? JSON.stringify(err));
    showAlert("Error", `No se pudo guardar la respuesta. ${detail}`);
  }
}


  async function toggleRespuestaEstado(r) {
    const nuevoEstado = Number(r.estado) === 1 ? 0 : 1;
    try {
      await cambiarEstadoRespuesta(r.id, { estado: nuevoEstado });
      await cargarDatos();
      showAlert("Éxito", `Respuesta ${nuevoEstado === 1 ? "activada" : "desactivada"} correctamente.`);
    } catch (err) {
      console.error("Error actualizando estado de respuesta:", err);
      showAlert("Error", "No se pudo actualizar el estado de la respuesta.");
    }
  }

  // combinar preguntas/respuestas para búsqueda
  const preguntasConRespuesta = useMemo(() => {
    return preguntas.map((p) => {
      const r = obtenerRespuestaDePregunta(p);
      return {
        ...p,
        respuestaRelacionada: r || null,
        respuestaTexto: r ? (r.Respuesta_P || r.respuesta || "") : "",
        respuestaEstado: r ? r.estado : null,
      };
    });
  }, [preguntas, respuestas]);

  const preguntasFiltradas = useMemo(() => {
    const base = tab === "pendientes"
      ? preguntasConRespuesta.filter((p) => !p.respuestaRelacionada)
      : preguntasConRespuesta.filter((p) => !!p.respuestaRelacionada);
    return base.filter((p) => {
      // query simple
      if (!query) return true;
      const q = query.trim().toLowerCase();
      return (p.pregunta || "").toString().toLowerCase().includes(q)
        || (p.respuestaTexto || "").toString().toLowerCase().includes(q)
        || (getEmailDePregunta(p) || "").toString().toLowerCase().includes(q)
        || (getNombreDePregunta(p) || "").toString().toLowerCase().includes(q);
    });
  }, [preguntasConRespuesta, tab, query]);

  // helpers usados en render (los declaraste tú antes — los reutilizo)
  function getNombreDePregunta(p) {
    if (!p) return "Pregunta anónima";
    if (p.nombre) return p.nombre;
    if (p.name) return p.name;
    if (p.nombre_usuario) return p.nombre_usuario;
    if (p.usuario && (p.usuario.nombre || p.usuario.name)) return p.usuario.nombre || p.usuario.name;
    if (p.CustomUser && (p.CustomUser.nombre || p.CustomUser.name)) return p.CustomUser.nombre || p.CustomUser.name;
    if (p.user && (p.user.nombre || p.user.name)) return p.user.nombre || p.user.name;
    const email = getEmailDePregunta(p);
    if (email) return email.split("@")[0];
    return "Pregunta anónima";
  }

  function getEmailDePregunta(p) {
    if (!p) return "";
    if (p.email) return p.email;
    if (p.correo) return p.correo;
    if (p.email_usuario) return p.email_usuario;
    if (p.usuario && (p.usuario.email || p.usuario.correo)) return p.usuario.email || p.usuario.correo;
    if (p.CustomUser && (p.CustomUser.email || p.CustomUser.correo)) return p.CustomUser.email || p.CustomUser.correo;
    if (p.user && (p.user.email || p.user.correo)) return p.user.email || p.user.correo;
    return "";
  }

  console.log( respuestas);
    console.log(preguntas);
  

  return (
    <div className="admin-buzon-page">
      <div className="header1">
        <h1>Buzón de Preguntas y FAQs</h1>
        <p className="subtitle">Gestiona las consultas de los usuarios</p>
      </div>

      {!usuario && <div className="warning">⚠ Debe iniciar sesión para poder responder desde el panel.</div>}

      <div className="search-row">
        <div className="search-bar">
          <FiSearch size={18} className="search-icon" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar..." />
          {query && <button className="clear-btn" onClick={() => setQuery("")}><FiX /></button>}
        </div>
        <div className="search-controls">
          <div className="date-filter">
            <label><FiCalendar /> Desde<input type="date" value={dateFrom} onChange={(e)=>setDateFrom(e.target.value)} /></label>
            <label><FiCalendar /> Hasta<input type="date" value={dateTo} onChange={(e)=>setDateTo(e.target.value)} /></label>
            <button className="btn small" onClick={()=>{setDateFrom(""); setDateTo("");}}>Limpiar fechas</button>
          </div>
        </div>
      </div>

      <div className="tabs1">
        <button className={`tab ${tab==="pendientes"?"active":""}`} onClick={()=>setTab("pendientes")}>Pendientes ({preguntasConRespuesta.filter(p=>!p.respuestaRelacionada).length})</button>
        <button className={`tab ${tab==="respondidas"?"active":""}`} onClick={()=>setTab("respondidas")}>Respondidas ({preguntasConRespuesta.filter(p=>!!p.respuestaRelacionada).length})</button>
      </div>

      <div className="list-container">
        {loading && <div className="loading">Cargando...</div>}
        {preguntasFiltradas.length===0 ? <div className="empty">No se encontraron resultados.</div> :
          preguntasFiltradas.map(p => {
            const r = p.respuestaRelacionada;
            return (
              <article key={p.id} className="card pregunta-card">
                <div className="card-left"><div className="avatar-placeholder"><FiMessageSquare size={22} color="#8b5cf6" /></div></div>
                <div className="card-body">
                  <div className="card-top">
                    <div className="author"><strong>{getNombreDePregunta(p)}</strong><div className="email">{getEmailDePregunta(p) || "— sin correo —"}</div></div>
                    <div className="meta">
                      {tab==="pendientes" ? <span className="badge pending">Pendiente</span> : <span className={`badge ${r && Number(r.estado)===1 ? "answered" : "inactive"}`}>{r && Number(r.estado)===1 ? "Respondida (Activa)" : "Respondida (Inactiva)"}</span>}
                      <div className="fecha">{(p.created_at||p.Fecha||p.fecha||"") && new Date(p.created_at||p.Fecha||p.fecha).toLocaleDateString()}</div>
                    </div>
                  </div>

                  <div className="pregunta-text">{p.pregunta}</div>

                  {r && <div className="respuesta-box"><strong>Respuesta:</strong><div className="respuesta-text">{r.Respuesta_P || r.respuesta || ""}</div></div>}

                  <div className="card-actions">
                    <button className="btn primary" onClick={()=>abrirModalParaResponder(p)} disabled={!usuario}>
                      <FiEdit /> {tab==="pendientes" ? "Responder" : "Editar respuesta"}
                    </button>
                    {r && <button className="btn secondary" onClick={()=>toggleRespuestaEstado(r)}>{Number(r.estado)===1 ? "Desactivar" : "Activar"}</button>}
                  </div>
                </div>
              </article>
            );
          })
        }
      </div>

      {modalOpen && preguntaSeleccionada && (
        <ModalRespuesta
          mensaje={preguntaSeleccionada}
          respuestaExistente={preguntaSeleccionada.respuestaExistente}
          onClose={()=>{setModalOpen(false); setPreguntaSeleccionada(null);}}
          onSave={(texto)=>{ handleSaveFromModal(texto); }}
          usuario={usuario}
        />
      )}

      <AlertModal open={alertOpen} title={alertTitle} message={alertMessage} onClose={()=>setAlertOpen(false)} />
    </div>
  );
}
