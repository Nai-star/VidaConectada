import React, { useEffect, useState } from "react";
import { getTestimoniosTexto, getTestimoniosVideo } from "../../services/ServicioTestimonio";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./testimonios.css";

function Testimonios() {
  const [testimoniosTexto, setTestimoniosTexto] = useState([]);
  const [testimoniosVideo, setTestimoniosVideo] = useState([]);

  useEffect(() => {
    const cargarDatos = async () => {
      const texto = await getTestimoniosTexto();
      const video = await getTestimoniosVideo();

      setTestimoniosTexto(texto);
      setTestimoniosVideo(video);
    };
    cargarDatos();
  }, []);

  // Configuración de Slider react-slick
  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000, // 5 segundos
    arrows: true,
  };

  return (
    <section className="testimonios-section">
    <section className="hero-testimonios">
    <div className="hero-inner">
      <div className="pill">
        <span className="pill-icon">❤</span>
        <span className="pill-text">Historias Reales</span>
      </div>

      <h2 className="hero-title">Voces que Inspiran a Donar</h2>

      <p className="hero-desc">
        Descubre las experiencias de donadores y familias cuyas vidas han sido transformadas por el acto de donar sangre
      </p>
    </div>
  </section>
      <div className="contenedor-testimonios">
        {/* ---- Testimonios de texto ---- */}
        <div className="testimonios-texto">
          <h3 className="hero-title">Lo que dicen</h3>
          <Slider {...sliderSettings}>
            {testimoniosTexto.map((t) => (
              <div className="caja-texto" key={t.id}>
                
                {/* Frase */}
                <p className="frase">“{t.Frase}”</p>

                {/* Foto + Nombre */}
                <div className="testimonio-info">
                  <img
                    src={t.Foto_P}
                    alt={t.Nombre}
                    className="foto-circular"
                  />

                  <div className="nombre-badge">{t.Nombre}</div>
                </div>

              </div>
            ))}
          </Slider>

        </div>

        {/* ---- Testimonios de video ---- */}
        <div className="testimonios-video">
          <h3 className="hero-title">Experiencias en video</h3>
          <Slider {...sliderSettings}>
            {testimoniosVideo.map((v) => (
              <div className="video-container" key={v.id}>
                <video
                  className="video-testimonio"
                  src={v.video.Video}
                  controls
                />
                <p className="video-texto">{v.video.Descripcion}</p>
              </div>
            ))}
          </Slider>
        </div>
      </div>
    </section>
  );
}

export default Testimonios;
