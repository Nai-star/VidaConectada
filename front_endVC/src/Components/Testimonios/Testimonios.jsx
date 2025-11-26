import React, { useEffect, useState } from "react";
import { getTestimoniosTexto, getTestimoniosVideo } from "../../services/ServicioTestimonio";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
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

  return (
    <section className="testimonios-section">
      <h2 className="titulo">Testimonios</h2>

      <div className="contenedor-testimonios">
        {/* Testimonios de texto */}
        <div className="testimonios-texto">
          <h3>Lo que dicen</h3>
          <Swiper
            slidesPerView={1}
            spaceBetween={20}
            loop={true}
            autoplay={{ delay: 5000, disableOnInteraction: false }}
            modules={[Autoplay]}
          >
            {testimoniosTexto.map((t) => (
              <SwiperSlide key={t.id}>
                <div className="caja-texto">
                  <img src={t.Foto_P} className="foto-testimonio" alt="Foto testimonio" />
                  <p className="frase">“{t.Frase}”</p>
                  <p className="nombre">{t.Nombre}</p>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        {/* Testimonios de video */}
        <div className="testimonios-video">
          <h3>Experiencias en video</h3>
          <Swiper
            slidesPerView={1}
            spaceBetween={20}
            loop={true}
            autoplay={{ delay: 5000, disableOnInteraction: false }}
            modules={[Autoplay]}
          >
            {testimoniosVideo.map((v) => (
              <SwiperSlide key={v.id}>
                <div className="video-container">
                  <video className="video-testimonio" src={v.video.Video} controls />
                  <p className="video-texto">{v.video.Descripcion}</p>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </section>
  );
}

export default Testimonios;
