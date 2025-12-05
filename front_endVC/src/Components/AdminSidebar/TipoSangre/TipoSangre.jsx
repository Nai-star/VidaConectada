// TipoSangre.jsx
import React, { useEffect, useState } from "react";
import { GetTiposSangre } from "../../../services/Servicio_TS";
import "./TipoSangre.css";
import { FaTint } from "react-icons/fa";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

/**
 * TipoSangre: listado + select para actualizar estado.
 * -> Después de crear/actualizar un registro en /urgente_tip_sang/,
 *    despacha window.dispatchEvent(new CustomEvent("urgentesUpdated", { detail: { urgentes: [...] } }))
 *    donde `urgentes` es un arreglo adaptado que la vista de escasez entiende.
 */
export default function TipoSangre() {
  const [tipos, setTipos] = useState([]);
  const [urgentesRaw, setUrgentesRaw] = useState([]); // registros crudos de /urgente_tip_sang/
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);

  useEffect(() => {
    cargarTodos();
  }, []);

  async function cargarTodos() {
    try {
      setLoading(true);
      const t = await GetTiposSangre(); // mapea: id_tipo_sangre, blood_type, ...
      const r = await fetch(`${API_URL}/urgente_tip_sang/`);
      const urgRaw = r.ok ? await r.json() : [];
      setTipos(t);
      setUrgentesRaw(urgRaw);
    } catch (err) {
      console.error("Error cargando datos:", err);
    } finally {
      setLoading(false);
    }
  }

  // matcher robusto para saber si un registro urgente pertenece al id_tipo_sangre
  const matchSangreToId = (sangreField, id_sangre) => {
    if (sangreField == null) return false;
    if (!isNaN(Number(sangreField))) return Number(sangreField) === Number(id_sangre);
    if (typeof sangreField === "object" && sangreField.id !== undefined) return Number(sangreField.id) === Number(id_sangre);
    if (typeof sangreField === "string") {
      const m = sangreField.match(/\/(\d+)\/?$/);
      if (m) return Number(m[1]) === Number(id_sangre);
    }
    return false;
  };

  // construir estado visible a partir de urgentesRaw
  const obtenerEstado = (tipo) => {
    const match = urgentesRaw.find((u) => matchSangreToId(u.Sangre, tipo.id_tipo_sangre) && u.activo);
    if (match) {
      if (match.urgencia === "Urgente") return "Urgente";
      if (match.urgencia === "Baja disponibilidad") return "Baja disponibilidad";
    }
    return "Normal";
  };

  const estados = tipos.map((t) => ({ ...t, estado: obtenerEstado(t) }));
  const stockCritico = estados.filter((t) => t.estado !== "Normal");
  const contadorNormales = estados.filter((t) => t.estado === "Normal").length;
  const contadorBaja = estados.filter((t) => t.estado === "Baja disponibilidad").length;
  const contadorUrgente = estados.filter((t) => t.estado === "Urgente").length;

  // adapta urgentesRaw + tipos a la forma que espera la vista de escasez:
  // { id, id_tipo_sangre, blood_type, urgency, is_active, note, updated_at }
  const buildAdaptedUrgentes = (urgentesArr, tiposArr) => {
    const adapted = [];
    for (const u of urgentesArr) {
      // encontrar id_tipo_sangre por la relacion Sangre
      let id_tipo_sangre = null;
      // 1) si Sangre es number-like
      if (!isNaN(Number(u.Sangre))) id_tipo_sangre = Number(u.Sangre);
      else if (typeof u.Sangre === "object" && u.Sangre.id !== undefined) id_tipo_sangre = Number(u.Sangre.id);
      else if (typeof u.Sangre === "string") {
        const m = u.Sangre.match(/\/(\d+)\/?$/);
        if (m) id_tipo_sangre = Number(m[1]);
      }

      // buscar blood_type en tiposArr por id_tipo_sangre
      const tipoObj = tiposArr.find((t) => Number(t.id_tipo_sangre) === Number(id_tipo_sangre));
      const blood_type = tipoObj ? tipoObj.blood_type : u.blood_type || null;

      // mapear urgencia a claves esperadas por la vista (priority/urgent/normal)
      let urgency = "urgent";
      if (u.urgencia === "Urgente") urgency = "urgent";
      else if (u.urgencia === "Baja disponibilidad") urgency = "priority";
      else urgency = "normal";

      adapted.push({
        id: u.id,
        id_tipo_sangre: id_tipo_sangre,
        blood_type: blood_type,
        urgency,
        is_active: !!u.activo,
        note: u.nota || u.note || "",
        updated_at: u.actualizado || u.updated_at || null,
      });
    }
    // opcional: filtrar solo activos
    return adapted.filter((a) => a.is_active);
  };

  // helpers network
  const tryPatch = async (id, body) => {
    const res = await fetch(`${API_URL}/urgente_tip_sang/${id}/`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return res;
  };

  const tryPost = async (body) => {
    const res = await fetch(`${API_URL}/urgente_tip_sang/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return res;
  };

  // actualiza o crea el registro urgente y DESPACHA evento con la lista adaptada
  async function actualizarEstado(id_sangre, nuevoEstado) {
    try {
      setSavingId(id_sangre);

      // refrescar urgentes crudos
      const rGet = await fetch(`${API_URL}/urgente_tip_sang/`);
      const urgentes = rGet.ok ? await rGet.json() : [];
      // actualizar estado local urgentesRaw para el flujo
      setUrgentesRaw(urgentes);

      // encontrar existente por Sangre
      const existente = urgentes.find((u) => matchSangreToId(u.Sangre, id_sangre));

      const payloadBase = {
        urgencia: nuevoEstado,
        activo: nuevoEstado !== "Normal",
        actualizado: new Date().toISOString(),
      };

      if (nuevoEstado === "Normal") {
        if (existente) {
          const patchRes = await tryPatch(existente.id, { activo: false });
          if (!patchRes.ok) {
            const txt = await patchRes.text();
            throw new Error("Error desactivando: " + patchRes.status + " " + txt);
          }
        }
      } else {
        if (existente) {
          const patchRes = await tryPatch(existente.id, payloadBase);
          if (!patchRes.ok) {
            const txt = await patchRes.text();
            throw new Error("Error actualizando: " + patchRes.status + " " + txt);
          }
        } else {
          // intentar POST con Sangre: id; si falla, con url
          const postBodyA = { ...payloadBase, Sangre: id_sangre, nota: "Creado desde panel" };
          let postRes = await tryPost(postBodyA);
          if (!postRes.ok) {
            const postBodyB = { ...payloadBase, Sangre: `/api/sangre/${id_sangre}/`, nota: "Creado desde panel" };
            postRes = await tryPost(postBodyB);
            if (!postRes.ok) {
              const txt = await postRes.text();
              throw new Error("Error creando: " + postRes.status + " " + txt);
            }
            // si postRes ok, re-get urgentes para consistencia
          }
        }
      }

      // recargar urgentes crudos y actualizar estado local
      const rNew = await fetch(`${API_URL}/urgente_tip_sang/`);
      const urgentesNew = rNew.ok ? await rNew.json() : [];
      setUrgentesRaw(urgentesNew);

      // construir lista adaptada y DESPACHAR EVENTO con detalle:
      const adapted = buildAdaptedUrgentes(urgentesNew, tipos);
      window.dispatchEvent(new CustomEvent("urgentesUpdated", { detail: { urgentes: adapted } }));

      // opcional: también recargar tipos si lo deseas (comenta si no quieres fetch extra)
      // await cargarTodos();
    } catch (err) {
      console.error("Error actualizarEstado:", err);
      alert("Error actualizando estado. Mira la consola.");
    } finally {
      setSavingId(null);
    }
  }

  const cls = (estado) => (estado ? estado.replace(/\s+/g, "-") : "");

  return (
    <div className="blood-dashboard-container">
      <header className="header-top">
        <div>
          <h2 className="titulo">Control de Tipos de Sangre</h2>
          <p className="sub">Monitorea y actualiza el estado del inventario sanguíneo</p>
        </div>
      </header>

      <div className="card tabla-card">
        <div className="card-header"><h3>Inventario de Tipos Sanguíneos</h3></div>
        <div className="tabla-container">
          {loading ? (
            <div>Cargando...</div>
          ) : (
            <table className="tabla-sangre">
              <thead>
                <tr>
                  <th>Tipo</th>
                  <th>Frecuencia</th>
                  <th>Población</th>
                  <th>Donar a</th>
                  <th>Recibe de</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {estados.map((t) => (
                  <tr key={t.id_tipo_sangre}>
                    <td className="tipo-col">
                      <FaTint className={`icono-sangre ${cls(t.estado)}`} />
                      <span className="tipo-text">{t.blood_type}</span>
                    </td>
                    <td>{t.frecuencia || "—"}</td>
                    <td>{t.poblacion || "—"}</td>
                    <td>{t.donaA || "—"}</td>
                    <td>{t.recibeDe || "—"}</td>
                    <td><span className={`estado-chip ${cls(t.estado)}`}>{t.estado}</span></td>
                    <td style={{ textAlign: "right" }}>
                      <select
                        value={t.estado}
                        onChange={(e) => actualizarEstado(t.id_tipo_sangre, e.target.value)}
                        disabled={savingId === t.id_tipo_sangre}
                        style={{ padding: "6px 8px", borderRadius: 6 }}
                      >
                        <option value="Normal">Normal</option>
                        <option value="Baja disponibilidad">Baja disponibilidad</option>
                        <option value="Urgente">Urgente</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className="resumen-grid" style={{ marginTop: 16 }}>
        <div className="card resumen-card normal">
          <div className="resumen-head">
            <FaTint className="icono-card normal" />
            <h4>Estado Normal</h4>
          </div>
          <p className="resumen-count">{contadorNormales}</p>
          <p className="resumen-small">tipos de sangre</p>
        </div>

        <div className="card resumen-card baja">
          <div className="resumen-head">
            <FaTint className="icono-card baja" />
            <h4>Baja Disponibilidad</h4>
          </div>
          <p className="resumen-count">{contadorBaja}</p>
          <p className="resumen-small">tipos de sangre</p>
        </div>

        <div className="card resumen-card urgente">
          <div className="resumen-head">
            <FaTint className="icono-card urgente" />
            <h4>Urgente</h4>
          </div>
          <p className="resumen-count">{contadorUrgente}</p>
          <p className="resumen-small">tipos de sangre</p>
        </div>
      </div>
    </div>
  );
}
