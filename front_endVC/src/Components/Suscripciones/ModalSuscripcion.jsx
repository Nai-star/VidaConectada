import React, { useEffect, useState } from "react";
import "./modalSuscripcion.css";
import { crearSuscripcion } from "../../services/ServicioSuscripcion";
import { GetTiposSangre } from "../../services/Servicio_TS";
// Asegúrate de importar estas funciones si las usas, si no, déjalas comentadas o bórralas
// import { checkCustomUser, checkSuscripcion, createUser } from "../../services/ServicioCustomUser"; 
import { FiBell } from "react-icons/fi";

/* ---------- Aux: extraer y normalizar mensajes del servidor (incluye traducción inglés->es) ---------- */
function mapEnglishServerMessageToSpanish(msg = "") {
  const s = (msg || "").toString();

  // patrones comunes que Django/DRF genera en inglés
  if (/already exists/i.test(s) && /Numero[_\s]?cedula/i.test(s)) {
    return "Esta cédula ya está registrada.";
  }
  if (/already exists/i.test(s) && /correo|email/i.test(s)) {
    return "Este correo ya está registrado.";
  }
  // 💡 NUEVO: Manejo de error de unicidad para Telefono
  if (/already exists/i.test(s) && /telefono|phone/i.test(s)) {
    return "Este número de teléfono ya está registrado.";
  }
  if (/unique constraint/i.test(s) && /numero/i.test(s)) {
    return "Esta cédula ya está registrada.";
  }
  // mensaje genérico en inglés
  if (/already exists/i.test(s) || /duplicate/i.test(s)) {
    return "Ya existe un registro con esos datos.";
  }

  // fallback: devolver el mensaje original
  return s;
}

function parseAxiosError(err) {
  if (!err) return "Ocurrió un error.";
  const resp = err.response;
  if (!resp || resp.data === undefined || resp.data === null) {
    return err.message || "No se pudo conectar con el servidor.";
  }
  const data = resp.data;

  // Si el backend devuelve un objeto con campos, priorizamos campos específicos
  if (typeof data === "object" && !Array.isArray(data)) {
    // Normalizar claves que puedas recibir (Numero_cedula, numero_cedula, correo, email, telefono, etc.)
    const pick = (keys) => {
      for (const k of keys) {
        if (data[k]) return data[k];
      }
      return null;
    };

    const ced = pick(["Numero_cedula", "numero_cedula", "Numero Cédula", "Numero cedula"]);
    if (ced) return Array.isArray(ced) ? String(ced[0]) : String(ced);

    const correo = pick(["correo", "email", "Correo", "e-mail"]);
    if (correo) return Array.isArray(correo) ? String(correo[0]) : String(correo);
    
    // 💡 NUEVO: Manejo de errores para el campo Telefono
    const telefono = pick(["Telefono", "telefono"]);
    if (telefono) return Array.isArray(telefono) ? String(telefono[0]) : String(telefono);

    if (data.detail) return String(data.detail);
    if (data.non_field_errors) return Array.isArray(data.non_field_errors) ? String(data.non_field_errors[0]) : String(data.non_field_errors);

    // si no encontramos campos conocidos, devolver el primer mensaje encontrado
    for (const k of Object.keys(data)) {
      const v = data[k];
      if (Array.isArray(v) && v.length) return String(v[0]);
      if (typeof v === "string") return v;
    }

    try {
      return JSON.stringify(data);
    } catch {
      return "Error de validación del servidor.";
    }
  }

  // Si la respuesta es un string (p. ej. "suscritos with this Numero cedula already exists.")
  if (typeof data === "string") {
    // intentar mapear inglés -> español
    return mapEnglishServerMessageToSpanish(data);
  }

  // Si es array
  if (Array.isArray(data) && data.length) return String(data[0]);

  return "Error inesperado del servidor.";
}

