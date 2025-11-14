import React, { useEffect, useState } from "react"
import { FiPhone, FiMapPin, FiMail, FiUser } from "react-icons/fi"
import "./barrainfo.css"

function Barrainfo() {
    const [hidden, setHidden] = useState(false);
    const [lastY, setLastY] = useState(0);

    // mover la variable CSS cuando cambia 'hidden'
    useEffect(() => {
        const val = hidden ? "0px" : "var(--mini-topbar-h)";
        document.documentElement.style.setProperty("--mini-offset", val);
    }, [hidden]);

    useEffect(() => {

        setHidden((window.scrollY || 0) > 8);

        const onScroll = () => {
        const y = window.scrollY || 0;
        // Oculta al bajar, muestra al subir. Pequeño umbral para evitar parpadeo.
        if (y > lastY + 8) setHidden(true);
        else if (y < lastY - 8) setHidden(false);
        setLastY(y);
        };
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, [lastY]);



  return (
    
    <div className={`mini-topbar ${hidden ? "is-hidden" : ""}`}>
      <div className="mini-wrap">
        <a href="tel:+50626308045" className="mini-item">
          <FiPhone className="mini-ic" />
          <span>2630-8045</span>
        </a>

        <div className="mini-divider" />

        <div className="mini-item">
          <FiMapPin className="mini-ic" />
          <span>Hospital Monseñor Sanabria</span>
        </div>

        <div className="mini-divider" />

        <a href="mailto:vidaconectadacr@gmail.com" className="mini-item">
          <FiMail className="mini-ic" />
          <span>vidaconectadacr@gmail.com</span>
        </a>

        <div className="mini-divider" />

        <a href="/encuesta" className="mini-item">
          <FiUser className="mini-ic" />
          <span>Encuesta satisfacción al usuario</span>
        </a>

        <div className="mini-divider" />

        <a href="/quejas" className="mini-item">
          <FiUser className="mini-ic" />
          <span>Quejas y sugerencias</span>
        </a>
      </div>
    </div>


    
  )
}

export default Barrainfo
