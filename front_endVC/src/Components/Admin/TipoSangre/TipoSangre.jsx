// TipoSangre.jsx
import React, { useEffect, useState } from "react";
import {
  GetTiposSangre,
  getUrgentesRaw,
  crearUrgente,
  actualizarEstadoUrgencia,
} from "../../../services/Servicio_TS";
import "./TipoSangre.css";
import { FaTint } from "react-icons/fa";

export default function TipoSangre() {
  const [tipos, setTipos] = useState([]);
  const [urgentesRaw, setUrgentesRaw] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);

  useEffect(() => {
    cargarTodos();
  }, []);

  async function cargarTodos() {
    try {
      setLoading(true);
      const t = await GetTiposSangre();
      const urg = await getUrgentesRaw();
      setTipos(t);
      setUrgentesRaw(urg);
    } catch (err) {
      console.error("Error cargando datos:", err);
    } finally {
      setLoading(false);
    }
  }

  const matchSangreToId = (sangreField, id_sangre) => {
    if (sangreField == null) return false;
    if (!isNaN(Number(sangreField))) return Number(sangreField) === Number(id_sangre);
    if (typeof sangreField === "object" && sangreField.id !== undefined)
      return Number(sangreField.id) === Number(id_sangre);
    if (typeof sangreField === "string") {
      const m = sangreField.match(/\/(\d+)\/?$/);
      if (m) return Number(m[1]) === Number(id_sangre);
    }
    return false;
  };

  const obtenerEstado = (tipo) => {
    const match = urgentesRaw.find(
      (u) => matchSangreToId(u.Sangre, tipo.id_tipo_sangre) && u.activo
    );
    if (match) {
      if (match.urgencia === "Urgente") return "Urgente";
      if (match.urgencia === "Baja disponibilidad") return "Baja disponibilidad";
    }
    return "Normal";
  };

  const estados = tipos.map((t) => ({ ...t, estado: obtenerEstado(t) }));
  const contadorNormales = estados.filter((t) => t.estado === "Normal").length;
  const contadorBaja = estados.filter((t) => t.estado === "Baja disponibilidad").length;
  const contadorUrgente = estados.filter((t) => t.estado === "Urgente").length;

  const buildAdaptedUrgentes = (urgentesArr, tiposArr) => {
    const adapted = [];
    for (const u of urgentesArr) {
      let id_tipo_sangre = null;

      if (!isNaN(Number(u.Sangre))) id_tipo_sangre = Number(u.Sangre);
      else if (typeof u.Sangre === "object" && u.Sangre.id !== undefined)
        id_tipo_sangre = Number(u.Sangre.id);
      else if (typeof u.Sangre === "string") {
        const m = u.Sangre.match(/\/(\d+)\/?$/);
        if (m) id_tipo_sangre = Number(m[1]);
      }

      const tipoObj = tiposArr.find(
        (t) => Number(t.id_tipo_sangre) === Number(id_tipo_sangre)
      );
      const blood_type = tipoObj ? tipoObj.blood_type : u.blood_type || null;

      let urgency = "urgent";
      if (u.urgencia === "Urgente") urgency = "urgent";
      else if (u.urgencia === "Baja disponibilidad") urgency = "priority";
      else urgency = "normal";

      adapted.push({
        id: u.id,
        id_tipo_sangre,
        blood_type,
        urgency,
        is_active: !!u.activo,
        note: u.nota || u.note || "",
        updated_at: u.actualizado || u.updated_at || null,
      });
    }
    return adapted.filter((a) => a.is_active);
  };

  // ------------------------------------------------
  //  🔥 ACTUALIZAR ESTADO (CON NOTAS AUTOMÁTICAS)
  // ------------------------------------------------
  async function actualizarEstado(id_sangre, nuevoEstado) {
    try {
      setSavingId(id_sangre);

      const urgentes = await getUrgentesRaw();
      setUrgentesRaw(urgentes);

      const existente = urgentes.find((u) =>
        matchSangreToId(u.Sangre, id_sangre)
      );

      // -------------------------------------
      //   🟦 Notas automáticas
      // -------------------------------------
      let notaAuto = "";
      if (nuevoEstado === "Urgente") notaAuto = "Se necesita con urgencia";
      else if (nuevoEstado === "Baja disponibilidad") notaAuto = "Stock bajo";
      else notaAuto = "Estado normal";

      const payloadBase = {
        urgencia: nuevoEstado,
        activo: true,
        nota: notaAuto,
        actualizado: new Date().toISOString(),
      };

      // -------------------------------------
      //     🟢 Estado NORMAL
      // -------------------------------------
      if (nuevoEstado === "Normal") {
        if (existente) {
          await actualizarEstadoUrgencia(existente.id, {
            urgencia: "Normal",
            activo: true,
            nota: notaAuto,
            actualizado: new Date().toISOString(),
          });
        } else {
          // Crear registro Normal si no existe
          await crearUrgente({
            urgencia: "Normal",
            activo: true,
            Sangre: id_sangre,
            nota: notaAuto,
            actualizado: new Date().toISOString(),
          });
        }
      }

      // -------------------------------------
      //   🔴 URGENTE / 🟡 BAJA DISPONIBILIDAD
      // -------------------------------------
      else {
        if (existente) {
          await actualizarEstadoUrgencia(existente.id, payloadBase);
        } else {
          let postRes = await crearUrgente({
            ...payloadBase,
            Sangre: id_sangre,
          });

          if (!postRes.ok) {
            postRes = await crearUrgente({
              ...payloadBase,
              Sangre: `/api/sangre/${id_sangre}/`,
            });

            if (!postRes.ok) {
              const txt = await postRes.text();
              throw new Error("Error creando: " + txt);
            }
          }
        }
      }

      const urgNew = await getUrgentesRaw();
      setUrgentesRaw(urgNew);

      const adapted = buildAdaptedUrgentes(urgNew, tipos);
      window.dispatchEvent(
        new CustomEvent("urgentesUpdated", { detail: { urgentes: adapted } })
      );
    } catch (err) {
      console.error("Error actualizarEstado:", err);
     
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
          <p className="sub">
            Monitorea y actualiza el estado del inventario sanguíneo
          </p>
        </div>
      </header>

      <div className="card tabla-card">
        <div className="card-header">
          <h3>Inventario de Tipos Sanguíneos</h3>
        </div>
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
                    <td>
                      <span className={`estado-chip ${cls(t.estado)}`}>
                        {t.estado}
                      </span>
                    </td>
                    <td className="col-acciones">
                      <select
                        className={`estado-select ${cls(t.estado)}`}
                        value={t.estado}
                        onChange={(e) =>
                          actualizarEstado(t.id_tipo_sangre, e.target.value)
                        }
                        disabled={savingId === t.id_tipo_sangre}
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
