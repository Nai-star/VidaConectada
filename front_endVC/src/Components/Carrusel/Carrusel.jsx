import React, { useEffect, useMemo, useState } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./carrusel.css";
import { obtenerCarruselActivos } from "../../services/ServicioCarrusel.js";

function Carrusel({ cerrarMenu = () => {} }) {
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
        setSlides(items);
      } catch (e) {
        if (!alive) return;
        setErr("No se pudo cargar el carrusel.");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  // fallback si no hay datos
  const data = useMemo(() => {
    if (slides.length) return slides;
    return [
      {
        id: "local-1",
        image: "/banner-1.jpg",
        text: "Donar sangre es donar vida.",
        active: true,
        darkFilter: true,
        showText: true,
      },
      {
        id: "local-2",
        image: "/banner-2.jpg",
        text: "Tu gota cuenta: salva a alguien hoy.",
        active: true,
        darkFilter: true,
        showText: true,
      },
    ];
  }, [slides]);

  const frases = useMemo(
    () => data.map(d => d.text || "").filter(Boolean),
    [data]
  );

  const settings = {
    dots: true,
    infinite: true,
    autoplay: true,
    autoplaySpeed: 4000,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
    fade: true,
    beforeChange: (_current, next) => setIdx(next % Math.max(frases.length, 1)),
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

  if (err && !data.length) {
    return (
      <div className="banner-container">
        <div className="banner-error">{err}</div>
      </div>
    );
  }

  // Slide actual (para decidir filtro/mostrar texto)
  const current = data[idx] ?? data[0];

  return (
    <div id="inicio" className="banner-container">
      <Slider {...settings} className="banner-slider">
        {data.map(item => (
          <div className="slide" key={item.id}>
            <img
              src={item.image}
              alt={item.text || "Banner"}
              loading="lazy"
              referrerPolicy="no-referrer"
            />
          </div>
        ))}
      </Slider>

      {/* Filtro oscuro controlado por admin (por slide) */}
      <div
        className={`banner-overlay ${current?.darkFilter ? "on" : "off"}`}
        aria-hidden="true"
      />

      {/* Texto controlado por admin */}
      {current?.showText && (current?.text || frases.length) ? (
        <div key={idx} className="banner-frases">
          <span>{frases[idx] || current?.text}</span>
        </div>
      ) : null}
    </div>
  );
}

export default Carrusel;
