import React, { useState } from "react";
import "./BuzonPreguntas.css";
import { crearConsultaBuzon } from "../../services/ServicioBuzon";
import { FiMessageSquare } from "react-icons/fi";


const emailRegex =
  /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;

function BuzonPreguntas() {

    const [form, setForm] = useState({ nombre: "", correo: "", pregunta: "" });
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState({ type: "", msg: "" });

    const onChange = (e) =>
        setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

    const validate = () => {
        if (!form.nombre.trim()) return "El nombre es requerido.";
        if (!emailRegex.test(form.correo)) return "Ingresa un correo válido.";
        if (form.pregunta.trim().length < 10)
        return "La pregunta debe tener al menos 10 caracteres.";
        return "";
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        const err = validate();
        if (err) {
        setStatus({ type: "error", msg: err });
        return;
        }
        try {
        setLoading(true);
        setStatus({ type: "", msg: "" });
        await crearConsultaBuzon(form);
        setStatus({
            type: "success",
            msg: "¡Gracias! Tu consulta fue enviada al equipo. Te responderemos pronto.",
        });
        setForm({ nombre: "", correo: "", pregunta: "" });
        } catch (e2) {
        setStatus({
            type: "error",
            msg: e2?.message || "Ocurrió un error inesperado.",
        });
        } finally {
        setLoading(false);
        }
    };




  return (
    <div>

    <section className="bz-wrap" id="buzon">
      <h2 className="bz-title">
        <FiMessageSquare className="bz-icon" />
        Buzón de Preguntas
      </h2>
      <p className="bz-subtitle">
        ¿Tienes una duda específica? Envíanos tu pregunta
      </p>

      <form className="bz-card" onSubmit={onSubmit} noValidate>
        <label className="bz-label" htmlFor="nombre">Nombre completo</label>
        <input
          id="nombre"
          name="nombre"
          className="bz-input"
          placeholder="Tu nombre"
          value={form.nombre}
          onChange={onChange}
          disabled={loading}
        />

        <label className="bz-label" htmlFor="correo">Correo electrónico</label>
        <input
          id="correo"
          name="correo"
          className="bz-input"
          placeholder="correo@ejemplo.com"
          value={form.correo}
          onChange={onChange}
          disabled={loading}
        />

        <label className="bz-label" htmlFor="pregunta">Tu pregunta</label>
        <textarea
          id="pregunta"
          name="pregunta"
          className="bz-textarea"
          placeholder="Escribe tu pregunta aquí..."
          rows={5}
          value={form.pregunta}
          onChange={onChange}
          disabled={loading}
        />

        <div className="bz-note">
          <strong>Nota:</strong>{" "}
          Las preguntas seleccionadas para publicar en la sección de FAQ serán
          mostradas de forma anónima para proteger tu privacidad.
        </div>

        {/* Mensajes de estado con transición */}
        {status.msg && (
          <div className={`bz-alert ${status.type}`}>
            {status.msg}
          </div>
        )}

        <button className="bz-btn" type="submit" disabled={loading}>
          {loading ? "Enviando..." : "Enviar Consulta"}
        </button>
      </form>
    </section>




    </div>
  )
}

export default BuzonPreguntas