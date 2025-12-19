import { useState } from "react";
import { FaFacebookF, FaInstagram, FaTwitter } from "react-icons/fa"
import { Link } from "react-router-dom"
import { HashLink } from 'react-router-hash-link';
import ModalGuiaDonante from "../../Components/GuiaDonanate/ModalGuiaDonante";

import "./Footer.css"

function Footer() {
   const [openGuia, setOpenGuia] = useState(false);



  return (
    
    <footer className="footer">
 
      <div className="footer-content">
        {/* Columna 1 */}
        <div className="footer-section">
          <div className="footer-logo">
            <img src="/logo_vidaconectada.png" alt="VidaConectada" />
            <span>Vida<span className="footer-accent">Conectada</span></span>
          </div>
          <p>
            Plataforma comunitaria para fomentar la donación de sangre en Costa Rica.
          </p>
        </div>

        {/* Columna 2 */}
        <div className="footer-section">
          <h4>Enlaces Rápidos</h4>
          <ul>
            <li><HashLink smooth to="/home#inicio">Inicio</HashLink></li>
            <li><HashLink smooth to="/home#requisitos">Requisitos</HashLink></li>
            <li><HashLink smooth to="/home#campanas">Campañas</HashLink></li>
            <li><HashLink smooth to="/home#info">Información</HashLink></li>
          </ul>
        </div>

        {/* Columna 3 */}
        <div className="footer-section">
          <h4>Recursos</h4>
          <ul>
            <li><HashLink to="/home#faq">Preguntas Frecuentes</HashLink></li>
            <li><HashLink to="/home#contacto">Contacto</HashLink></li>
            <li
              style={{ cursor: "pointer" }}
              onClick={() => setOpenGuia(true)}
            >
              Guía Completa del Donante
            </li>
          </ul>
        </div>

        {/* Columna 4 */}
        <div className="footer-section">
          <h4>Contacto</h4>
          <p>📧 vidaconectadacr@gmail.com</p>
          <p>📞 +506 8888-8888</p>
          <h5>Síguenos</h5>
          <div className="footer-social">
            <a href="https://facebook.com" target="_blank"><FaFacebookF /></a>
            <a href="https://instagram.com" target="_blank"><FaInstagram /></a>
          </div>
        </div>
      </div>

      <ModalGuiaDonante
        isOpen={openGuia}
        onClose={() => setOpenGuia(false)}
      />

      <hr className="footer-divider" />

      <div className="footer-bottom">
        <p>© 2025 VidaConectada. Proyecto comunitario sin fines de lucro.</p>
        <p className="footer-made">
          Desarrollado con <span className="heart">❤</span> para la comunidad costarricense
        </p>
        <div className="footer-links">
          <div >
          <a className="gal-btn" href="/privacidad">Política de Privacidad</a>
          </div>

          <div >
            <a className="gal-btn" href="/terminos">Términos de Uso</a>
          </div>


        </div>
      </div>
    </footer>
  )
}

export default Footer