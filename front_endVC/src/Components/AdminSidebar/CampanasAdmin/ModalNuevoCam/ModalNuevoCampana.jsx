import React, { useState, useEffect } from "react";
import "./ModalNuevoCampana.css";
import { obtenerProvincias, obtenerCantones } from "../../../../services/ServicioProvincias";
import { obtenerRequisitos } from "../../../../services/ServicioRequisitos";

export default function ModalNuevoCampana({ onClose, onSave }) {
  const [titulo, setTitulo] = useState("");
  const [subtitulo, setSubtitulo] = useState("");
  const [fecha, setFecha] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [hora, setHora] = useState("");
  const [horaFin, setHoraFin] = useState("");
  const [lugar, setLugar] = useState("");
  const [contacto, setContacto] = useState("");


  const [provincia, setProvincia] = useState("");
  const [provincias, setProvincias] = useState([]);

  const [canton, setCanton] = useState("");
  const [cantones, setCantones] = useState([]);

  const [imagen, setImagen] = useState(null);

  const [requisitos, setRequisitos] = useState([]);
  const [requisitosSeleccionados, setRequisitosSeleccionados] = useState([]);

  const [error, setError] = useState("");

  useEffect(() => {
    // Provincias
    obtenerProvincias()
      .then((res) => {
        const data = Array.isArray(res) ? res : (res?.data ?? []);
        const norm = data.map((p) => ({
          id: p.id ?? p.ID ?? p.value,
          nombre_p: p.nombre_p ?? p.nombre ?? p.name ?? String(p.id ?? p.value ?? "")
        }));
        setProvincias(norm.filter(Boolean));
      })
      .catch(() => setProvincias([]));

    // Cantones
    obtenerCantones()
      .then((res) => {
        const data = Array.isArray(res) ? res : (res?.data ?? []);
        setCantones(Array.isArray(data) ? data : []);
      })
      .catch(() => setCantones([]));

    // Requisitos
    obtenerRequisitos()
      .then((res) => setRequisitos(Array.isArray(res) ? res : []))
      .catch(() => setRequisitos([]));
  }, []);

  const cantonesFiltrados = (cantones || []).filter((c) => {
    if (!provincia || !c) return false;
    const provObj = c.Provincia ?? c.provincia ?? c.ProvinciaId ?? c.provincia_id;
    if (!provObj) return false;
    if (typeof provObj === "object" && "id" in provObj) return String(provObj.id) === String(provincia);
    return String(provObj) === String(provincia);
  });

  const toggleRequisito = (id) => {
    setRequisitosSeleccionados((prev) => 
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    );
  };

  const guardar = async () => {
    setError("");

    if (!titulo.trim() || !subtitulo.trim() || !fecha || !hora || !lugar.trim() || !canton || !contacto.trim() || requisitosSeleccionados.length === 0) {
      setError("Por favor complete todos los campos y seleccione al menos un requisito.");
      return;
    }

    try {
      // FormData para enviar imagen + requisitos
      const formData = new FormData();
      formData.append("Titulo", titulo.trim());
      formData.append("Descripcion", subtitulo.trim());
      formData.append("Fecha_inicio", fecha);
      formData.append("Fecha_fin", fechaFin || fecha);
      formData.append("Hora_inicio", hora);
      formData.append("Hora_fin", horaFin || hora);
      formData.append("direccion_exacta", lugar.trim());
      formData.append("Cantones", canton);
      formData.append("Activo", true);
      formData.append("Contacto", contacto.trim());

      // requisitos (MUY IMPORTANTE)
      requisitosSeleccionados.forEach(id => {
        formData.append("requisitos", id);
      });
      // imagen (UNA SOLA)
      if (imagen instanceof File) {
        formData.append("imagen", imagen);
      }
      

      // Llamada al backend
      const nuevaCampana = await onSave(formData); // onSave debe devolver la campaña creada
      console.log("Guardado exitoso ✅");
      console.log("Payload enviado:", {
        titulo,
        subtitulo,
        fecha,
        fechaFin: fechaFin || fecha,
        hora,
        horaFin: horaFin || hora,
        lugar,
        Cantones: canton,
        requisitos: requisitosSeleccionados,
        imagen
      });
      console.log("Respuesta del backend:", nuevaCampana);

      // Se actualiza la lista en el componente padre automáticamente
      onClose(nuevaCampana); // pasamos la nueva campaña para que el padre la agregue

    } catch (err) {
      console.error("Error al crear campaña:", err);
      setError("No se ha podido crear la campaña.");
    }
  };

  return (
    <div className="modal fondo">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Nueva Campaña</h2>
          <button aria-label="Cerrar" onClick={() => onClose(null)}>×</button>
        </div>

        {error && <p className="error">{error}</p>}

        <label>Provincia</label>
        <select value={provincia} onChange={(e) => { setProvincia(e.target.value); setCanton(""); }}>
          <option value="">Seleccione una provincia</option>
          {provincias.map(p => <option key={p.id} value={p.id}>{p.nombre_p}</option>)}
        </select>

        <label>Cantón</label>
        <select value={canton} onChange={(e) => setCanton(e.target.value)} disabled={!provincia}>
          <option value="">Seleccione un cantón</option>
          {cantonesFiltrados.map(c => (
            <option key={c.id} value={c.id}>{c.nombre_canton ?? c.nombre ?? c.name ?? String(c.id)}</option>
          ))}
        </select>

        <label>Requisitos</label>
        <div className="multi-select">
          {requisitos.map(r => (
            <label key={r.id}>
              <input
                type="checkbox"
                value={r.id}
                checked={requisitosSeleccionados.includes(r.id)}
                onChange={() => toggleRequisito(r.id)}
              />
              {r.requisitos}
            </label>
          ))}
        </div>

        <label>Título</label>
        <input type="text" value={titulo} onChange={(e) => setTitulo(e.target.value)} />

        <label>Descripción</label>
        <textarea value={subtitulo} onChange={(e) => setSubtitulo(e.target.value)} />
        
        <label>Contacto</label>
        <input type="text" placeholder="Ej: 8888-8888 / correo@ejemplo.com" value={contacto} onChange={(e) => setContacto(e.target.value)}/>
        <small className="hint"> Teléfono, WhatsApp o correo electrónico de contacto</small>
        
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
        <input type="file" accept="image/*" onChange={(e) => setImagen(e.target.files[0] || null)} />

        <div className="botones">
          <button onClick={guardar}>Guardar</button>
          <button onClick={() => onClose(null)} className="cancelar">Cancelar</button>
        </div>
      </div>
    </div>
  );
}
