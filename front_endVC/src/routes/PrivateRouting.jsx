import React from "react";
import { Navigate } from "react-router-dom";
import UsuarioInactividad from "../services/UsuarioInactividad";

function PrivateRouting({ children }) {
  const usuario = JSON.parse(localStorage.getItem("usuarioLogueado") || "null");

  // 🔒 No logueado
  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  // 🔒 No admin
  if (usuario.rol !== "admin") {
    return <Navigate to="/admin" replace />;
  }

  // ⏱️ Control de inactividad (solo admins)
  UsuarioInactividad();

  // ✅ Todo OK
  return children;
}

export default PrivateRouting;

