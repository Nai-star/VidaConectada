import React, { useEffect, useState } from "react";
import { obtenerCampanas } from "../../services/ServicioCampanas";
import { FiCalendar, FiClock, FiMapPin, FiChevronLeft, FiChevronRight } from "react-icons/fi"; // Se agregaron iconos para carrusel
import "./campanas.css";
// Importar el modal de participación (si lo necesitas, lo dejé fuera por simplicidad en esta revisión)
// import ParticipationModal from '../ParticipationModal/ParticipationModal'; 


// ----------------------------------------------------
// 💡 COMPONENTE PARA MANEJAR LAS IMÁGENES EN CARRUSEL
// ----------------------------------------------------
const ImageCarousel = ({ imagenes, titulo, cid }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!imagenes || imagenes.length === 0) {
    return <div className="no-img">Sin imágenes disponibles.</div>;
  }

  const goToPrev = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? imagenes.length - 1 : prevIndex - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === imagenes.length - 1 ? 0 : prevIndex + 1
    );
  };

  // Solo mostrar los controles si hay más de una imagen
  const showControls = imagenes.length > 1;

  return (
    <div className="carousel-container">
      {/* 💡 Carrusel principal de imagen */}
      <img
        src={imagenes[currentIndex]}
        alt={`${titulo} ${currentIndex + 1}`}
        className="campana-img-main"
        onError={(e) => { e.currentTarget.style.display = 'none'; }}
      />
      
      {showControls && (
        <>
          {/* Botones de navegación */}
          <button className="carousel-control prev" onClick={goToPrev} aria-label="Imagen anterior">
            <FiChevronLeft />
          </button>
          <button className="carousel-control next" onClick={goToNext} aria-label="Imagen siguiente">
            <FiChevronRight />
          </button>
          
          {/* Indicadores (Dots) */}
          <div className="carousel-indicators">
            {imagenes.map((_, index) => (
              <span 
                key={index} 
                className={`indicator ${index === currentIndex ? 'active' : ''}`}
                onClick={() => setCurrentIndex(index)}
                aria-label={`Ir a la imagen ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};


// ----------------------------------------------------
// 💡 COMPONENTE PRINCIPAL Campanas
// ----------------------------------------------------
function Campanas() {
  const [campanas, setCampanas] = useState([]);
  const [openId, setOpenId] = useState(null);

  useEffect(() => {
    async function cargar() {
      try {
        const data = await obtenerCampanas();
        setCampanas(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error al cargar campañas:", err);
        setCampanas([]);
      }
    }
    cargar();
  }, []);

  const toggleOpen = (id) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
  <section className="cmp-wrap" id="campanas">
    <h2 className="cmp-title">Campañas Activas</h2>
    <p className="cmp-subtitle">Encuentra una jornada de donación cerca de ti y participa</p>

    <div className="campanas-container">
      {campanas.length === 0 ? (
        <div className="cmp-empty">No hay campañas disponibles.</div>
      ) : (
        campanas.map((c, idx) => {
          const cid = c.id ?? c.pk ?? c._id ?? idx;
          const imagenes = Array.isArray(c.imagenes) ? c.imagenes : [];
          const requisitos = Array.isArray(c.requisitos) ? c.requisitos : [];

          return (
            <div key={cid} className="campana-card">
              
              {/* 💡 Uso del componente Carrusel */}
              <ImageCarousel imagenes={imagenes} titulo={c.Titulo} cid={cid} />
              
              <h3 className="campana-title">{c.Titulo}</h3>

              {/* META */}
              <div className="info-row">
                <FiCalendar /> 
                <span>
                  {c.Fecha_inicio }
                  {" - "}
                  {c.Fecha_fin }
                </span>
              </div>
              
              <div className="info-row">
                <FiClock /> 
                <span>
                  {c.Hora_inicio ? c.Hora_inicio : ""} - {c.Hora_fin ? c.Hora_fin : ""}
                </span>
              </div>

              <div className="info-row"><FiMapPin /> <span>{c.direccion_exacta ?? c.direccion ?? ""}</span></div>

              {/* SECCIÓN DESPLEGABLE */}
              <div className={`detalles-expandido ${openId === cid ? "open" : ""}`}>
                <div className="detalles-content">
                  <h4>Descripción</h4>
                  <p>{c.Descripcion ?? "Sin descripción disponible."}</p>

                  <h4>Requisitos</h4>
                  {requisitos.length > 0 ? (
                    <ul>
                      {requisitos.map((req, i) => (
                        <li key={req.id ?? i}>{req.texto}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="no-img">No hay requisitos registrados.</p>
                  )}

                  <h4>Contacto</h4>
                  <p>{c.Contacto ?? "No disponible"}</p>
                </div>
              </div>

              {/* BOTÓN */}
              <button
                className="btn-detalles" onClick={() => toggleOpen(cid)} type="button">
              {openId === cid ? "Participar en la campaña" : "Ver más"}
              </button>
              
            </div>
          );
        })
      )}
    </div>
  </section>
  );
}

export default Campanas;