import React from "react";
import { logout } from "../../services/ServicioLogin";
import { NavLink, useNavigate} from "react-router-dom";
import "./AdminSidebar.css";

import { 
  FiGrid, 
  FiImage, 
  FiCalendar, 
  FiMessageCircle, 
  FiDroplet, 
  FiFileText, 
  FiUsers, 
  FiSettings, 
  FiMap 
} from "react-icons/fi";


const ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: <FiGrid />, path: "" },
  { id: "banners", label: "Banners Principales", icon: <FiImage />, path: "carusel_admin" },
  { id: "galeria", label: "Galería", icon: <FiImage />, path: "galeria_admin" },
  { id: "campanas", label: "Campañas", icon: <FiCalendar />, path: "CampanaAdmin" },
  { id: "Testimonios", label: "Testimonios", icon: <FiCalendar />, path: "/testimonio" },
  { id: "preguntas", label: "Preguntas y FAQs", icon: <FiMessageCircle />, path: "admin_buzon" },
  { id: "tipos", label: "Tipos de Sangre", icon: <FiDroplet />, path: "TS" },
  { id: "requisitos", label: "Requisitos para Donar", icon: <FiFileText />, path: "requisitos_admin" },
  { id: "red_bancos", label: "Red de Bancos", icon: <FiMap />, path: "red_bancos" },
  { id: "usuarios", label: "Usuarios", icon: <FiUsers />, path: "gestion_usuarios" },
  { id: "config", label: "Configuración", icon: <FiSettings />, path: "configuracion" },
];


function AdminSidebar() {
  const navigate = useNavigate();
  const handleLogout = () => {    
    logout();
    navigate("/login");
  };
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
        <button className="logout-btn" onClick={handleLogout}>
          ⤴ <span>Cerrar sesión</span>
        </button>
      </div>
    </aside>
  );
}

export default AdminSidebar;
