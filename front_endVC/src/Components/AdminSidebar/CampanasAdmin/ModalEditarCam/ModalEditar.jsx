/// ModalEditarCampana.jsx
import React, { useEffect, useState } from "react";
import "./ModalEditar.css"; // mantiene tus estilos
import { actualizarCampana } from "../../../../services/ServicioCampanas";
import { obtenerProvincias, obtenerCantones } from "../../../../services/ServicioProvincias";

export default function ModalEditarCampana({ campana = null, onClose, onSaved }) {
  const [titulo, setTitulo] = useState("");
  const [subtitulo, setSubtitulo] = useState("");
  const [fecha, setFecha] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [hora, setHora] = useState("");
  const [horaFin, setHoraFin] = useState("");
  const [lugar, setLugar] = useState("");
  const [canton, setCanton] = useState("");
  const [provincia, setProvincia] = useState("");
  const [imagen, setImagen] = useState(null);
  const [imagenesExistentes, setImagenesExistentes] = useState([]);
  const [saving, setSaving] = useState(false);

  // listas de provincias y cantones (para mostrar nombres)
  const [provincias, setProvincias] = useState([]);
  const [cantones, setCantones] = useState([]);

  // cargar provincias y cantones para poblar selects
  useEffect(() => {
    async function cargarUbicaciones() {
      try {
        const p = await obtenerProvincias();
        const provData = Array.isArray(p) ? p : (p?.data ?? []);
        setProvincias(provData || []);
      } catch (err) {
        console.error("Error cargando provincias:", err);
        setProvincias([]);
      }

      try {
        const c = await obtenerCantones();
        const cantData = Array.isArray(c) ? c : (c?.data ?? []);
        setCantones(cantData || []);
      } catch (err) {
        console.error("Error cargando cantones:", err);
        setCantones([]);
      }
    }
    cargarUbicaciones();
  }, []);

  // inicializar campos cuando cambie la campana
  useEffect(() => {
    if (!campana) return;
    setTitulo(campana.Titulo ?? "");
    setSubtitulo(campana.Descripcion ?? "");
    setFecha(campana.Fecha_inicio ? normalizeToInputDate(campana.Fecha_inicio) : "");
    setFechaFin(campana.Fecha_fin ? normalizeToInputDate(campana.Fecha_fin) : "");
    setHora(campana.Hora_inicio ?? "");
    setHoraFin(campana.Hora_fin ?? "");
    setLugar(campana.direccion_exacta ?? "");

    // Cantones puede venir como objeto o id — normalizar a id string
    const cantValue = campana.Cantones
      ? (typeof campana.Cantones === "object" ? (campana.Cantones.id ?? campana.Cantones) : campana.Cantones)
      : "";
    setCanton(cantValue !== null && cantValue !== undefined ? String(cantValue) : "");

    // Provincia si el objeto Cantones incluye la relación
    let provValue = "";
    try {
      // si Cantones es objeto con Provincia
      if (campana.Cantones && typeof campana.Cantones === "object") {
        const provObj = campana.Cantones.Provincia ?? campana.Cantones.provincia ?? campana.Cantones.ProvinciaId ?? campana.Cantones.provincia_id;
        if (provObj) provValue = typeof provObj === "object" ? (provObj.id ?? provObj) : provObj;
      }
    } catch (e) { /* ignore */ }
    setProvincia(provValue !== null && provValue !== undefined ? String(provValue) : "");

    // imagenes existentes: puede venir en campana.imagenes o Imagen_campana
    const imgs = (campana.imagenes ?? campana.Imagen_campana ?? []).map(i => {
      if (!i) return null;
      if (typeof i === "string") return { id: null, imagen_url: i, imagen: i };
      return { id: i.id ?? null, imagen_url: i.imagen_url ?? i.url ?? i.imagen ?? null, imagen: i.imagen ?? null };
    }).filter(Boolean);
    setImagenesExistentes(imgs);
  }, [campana]);

  function normalizeToInputDate(value) {
    if (!value) return "";
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
    if (/^\d{2}-\d{2}-\d{4}$/.test(value)) {
      const [dd, mm, yyyy] = value.split("-");
      return `${yyyy}-${mm}-${dd}`;
    }
    const d = new Date(value);
    if (!isNaN(d)) {
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      return `${yyyy}-${mm}-${dd}`;
    }
    return value;
  }

  // filtrar cantones por provincia seleccionada (si aplica)
  const cantonesFiltrados = (cantones || []).filter(c => {
    if (!provincia) return true; // si no hay provincia, mostrar todos
    const provObj = c.Provincia ?? c.provincia ?? c.ProvinciaId ?? c.provincia_id;
    if (!provObj) return false;
    if (typeof provObj === "object" && "id" in provObj) return String(provObj.id) === String(provincia);
    return String(provObj) === String(provincia);
  });

  function handleFileChange(e) {
    const f = e.target.files?.[0] ?? null;
    setImagen(f);
  }

  function handleRemoveExistingImage(id) {
    setImagenesExistentes(prev => prev.filter(x => x.id !== id));
  }

  async function guardar() {
    if (!titulo?.trim()) return alert("El título es requerido");
    if (!fecha) return alert("La fecha inicio es requerida");
    if (!hora) return alert("La hora inicio es requerida");
    if (!lugar?.trim()) return alert("La dirección es requerida");
    if (!campana || !campana.id) return alert("Campaña inválida");

    setSaving(true);
    try {
      const hasFile = !!imagen;
      if (hasFile) {
        const fd = new FormData();
        fd.append("Titulo", titulo.trim());
        fd.append("Descripcion", subtitulo.trim());
        if (fecha) fd.append("Fecha_inicio", fecha);
        if (fechaFin) fd.append("Fecha_fin", fechaFin);
        if (hora) fd.append("Hora_inicio", hora);
        if (horaFin) fd.append("Hora_fin", horaFin);
        fd.append("direccion_exacta", lugar.trim());
        // Cantones: enviar id numérico si existe
        if (canton) fd.append("Cantones", String(canton));
        // enviar archivo nuevo
        fd.append("imagen", imagen);
        // si quieres conservar ids de imagenes existentes, podrías enviar:
        // fd.append("imagenes_existentes", JSON.stringify(imagenesExistentes.map(i=>i.id)));
        await actualizarCampana(campana.id, fd);
      } else {
        const body = {
          Titulo: titulo.trim(),
          Descripcion: subtitulo.trim(),
          Fecha_inicio: fecha,
          Fecha_fin: fechaFin || fecha,
          Hora_inicio: hora,
          Hora_fin: horaFin || hora,
          direccion_exacta: lugar.trim(),
          Cantones: canton ? Number(canton) : (campana.Cantones && typeof campana.Cantones === "object" ? (campana.Cantones.id ?? campana.Cantones) : campana.Cantones)
        };
        await actualizarCampana(campana.id, body);
      }

      // éxito: llamar callback del padre
      onSaved && onSaved({ success: true });
      onClose && onClose();
    } catch (err) {
      console.error("Error actualizando campaña:", err);
      alert("No se pudo actualizar la campaña: " + (err?.message ?? err));
    } finally {
      setSaving(false);
    }
  }

  if (!campana) return null;

  return (
    <div className="modal fondo">
      <div className="modal-content" style={{ maxWidth: 720 }}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: 8}}>
          <h2>Editar Campaña</h2>
          <button aria-label="Cerrar" onClick={onClose} style={{border:'none',background:'transparent',fontSize:18,cursor:'pointer'}}>×</button>
        </div>

        <label>Título</label>
        <input type="text" value={titulo} onChange={(e) => setTitulo(e.target.value)} />

        <label>Descripción</label>
        <textarea value={subtitulo} onChange={(e) => setSubtitulo(e.target.value)} />

        <div style={{display:'flex', gap:8}}>
          <div style={{flex:1}}>
            <label>Fecha inicio</label>
            <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />
          </div>
          <div style={{flex:1}}>
            <label>Fecha fin</label>
            <input type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} />
          </div>
        </div>

        <div style={{display:'flex', gap:8}}>
          <div style={{flex:1}}>
            <label>Hora inicio</label>
            <input type="time" value={hora} onChange={(e) => setHora(e.target.value)} />
          </div>
          <div style={{flex:1}}>
            <label>Hora fin</label>
            <input type="time" value={horaFin} onChange={(e) => setHoraFin(e.target.value)} />
          </div>
        </div>

        <label>Dirección exacta</label>
        <input type="text" value={lugar} onChange={(e) => setLugar(e.target.value)} />

        {/* Select Provincia (opcional, si deseas mostrar) */}
        <label>Provincia</label>
        <select value={provincia} onChange={(e) => { setProvincia(e.target.value); setCanton(""); }}>
          <option value="">-- Seleccione provincia (opcional) --</option>
          {provincias.map(p => {
            const id = p.id ?? p.ID ?? p.value;
            const name = p.nombre_p ?? p.nombre ?? p.name ?? String(id);
            return <option key={id} value={id}>{name}</option>;
          })}
        </select>

        {/* Select Cantón (muestra nombres, value = id) */}
        <label>Cantón</label>
        <select value={canton} onChange={(e) => setCanton(e.target.value)} disabled={!provincia && cantones.length>0}>
          <option value="">Seleccione un cantón</option>
          {cantonesFiltrados.map(c => {
            const id = c.id ?? c.ID ?? c.value;
            const nombre = c.nombre_canton ?? c.nombre ?? c.name ?? String(id);
            return <option key={id} value={id}>{nombre}</option>;
          })}
        </select>

        <label>Imagen nueva (opcional)</label>
        <input type="file" accept="image/*" onChange={handleFileChange} />

        <div style={{display:'flex', gap:8, marginTop:8, flexWrap:'wrap'}}>
          {imagenesExistentes.map(img => (
            <div key={String(img.id) + (img.imagen_url ?? img.imagen)} style={{position:'relative', width:120, height:80, border:'1px solid #ddd', borderRadius:6, overflow:'hidden'}}>
              <img src={img.imagen_url || img.imagen} alt="" style={{width:'100%', height:'100%', objectFit:'cover'}} />
              <button type="button" onClick={() => handleRemoveExistingImage(img.id)} style={{position:'absolute', top:4, right:4, background:'rgba(255,255,255,0.9)', border:'none', borderRadius:12, cursor:'pointer'}}>✕</button>
            </div>
          ))}
        </div>

        <div className="botones" style={{marginTop:12, display:'flex', gap:8}}>
          <button onClick={guardar} disabled={saving}>{saving ? "Guardando..." : "Guardar"}</button>
          <button onClick={onClose} className="cancelar">Cancelar</button>
        </div>
      </div>
    </div>
  );
}
