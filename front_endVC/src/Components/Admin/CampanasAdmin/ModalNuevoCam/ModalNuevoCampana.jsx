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
  const [guardando, setGuardando] = useState(false);

  const [errores, setErrores] = useState({});



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

  const validarFormulario = () => {
  const nuevosErrores = {};

  if (!provincia) nuevosErrores.provincia = "Seleccione una provincia";
  if (!canton) nuevosErrores.canton = "Seleccione un cantón";
  if (!titulo.trim()) nuevosErrores.titulo = "El título es obligatorio";
  if (!subtitulo.trim()) nuevosErrores.subtitulo = "La descripción es obligatoria";
  if (!contacto.trim()) nuevosErrores.contacto = "El contacto es obligatorio";
  if (!fecha) nuevosErrores.fecha = "La fecha es obligatoria";
  if (!hora) nuevosErrores.hora = "La hora es obligatoria";
  if (!lugar.trim()) nuevosErrores.lugar = "La dirección es obligatoria";
  if (requisitosSeleccionados.length === 0) {
    nuevosErrores.requisitos = "Debe seleccionar al menos un requisito";
  }

  setErrores(nuevosErrores);
  return Object.keys(nuevosErrores).length === 0;
};


  const guardar = async () => {
  if (guardando) return;     // Bloqueo doble click
  setError("");

   if (!validarFormulario()) return;

  try {
    setGuardando(true);      // Bloquea botón

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

    requisitosSeleccionados.forEach(id => {
      formData.append("requisitos", id);
    });

    if (imagen instanceof File) {
      formData.append("imagen", imagen);
    }

    const nuevaCampana = await onSave(formData);

    onClose(nuevaCampana);

  } catch (err) {
    console.error("Error al crear campaña:", err);
    setError("No se ha podido crear la campaña.");
  } finally {
    setGuardando(false);     // Libera botón
  }
};


  return (
    <div className="modal fondo">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Nueva Campaña</h2>
          <button aria-label="Cerrar" onClick={() => onClose(null)}>×</button>
        </div>

        
        <label>Provincia</label>
        <select value={provincia} onChange={(e) => { setProvincia(e.target.value); setCanton(""); }}>
          <option value="">Seleccione una provincia</option>
          {provincias.map(p => <option key={p.id} value={p.id}>{p.nombre_p}</option>)}
        </select>{errores.provincia && <small className="error">{errores.provincia}</small>}

        <label>Cantón</label>
        <select value={canton} onChange={(e) => setCanton(e.target.value)} disabled={!provincia}>
          <option value="">Seleccione un cantón</option>
          {cantonesFiltrados.map(c => (
            <option key={c.id} value={c.id}>{c.nombre_canton ?? c.nombre ?? c.name ?? String(c.id)}</option>
          ))}
        </select>{errores.canton && <small className="error">{errores.canton}</small>}

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
        </div>{errores.requisitos && <small className="error">{errores.requisitos}</small>}

        <label>Título</label>
        <input placeholder="Nombre de la Campaña" type="text" value={titulo} onChange={(e) => setTitulo(e.target.value)} />
        {errores.titulo && <small className="error">{errores.titulo}</small>}

        <label>Descripción</label>
        <textarea placeholder="Puedes agregar una descripción detallada de la campaña o como llegar por si agregan un link en dirección exacta"   value={subtitulo} onChange={(e) => setSubtitulo(e.target.value)} /> 
        {errores.subtitulo && <small className="error">{errores.subtitulo}</small>}

        <label>Contacto</label>
        <input type="text" placeholder="Ej: 8888-8888 / correo@ejemplo.com" value={contacto} onChange={(e) => setContacto(e.target.value)}/>
        <small className="hint"> Teléfono, WhatsApp o correo electrónico de contacto</small>
        {errores.contacto && <small className="error">{errores.contacto}</small>}

        <label>Fecha inicio</label>
        <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />
        {errores.fecha && <small className="error">{errores.fecha}</small>}

        <label>Fecha fin</label>
        <input type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} />
        {errores.fechaFin && <small className="error">{errores.fechaFin}</small>}

        <label>Hora inicio</label>
        <input type="time" value={hora} onChange={(e) => setHora(e.target.value)} />
        {errores.hora && <small className="error">{errores.hora}</small>}

        <label>Hora fin</label>
        <input type="time" value={horaFin} onChange={(e) => setHoraFin(e.target.value)} />
        {errores.horaFin && <small className="error">{errores.horaFin}</small>}

        <label>Dirección exacta</label>
        <input type="text" placeholder="Pueden agregar el link de la ubicación" value={lugar} onChange={(e) => setLugar(e.target.value)} />
        {errores.lugar && <small className="error">{errores.lugar}</small>}

        <label>Imagen (opcional)</label>
        <input type="file" accept="image/*" onChange={(e) => setImagen(e.target.files[0] || null)} />

        <div className="botones">
          <button onClick={guardar} disabled={guardando}>
            {guardando ? "Guardando..." : "Guardar"}
          </button>

          <button 
            onClick={() => onClose(null)} 
            className="cancelar"
            disabled={guardando}
          >
            Cancelar
          </button>
        </div>

      </div>
    </div>
  );
}
