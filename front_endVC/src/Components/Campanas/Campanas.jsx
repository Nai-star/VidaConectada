import React, { useEffect, useState } from "react";
import { obtenerCampanasPublicas } from "../../services/ServicioCampanas";
import { FiCalendar, FiClock, FiMapPin, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import ParticiparModal from "../ParticiparModal/ParticiparModal"; 
import "./campanas.css";

// ------------------------------
// Componente Carrusel de Imágenes
// ------------------------------
const ImageCarousel = ({ imagenes, titulo }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!imagenes || imagenes.length === 0) return <div className="no-img">Sin imágenes disponibles.</div>;

  const goToPrev = () => setCurrentIndex(prev => (prev === 0 ? imagenes.length - 1 : prev - 1));
  const goToNext = () => setCurrentIndex(prev => (prev === imagenes.length - 1 ? 0 : prev + 1));
  const showControls = imagenes.length > 1;

  return (
    <div className="carousel-container">
      <img
        src={imagenes[currentIndex]}
        alt={`${titulo} ${currentIndex + 1}`}
        className="campana-img-main"
        onError={(e) => { e.currentTarget.style.display = 'none'; }}
      />
      {showControls && (
        <>
          <button className="carousel-control prev" onClick={goToPrev} aria-label="Imagen anterior">
            <FiChevronLeft />
          </button>
          <button className="carousel-control next" onClick={goToNext} aria-label="Imagen siguiente">
            <FiChevronRight />
          </button>
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

// ------------------------------
// Componente principal: Campanas
// ------------------------------
function Campanas() {
  const [campanas, setCampanas] = useState([]);
  const [openId, setOpenId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);

  useEffect(() => {
    async function cargar() {
      try {
        const data = await obtenerCampanasPublicas();
        setCampanas(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error al cargar campañas:", err);
        setCampanas([]);
      }
    }
    cargar();
  }, []);

  const handleCardButtonClick = (c) => {
    const cid = c.id ?? c.pk ?? c._id;
    if (openId === cid) {
      // Botón dice "Participar en la campaña", abrir modal
      setSelectedCampaign(c);
      setModalOpen(true);
    } else {
      // Solo expandir detalles
      setOpenId(cid);
    }
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedCampaign(null);
  };

  const handleParticipateSuccess = (campaign) => {
    console.log("Participación registrada para:", campaign);
    // Aquí puedes actualizar estado o mostrar un toast si quieres
  };

  return (
    <section className="cmp-wrap" id="campanas">
      <h2 className="cmp-title">Campañas Activas</h2>
      <p className="cmp-subtitle">Encuentra una jornada de donación cerca de ti y participa</p>

      <div className="campanas-container1">
        {campanas.length === 0 ? (
          <div className="cmp-empty">No hay campañas disponibles.</div>
        ) : (
          campanas.map((c, idx) => {
            const cid = c.id ?? c.pk ?? c._id ?? idx;
            const imagenes = Array.isArray(c.imagenes) ? c.imagenes : [];
            const requisitos = Array.isArray(c.detalles_requisitos)
            ? c.detalles_requisitos
            : [];


            return (
              <div key={cid} className="campana-card">
                <ImageCarousel imagenes={imagenes} titulo={c.Titulo} />

                <h3 className="campana-title">{c.Titulo}</h3>

                <div className="info-row">
                  <FiCalendar /> <span>{c.Fecha_inicio} - {c.Fecha_fin}</span>
                </div>

                <div className="info-row">
                  <FiClock /> <span>{c.Hora_inicio ?? ""} - {c.Hora_fin ?? ""}</span>
                </div>

                <div className="info-row">
                  <FiMapPin /> <span>{c.direccion_exacta ?? c.direccion ?? ""}</span>
                </div>

                <div className={`detalles-expandido ${openId === cid ? "open" : ""}`}>
                  <div className="detalles-content">
                    <h4>Descripción</h4>
                    <p>{c.Descripcion ?? "Sin descripción disponible."}</p>

                    <h4>Requisitos</h4>
                    {requisitos.length > 0 ? (
                      <ul>
                        {requisitos.map((req, i) => (
                          <li key={req.id ?? i}>
                            {req.Requisitos?.requisitos ?? "Requisito no definido"}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="no-img">No hay requisitos registrados.</p>
                    )}

                    <h4>Contacto</h4>
                    <p>{c.Contacto ?? "No disponible"}</p>
                  </div>
                </div>

                <button
                  className="btn-detalles"
                  onClick={() => handleCardButtonClick(c)}
                  type="button"
                >
                  {openId === cid ? "Participar en la campaña" : "Ver más"}
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Modal sin portal */}
      {modalOpen && selectedCampaign && (
        <ParticiparModal
          isOpen={modalOpen}
          onClose={handleCloseModal}
          campaign={selectedCampaign}
          onParticipateSuccess={handleParticipateSuccess}
        />
      )}
    </section>
  );
}

export default Campanas;
