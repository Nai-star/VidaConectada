/// ModalEditarCampana.jsx
import React, { useEffect, useState } from "react";
import "./ModalEditar.css";
import { actualizarCampana } from "../../../../services/ServicioCampanas";
import { obtenerRequisitos } from "../../../../services/ServicioRequisitos";
import { obtenerProvincias, obtenerCantones } from "../../../../services/ServicioProvincias";

export default function ModalEditarCampana({ campana = null, onClose, onSaved }) {
  const [titulo, setTitulo] = useState("");
  const [subtitulo, setSubtitulo] = useState("");
  const [fecha, setFecha] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [hora, setHora] = useState("");
  const [horaFin, setHoraFin] = useState("");
  const [lugar, setLugar] = useState("");
  const [contacto, setContacto] = useState("");

  const [provincia, setProvincia] = useState("");
  const [canton, setCanton] = useState("");

  const [imagen, setImagen] = useState(null);
  const [imagenesExistentes, setImagenesExistentes] = useState([]);
  const [saving, setSaving] = useState(false);

  // requisitos
  const [requisitosDisponibles, setRequisitosDisponibles] = useState([]);
  const [requisitosSeleccionados, setRequisitosSeleccionados] = useState([]);

  // ubicaciones
  const [provincias, setProvincias] = useState([]);
  const [cantones, setCantones] = useState([]);

  /* =========================
     CARGAR REQUISITOS
  ==========================*/
  useEffect(() => {
    async function cargarRequisitos() {
      try {
        const r = await obtenerRequisitos();
        const data = Array.isArray(r) ? r : (r?.data ?? []);
        setRequisitosDisponibles(data);
      } catch (e) {
        console.error("Error cargando requisitos", e);
        setRequisitosDisponibles([]);
      }
    }
    cargarRequisitos();
  }, []);

  /* =========================
     CARGAR PROVINCIAS / CANTONES
  ==========================*/
  useEffect(() => {
    async function cargarUbicaciones() {
      try {
        const p = await obtenerProvincias();
        setProvincias(Array.isArray(p) ? p : (p?.data ?? []));
      } catch {
        setProvincias([]);
      }

      try {
        const c = await obtenerCantones();
        setCantones(Array.isArray(c) ? c : (c?.data ?? []));
      } catch {
        setCantones([]);
      }
    }
    cargarUbicaciones();
  }, []);

  /* =========================
     INICIALIZAR DATOS
  ==========================*/
  useEffect(() => {
    if (!campana) return;

    setTitulo(campana.Titulo ?? "");
    setSubtitulo(campana.Descripcion ?? "");
    setFecha(normalizeToInputDate(campana.Fecha_inicio));
    setFechaFin(normalizeToInputDate(campana.Fecha_fin));
    setHora(campana.Hora_inicio ?? "");
    setHoraFin(campana.Hora_fin ?? "");
    setLugar(campana.direccion_exacta ?? "");
    setContacto(campana.Contacto ?? "");

    // cantón
    const cantValue =
      typeof campana.Cantones === "object"
        ? campana.Cantones?.id
        : campana.Cantones;
    setCanton(cantValue ? String(cantValue) : "");

    // provincia
    if (campana.Cantones?.Provincia) {
      const prov = campana.Cantones.Provincia;
      setProvincia(typeof prov === "object" ? String(prov.id) : String(prov));
    }

    // imágenes
    const imgs = (campana.imagenes ?? campana.Imagen_campana ?? []).map(i => ({
      id: i.id ?? null,
      url: i.imagen_url ?? i.imagen ?? i
    }));
    setImagenesExistentes(imgs);

    // requisitos seleccionados
    const reqSel = (campana.DetalleRequisito ?? []).map(
      d => d.Requisitos?.id ?? d.Requisitos
    );
    setRequisitosSeleccionados(reqSel);
  }, [campana]);

  function normalizeToInputDate(v) {
    if (!v) return "";
    if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return v;
    const d = new Date(v);
    if (isNaN(d)) return "";
    return d.toISOString().slice(0, 10);
  }

  const cantonesFiltrados = cantones.filter(c => {
    if (!provincia) return true;
    const prov = c.Provincia ?? c.provincia_id;
    return String(prov?.id ?? prov) === provincia;
  });

  function toggleRequisito(id) {
    setRequisitosSeleccionados(prev =>
      prev.includes(id)
        ? prev.filter(x => x !== id)
        : [...prev, id]
    );
  }

  /* =========================
     GUARDAR
  ==========================*/
  async function guardar() {
    if (!titulo.trim()) return alert("Título requerido");
    if (!fecha || !hora) return alert("Fecha y hora requeridas");
    if (!lugar.trim()) return alert("Dirección requerida");

    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("Titulo", titulo.trim());
      fd.append("Descripcion", subtitulo.trim());
      fd.append("Fecha_inicio", fecha);
      fd.append("Fecha_fin", fechaFin || fecha);
      fd.append("Hora_inicio", hora);
      fd.append("Hora_fin", horaFin || hora);
      fd.append("direccion_exacta", lugar.trim());
      fd.append("Contacto", contacto.trim());
      if (canton) fd.append("Cantones", canton);

      requisitosSeleccionados.forEach(id =>
        fd.append("requisitos", id)
      );

      if (imagen) fd.append("imagen", imagen);

      await actualizarCampana(campana.id, fd);

      onSaved?.({ success: true });
      onClose?.();
    } catch (e) {
      console.error(e);
      alert("Error al actualizar campaña");
    } finally {
      setSaving(false);
    }
  }

  if (!campana) return null;

  /* =========================
     JSX
  ==========================*/
  return (
    <div className="modal fondo">
      <div className="modal-content" style={{ maxWidth: 720 }}>
        <h2>Editar Campaña</h2>

        <label>Título</label>
        <input value={titulo} onChange={e => setTitulo(e.target.value)} />

        <label>Descripción</label>
        <textarea value={subtitulo} onChange={e => setSubtitulo(e.target.value)} />

        <label>Contacto</label>
        <input
          value={contacto}
          onChange={e => setContacto(e.target.value)}
          placeholder="Teléfono, WhatsApp o correo"
        />

        <label>Requisitos</label>
        <div className="requisitos-box">
          {requisitosDisponibles.map(r => (
            <label key={r.id}>
              <input
                type="checkbox"
                checked={requisitosSeleccionados.includes(r.id)}
                onChange={() => toggleRequisito(r.id)}
              />
              {r.requisitos ?? r.nombre}
            </label>
          ))}
        </div>

        <label>Dirección</label>
        <input value={lugar} onChange={e => setLugar(e.target.value)} />

        <label>Provincia</label>
        <select value={provincia} onChange={e => setProvincia(e.target.value)}>
          <option value="">Seleccione</option>
          {provincias.map(p => (
            <option key={p.id} value={p.id}>{p.nombre_p}</option>
          ))}
        </select>

        <label>Cantón</label>
        <select value={canton} onChange={e => setCanton(e.target.value)}>
          <option value="">Seleccione</option>
          {cantonesFiltrados.map(c => (
            <option key={c.id} value={c.id}>{c.nombre_canton}</option>
          ))}
        </select>

        <label>Imagen nueva</label>
        <input type="file" onChange={e => setImagen(e.target.files[0])} />

        <div className="botones">
          <button onClick={guardar} disabled={saving}>
            {saving ? "Guardando..." : "Guardar"}
          </button>
          <button onClick={onClose} className="cancelar">Cancelar</button>
        </div>
      </div>
    </div>
  );
}
