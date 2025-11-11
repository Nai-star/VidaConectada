import React, { useEffect, useState } from "react";
import "./modalSuscripcion.css";
import { crearSuscripcion } from "../../services/ServicioSuscripcion";
import { GetTiposSangre } from "../../services/Servicio_TS";
import { FiBell } from "react-icons/fi";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;

function ModalSuscripcion({ isOpen, onClose }) {

    const [form, setForm] = useState({
        nombre: "",
        apellido: "",
        correo: "",
        tipo_sangre: "",
    });

    const [tipos, setTipos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState({ type: "", text: "" });

    // Carga tipos de sangre al abrir el modal
    useEffect(() => {
        if (isOpen) {
        GetTiposSangre()
            .then((data) => setTipos(data))
            .catch(() => setTipos([]));
        }
    }, [isOpen]);

    const onChange = (e) =>
        setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

    const validar = () => {
        if (!form.nombre.trim()) return "El nombre es requerido";
        if (!form.apellido.trim()) return "El apellido es requerido";
        if (!emailRegex.test(form.correo)) return "Correo inválido";
        if (!form.tipo_sangre) return "Selecciona tu tipo de sangre";
        return "";
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        const error = validar();
        if (error) return setMsg({ type: "error", text: error });

        try {
        setLoading(true);
        setMsg({ type: "", text: "" });

        await crearSuscripcion(form);
        setMsg({ type: "success", text: "¡Suscripción registrada con éxito!" });

        setTimeout(() => onClose(), 1500);
        setForm({ nombre: "", apellido: "", correo: "", tipo_sangre: "" });
        } catch (e) {
        setMsg({ type: "error", text: "Hubo un error, intenta de nuevo." });
        } finally {
        setLoading(false);
        }
    };

    if (!isOpen) return null;




  return (

    <div className="sub-overlay" onClick={onClose}>
      <div className="sub-modal" onClick={(e) => e.stopPropagation()}>
        <h3 className="sub-title">Suscríbete al Boletín</h3>
        <p className="sub-subtitle">
          Recibe noticias, estadísticas y actualizaciones sobre VidaConectada
        </p>

        <div className="sub-iconWrap"><FiBell /></div>

        <form className="sub-form" onSubmit={onSubmit}>
          {/* Nombre y apellido */}
          <div className="sub-row">
            <div className="sub-field">
              <label>Nombre</label>
              <input
                name="nombre"
                value={form.nombre}
                onChange={onChange}
                placeholder="Tu nombre"
              />
            </div>

            <div className="sub-field">
              <label>Apellido</label>
              <input
                name="apellido"
                value={form.apellido}
                onChange={onChange}
                placeholder="Tu apellido"
              />
            </div>
          </div>

          {/* Correo */}
          <div className="sub-field">
            <label>Correo electrónico</label>
            <input
              name="correo"
              value={form.correo}
              onChange={onChange}
              placeholder="correo@ejemplo.com"
            />
          </div>

          {/* Tipo de sangre dinámico */}
          <div className="sub-field">
            <label>Tipo de sangre</label>
            <select
              name="tipo_sangre"
              value={form.tipo_sangre}
              onChange={onChange}
            >
              <option value="">Selecciona tu tipo de sangre</option>

              {tipos.map((t) => (
                <option key={t.id_tipo_sangre} value={t.blood_type}>
                  {t.blood_type}
                </option>
              ))}
            </select>
          </div>

          {/* Mensaje */}
          {msg.text && (
            <div className={`sub-alert ${msg.type}`}>{msg.text}</div>
          )}

          {/* Botón */}
          <button className="sub-btn" disabled={loading}>
            {loading ? "Enviando..." : "Suscribirme"}
          </button>

          <p className="sub-footnote">
            Enviaremos boletines mensuales con información relevante.
          </p>
        </form>

        <p className="sub-privacy">
          Tu privacidad es importante. No compartiremos tu información con terceros.
        </p>
      </div>
    </div>
  )
}

export default ModalSuscripcion