/* ---------- Componente ---------- */
function ModalSuscripcion({ isOpen, onClose }) {
  const [tiposSangre, setTiposSangre] = useState([]);
  const [customUser, setCustomUser] = useState(null);
  const [isExisting, setIsExisting] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({}); // { Numero_cedula: "...", correo: "...", Telefono: "..." }
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    Numero_cedula: "",
    nombre: "",
    correo: "",
    // 💡 NUEVO: Añadir Telefono al estado
    Telefono: "", 
    Sangre: "",
  });

  // Cargar tipos de sangre
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await GetTiposSangre();
        setTiposSangre(data || []);
      } catch (err) {
        console.error(err);
        setError("Error cargando tipos de sangre");
      }
    };
    fetchData();
  }, []);

  // Buscar usuario / suscripción cuando se bluree el input de cédula (mantener igual)
  const handleBuscarUsuario = async (e) => {
    try {
      setError("");
      setFieldErrors({});
      setSuccess("");

      const raw = e?.target?.value ?? form.Numero_cedula;
      const cedula = (raw ?? "").toString().trim();
      if (!cedula) return;

      setLoading(true);

      // Si tienes funciones para chequear usuario/suscripción, descomenta e importa:
      let user = null;
      let suscrito = null;
      // if (typeof window.checkCustomUser === "function") {
      //   user = await window.checkCustomUser(cedula);
      // } else if (typeof checkCustomUser === "function") {
      //   user = await checkCustomUser(cedula);
      // }
      // if (typeof window.checkSuscripcion === "function") {
      //   suscrito = await window.checkSuscripcion(cedula);
      // } else if (typeof checkSuscripcion === "function") {
      //   suscrito = await checkSuscripcion(cedula);
      // }

      setLoading(false);

      if (suscrito?.id) {
        setError("¡Ya estás suscrito con esta cédula!");
        setCustomUser(user || null);
        setIsExisting(!!user);
        return;
      }

      if (user?.id) {
        setCustomUser(user);
        setForm((prev) => ({
          ...prev,
          nombre: user.nombre ?? prev.nombre,
          correo: user.correo ?? prev.correo,
          // 💡 NOTA: Si tu CustomUser tiene campo de teléfono, agrégalo aquí:
          // Telefono: user.Telefono ?? prev.Telefono, 
          Numero_cedula: cedula,
        }));
        setIsExisting(true);
        setSuccess("Usuario registrado. Puedes continuar con la suscripción.");
        setError("");
      } else {
        setCustomUser(null);
        setIsExisting(false);
        // Limpiar el campo Telefono si no se encuentra el usuario
        setForm((prev) => ({ ...prev, nombre: "", correo: "", Telefono: "", Numero_cedula: cedula }));
        setError("");
        setSuccess("");
      }
    } catch (err) {
      setLoading(false);
      console.error("Error en búsqueda:", err);
      setError("Ocurrió un error al verificar la cédula.");
    }
  };

  // Manejo de inputs (mantener igual)
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // limpiar error de campo cuando usuario escribe
    setFieldErrors((prev) => ({ ...prev, [name]: null }));
  };

  // Validación cliente simple
  const validateClient = () => {
    const fe = {};
    if (!form.Numero_cedula?.toString().trim()) fe.Numero_cedula = "La cédula es obligatoria.";
    if (!form.nombre?.toString().trim()) fe.nombre = "El nombre es obligatorio.";
    if (!form.correo?.toString().trim()) fe.correo = "El correo es obligatorio.";
    // 💡 NUEVO: Añadir validación para el campo Telefono
    if (!form.Telefono?.toString().trim()) fe.Telefono = "El teléfono es obligatorio.";
    if (!form.Sangre) fe.Sangre = "Debe seleccionar un tipo de sangre.";
    return fe;
  };

  // Envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setFieldErrors({});

    const fe = validateClient();
    if (Object.keys(fe).length) {
      setFieldErrors(fe);
      return;
    }

    try {
      setLoading(true);

      // Payload que esperará tu serializer
      const payload = {
        Numero_cedula: form.Numero_cedula,
        nombre: form.nombre,  
        correo: form.correo,
        // 💡 NUEVO: Incluir el campo Telefono en el payload
        Telefono: form.Telefono, 
        Sangre: form.Sangre,
        // Si usas CustomUser y es un FK, necesitas enviar el ID
        // ...(customUser?.id ? { CustomUser: customUser.id } : {}), 
      };

      const response = await crearSuscripcion(payload);
      setLoading(false);

      if (response?.id) {
        setSuccess("¡Suscripción creada con éxito!");
        setError("");
        // 💡 NUEVO: Limpiar el campo Telefono en el formulario
        setForm({ Numero_cedula: "", nombre: "", correo: "", Telefono: "", Sangre: "" });
        setCustomUser(null);
        setIsExisting(false);
      } else {
        setError("No se pudo crear la suscripción. Revise los datos.");
      }
    } catch (err) {
      setLoading(false);
      console.error("Error en submit:", err);

      // Primero, si el backend devolvió un objeto con errores por campo
      const respData = err?.response?.data;
      if (respData && typeof respData === "object" && !Array.isArray(respData)) {
        const newFieldErrors = {};
        
        // Cédula
        if (respData.Numero_cedula || respData.numero_cedula) {
            const v = respData.Numero_cedula ?? respData.numero_cedula;
            newFieldErrors.Numero_cedula = Array.isArray(v) ? v[0] : String(v);
        }
        // Correo
        if (respData.correo || respData.email) {
            const v = respData.correo ?? respData.email;
            newFieldErrors.correo = Array.isArray(v) ? v[0] : String(v);
        }
        // 💡 NUEVO: Telefono
        if (respData.Telefono || respData.telefono) {
            const v = respData.Telefono ?? respData.telefono;
            newFieldErrors.Telefono = Array.isArray(v) ? v[0] : String(v);
        }

        if (Object.keys(newFieldErrors).length) {
          // Traducciones
          if (newFieldErrors.Numero_cedula) {
            newFieldErrors.Numero_cedula = mapEnglishServerMessageToSpanish(newFieldErrors.Numero_cedula);
          }
          if (newFieldErrors.correo) {
            newFieldErrors.correo = mapEnglishServerMessageToSpanish(newFieldErrors.correo);
          }
          // 💡 NUEVO: Traducir Telefono
          if (newFieldErrors.Telefono) {
            newFieldErrors.Telefono = mapEnglishServerMessageToSpanish(newFieldErrors.Telefono);
          }
          
          setFieldErrors(newFieldErrors);
          // Mostrar mensaje general (prioriza errores por campo)
          setError(newFieldErrors.Numero_cedula || newFieldErrors.correo || newFieldErrors.Telefono || "Error de validación.");
          return;
        }
      }

      // si vino un string (mensaje en inglés), mapeamos a español si corresponde
      const friendly = parseAxiosError(err);
      setError(friendly);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="sub-overlay">
      <div className="sub-modal">
        <button className="close-btn" onClick={onClose}>X</button>
        <div className="sub-iconWrap"><FiBell /></div>
        <h2 className="sub-title">Suscribirse</h2>
        <p className="sub-subtitle">Complete los datos para suscribirse</p>

        {error && <div className="sub-alert error">{error}</div>}
        {success && <div className="sub-alert success">{success}</div>}

        <form className="sub-form" onSubmit={handleSubmit}>
          {/* CÉDULA */}
          <div className="sub-field">
            <label>Cédula:</label>
            <input
              type="text"
              name="Numero_cedula"
              value={form.Numero_cedula}
              onChange={handleChange}
              onBlur={handleBuscarUsuario}
              placeholder="Ingrese la cédula"
            />
            {fieldErrors.Numero_cedula && <small className="field-error">{fieldErrors.Numero_cedula}</small>}
          </div>

          {/* NOMBRE */}
          <div className="sub-field">
            <label>Nombre:</label>
            <input
              type="text"
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              readOnly={isExisting}
              placeholder="Nombre del usuario"
            />
            {fieldErrors.nombre && <small className="field-error">{fieldErrors.nombre}</small>}
          </div>

          {/* CORREO */}
          <div className="sub-field">
            <label>Correo:</label>
            <input
              type="email"
              name="correo"
              value={form.correo}
              onChange={handleChange}
              readOnly={isExisting}
              placeholder="Correo del usuario"
            />
            {fieldErrors.correo && <small className="field-error">{fieldErrors.correo}</small>}
          </div>

          {/* 💡 NUEVO: CAMPO TELÉFONO */}
          <div className="sub-field">
            <label>Teléfono:</label>
            <input
              type="tel"
              name="Telefono"
              value={form.Telefono}
              onChange={handleChange}
              placeholder="Número de teléfono (ej. 8091234567)"
            />
            {fieldErrors.Telefono && <small className="field-error">{fieldErrors.Telefono}</small>}
          </div>
          {/* 💡 FIN NUEVO */}

          {/* TIPO DE SANGRE */}
          <div className="sub-field">
            <label>Tipo de sangre:</label>
            <select name="Sangre" value={form.Sangre} onChange={handleChange}>
              <option value="">Seleccione...</option>
              {tiposSangre.map((t) => (
                <option key={t.id_tipo_sangre ?? t.id} value={t.id_tipo_sangre ?? t.id}>
                  {t.blood_type ?? t.nombre ?? t.tipo}
                </option>
              ))}
            </select>
            {fieldErrors.Sangre && <small className="field-error">{fieldErrors.Sangre}</small>}
          </div>

          <button type="submit" className="sub-btn" disabled={loading}>
            {loading ? "Procesando..." : "Suscribirse"}
          </button>
        </form>

        <p className="sub-footnote">Al suscribirse, acepta nuestra política de privacidad.</p>
      </div>
    </div>
  );
}

export default ModalSuscripcion;