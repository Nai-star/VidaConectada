import React, { useEffect, useState } from "react";
import { obtenerCampanas } from "../../services/ServicioCampanas";
import { FiCalendar, FiClock, FiMapPin } from "react-icons/fi";
import "./campanas.css";

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
            // id seguro: usa id, pk, _id o el índice como fallback
            const cid = c.id ?? c.pk ?? c._id ?? idx;

            const imagenes = Array.isArray(c.imagenes) ? c.imagenes : (Array.isArray(c.Imagen_campana) ? c.Imagen_campana : []);
            const requisitos = Array.isArray(c.requisitos) ? c.requisitos : (Array.isArray(c.DetalleRequisito) ? c.DetalleRequisito.map(dr => dr.Requisitos ?? dr) : []);

            return (
              <div key={cid} className="campana-card">
                <h3 className="campana-title">{c.Titulo}</h3>

                {/* IMÁGENES */}
                <div className="imagenes-container">
                  {imagenes.length > 0 ? (
                    imagenes.map((img, i) => {
                      const src = img?.imagen ?? img?.url ?? img;
                      return <img key={i} src={src} alt={`${c.Titulo} ${i+1}`} className="campana-img" />;
                    })
                  ) : (
                    <p className="no-img">Sin imágenes</p>
                  )}
                </div>

                {/* META */}
                <div className="info-row">
                  <FiCalendar /> <span>{c.Fecha_inicio ? new Date(c.Fecha_inicio).toLocaleDateString() : ""}</span>
                </div>

                <div className="info-row">
                  <FiClock /> <span>{c.Fecha_inicio ? new Date(c.Fecha_inicio).toLocaleTimeString() : ""} - {c.Fecha_fin ? new Date(c.Fecha_fin).toLocaleTimeString() : ""}</span>
                </div>

                <div className="info-row">
                  <FiMapPin /> <span>{c.direccion_exacta ?? c.direccion ?? ""}</span>
                </div>

                {/* SECCIÓN DESPLEGABLE: usa cid para controlar apertura */}
                <div className={`detalles-expandido ${openId === cid ? "open" : ""}`}>
                  <div className="detalles-content">
                    <h4>Descripción</h4>
                    <p>{c.Descripcion ?? "Sin descripción disponible."}</p>

                    <h4>Requisitos</h4>
                    {requisitos.length > 0 ? (
                      <ul>
                        {requisitos.map((req, i) => (
                          // req puede ser objeto o string
                          <li key={req?.id ?? i}>{req?.Nombre ?? req}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="no-img">No hay requisitos registrados.</p>
                    )}

                    <h4>Contacto</h4>
                    <p>{c.Contacto ?? "No disponible"}</p>
                  </div>
                </div>

                {/* BOTÓN FINAL */}
                <button
                  className="btn-detalles"
                  onClick={() => toggleOpen(cid)}
                  type="button"
                >
                  {openId === cid ? "Participar en campaña" : "Ver más"}
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
