import React, { useState} from 'react';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { HashLink } from 'react-router-hash-link';
import "./carrusel.css";


function Carrusel({ cerrarMenu = () => {} }) {

  const frases = [
    "Donar sangre es donar vida.",
    "Tu gota cuenta: salva a alguien hoy.",
    "Sé el héroe anónimo de una familia.",
    "VidaConectada: juntos hacemos la diferencia.",
    "Un pequeño acto, un gran impacto.",
  ];

  const [fraseIndex, setFraseIndex] = useState(0);

  const settings = {
    dots: true,
    infinite: true,
    autoplay: true,
    autoplaySpeed: 4000,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false, // sin flechas, solo dots
    fade: true,     // efecto de desvanecido entre imágenes
    
    // cada vez que cambia el slide, rotamos la frase
    beforeChange: (_current, next) => {
      setFraseIndex(next % frases.length);
    },
    swipeToSlide: true,
    pauseOnHover: false,
  };

  

  return (
    <div className="banner-container">
      {/* Carrusel de imágenes */}
      <Slider {...settings} className="banner-slider">
        <div className="slide">
          <img src="/banner-1.jpg" alt="Campaña de donación 1" loading="eager" />
        </div>
        <div className="slide">
          <img src="/banner-4.jpg" alt="Campaña de donación 2" loading="lazy" />
        </div>
        <div className="slide">
          <img src="/banner-2.jpg" alt="Campaña de donación 3" loading="lazy" />
        </div>
        <div className="slide">
          <img src="/banner-3.jpg" alt="Campaña de donación 4" loading="lazy" />
        </div>
        <div className="slide">
          <img src="/banner-5.jpg" alt="Campaña de donación 5" loading="lazy" />
        </div>
      </Slider>

      {/* Capa oscura */}
      <div className="banner-overlay"></div>

      {/* Logo fijo al centro */}
      <div key={fraseIndex} className="banner-frases">
        <span>{frases[fraseIndex]}</span>
        <HashLink smooth to="/homepage#donar" onClick={cerrarMenu}>
          <button type="button" className="btn-participar" aria-label="Ir a donar">
            Quiero Donar
          </button>
        </HashLink>
      </div>
    </div>
  );
}

export default Carrusel;