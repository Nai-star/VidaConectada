import React, { useEffect, useState } from "react";
import "./modalSuscripcion.css";
import { crearSuscripcion } from "../../services/ServicioSuscripcion";
import { GetTiposSangre } from "../../services/Servicio_TS";


import { FiBell } from "react-icons/fi";

function ModalSuscripcion({ isOpen, onClose }) {
  const [tiposSangre, setTiposSangre] = useState([]);
  const [customUser, setCustomUser] = useState(null);
  const [isExisting, setIsExisting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    Numero_cedula: "",
    nombre: "",
    correo: "",
    Sangre: "",
  });

  // ------------------------------ cargar tipos de sangre
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

  // ------------------------------ verificar usuario y suscripción
  const handleBuscarUsuario = async () => {
    if (!form.cedula.trim()) return;

    const user = await checkCustomUser(form.cedula);
    const suscrito = await checkSuscripcion(form.cedula);

    if (suscrito?.id) {
      setError("¡Ya estás suscrito con esta cédula!");
      setSuccess("");
      setCustomUser(user || null);
      setIsExisting(!!user);
      return;
    }

    if (user?.id) {
      setCustomUser(user);
      setForm((prev) => ({
        ...prev,
        nombre: user.nombre,
        correo: user.correo,
      }));
      setIsExisting(true);
      setError("Usuario ya registrado, puedes continuar con la suscripción.");
      setSuccess("");
    } else {
      setCustomUser(null);
      setIsExisting(false);
      setForm((prev) => ({ ...prev, nombre: "", correo: "" }));
      setError("");
      setSuccess("");
    }
  };

  // ------------------------------ manejar inputs
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ------------------------------ enviar formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    //if (!form.Numero_cedula.trim()) return setError("La cédula es obligatoria.");
    //if (!form.nombre.trim()) return setError("El nombre es obligatorio.");
    //if (!form.correo.trim()) return setError("El correo es obligatorio.");
    //if (!form.Sangre) return setError("Debe seleccionar un tipo de sangre.");


    console.log(form);
    
    const suscrito = await crearSuscripcion (form);
    console.log(suscrito);
    
    if (suscrito?.id) return setError("¡Ya estás suscrito con esta cédula!");

    let userId = customUser?.id;

    // Crear usuario si no existe
    if (!userId) {
      const newUser = await createUser({
        cedula: form.cedula,
        nombre: form.nombre,
        correo: form.correo,
      });
      if (!newUser?.id) return setError("Error al crear usuario.");
      userId = newUser.id;
    }

    // Crear suscripción
    const payload = {
      Numero_cedula: form.cedula,
      CustomUser: userId,
      Sangre: form.sangre,
    };

    const response = await crearSuscripcion(payload);

    if (response?.id) {
      setSuccess("¡Suscripción creada con éxito!");
      setError("");
    } else {
      setError("Error al crear suscripción.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="sub-overlay">
      <div className="sub-modal">
        <button className="close-btn" onClick={onClose}>X</button>

        <div className="sub-iconWrap">
          <FiBell />
        </div>

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
          </div>

          {/* TIPO DE SANGRE */}
          <div className="sub-field">
            <label>Tipo de sangre:</label>
            <select name="Sangre" value={form.Sangre} onChange={handleChange}>
              <option value="">Seleccione...</option>
              {tiposSangre.map((t) => (
                <option key={t.id_tipo_sangre} value={t.id_tipo_sangre}>
                  {t.blood_type}
                </option>
              ))}
            </select>
          </div>

          <button type="submit" className="sub-btn">
            Suscribirse
          </button>
        </form>

        <p className="sub-footnote">
          Al suscribirse, acepta nuestra política de privacidad.
        </p>
      </div>
    </div>
  );
}

export default ModalSuscripcion;
