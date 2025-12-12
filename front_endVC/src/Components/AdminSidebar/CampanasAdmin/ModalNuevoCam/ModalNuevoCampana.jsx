// ModalNuevoCampana.jsx
import React, { useState, useEffect } from "react";
import "./ModalNuevoCampana.css";
import { obtenerProvincias, obtenerCantones } from "../../../../services/ServicioProvincias";

export default function ModalNuevoCampana({ onClose, onSave }) {
  const [titulo, setTitulo] = useState("");
  const [subtitulo, setSubtitulo] = useState("");
  const [fecha, setFecha] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [hora, setHora] = useState("");
  const [horaFin, setHoraFin] = useState("");
  const [lugar, setLugar] = useState("");

  const [provincia, setProvincia] = useState("");
  const [provincias, setProvincias] = useState([]);

  const [canton, setCanton] = useState("");
  const [cantones, setCantones] = useState([]);

  const [imagen, setImagen] = useState(null); // solo 1 archivo (ajusta si necesitas múltiples)

  useEffect(() => {
    obtenerProvincias()
      .then((res) => {
        const data = Array.isArray(res) ? res : (res?.data ?? []);
        const norm = (data || []).map((p) => ({
          id: p.id ?? p.ID ?? p.value,
          nombre_p: p.nombre_p ?? p.nombre ?? p.name ?? String(p.id ?? p.value ?? "")
        }));
        setProvincias(norm.filter(Boolean));
      })
      .catch((err) => {
        console.error("Error al obtener provincias:", err);
        setProvincias([]);
      });

    obtenerCantones()
      .then((res) => {
        const data = Array.isArray(res) ? res : (res?.data ?? []);
        setCantones(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error("Error al obtener cantones:", err);
        setCantones([]);
      });
  }, []);

  const cantonesFiltrados = (cantones || []).filter((c) => {
    if (!provincia || !c) return false;
    const provObj = c.Provincia ?? c.provincia ?? c.ProvinciaId ?? c.provincia_id;
    if (!provObj) return false;
    if (typeof provObj === "object" && "id" in provObj) {
      return String(provObj.id) === String(provincia);
    }
    return String(provObj) === String(provincia);
  });

  const guardar = () => {
    // validaciones básicas
    if (!titulo?.trim()) {
      alert("El título es requerido");
      return;
    }
    if (!subtitulo?.trim()) {
      alert("La descripción es requerida");
      return;
    }
    if (!fecha) {
      alert("La fecha de inicio es requerida");
      return;
    }
    if (!hora) {
      alert("La hora de inicio es requerida");
      return;
    }
    if (!lugar?.trim()) {
      alert("La dirección es requerida");
      return;
    }

    // Cantón: puede venir como string -> convertir a Number
    const cantonId = canton === "" ? null : (Number.isNaN(Number(canton)) ? null : Number(canton));
    if (cantonId === null) {
      alert("Debe seleccionar un cantón");
      return;
    }

    // preparar payload con los nombres que espera el servicio
    const payload = {
      titulo: titulo.trim(),
      subtitulo: subtitulo.trim(),
      fecha,               // YYYY-MM-DD (input type=date)
      fechaFin: fechaFin || fecha,
      hora,                // HH:MM (input type=time)
      horaFin: horaFin || hora,
      lugar: lugar.trim(),
      Cantones: cantonId,
      imagen: imagen || null
    };

    console.log("[ModalNuevo] Payload final:", payload);
    onSave(payload);
    onClose();
  };

  return (
    <div className="modal fondo">
      <div className="modal-content">
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: 8}}>
          <h2>Nueva Campaña</h2>
          <button aria-label="Cerrar" onClick={onClose} style={{border:'none',background:'transparent',fontSize:18,cursor:'pointer'}}>×</button>
        </div>

        <label>Provincia</label>
        <select
          value={provincia}
          onChange={(e) => { setProvincia(e.target.value); setCanton(""); }}
        >
          <option value="">Seleccione una provincia</option>
          {provincias.map(p => <option key={p.id} value={p.id}>{p.nombre_p}</option>)}
        </select>

        <label>Cantón</label>
        <select value={canton} onChange={(e) => setCanton(e.target.value)} disabled={!provincia}>
          <option value="">Seleccione un cantón</option>
          {cantonesFiltrados.map(c => (
            <option key={c.id} value={c.id}>
              {c.nombre_canton ?? c.nombre ?? c.name ?? String(c.id)}
            </option>
          ))}
        </select>

        <label>Título</label>
        <input type="text" value={titulo} onChange={(e) => setTitulo(e.target.value)} />

        <label>Descripción</label>
        <textarea value={subtitulo} onChange={(e) => setSubtitulo(e.target.value)} />

        <label>Fecha inicio</label>
        <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />

        <label>Fecha fin</label>
        <input type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} />

        <label>Hora inicio</label>
        <input type="time" value={hora} onChange={(e) => setHora(e.target.value)} />

        <label>Hora fin</label>
        <input type="time" value={horaFin} onChange={(e) => setHoraFin(e.target.value)} />

        <label>Dirección exacta</label>
        <input type="text" value={lugar} onChange={(e) => setLugar(e.target.value)} />

        <label>Imagen (opcional)</label>
        <input type="file" accept="image/*" onChange={(e) => setImagen(e.target.files?.[0] ?? null)} />

        <div className="botones" style={{marginTop:12}}>
          <button onClick={guardar}>Guardar</button>
          <button onClick={onClose} className="cancelar">Cancelar</button>
        </div>
      </div>
    </div>
  );
}
