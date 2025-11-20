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
  const [tiposSangre, setTiposSangre] = useState([]);

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setForm({ nombre: "", apellido: "", correo: "", tipo_sangre: "" });
      setIsSubscribedUser(false);
      setMsg({ type: "", text: "" });
      setLoading(false);
    }
  }, [isOpen]);

  useEffect(() => {
    // Carga y normaliza tipos de sangre (soporta varias formas de respuesta)
    async function loadTipos() {
      try {
        const data = await GetTiposSangre();
        if (!Array.isArray(data)) {
          setTiposSangre([]);
          return;
        }
        const normalized = data.map((t) => {
          // soporta distintos shapes: {id, tipo} o {id_tipo_sangre, blood_type} o {id, tipo_sangre}
          const id = t.id ?? t.id_tipo_sangre ?? t.id_tipo;
          const tipo = t.tipo ?? t.blood_type ?? t.tipo_sangre ?? t.tipo_sangre_text;
          return { id, tipo };
        }).filter(Boolean);
        setTiposSangre(normalized);
      } catch (e) {
        console.error("Error cargando tipos de sangre", e);
        setTiposSangre([]);
      }
    }
    loadTipos();
  }, []);

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

      if (!usuario) {
        // No existe → pedir formulario completo
        setStep(2);
        setIsSubscribedUser(false);
        setMsg({ type: "", text: "" });
        return;
      }

      // Normalizar campos del user object (soporta distintos nombres)
      const nombre = usuario.nombre ?? usuario.first_name ?? "";
      const apellido = usuario.apellido ?? usuario.last_name ?? "";
      const correo = (usuario.correo ?? usuario.email ?? form.correo).toString();
      const tipo_sangre = usuario.tipo_sangre ?? usuario.blood_type ?? "";

      // Determinar verificación/activo (fallback: si no hay flags, asumimos OK)
      const verifiedFlag = usuario.is_verified ?? usuario.verified ?? usuario.email_verified;
      const activeFlag = usuario.is_active ?? usuario.active;
      const isVerified = verifiedFlag === true || activeFlag === true || (verifiedFlag === undefined && activeFlag === undefined);

      if (!isVerified) {
        setForm((f) => ({ ...f, correo }));
        setStep(2);
        setIsSubscribedUser(false);
        setMsg({ type: "info", text: "Se encontró un registro con ese correo, pero no está verificado. Completa los datos para registrarte/actualizar." });
        return;
      }

      // Usuario verificado → precargar y permitir confirmación
      setForm({ nombre, apellido, correo, tipo_sangre });
      setIsSubscribedUser(true);
      setStep(2);
      setMsg({ type: "info", text: `¡Hola de nuevo, ${nombre} ${apellido}! Confirma tu participación.` });
    } catch (err) {
      console.error("Error en checkCustomUser:", err);
      setMsg({ type: "error", text: "Error al verificar el correo. Intenta nuevamente." });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg({ type: "", text: "" });

    // Build campaign id robustly
    const campaignId = campaign?.id ?? campaign?.pk ?? campaign?._id;

    if (isSubscribedUser) {
      try {
        setLoading(true);
        console.log("Enviando confirmación para usuario suscrito:", { correo: form.correo, tipo_sangre: form.tipo_sangre, campaignId });
        await registerParticipante({
          nombre: form.nombre,
          apellido: form.apellido,
          correo: form.correo,
          tipo_sangre: form.tipo_sangre,
          campaignId,
          createSubscription: false,
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

    // Nuevo usuario o no suscrito
    const error = validarFormulario();
    if (error) return setMsg({ type: "error", text: error });

    try {
      setLoading(true);
      console.log("Enviando registro nuevo participante:", { ...form, campaignId });
      await registerParticipante({
        nombre: form.nombre,
        apellido: form.apellido,
        correo: form.correo,
        tipo_sangre: form.tipo_sangre,
        campaignId,
        createSubscription: true,
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
              <input
                name="correo"
                value={form.correo}
                onChange={onChange}
                placeholder="correo@ejemplo.com"
                autoFocus
              />
            </div>
          )}

          {step === 2 && (
            <>
              <div className="sub-row">
                <div className="sub-field">
                  <label>Nombre</label>
                  <input
                    name="nombre"
                    value={form.nombre}
                    onChange={onChange}
                    placeholder="Tu nombre"
                    readOnly={isSubscribedUser}
                  />
                </div>
                <div className="sub-field">
                  <label>Apellido</label>
                  <input
                    name="apellido"
                    value={form.apellido}
                    onChange={onChange}
                    placeholder="Tu apellido"
                    readOnly={isSubscribedUser}
                  />
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
                    // value = t.tipo (ej. "A+", "AB-") — tu servicio mapea esto a ID antes de enviar
                    <option key={t.id} value={t.tipo}>
                      {t.tipo}
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
