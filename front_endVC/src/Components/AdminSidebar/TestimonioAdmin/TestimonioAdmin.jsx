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



function TestimonioAdmin() {
  const usuario = localStorage.getItem("userId");

  const [tab, setTab] = useState("texto");

  const [testimoniosTexto, setTestimoniosTexto] = useState([]);
  const [testimoniosVideo, setTestimoniosVideo] = useState([]);

  const [editandoTexto, setEditandoTexto] = useState(null);
  const [editandoVideo, setEditandoVideo] = useState(null);

  const [mostrarModalTexto, setMostrarModalTexto] = useState(false);
  const [mostrarModalVideo, setMostrarModalVideo] = useState(false);

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
    setTestimoniosTexto(await getTestimoniosTexto());
    setTestimoniosVideo(await getTestimoniosVideo());
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
  const submitTexto = async (e) => {
    e.preventDefault();

    const payload = {
      ...formTexto,
      CustomUser: usuario,
    };

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
  const submitVideo = async (e) => {
    e.preventDefault();

    const payload = {
      ...formVideo,
      CustomUser: usuario,
    };

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
               {/*  <th>ID</th> */}
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
                  <td style={{fontWeight: '500'}}>{t.Nombre}</td>
                  <td style={{color: '#666', fontStyle: 'italic'}}>“{t.Frase}”</td>
                  {/* <td style={{fontSize: '12px', color: '#999'}}>#{t.id}</td> */}
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
                    </span>{" "}
                    <span
                      onClick={async () => {
                        await eliminarTestimonioTexto(t.id);
                        cargarTestimonios();
                      }}
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
                {/* <th>ID</th> */}
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
                    <td style={{color: '#666', fontStyle: 'italic'}}>{v.video.Descripcion}</td>
                    {/* <td>#{v.video.id}</td> */}
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
                      </span>{" "}
                      <span
                        onClick={async () => {
                          await eliminarTestimonioVideo(v.video.id);
                          cargarTestimonios();
                        }}
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
      {mostrarModalTexto && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h3>{editandoTexto ? "Editar Testimonio" : "Nuevo Testimonio"}</h3>
            <form onSubmit={submitTexto}>
              <input name="Nombre" placeholder="Nombre" value={formTexto.Nombre} onChange={handleTextoChange} required />
              <input name="Frase" placeholder="Mensaje testimonio" value={formTexto.Frase} onChange={handleTextoChange} required />
              <label htmlFor="Foto_P">Subir foto de perfil</label>
              <input type="file"  name="Foto_P" onChange={handleTextoChange} />
              <div className="modal-actions">
                <button type="button" onClick={() => setMostrarModalTexto(false)}>Cancelar</button>
                <button type="submit">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {mostrarModalVideo && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h3>{editandoVideo ? "Editar Video" : "Nuevo Video"}</h3>
            <form onSubmit={submitVideo}>
              <input name="Descripcion" placeholder="Descripción breve" value={formVideo.Descripcion} onChange={handleVideoChange} required />
              <label htmlFor="Video">Subir video como testimonio</label>
              <input type="file" name="Video" accept="video/*" onChange={handleVideoChange} />
              <div className="modal-actions">
                <button type="button" onClick={() => setMostrarModalVideo(false)}>Cancelar</button>
                <button type="submit">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default TestimonioAdmin;

