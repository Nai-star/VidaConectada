import React from "react";
import "./AdminSidebar.css";

const ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: "▦" },
  { id: "banners", label: "Banners Principales", icon: "🖼️" },
  { id: "campanas", label: "Campañas", icon: "📅" },
  { id: "preguntas", label: "Preguntas y FAQs", icon: "💬" },
  { id: "tipos", label: "Tipos de Sangre", icon: "💧" },
  { id: "requisitos", label: "Requisitos para Donar", icon: "📋" },
  { id: "usuarios", label: "Usuarios", icon: "👥" },
  { id: "config", label: "Configuración", icon: "⚙️" },
];

export default function AdminSidebar({ active = "dashboard", onNavigate }) {
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
          <li
            key={item.id}
            className={`nav-item ${active === item.id ? "active" : ""}`}
            onClick={() => onNavigate(item.id)}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </li>
        ))}
      </ul>

      <div className="bottom">
        <button className="logout-btn" onClick={() => onNavigate("logout")}>
          ⤴ <span>Cerrar sesión</span>
        </button>
      </div>
    </aside>
  );
}
