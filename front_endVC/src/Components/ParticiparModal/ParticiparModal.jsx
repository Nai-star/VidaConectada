import React, { useEffect, useState } from "react";
import "../Suscripciones/modalSuscripcion.css";
import { registerParticipante } from "../../services/ServicioParticipacion";
import { checkCustomUser } from "../../services/ServicioCustomUser";
import { GetTiposSangre } from "../../services/Servicio_TS"; 

import { FiBell } from "react-icons/fi";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;

function ParticiparModal({ isOpen, onClose, campaign, onParticipateSuccess }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ nombre: "", apellido: "", correo: "", tipo_sangre: "" });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [isSubscribedUser, setIsSubscribedUser] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setForm({ nombre: "", apellido: "", correo: "", tipo_sangre: "" });
      setIsSubscribedUser(false);
      setMsg({ type: "", text: "" });
      setLoading(false);
    }
  }, [isOpen]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));

    // Si cambia el correo volvemos a paso 1 y borramos estado de suscripción
    if (name === "correo") {
      setIsSubscribedUser(false);
      setStep(1);
      setMsg({ type: "", text: "" });
    }
  };

  const validarCorreo = () => {
    const c = (form.correo || "").trim();
    if (!c) return "Ingrese un correo";
    if (!emailRegex.test(c)) return "Correo inválido";
    return "";
  };

  const validarFormulario = () => {
    if (!form.nombre.trim()) return "El nombre es requerido";
    if (!form.apellido.trim()) return "El apellido es requerido";
    if (!form.tipo_sangre) return "Selecciona tu tipo de sangre";
    return "";
  };

  const handleNextStep = async (e) => {
    e.preventDefault();
    setMsg({ type: "", text: "" });

    const error = validarCorreo();
    if (error) return setMsg({ type: "error", text: error });

    setLoading(true);
    try {
      // Consulta a la API (ServicioCustomUser)
      const usuario = await checkCustomUser(form.correo);

      // Si no hay usuario -> paso 2 (registro completo)
      if (!usuario) {
        setStep(2);
        setIsSubscribedUser(false);
        setMsg({ type: "", text: "" });
        return;
      }

      // Si hay usuario: verificar campos de verificación (varios nombres posibles)
      // Normalizamos nombres/flags posibles
      const userObj = usuario;
      const nombre = userObj.nombre ?? userObj.first_name ?? "";
      const apellido = userObj.apellido ?? userObj.last_name ?? "";
      const correo = (userObj.correo ?? userObj.email ?? form.correo).toString();
      const tipo_sangre = userObj.tipo_sangre ?? userObj.blood_type ?? "";

      // Detectar si tiene flag de verificación/activación
      const verifiedFlag = userObj.is_verified ?? userObj.verified ?? userObj.email_verified;
      const activeFlag = userObj.is_active ?? userObj.active; // en Django suele ser is_active
      const isVerified = verifiedFlag === true || activeFlag === true || verifiedFlag === undefined && activeFlag === undefined;

      // Si el usuario existe pero NO está verificado -> tratar como no suscrito
      if (!isVerified) {
        // No marcar como suscrito; pasar a step 2 para que el usuario complete/reenvíe datos
        setForm((f) => ({ ...f, correo })); // pre-llenamos correo al menos
        setStep(2);
        setIsSubscribedUser(false);
        setMsg({ type: "info", text: "Se encontró un registro con ese correo, pero no está verificado. Completa los datos para registrarte/actualizar." });
        return;
      }

      // Usuario existe y parece verificado -> precargar y permitir confirmación
      setForm({ nombre, apellido, correo, tipo_sangre });
      setIsSubscribedUser(true);
      setStep(2);
      setMsg({ type: "info", text: `¡Hola de nuevo, ${nombre} ${apellido}! Confirma tu participación.` });
    } catch (err) {
      console.error("Error en checkCustomUser:", err);
      // Si la petición falla, no pasamos info; mejor mostrar mensaje y permitir que continúe manualmente
      setMsg({ type: "error", text: "Error al verificar el correo. Intenta nuevamente." });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg({ type: "", text: "" });

    if (isSubscribedUser) {
      // confirmar participación para usuario verificado
      try {
        setLoading(true);
        await registerParticipante({
          nombre: form.nombre,
          apellido: form.apellido,
          correo: form.correo,
          tipo_sangre: form.tipo_sangre,
          campaignId: campaign?.id ?? campaign?.pk ?? campaign?._id,
        });
        setMsg({ type: "success", text: `Participación registrada. ¡Gracias, ${form.nombre}!` });
        onParticipateSuccess && onParticipateSuccess(campaign);
        setTimeout(() => onClose && onClose(), 1500);
      } catch (err) {
        console.error("Error registrando participación:", err);
        setMsg({ type: "error", text: "Error al registrar la participación. Intenta de nuevo." });
      } finally {
        setLoading(false);
      }
      return;
    }

    // Si no está suscrito: validar y crear participación + crear usuario si el backend lo soporta
    const error = validarFormulario();
    if (error) return setMsg({ type: "error", text: error });

    try {
      setLoading(true);
      await registerParticipante({
        nombre: form.nombre,
        apellido: form.apellido,
        correo: form.correo,
        tipo_sangre: form.tipo_sangre,
        campaignId: campaign?.id ?? campaign?.pk ?? campaign?._id,
        createSubscription: true, // backend debe interpretar esto y crear customuser si es necesario
      });
      setMsg({ type: "success", text: `Participación registrada. ¡Gracias, ${form.nombre}!` });
      onParticipateSuccess && onParticipateSuccess(campaign);
      setTimeout(() => onClose && onClose(), 1500);
    } catch (err) {
      console.error("Error registrando participante (nuevo):", err);
      setMsg({ type: "error", text: "Error al procesar el registro. Intenta de nuevo." });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const [tiposSangre, setTiposSangre] = useState([]);

  useEffect(() => {
    // Cargar tipos de sangre al iniciar
    async function loadTipos() {
      try {
        const data = await GetTiposSangre();
        setTiposSangre(data);
      } catch (e) {
        console.error("Error cargando tipos de sangre", e);
      }
    }

    loadTipos();
  }, []);

  return (
    <div className="sub-overlay" onClick={onClose}>
      <div className="sub-modal" onClick={(e) => e.stopPropagation()}>
        <h3 className="sub-title">
          {isSubscribedUser ? `¡Hola de nuevo, ${form.nombre}!` : "Participa en la campaña"}
        </h3>
        <p className="sub-subtitle">
          {isSubscribedUser
            ? `Confirma tu participación en "${campaign?.Titulo ?? campaign?.title ?? ""}".`
            : step === 1
            ? "Ingresa tu correo para comenzar"
            : "Completa tus datos para participar"}
        </p>

        <div className="sub-iconWrap"><FiBell /></div>

        <form className="sub-form" onSubmit={step === 1 ? handleNextStep : handleSubmit}>
          {step === 1 && (
            <div className="sub-field">
              <label>Correo electrónico</label>
              <input name="correo" value={form.correo} onChange={onChange} placeholder="correo@ejemplo.com" autoFocus />
            </div>
          )}

          {step === 2 && (
            <>
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

              <div className="sub-field">
                <label>Tipo de sangre</label>
                <select
                  name="tipo_sangre"
                  value={form.tipo_sangre}
                  onChange={onChange}
                  disabled={isSubscribedUser && !!form.tipo_sangre}
                >
                  <option value="">Selecciona tu tipo de sangre</option>

                  {tiposSangre.map((t) => (
                    <option key={t.id_tipo_sangre} value={t.blood_type}>
                      {t.blood_type}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          {msg.text && <div className={`sub-alert ${msg.type}`}>{msg.text}</div>}

          <button className="sub-btn" disabled={loading}>
            {loading ? "Procesando..." : isSubscribedUser ? "Confirmar participación" : step === 1 ? "Siguiente" : "Participar"}
          </button>
        </form>

        <p className="sub-footnote">Enviaremos información relevante y respetaremos tu privacidad.</p>
      </div>
    </div>
  );
}

export default ParticiparModal;
