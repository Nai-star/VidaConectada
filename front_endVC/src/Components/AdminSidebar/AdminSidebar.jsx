import React from "react";
import { NavLink } from "react-router-dom";
import "./AdminSidebar.css";

const ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: "▦", path: "" },
  { id: "banners", label: "Banners Principales", icon: "🖼️", path: "carusel_admin" },
  { id: "campanas", label: "Campañas", icon: "📅", path: "campanas" },
  { id: "preguntas", label: "Preguntas y FAQs", icon: "💬", path: "preguntas" },
  { id: "tipos", label: "Tipos de Sangre", icon: "💧", path: "tipos" },
  { id: "requisitos", label: "Requisitos para Donar", icon: "📋", path: "requisitos" },
  { id: "usuarios", label: "Usuarios", icon: "👥", path: "gestion_usuarios" },
  { id: "config", label: "Configuración", icon: "⚙️", path: "configuracion" },
];

function AdminSidebar() {
  return (
    <aside className="admin-sidebar">
      <div className="brand">
        <img
          src="/logo_vidaconectada.png"
          className="brand-logo"
          alt="VidaConectada"
        />
        <div>
          <div className="brand-title">VidaConectada</div>
          <div className="brand-sub">Panel Administrador</div>
        </div>
      </div>

      <ul className="nav-list">
        {ITEMS.map((item) => (
          <li key={item.id}>
            <NavLink
              to={item.path}
              className={({ isActive }) =>
                "nav-item " + (isActive ? "active" : "")
              }
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>

      <div className="bottom">
        <button className="logout-btn" onClick={() => console.log("logout")}>
          ⤴ <span>Cerrar sesión</span>
        </button>
      </div>
    </aside>
  );
}

export default AdminSidebar;
