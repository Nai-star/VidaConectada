import React, { useEffect, useState } from "react";
import "../Suscripciones/modalSuscripcion.css";
import axios from "axios";
import { registerParticipante } from "../../services/ServicioParticipacion";
import { GetTiposSangre } from "../../services/Servicio_TS";
import { checkCustomUser } from "../../services/ServicioCustomUser";
import { FiBell } from "react-icons/fi";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://192.168.100.34:8000/api";
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;

function ParticiparModal({ isOpen, onClose, campaign, onParticipateSuccess }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ nombre: "", apellido: "", correo: "", tipo_sangre: "", cedula: "" });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [isSubscribedUser, setIsSubscribedUser] = useState(false);
  const [tiposSangre, setTiposSangre] = useState([]);

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setForm({ nombre: "", apellido: "", correo: "", tipo_sangre: "", cedula: "" });
      setIsSubscribedUser(false);
      setMsg({ type: "", text: "" });
      setLoading(false);
    }
  }, [isOpen]);

  useEffect(() => {
    async function loadTipos() {
      try {
        const data = await GetTiposSangre();
        if (!Array.isArray(data)) {
          setTiposSangre([]);
          return;
        }
        const normalized = data
          .map((t) => {
            const id = t.id ?? t.id_tipo_sangre ?? t.id_tipo;
            const tipo = t.tipo ?? t.blood_type ?? t.tipo_sangre ?? t.tipo_sangre_text;
            return { id, tipo };
          })
          .filter(Boolean);
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

    // Si cambia el correo o la cédula volvemos a paso 1 y borramos estado de suscripción
    if (name === "correo" || name === "cedula") {
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

  /**
   * handleNextStep:
   *  - primero busca por cédula en /api/suscritos/?Numero_cedula=...
   *  - si encuentra: NO abre el formulario; en su lugar registra la participación de inmediato (createSubscription:false)
   *  - si no encuentra: intenta buscar por email (checkCustomUser)
   *  - si tampoco encuentra: avanza a step 2 para que el usuario complete sus datos (crear suscrito si aplica)
   */
  const handleNextStep = async (e) => {
    e.preventDefault();
    setMsg({ type: "", text: "" });

    const error = validarCorreo();
    if (error) return setMsg({ type: "error", text: error });

    setLoading(true);
    try {
      // 0) Normalize inputs
      const cedulaTrim = (form.cedula || "").trim();
      const emailTrim = (form.correo || "").trim();

      // 1) Si hay cédula, intentar buscar suscrito por cédula (tabla suscritos)
      if (cedulaTrim) {
        try {
          const url = `${API_BASE_URL}/suscritos/?Numero_cedula=${encodeURIComponent(cedulaTrim)}`;
          console.debug("Buscando suscrito por cédula:", url);
          const resp = await axios.get(url);
          let sus = null;
          if (resp.status === 200 && resp.data) {
            const d = resp.data;
            if (Array.isArray(d) && d.length > 0) sus = d[0];
            else if (d.results && Array.isArray(d.results) && d.results.length > 0) sus = d.results[0];
            else if (typeof d === "object" && !Array.isArray(d)) sus = d;
          }

          if (sus) {
            // Si encontramos suscrito por cédula: no abrir formulario.
            // Preparamos payload usando los datos del suscrito y registramos participación automáticamente.
            const nombreSus = sus.nombre ?? sus.name ?? "";
            const correoSus = sus.correo ?? sus.email ?? emailTrim;
            // intentar mapear sangre: si sus.Sangre es FK objeto o id
            const sangreId = sus.Sangre?.id ?? sus.Sangre ?? sus.Sangre_id ?? sus.sangre_id ?? null;

            setForm((f) => ({ ...f, nombre: nombreSus, correo: correoSus, tipo_sangre: sangreId || f.tipo_sangre, cedula: cedulaTrim }));
            setIsSubscribedUser(true);
            setMsg({ type: "info", text: "Cédula encontrada — registrando participación automáticamente..." });

            // build payload for registerParticipante - adapt keys expected by your service
            const payload = {
              nombre: nombreSus,
              apellido: sus.apellido ?? sus.last_name ?? form.apellido,
              correo: correoSus,
              // if your registerParticipante expects tipo_sangre text, try to map id->text via tiposSangre
              tipo_sangre: mapTipoSangreIdToText(sangreId) || form.tipo_sangre,
              campaignId: campaign?.id ?? campaign?.pk ?? campaign?._id,
              createSubscription: false,
              cedula: cedulaTrim,
            };

            try {
              await registerParticipante(payload);
              setMsg({ type: "success", text: `Participación registrada. ¡Gracias, ${nombreSus || "participante"}!` });
              onParticipateSuccess && onParticipateSuccess(campaign);
              setTimeout(() => onClose && onClose(), 1400);
            } catch (errReg) {
              console.error("Error registrando participacion para suscrito encontrado:", errReg);
              const backendMsg = errReg?.response?.data ? JSON.stringify(errReg.response.data) : null;
              setMsg({
                type: "error",
                text: backendMsg ? `Error: ${backendMsg}` : "No se pudo registrar la participación automáticamente. Intenta de nuevo.",
              });
            } finally {
              setLoading(false);
            }
            return; // importante: no abrir siguiente formulario
          }
        } catch (errCed) {
          // fallo la búsqueda por cédula (endpoint puede no existir o devolvió error); seguimos con búsqueda por email
          console.debug("Busqueda por cedula falló o no devolvió resultado:", errCed?.response?.status ?? errCed);
        }
      }

      // 2) Si no encontramos por cédula, intentamos buscar por email (checkCustomUser)
      let usuario = null;
      try {
        usuario = await checkCustomUser(emailTrim);
      } catch (errEmailSearch) {
        console.debug("checkCustomUser falló o no encontró por email:", errEmailSearch);
        usuario = null;
      }

      if (!usuario) {
        // no existe ni por cedula ni por email -> abrir formulario para completar datos
        setStep(2);
        setIsSubscribedUser(false);
        setMsg({ type: "", text: "" });
        return;
      }

      // 3) Usuario encontrado por email -> evaluar verificación y precargar como antes
      const nombre = usuario.nombre ?? usuario.first_name ?? usuario.firstName ?? "";
      const apellido = usuario.apellido ?? usuario.last_name ?? usuario.lastName ?? "";
      const correo = (usuario.correo ?? usuario.email ?? emailTrim).toString();
      const tipo_sangre = usuario.tipo_sangre ?? usuario.blood_type ?? usuario.tipo ?? "";

      const verifiedFlag = usuario.is_verified ?? usuario.verified ?? usuario.email_verified;
      const activeFlag = usuario.is_active ?? usuario.active;
      const isVerified =
        verifiedFlag === true || activeFlag === true || (verifiedFlag === undefined && activeFlag === undefined);

      if (!isVerified) {
        setForm((f) => ({ ...f, correo }));
        setStep(2);
        setIsSubscribedUser(false);
        setMsg({
          type: "info",
          text: "Se encontró un registro con ese correo, pero no está verificado. Completa los datos para registrarte/actualizar.",
        });
        return;
      }

      // Usuario verificado → precargar y permitir confirmación (aún mostramos paso 2 pero campos en readOnly)
      setForm({ nombre, apellido, correo, tipo_sangre, cedula: form.cedula });
      setIsSubscribedUser(true);
      setStep(2);
      setMsg({ type: "info", text: `¡Hola de nuevo, ${nombre} ${apellido}! Confirma tu participación.` });
    } catch (err) {
      console.error("Error en handleNextStep:", err);
      const backendMsg = err?.response?.data ? JSON.stringify(err.response.data) : null;
      setMsg({
        type: "error",
        text: backendMsg ? `Error de servidor: ${backendMsg}` : "Error al verificar el usuario. Intenta nuevamente.",
      });
      setLoading(false);
    }
  };

  // Helper: intenta mapear un tipo_sangre id a su texto (si tiposSangre fue cargado)
  const mapTipoSangreIdToText = (id) => {
    if (!id) return null;
    // tiposSangre entries tienen {id, tipo} donde tipo es texto
    const found = tiposSangre.find((t) => String(t.id) === String(id) || t.id === id);
    return found ? found.tipo : null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg({ type: "", text: "" });

    const campaignId = campaign?.id ?? campaign?.pk ?? campaign?._id;

    if (isSubscribedUser) {
      try {
        setLoading(true);
        console.log("Enviando confirmación para usuario suscrito:", {
          correo: form.correo,
          tipo_sangre: form.tipo_sangre,
          campaignId,
        });
        await registerParticipante({
          nombre: form.nombre,
          apellido: form.apellido,
          correo: form.correo,
          tipo_sangre: form.tipo_sangre,
          campaignId,
          createSubscription: false,
          cedula: form.cedula,
        });
        setMsg({ type: "success", text: `Participación registrada. ¡Gracias, ${form.nombre}!` });
        onParticipateSuccess && onParticipateSuccess(campaign);
        setTimeout(() => onClose && onClose(), 1500);
      } catch (err) {
        console.error("Error registrando participación:", err);
        const backendMsg = err?.response?.data ? JSON.stringify(err.response.data) : null;
        setMsg({
          type: "error",
          text: backendMsg ? `Error: ${backendMsg}` : "Error al registrar la participación. Intenta de nuevo.",
        });
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
        cedula: form.cedula,
      });
      setMsg({ type: "success", text: `Participación registrada. ¡Gracias, ${form.nombre}!` });
      onParticipateSuccess && onParticipateSuccess(campaign);
      setTimeout(() => onClose && onClose(), 1500);
    } catch (err) {
      console.error("Error registrando participante (nuevo):", err);
      const backendMsg = err?.response?.data ? JSON.stringify(err.response.data) : null;
      setMsg({
        type: "error",
        text: backendMsg ? `Error: ${backendMsg}` : "Error al procesar el registro. Intenta de nuevo.",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="sub-overlay" onClick={onClose}>
      <div className="sub-modal" onClick={(e) => e.stopPropagation()}>
        <h3 className="sub-title">{isSubscribedUser ? `¡Hola de nuevo, ${form.nombre}!` : "Participa en la campaña"}</h3>
        <p className="sub-subtitle">
          {isSubscribedUser
            ? `Confirma tu participación en "${campaign?.Titulo ?? campaign?.title ?? ""}".`
            : step === 1
            ? "Ingresa tu correo y cédula para comenzar"
            : "Completa tus datos para participar"}
        </p>

        <div className="sub-iconWrap">
          <FiBell />
        </div>

        <form className="sub-form" onSubmit={step === 1 ? handleNextStep : handleSubmit}>
          {step === 1 && (
            <>
              <div className="sub-row">
                <div className="sub-field" style={{ flex: 1 }}>
                  <label>Correo electrónico</label>
                  <input name="correo" value={form.correo} onChange={onChange} placeholder="correo@ejemplo.com" autoFocus />
                </div>
                <div className="sub-field" style={{ width: 160 }}>
                  <label>Cédula</label>
                  <input name="cedula" value={form.cedula} onChange={onChange} placeholder="Número de cédula" />
                </div>
              </div>
            </>
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
                <select name="tipo_sangre" value={form.tipo_sangre} onChange={onChange} disabled={isSubscribedUser && !!form.tipo_sangre}>
                  <option value="">Selecciona tu tipo de sangre</option>
                  {tiposSangre.map((t) => (
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
