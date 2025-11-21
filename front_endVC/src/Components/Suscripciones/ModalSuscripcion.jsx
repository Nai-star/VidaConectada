import React, { useEffect, useState } from "react";
import "./modalSuscripcion.css";
import { crearSuscripcion } from "../../services/ServicioSuscripcion";
import { GetTiposSangre } from "../../services/Servicio_TS";
import { checkCustomUser } from "../../services/ServicioCustomUser"; // <-- agregar
import { FiBell } from "react-icons/fi";

const emailRegex = /^[^\s@]+@[^\s@]+.[^\s@]{2,}$/i;

function ModalSuscripcion({ isOpen, onClose }) {
const [form, setForm] = useState({ nombre: "", apellido: "", correo: "", tipo_sangre: "" });
const [tipos, setTipos] = useState([]);
const [loading, setLoading] = useState(false);
const [msg, setMsg] = useState({ type: "", text: "" });
const [isSubscribedUser, setIsSubscribedUser] = useState(false); // <-- nuevo

useEffect(() => {
if (isOpen) {
GetTiposSangre()
.then((data) => setTipos(data))
.catch(() => setTipos([]));
  setForm({ nombre: "", apellido: "", correo: "", tipo_sangre: "" });
  setIsSubscribedUser(false);
  setMsg({ type: "", text: "" });
}


}, [isOpen]);

const onChange = (e) => {
const { name, value } = e.target;
setForm((f) => ({ ...f, [name]: value }));

if (name === "correo") {
  setIsSubscribedUser(false);
  setMsg({ type: "", text: "" });
}

};

const validar = () => {
if (!form.nombre.trim()) return "El nombre es requerido";
if (!form.apellido.trim()) return "El apellido es requerido";
if (!emailRegex.test(form.correo)) return "Correo inválido";
if (!form.tipo_sangre) return "Selecciona tu tipo de sangre";
return "";
};

const handleNextStep = async (e) => {
e.preventDefault();
setMsg({ type: "", text: "" });

const correoError = !form.correo.trim() ? "Ingrese un correo" : !emailRegex.test(form.correo) ? "Correo inválido" : "";
if (correoError) return setMsg({ type: "error", text: correoError });

setLoading(true);
try {
  // Verificar si el usuario ya existe
  const usuario = await checkCustomUser(form.correo);
  if (usuario) {
    setIsSubscribedUser(true);
    setForm({
      nombre: usuario.nombre ?? usuario.first_name ?? "",
      apellido: usuario.apellido ?? usuario.last_name ?? "",
      correo: usuario.correo ?? usuario.email ?? form.correo,
      tipo_sangre: usuario.tipo_sangre ?? usuario.blood_type ?? "",
    });
    setMsg({ type: "info", text: "Este correo ya está suscrito. Confirma los datos o actualiza." });
    return;
  }
  setIsSubscribedUser(false);
  setMsg({ type: "", text: "" });
} catch (err) {
  console.error("Error verificando correo:", err);
  setMsg({ type: "error", text: "Error al verificar el correo. Intenta nuevamente." });
} finally {
  setLoading(false);
}


};

const onSubmit = async (e) => {
e.preventDefault();
setMsg({ type: "", text: "" });
if (!isSubscribedUser) {
  const error = validar();
  if (error) return setMsg({ type: "error", text: error });
}

try {
  setLoading(true);
  await crearSuscripcion(form);
  setMsg({ type: "success", text: "¡Suscripción registrada con éxito!" });
  setTimeout(() => onClose(), 1500);
  setForm({ nombre: "", apellido: "", correo: "", tipo_sangre: "" });
} catch (err) {
  console.error("Error creando suscripción:", err);
  setMsg({ type: "error", text: "Hubo un error, intenta de nuevo." });
} finally {
  setLoading(false);
}

};

if (!isOpen) return null;

return ( <div className="sub-overlay" onClick={onClose}>
<div className="sub-modal" onClick={(e) => e.stopPropagation()}> <h3 className="sub-title">Suscríbete al Boletín</h3> <p className="sub-subtitle">Recibe noticias, estadísticas y actualizaciones sobre VidaConectada</p>

    <div className="sub-iconWrap"><FiBell /></div>

    <form className="sub-form" onSubmit={isSubscribedUser ? onSubmit : handleNextStep}>
      {/* Nombre y apellido */}
      <div className="sub-row">
        <div className="sub-field">
          <label>Nombre</label>
          <input name="nombre" value={form.nombre} onChange={onChange} placeholder="Tu nombre" readOnly={isSubscribedUser} />
        </div>
        <div className="sub-field">
          <label>Apellido</label>
          <input name="apellido" value={form.apellido} onChange={onChange} placeholder="Tu apellido" readOnly={isSubscribedUser} />
        </div>
      </div>

      {/* Correo */}
      <div className="sub-field">
        <label>Correo electrónico</label>
        <input name="correo" value={form.correo} onChange={onChange} placeholder="correo@ejemplo.com" />
      </div>

      {/* Tipo de sangre */}
      <div className="sub-field">
        <label>Tipo de sangre</label>
        <select name="tipo_sangre" value={form.tipo_sangre} onChange={onChange} disabled={isSubscribedUser && !!form.tipo_sangre}>
          <option value="">Selecciona tu tipo de sangre</option>
          {tipos.map((t) => (
            <option key={t.id_tipo_sangre} value={t.blood_type}>{t.blood_type}</option>
          ))}
        </select>
      </div>

      {msg.text && <div className={`sub-alert ${msg.type}`}>{msg.text}</div>}

      <button className="sub-btn" disabled={loading}>
        {loading ? "Procesando..." : isSubscribedUser ? "Actualizar suscripción" : "Verificar correo"}
      </button>

      <p className="sub-footnote">Enviaremos boletines mensuales con información relevante.</p>
    </form>

    <p className="sub-privacy">Tu privacidad es importante. No compartiremos tu información con terceros.</p>
  </div>
</div>

);
}

export default ModalSuscripcion;
