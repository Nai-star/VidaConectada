import React, { useEffect, useState } from "react";
import {
  obtenerTodosLosBanners,
  eliminarBanner,
} from "../../services/ServicioCarrusel";
import ModalAdmin from "../ModalAdmin/ModalAdmin"
import "./CaruselAdmin.css";

function CarruselAdmin() {
  const [banners, setBanners] = useState([]);
  const [idx, setIdx] = useState(0);
  const [loading, setLoading] = useState(true);

  // ------- MODAL -------
  const [modalVisible, setModalVisible] = useState(false);
  const [modalModo, setModalModo] = useState("nuevo");
  const [modalData, setModalData] = useState(null);

  const load = async () => {
    try {
      setLoading(true);
      const data = await obtenerTodosLosBanners();
      setBanners(data);
    } catch {
      alert("Error cargando carrusel");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (banners.length === 0) return;

    const interval = setInterval(() => {
      setIdx((p) => (p + 1) % banners.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [banners]);

  const nextSlide = () => setIdx((p) => (p + 1) % banners.length);
  const prevSlide = () =>
    setIdx((p) => (p - 1 + banners.length) % banners.length);

  const current = banners[idx] ?? null;

  const handleEliminar = async (id) => {
    if (!window.confirm("¿Eliminar este banner?")) return;
    try {
      await eliminarBanner(id);
      load();
    } catch {
      alert("No se pudo eliminar.");
    }
  };

  // -------- MODALES --------
  const abrirModalNuevo = () => {
    setModalModo("nuevo");
    setModalData(null);
    setModalVisible(true);
  };

  const abrirModalEditar = (banner) => {
    setModalModo("editar");
    setModalData(banner);
    setModalVisible(true);
  };

  const cerrarModal = () => {
    setModalVisible(false);
    setModalData(null);
  };

  return (
    <div className="carusel-admin-container">
      <h1>Administración del Carrusel</h1>
      <p>Controla las imágenes, textos y estados del carrusel principal.</p>

      {/* PREVIEW */}
      <div className="preview-box">
        <h2>Vista previa del carrusel</h2>

        <div
          className="preview-slider"
          style={{
            backgroundImage: current?.image
              ? `url(${current.image})`
              : "url('https://placehold.co/1200x300?text=Sin+Imagen')",
          }}
          onClick={nextSlide}
        >
          {current?.darkFilter && <div className="dark-filter"></div>}

          {current?.showText && current?.text && (
            <div className="preview-text">{current.text}</div>
          )}

          <div
            className="arrow-left"
            onClick={(e) => {
              e.stopPropagation();
              prevSlide();
            }}
          ></div>

          <div
            className="arrow-right"
            onClick={(e) => {
              e.stopPropagation();
              nextSlide();
            }}
          ></div>

          <div className="preview-slider-dots">
            {banners.map((_, i) => (
              <div
                key={i}
                className={`dot ${i === idx ? "active" : ""}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setIdx(i);
                }}
              ></div>
            ))}
          </div>
        </div>
      </div>

      {/* LISTA ADMIN */}
      <div className="lista-box">
        <div className="lista-header">
          <h2>Lista de banners</h2>

          <button className="btn-nuevo" onClick={abrirModalNuevo}>
            Nuevo Banner
          </button>
        </div>

        <table className="tabla-carusel">
          <thead>
            <tr>
              <th>Imagen</th>
              <th>Texto</th>
              <th>Filtro</th>
              <th>Estado</th>
              <th>Acción</th>
            </tr>
          </thead>

          <tbody>
            {loading && (
              <tr>
                <td colSpan="5">Cargando…</td>
              </tr>
            )}

            {!loading && banners.length === 0 && (
              <tr>
                <td colSpan="5">No hay banners registrados.</td>
              </tr>
            )}

            {!loading &&
              banners.map((b) => (
                <tr key={b.id}>
                  <td>
                    {b.image ? (
                      <img src={b.image} className="mini-img" alt="mini" />
                    ) : (
                      <div className="mini-img" />
                    )}
                  </td>

                  <td>{b.text || <span style={{ color: "#999" }}>Sin texto</span>}</td>

                  <td>{b.darkFilter ? "Sí" : "No"}</td>

                  <td>
                    <span className="estado-activo">
                      {b.active ? "Activo" : "Inactivo"}
                    </span>
                  </td>

                  <td style={{ textAlign: "center" }}>
                    {/* EDITAR */}
                    <button
                      className="btn-icon edit-icon"
                      onClick={() => abrirModalEditar(b)}
                    >
                      ✏️
                    </button>

                    {/* ELIMINAR */}
                    <button
                      className="btn-icon delete-icon"
                      onClick={() => handleEliminar(b.id)}
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* MODAL NUEVO / EDITAR */}
      {modalVisible && (
        <ModalAdmin
          cerrar={cerrarModal}
          recargar={load}
          modo={modalModo}
          data={modalData}
        />
      )}
    </div>
  );
}

export default CarruselAdmin;
