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
      <h2 className="titulo">Testimonios</h2>

      <div className="contenedor-testimonios">
        {/* ---- Testimonios de texto ---- */}
        <div className="testimonios-texto">
          <h3>Lo que dicen</h3>
          <Slider {...sliderSettings}>
            {testimoniosTexto.map((t) => (
              <div className="caja-texto" key={t.id}>
                <img
                  src={t.Foto_P}
                  className="foto-testimonio"
                  alt={t.Nombre}
                />
                <p className="frase">“{t.Frase}”</p>
                <p className="nombre">{t.Nombre}</p>
              </div>
            ))}
          </Slider>
        </div>

        {/* ---- Testimonios de video ---- */}
        <div className="testimonios-video">
          <h3>Experiencias en video</h3>
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
