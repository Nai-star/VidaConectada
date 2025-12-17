import React, { useEffect, useState } from "react";
import {
  obtenerTodosLosBanners,
  eliminarBanner,
  cambiarEstadoBanner,
  actualizarBannerAdmin,
} from "../../services/ServicioCarrusel";

import ModalAdmin from "../ModalAdmin/ModalAdmin";
import ModalEditar from "./ModalEditar/ModalEditar";
import ModalEliminar from "./modaleliminar/ModalEliminar";

import { IoEye, IoEyeOff } from "react-icons/io5";
import { FiEdit, FiTrash2 } from "react-icons/fi";

import "./CaruselAdmin.css";

function CarruselAdmin() {
  const [banners, setBanners] = useState([]);
  const [idx, setIdx] = useState(0);
  const [loading, setLoading] = useState(true);

  const [modalVisible, setModalVisible] = useState(false);
  const [modalModo, setModalModo] = useState("nuevo");
  const [modalData, setModalData] = useState(null);

  const [modalEditar, setModalEditar] = useState(false);
  const [bannerSeleccionado, setBannerSeleccionado] = useState(null);

  const [modalEliminar, setModalEliminar] = useState(false);

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

  const activeBanners = banners.filter((b) => b.active);

  useEffect(() => {
    if (activeBanners.length === 0) return;
    const interval = setInterval(() => {
      setIdx((p) => (p + 1) % activeBanners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [activeBanners]);

  const nextSlide = () => setIdx((p) => (p + 1) % activeBanners.length);
  const prevSlide = () =>
    setIdx((p) => (p - 1 + activeBanners.length) % activeBanners.length);

  const current = activeBanners[idx] ?? null;

  const handleEliminar = (banner) => {
    setBannerSeleccionado(banner);
    setModalEliminar(true);
  };

  const abrirModalEditar = (banner) => {
    setBannerSeleccionado(banner);
    setModalEditar(true);
  };

  const toggleEstado = async (banner) => {
    const nuevoEstado = !banner.active;
    try {
      await cambiarEstadoBanner(banner.id, nuevoEstado);
      setBanners((prev) =>
        prev.map((b) =>
          b.id === banner.id ? { ...b, active: nuevoEstado } : b
        )
      );
    } catch {
      alert("No se pudo cambiar el estado del banner.");
    }
  };

  const abrirModalNuevo = () => {
    setModalModo("nuevo");
    setModalData(null);
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

      <div className="preview-box">
        <h2>Vista previa del carrusel</h2>
        {current ? (
          <div
            className="preview-slider"
            style={{
              backgroundImage: current.image
                ? `url(${current.image})`
                : "url('https://placehold.co/1200x300?text=Sin+Imagen')",
            }}
            onClick={nextSlide}
          >
            {current.darkFilter && <div className="dark-filter"></div>}
            {current.showText && current.text && (
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
              {activeBanners.map((_, i) => (
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
        ) : (
          <div
            className="preview-slider"
            style={{
              backgroundImage:
                "url('https://placehold.co/1200x300?text=Sin+Imagen')",
            }}
          >
            <div className="preview-text">No hay banners activos</div>
          </div>
        )}
      </div>

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

                  <td>
                    {b.text || <span style={{ color: "#999" }}>Sin texto</span>}
                  </td>
                  <td>{b.darkFilter ? "Sí" : "No"}</td>

                  <td>
                    <span className="estado-activo">
                      {b.active ? "Activo" : "Inactivo"}
                    </span>
                  </td>

                  <td style={{ textAlign: "center" }}>
                    <button
                      className="btn-icon ojito-btn"
                      onClick={() => toggleEstado(b)}
                    >
                      {b.active ? <IoEye size={22} /> : <IoEyeOff size={22} />}
                    </button>

                    <button
                      className="btn-icon edit-icon"
                      onClick={() => abrirModalEditar(b)}
                    >
                      <FiEdit size={20} />
                    </button>

                    <button
                      className="btn-icon delete-icon"
                      onClick={() => handleEliminar(b)}
                    >
                      <FiTrash2 size={20} />
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {modalVisible && (
        <ModalAdmin
          cerrar={cerrarModal}
          recargar={load}
          modo={modalModo}
          data={modalData}
        />
      )}

      {modalEditar && (
        <ModalEditar
          banner={bannerSeleccionado}
          cerrar={() => setModalEditar(false)}
          recargar={load}
          guardar={async (bannerEditado) => {
            try {
              await actualizarBannerAdmin(bannerEditado.id, bannerEditado);
              await load();
              setModalEditar(false);
            } catch (error) {
              console.error("Error guardando banner:", error);
            }
          }}
        />
      )}

      {modalEliminar && (
        <ModalEliminar
          bannerId={bannerSeleccionado.id} // ← usamos id
          cerrar={() => setModalEliminar(false)}
          recargar={load}
        />
      )}
    </div>
  );
}

export default CarruselAdmin;
