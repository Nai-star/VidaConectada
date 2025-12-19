// src/components/LoginComponent.jsx
import React, { useState, useEffect } from "react";
import { AiOutlineMail, AiOutlineEye, AiOutlineEyeInvisible, AiOutlineCloseCircle } from "react-icons/ai";
import { useNavigate } from "react-router-dom";
import { loginAdmin } from "../../services/ServicioLogin"; // ajusta ruta si tu estructura es distinta
import "./Login.css";

/**
 * Componente de Login
 * - Muestra mensajes claros cuando las credenciales son inválidas
 * - No imprime tokens en consola (solo un log de éxito mínimo)
 * - Redirige al panel /admin al iniciar sesión correctamente
 * - Usa la imagen mockup local (ruta entregada) para la columna derecha
 */
const Login = () => {
       // Favicon y título dinámicos
  useEffect(() => {
    const link = document.querySelector("link[rel~='icon']");
    if (link) link.href = "/logo_vidaconectada.png";
    document.title = "Login | Vida Conectada";
  }, []);



  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    if (!email || !password) {
      setError("Por favor ingresa email y contraseña.");
      return;
    }

    setLoading(true);
    try {
      const userData = await loginAdmin(email.trim(), password);
      // Login exitoso: guardamos mínima info y redirigimos
      setSuccessMsg("Inicio de sesión correcto. Redirigiendo...");
      // Espera breve para que el usuario vea el mensaje
      setTimeout(() => navigate("/admin"), 700);
    } catch (err) {
      // err.message viene del servicio y es legible
      console.error("Login error (frontend):", err);
      setError(err.message || "Error al iniciar sesión.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <a href="/" className="login-home-link">Home</a>

      <div className="login-content">
        {/* Panel izquierdo: título */}
        <div className="login-left-panel-title">
          <h1 className="login-title">
            Inicia sesión<br />
            en <span>VidaConectada</span>
          </h1>
        </div>

        {/* Panel derecho: formulario + imagen */}
        <div className="login-right-panel-content">
          <div className="login-form-container">
            <form className="login-form" onSubmit={handleLogin}>
              <div className="login-input-group">
                <AiOutlineMail className="login-input-icon-start" />
                <input
                  className="login-input"
                  type="email"
                  placeholder="Ingresa correo"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="login-input-group">
                <input
                  className="login-input"
                  type={showPassword ? "text" : "password"}
                  placeholder="********"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                {showPassword ? (
                  <AiOutlineEyeInvisible
                    className="login-input-icon-end"
                    onClick={() => setShowPassword(false)}
                  />
                ) : (
                  <AiOutlineEye
                    className="login-input-icon-end"
                    onClick={() => setShowPassword(true)}
                  />
                )}
              </div>

              <button className="login-button" type="submit" disabled={loading}>
                {loading ? "Cargando..." : "Iniciar"}
              </button>

              {/* Mensaje de error o éxito */}
              {error && (
                <div className="error-message" role="alert">
                  <AiOutlineCloseCircle style={{ marginRight: "8px" }} />
                  {error}
                </div>
              )}
              {successMsg && (
                <div className="success-message" role="status">
                  {successMsg}
                </div>
              )}
            </form>

            <p className="login-description">
              Accede al panel de administración de VidaConectada para gestionar usuarios, campañas y contenido de la plataforma de forma segura y eficiente.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Login;
