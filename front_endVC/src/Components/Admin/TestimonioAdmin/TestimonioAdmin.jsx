import React, { useEffect, useState } from "react";
import {
  getTestimoniosTexto,
  getTestimoniosVideo,
  crearTestimonioTexto,
  crearTestimonioVideo,
  eliminarTestimonioTexto,
  eliminarTestimonioVideo,
  editarTestimonioTexto,
  editarTestimonioVideo,
} from "../../../services/ServicioTestimonio";
import "./TestimonioAdmin.css";
import { FiEdit, FiTrash2 } from "react-icons/fi";


import Eliminar from "./ModalEliminar/Eliminar";
import ModalTexto from "./ModalTexto/ModalTexto";
import ModalVideo from "./ModalVideo/ModalVideo";


function TestimonioAdmin() {
  const usuario = localStorage.getItem("userId");

  const [tab, setTab] = useState("texto");

  const [testimoniosTexto, setTestimoniosTexto] = useState([]);
  const [testimoniosVideo, setTestimoniosVideo] = useState([]);

  const [editandoTexto, setEditandoTexto] = useState(null);
  const [editandoVideo, setEditandoVideo] = useState(null);

  const [mostrarModalTexto, setMostrarModalTexto] = useState(false);
  const [mostrarModalVideo, setMostrarModalVideo] = useState(false);

  // 🔴 Modal eliminar
  const [mostrarModalEliminar, setMostrarModalEliminar] = useState(false);
  const [eliminarTipo, setEliminarTipo] = useState(null);
  const [eliminarId, setEliminarId] = useState(null);

  const [formTexto, setFormTexto] = useState({
    Nombre: "",
    Frase: "",
    Foto_P: null,
    CustomUser: usuario,
  });

  const [formVideo, setFormVideo] = useState({
    Descripcion: "",
    Video: null,
    CustomUser: usuario,
  });

  /* ===================== CARGAR ===================== */
  const cargarTestimonios = async () => {
    const texto = await getTestimoniosTexto();
    const video = await getTestimoniosVideo();
    setTestimoniosTexto(texto);
    setTestimoniosVideo(video);
  };

  useEffect(() => {
    cargarTestimonios();
  }, []);

  /* ===================== HANDLERS ===================== */
  const handleTextoChange = (e) => {
    const { name, value, files } = e.target;
    setFormTexto({ ...formTexto, [name]: files ? files[0] : value });
  };

  const handleVideoChange = (e) => {
    const { name, value, files } = e.target;
    setFormVideo({ ...formVideo, [name]: files ? files[0] : value });
  };

  /* ===================== SUBMIT TEXTO ===================== */
  const submitTexto = async () => {
    const payload = { ...formTexto, CustomUser: usuario };

    if (editandoTexto) {
      await editarTestimonioTexto(editandoTexto, payload);
      setEditandoTexto(null);
    } else {
      await crearTestimonioTexto(payload);
    }

    setFormTexto({
      Nombre: "",
      Frase: "",
      Foto_P: null,
      CustomUser: usuario,
    });

    setMostrarModalTexto(false);
    cargarTestimonios();
  };

  /* ===================== SUBMIT VIDEO ===================== */
  const submitVideo = async () => {
    const payload = { ...formVideo, CustomUser: usuario };

    if (editandoVideo) {
      await editarTestimonioVideo(editandoVideo, payload);
      setEditandoVideo(null);
    } else {
      await crearTestimonioVideo(payload);
    }

    setFormVideo({
      Descripcion: "",
      Video: null,
      CustomUser: usuario,
    });

    setMostrarModalVideo(false);
    cargarTestimonios();
  };

  /* ===================== ELIMINAR ===================== */
  const abrirModalEliminar = (tipo, id) => {
    setEliminarTipo(tipo);
    setEliminarId(id);
    setMostrarModalEliminar(true);
  };

  const confirmarEliminar = async () => {
    if (eliminarTipo === "texto") {
      await eliminarTestimonioTexto(eliminarId);
    }

    if (eliminarTipo === "video") {
      await eliminarTestimonioVideo(eliminarId);
    }

    setMostrarModalEliminar(false);
    setEliminarTipo(null);
    setEliminarId(null);
    cargarTestimonios();
  };

  return (
    <div className="admin-panel">
      <h2>Testimonios</h2>
      <p>Gestiona los testimonios que inspiran a donar</p>

      {/* ===================== TABS ===================== */}
      <div className="tabs-container">
        <button
          className={`tab-item ${tab === "texto" ? "active" : ""}`}
          onClick={() => setTab("texto")}
        >
          ❝❞ Lo que dicen
        </button>

        <button
          className={`tab-item ${tab === "video" ? "active" : ""}`}
          onClick={() => setTab("video")}
        >
          ▶ Experiencias en video
        </button>
      </div>

      {/* ===================== TEXTO ===================== */}
      {tab === "texto" && (
        <div className="card-testimonios">
          <div className="card-header09">
            <span>Testimonios de Texto</span>

            <button
              className="btn-red"
              onClick={() => {
                setEditandoTexto(null);
                setFormTexto({
                  Nombre: "",
                  Frase: "",
                  Foto_P: null,
                  CustomUser: usuario,
                });
                setMostrarModalTexto(true);
              }}
            >
              + Nuevo Testimonio
            </button>
          </div>

          <table className="tabla-testimonios">
            <thead>
              <tr>
                <th>Foto</th>
                <th>Nombre</th>
                <th>Frase</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {testimoniosTexto.map((t) => (
                <tr key={t.id}>
                  <td>
                    {t.Foto_P && (
                      <img src={t.Foto_P} alt="" className="user-img" />
                    )}
                  </td>

                  <td>{t.Nombre}</td>
                  <td>“{t.Frase}”</td>

                  <td>
                    <span
                      onClick={() => {
                        setEditandoTexto(t.id);
                        setFormTexto({
                          Nombre: t.Nombre,
                          Frase: t.Frase,
                          Foto_P: null,
                          CustomUser: usuario,
                        });
                        setMostrarModalTexto(true);
                      }}
                    >
                      <FiEdit />
                    </span>

                    <span onClick={() => abrirModalEliminar("texto", t.id)}>
                      <FiTrash2 />
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ===================== VIDEO ===================== */}
      {tab === "video" && (
        <div className="card-testimonios">
          <div className="card-header09">
            <span>Testimonios en Video</span>

            <button
              className="btn-red"
              onClick={() => {
                setEditandoVideo(null);
                setFormVideo({
                  Descripcion: "",
                  Video: null,
                  CustomUser: usuario,
                });
                setMostrarModalVideo(true);
              }}
            >
              + Nuevo Video
            </button>
          </div>

          <table className="tabla-testimonios">
            <thead>
              <tr>
                <th>Video</th>
                <th>Descripción</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {testimoniosVideo
                .filter((v) => v.video && v.video.id)
                .map((v) => (
                  <tr key={v.video.id}>
                    <td>
                      <video width="120" controls>
                        <source src={v.video.Video} />
                      </video>
                    </td>

                    <td>{v.video.Descripcion}</td>

                    <td>
                      <span
                        onClick={() => {
                          setEditandoVideo(v.video.id);
                          setFormVideo({
                            Descripcion: v.video.Descripcion,
                            Video: null,
                            CustomUser: usuario,
                          });
                          setMostrarModalVideo(true);
                        }}
                      >
                        <FiEdit />
                      </span>

                      <span
                        onClick={() =>
                          abrirModalEliminar("video", v.video.id)
                        }
                      >
                        <FiTrash2 />
                      </span>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ===================== MODALES ===================== */}
      <ModalTexto
        visible={mostrarModalTexto}
        onClose={() => setMostrarModalTexto(false)}
        onSubmit={submitTexto}
        form={formTexto}
        onChange={handleTextoChange}
        editando={!!editandoTexto}
      />

      <ModalVideo
        visible={mostrarModalVideo}
        onClose={() => setMostrarModalVideo(false)}
        onSubmit={submitVideo}
        form={formVideo}
        onChange={handleVideoChange}
        editando={!!editandoVideo}
      />

      {/* ✅ MODAL ELIMINAR */}
      {mostrarModalEliminar && (
        <Eliminar
          onClose={() => setMostrarModalEliminar(false)}
          onConfirm={confirmarEliminar}
          nombre={
            eliminarTipo === "texto"
              ? testimoniosTexto.find(t => t.id === eliminarId)?.Nombre
              : testimoniosVideo
                  .find(v => v.video?.id === eliminarId)
                  ?.video?.Descripcion
          }
        />
      )}

    </div>
  );
}

export default TestimonioAdmin;