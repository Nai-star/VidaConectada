// GestionUsuarios.jsx
import React, { useEffect, useState } from "react";
import {
  obtenerSuscritos,
  obtenerSuscritoPorId,
  eliminarSuscrito,
  buildSearchQuery,
} from "../../../services/ServicioSuscripcion";
import { obtenerCampanas } from "../../../services/ServicioCampanas";
import "./GestionUsuarios.css"; // reutiliza el CSS que prefieras (puedes usar el provisto antes)

function GestionUsuarios() {
  const [suscritos, setSuscritos] = useState([]);
  const [campanas, setCampanas] = useState([]);
  const [q, setQ] = useState("");
  const [tab, setTab] = useState("suscritos");
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    cargarDatos();
  }, []);

  async function cargarDatos() {
    setLoading(true);
    try {
      const [s, c] = await Promise.all([obtenerSuscritos(), obtenerCampanas()]);
      // Normaliza los campos para uso en UI (FECHA, Nombre, correo, Numero_cedula, Sangre_id)
      const normalized = (Array.isArray(s) ? s : []).map((it) => ({
        id: it.id,
        nombre: it.nombre ?? it.name ?? "",
        correo: it.correo ?? it.email ?? "",
        numero_cedula: it.Numero_cedula ?? it.numero_cedula ?? it.cedula ?? "",
        sangre_id: it.Sangre_id ?? it.sangre_id ?? null,
        fecha: it.Fecha ?? it.fecha ?? null,
        // campos opcionales para UI
        donor_type: it.donor_type ?? it.tipo_donante ?? null,
        previous_donations: it.previous_donations ?? it.donaciones_previas ?? 0,
        // si tu API devuelve más info la mantengo
        raw: it,
      }));
      setSuscritos(normalized);

      // mantén campañas normalizadas (ya tu servicio las normaliza)
      setCampanas(Array.isArray(c) ? c : []);
    } catch (err) {
      console.error("Error cargando datos:", err);
    } finally {
      setLoading(false);
    }
  }

  async function onBuscar(e) {
    const valor = e.target.value;
    setQ(valor);

    // Opcional: buscar en backend
    try {
      const query = buildSearchQuery({ q: valor });
      const res = await obtenerSuscritos(query);
      setSuscritos((Array.isArray(res) ? res : []).map((it) => ({
        id: it.id,
        nombre: it.nombre ?? it.name ?? "",
        correo: it.correo ?? it.email ?? "",
        numero_cedula: it.Numero_cedula ?? it.numero_cedula ?? "",
        sangre_id: it.Sangre_id ?? it.sangre_id ?? null,
        fecha: it.Fecha ?? it.fecha ?? null,
        raw: it,
      })));
    } catch (err) {
      console.error("Error en búsqueda:", err);
    }
  }

  function filtradosPorPestana() {
    if (tab === "inscritos") {
      // relación simple: usuarios inscritos a alguna campaña. Si tu API no trae relación,
      // necesitarás ajustar (ej: endpoint que devuelve inscritos por campaña).
      return suscritos.filter((s) => {
        // si tu objeto raw tiene campañas relacionadas:
        if (s.raw?.campaigns) return s.raw.campaigns.length > 0;
        // por defecto, muestra todos (o aplica otro criterio)
        return false;
      });
    }
    return suscritos;
  }

  async function verDetalles(id) {
    try {
      const data = await obtenerSuscritoPorId(id);
      // normaliza
      const sus = {
        id: data.id,
        nombre: data.nombre ?? data.name ?? "",
        correo: data.correo ?? data.email ?? "",
        numero_cedula: data.Numero_cedula ?? data.numero_cedula ?? "",
        sangre_id: data.Sangre_id ?? data.sangre_id ?? null,
        fecha: data.Fecha ?? data.fecha ?? null,
        raw: data,
      };
      setSelected(sus);
    } catch (err) {
      console.error("Error cargando detalle:", err);
    }
  }

  async function borrar(id) {
    if (!window.confirm("¿Eliminar suscrito? Esta acción no puede revertirse.")) return;
    try {
      await eliminarSuscrito(id);
      setSuscritos((prev) => prev.filter((p) => p.id !== id));
      if (selected?.id === id) setSelected(null);
    } catch (err) {
      console.error("Error al eliminar:", err);
      alert("No se pudo eliminar el suscrito");
    }
  }

  const items = filtradosPorPestana();

  // cálculos para tarjetas
  const totalSuscritos = suscritos.length;
  const donantesActivos = suscritos.filter(s => (s.raw?.previous_donations ?? s.previous_donations) > 0).length;
  const inscritosCampanas = suscritos.filter(s => s.raw?.campaigns && s.raw.campaigns.length > 0).length;

  return (
    <div className="gestion-usuarios-page">
      <header>
        <h1>Gestión de Usuarios</h1>
        <p>Administra los usuarios registrados y participantes de campañas</p>
      </header>

      <div className="search-row">
        <input
          placeholder="Buscar por nombre, correo o tipo de sangre..."
          value={q}
          onChange={onBuscar}
        />
      </div>

      <div className="stats-row">
        <div className="stat-card"><strong>Total Suscritos</strong><div>{totalSuscritos}</div></div>
        <div className="stat-card"><strong>Donantes Activos</strong><div>{donantesActivos}</div></div>
        <div className="stat-card"><strong>Inscritos Campañas</strong><div>{inscritosCampanas}</div></div>
      </div>

      <div className="tabs">
        <button className={tab === "suscritos" ? "active" : ""} onClick={() => setTab("suscritos")}>Suscritos ({totalSuscritos})</button>
        <button className={tab === "inscritos" ? "active" : ""} onClick={() => setTab("inscritos")}>Inscritos a Campañas ({inscritosCampanas})</button>
      </div>

      <div className="table-wrap">
        {loading ? (<div>Cargando...</div>) : (
          <table className="users-table">
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Contacto</th>
                <th>Tipo de Sangre</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {items.map(s => (
                <tr key={s.id}>
                  <td>
                    <div><strong>{s.nombre}</strong></div>
                    <div className="meta">Registro: {s.fecha ? s.fecha.split?.("T")[0] ?? s.fecha : "-"}</div>
                  </td>
                  <td>
                    <div>{s.correo}</div>
                    <div>{s.numero_cedula}</div>
                  </td>
                  <td>{s.sangre_id ? `ID ${s.sangre_id}` : "-"}</td>
                  <td>
                    <button onClick={() => verDetalles(s.id)}>Ver detalles</button>
                    <button onClick={() => borrar(s.id)} style={{marginLeft:8}}>Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {selected && (
        <div className="modal-overlay">
          <div className="modal">
            <button className="close" onClick={() => setSelected(null)}>✕</button>
            <h3>Detalles del Suscrito</h3>
            <div><strong>Nombre:</strong> {selected.nombre}</div>
            <div><strong>Correo:</strong> {selected.correo}</div>
            <div><strong>Número cédula:</strong> {selected.numero_cedula}</div>
            <div><strong>Tipo sangre (id):</strong> {selected.sangre_id}</div>
            <div><strong>Fecha registro:</strong> {selected.fecha ? selected.fecha.split?.("T")[0] ?? selected.fecha : "-"}</div>
            {/* Si tu API devuelve campañas relacionadas, las puedes listar así: */}
            {selected.raw?.campaigns && (
              <div>
                <strong>Campañas:</strong>
                <ul>
                  {selected.raw.campaigns.map(c => <li key={c.id}>{c.Titulo ?? c.title ?? c.titulo}</li>)}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
export default GestionUsuarios;