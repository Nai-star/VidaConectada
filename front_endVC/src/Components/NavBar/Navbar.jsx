import React, { useState} from 'react';
import { Link } from "react-router-dom";
import { HashLink } from 'react-router-hash-link';
import { FaEllipsisH, FaTimes } from "react-icons/fa";
import logo from "/logo_vidaconectada.png";
import './Navbar.css';

function Navbar() {
    
     const manejadorClick = () => {
      cerrarMenu();     
      onOpenSuscripcion();  // ✅ abre el modal
    };


    const [menuAbierto, setMenuAbierto] = useState(false); // 🔥 estado menú mobile
    
    // Función para cerrar el menú al hacer clic en un enlace
    const cerrarMenu = () => {
    setMenuAbierto(false);
  }

  return (
    <nav className="navbar-container">
           
           {/* Logo */}
        <div className="navbar-logo">
          <Link to="/"onClick={cerrarMenu}>
            <img src={logo} alt="Logo VidaConectada" />
            <span>VidaConectada</span>
          </Link>
        </div>

        {/* Botón hamburguesa */}
        <button
          className="menu-toggle-I"
          onClick={() => setMenuAbierto(!menuAbierto)}
        >
          {menuAbierto ? <FaTimes /> : <FaEllipsisH />}
        </button>

        {/* Enlaces */}
        <ul className={`navbar-links ${menuAbierto ? "open" : ""}`}>
          <li><HashLink smooth to="/homepage#id" onClick={() => setMenuAbierto(false)}>Inicio</HashLink></li>
          <li><HashLink smooth to="/homepage#id" onClick={() => setMenuAbierto(false)}>Requisitos</HashLink></li>
          <li><HashLink smooth to="/homepage#id" onClick={() => setMenuAbierto(false)}>Campañas</HashLink></li>
          <li><HashLink smooth to="/homepage#id" onClick={() => setMenuAbierto(false)}>Información</HashLink></li>
          <li><HashLink smooth to="/homepage#id" onClick={() => setMenuAbierto(false)}>FAQ</HashLink></li>
          <li><HashLink smooth to="/homepage#id" onClick={() => setMenuAbierto(false)}>Contacto</HashLink></li>
       
          {/* botones */}
        <li className="navbar-btn-item">
          <HashLink smooth to="/" onClick={manejadorClick}>
            <button className="btn-sucribirse">Suscribirse</button>
          </HashLink>
        </li>
        <li className="navbar-btn-item">
          <HashLink smooth to="/homepage#donar" onClick={cerrarMenu}>
            <button className="btn-participar">Participar</button>
          </HashLink>
        </li>
       
        </ul>

        

    </nav>
  )
}

export default Navbar