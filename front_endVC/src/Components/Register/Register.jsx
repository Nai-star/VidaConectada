import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createAdminUser, checkEmailExists } from "../../services/ServicioRegist";
import "./Register.css";

function Register() {
  useEffect(() => {
    const link = document.querySelector("link[rel~='icon']");
    if (link) link.href = "/logo.png";
    document.title = "Registro Admin | VidaConectada";
  }, []);

  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [tipoMensaje, setTipoMensaje] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const resetForm = () => {
    setNombre("");
    setApellido("");
    setEmail("");
    setPassword("");
    setMensaje("");
    setTipoMensaje("");
  };

  // función auxiliar para generar username único
  const generateUniqueUsername = (first, last) => {
    const base = `${first.trim().toLowerCase()}.${last.trim().toLowerCase()}`.replace(/\s+/g, "");
    const suffix = Date.now().toString().slice(-5); // 5 dígitos del timestamp
    return `${base}.${suffix}`;
  };

  const handleRegistro = async () => {
    try {
      if (!nombre.trim() || !apellido.trim() || !email.trim() || !password) {
        setTipoMensaje("error");
        setMensaje("⚠️ Todos los campos son obligatorios");
        return;
      }
      if (!email.includes("@")) {
        setTipoMensaje("error");
        setMensaje("⚠️ Correo inválido");
        return;
      }
      if (password.length < 8) {
        setTipoMensaje("error");
        setMensaje("⚠️ La contraseña debe tener al menos 8 caracteres");
        return;
      }

      setLoading(true);
      setTipoMensaje("");
      setMensaje("");

      // --- PRE-CHECK: comprobar en backend si el email ya existe (UX) ---
      const emailTrim = email.trim().toLowerCase();
      try {
        const exists = await checkEmailExists(emailTrim);
        if (exists) {
          setTipoMensaje("error");
          setMensaje("❌ El correo ya está registrado.");
          setLoading(false);
          return;
        }
      } catch (err) {
        // Si falla el check (red/CORS), no bloqueamos el registro: el POST lo validará
        console.warn("checkEmailExists falló, procediendo al POST. Error:", err);
      }

      // Generar username único para evitar colisiones
      const username = generateUniqueUsername(nombre, apellido);

      const payload = {
        username,
        first_name: nombre.trim(),
        last_name: apellido.trim(),
        email: emailTrim,
        password: password,
        is_staff: true,
        is_active: true,
      };

      // POST para crear usuario (el backend debe validar email único también)
      const created = await createAdminUser(payload);

      setTipoMensaje("success");
      setMensaje("✅ Usuario admin creado correctamente.");
      resetForm();

      setTimeout(() => navigate("/admin/usuarios"), 900);
    } catch (err) {
      console.error("Error al crear usuario:", err);
      setTipoMensaje("error");
      // err.message contiene la info parseada del backend (ver ServicioRegist.js)
      setMensaje(err.message || "❌ Error al crear usuario admin");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="registro-admin-wrapper">
      <div className="left-side">
        <img
          src={"/mnt/data/e7ad0832-a7b5-4fda-9782-6ce462809582.png"}
          alt="mockup-logo"
          className="mockup-image"
        />
      </div>

      <div className="right-side">
        <div className="card">
          <div className="card-header">
            <div className="icon-circle" aria-hidden>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L15 8L22 9L17 14L18 21L12 18L6 21L7 14L2 9L9 8L12 2Z" fill="currentColor" />
              </svg>
            </div>
            <div>
              <h3>Registrar nuevo usuario (Admin)</h3>
              <p className="muted">Solo nombre, apellido, correo y contraseña — será rol administrador</p>
            </div>
          </div>

          <div className="form">
            <label>Nombre</label>
            <input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Nombre" />

            <label>Apellido</label>
            <input value={apellido} onChange={(e) => setApellido(e.target.value)} placeholder="Apellido" />

            <label>Correo electrónico</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="correo@ejemplo.com" type="email" />

            <label>Contraseña</label>
            <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Contraseña (mín. 8 caracteres)" type="password" />

            <div className="form-actions">
              <div className="messages">
                {mensaje && <div className={`mensaje ${tipoMensaje}`}>{mensaje}</div>}
              </div>

              <div className="buttons">
                <button type="button" className="btn-secondary" onClick={resetForm} disabled={loading}>Limpiar</button>
                <button type="button" className="btn-primary" onClick={handleRegistro} disabled={loading}>{loading ? "Creando..." : "Crear usuario admin"}</button>
              </div>
            </div>

            <p className="small-link">Volver a <Link to="/admin">Panel Admin</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
