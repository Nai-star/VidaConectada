import React, { useEffect, useState } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./carrusel.css";
import { obtenerCarruselActivos } from "../../services/ServicioCarrusel.js";

function Carrusel({ cerrarMenu = () => {}, frases = [] }) {
  const [slides, setSlides] = useState([]);
  const [idx, setIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const items = await obtenerCarruselActivos();
        if (!alive) return;
        setSlides(Array.isArray(items) ? items : []);
      } catch (e) {
        if (!alive) return;
        console.error("Carrusel: error al cargar slides", e);
        setErr("No se pudo cargar el carrusel.");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // settings del slider: antes de cambiar actualizamos idx correctamente
  const settings = {
    dots: true,
    infinite: slides.length > 1,
    autoplay: slides.length > 1,
    autoplaySpeed: 4000,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
    fade: true,
    beforeChange: (_current, next) => setIdx(next),
    swipeToSlide: true,
    pauseOnHover: false,
  };

  if (loading) {
    return (
      <div className="banner-container">
        <div className="banner-loading">Cargando…</div>
      </div>
    );
  }

  // si hay error y no hay slides, mostramos mensaje
  if (err && slides.length === 0) {
    return (
      <div className="banner-container">
        <div className="banner-error">{err}</div>
      </div>
    );
  }

  // slide actual (seguro)
  const current = slides.length ? slides[idx] ?? slides[0] : null;

  return (
    <div id="inicio" className="banner-container" onClick={cerrarMenu}>
      <Slider {...settings} className="banner-slider">
        {slides.map((item) => (
          <div className="slide" key={item.id ?? Math.random()}>
            {item.image ? (
              <img
                src={item.image}
                alt={item.text || "Banner"}
                loading="lazy"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="slide-placeholder">Sin imagen</div>
            )}
          </div>
        ))}
      </Slider>

      {/* Filtro oscuro controlado por admin (por slide) */}
      <div
        className={`banner-overlay ${current?.darkFilter ? "on" : "off"}`}
        aria-hidden="true"
      />

      {/* Texto controlado por admin o lista de frases */}
      {current?.showText && (current?.text || frases.length > 0) ? (
        <div key={idx} className="banner-frases">
          <span>{frases[idx] || current?.text}</span>
        </div>
      ) : null}
    </div>
  );
}

export default Carrusel;
