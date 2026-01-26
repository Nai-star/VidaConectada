import React, { useEffect, useState, useRef } from "react";
import {
  getTestimoniosTexto,
  getTestimoniosVideo,
} from "../../../services/ServicioTestimonio";
import Slider from "react-slick";

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./testimonios.css";

function Testimonios() {
  const [testimoniosTexto, setTestimoniosTexto] = useState([]);
  const [testimoniosVideo, setTestimoniosVideo] = useState([]);
  const [cargandoVideos, setCargandoVideos] = useState(true);

  const sliderVideoRef = useRef(null);
  const videosRef = useRef([]);

  useEffect(() => {
    const cargarDatos = async () => {
      const texto = await getTestimoniosTexto();
      const video = await getTestimoniosVideo();

      const videosValidos = video.filter(
        (v) => v?.video?.id && v?.video?.Video
      );

      setTestimoniosTexto(texto);
      setTestimoniosVideo(videosValidos);
      setCargandoVideos(false);
    };

    cargarDatos();
  }, []);

  // 🎠 Slider texto (igual que antes)
  const sliderTextoSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    arrows: true,
  };

  // 🎬 Slider video (SIN autoplay)
  const sliderVideoSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: false,
    arrows: true,
  };

  // ▶️ Cuando un video empieza, se pausan los demás
  const handlePlay = (index) => {
    videosRef.current.forEach((video, i) => {
      if (video && i !== index) {
        video.pause();
        video.currentTime = 0;
      }
    });
  };

  // ⏭️ Cuando termina el video → siguiente slide
  const handleEnded = () => {
    sliderVideoRef.current?.slickNext();
  };


  const handleVideoMetadata = (e) => {
    const video = e.target;

    if (video.videoWidth > video.videoHeight) {
      video.classList.add("video-horizontal");
      video.classList.remove("video-vertical");
    } else {
      video.classList.add("video-vertical");
      video.classList.remove("video-horizontal");
    }
  };



  return (
    <section className="testimonios-section">
      {/* ===== HERO ===== */}
      <section className="hero-testimonios">
        <div className="hero-inner">
          <div className="pill">
            <span className="pill-icon">❤</span>
            <span className="pill-text">Historias Reales</span>
          </div>

          <h2 className="hero-title">Voces que Inspiran a Donar</h2>

          <p className="hero-desc">
            Descubre las experiencias de donadores y familias cuyas vidas han sido
            transformadas por el acto de donar sangre
          </p>
        </div>
      </section>

      <div className="contenedor-testimonios">
        {/* ===== TESTIMONIOS TEXTO ===== */}
        <div className="testimonios-texto">
          <h3 className="hero-title">Lo que dicen</h3>

          <Slider {...sliderTextoSettings}>
            {testimoniosTexto.map((t) => (
              <div className="caja-texto" key={t.id}>
                <p className="frase">{t.Frase}</p>

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

        {/* ===== TESTIMONIOS VIDEO ===== */}
        <div className="testimonios-video">
          <h3 className="hero-title">Experiencias en video</h3>

          {cargandoVideos && (
            <p className="mensaje-info">Cargando testimonios en video...</p>
          )}

          {!cargandoVideos && testimoniosVideo.length === 0 && (
            <div className="sin-videos">
              <span className="icono-video">🎥</span>
              <p>Aún no hay testimonios en video disponibles</p>
            </div>
          )}

          {!cargandoVideos && testimoniosVideo.length > 0 && (
            <Slider ref={sliderVideoRef} {...sliderVideoSettings}>
              {testimoniosVideo.map((v, index) => (
                <div className="video-container" key={v.video.id}>
                  
                  <video
                    ref={(el) => (videosRef.current[index] = el)}
                    className="video-testimonio"
                    src={v.video.Video.replace(
                      "/upload/",
                      "/upload/q_auto:good,vc_auto,ac_aac/"
                    )}
                    controls
                    playsInline
                    onLoadedMetadata={handleVideoMetadata}  
                    onPlay={() => handlePlay(index)}
                    onEnded={handleEnded}
                  />
                  <p className="video-texto">{v.video.Descripcion}</p>
                </div>
              ))}
            </Slider>
          )}
        </div>
      </div>
    </section>
  );
}

export default Testimonios;
