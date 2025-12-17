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

function AdminTestimonios() {
  const [tab, setTab] = useState("texto");

  const [testimoniosTexto, setTestimoniosTexto] = useState([]);
  const [testimoniosVideo, setTestimoniosVideo] = useState([]);

  const [editandoTexto, setEditandoTexto] = useState(null);
  const [editandoVideo, setEditandoVideo] = useState(null);

  const [formTexto, setFormTexto] = useState({
    Nombre: "",
    Frase: "",
    Foto_P: null,
    CustomUser: "",
  });

  const [formVideo, setFormVideo] = useState({
    Descripcion: "",
    Video: null,
    CustomUser: "",
  });

  const cargarTestimonios = async () => {
    setTestimoniosTexto(await getTestimoniosTexto());
    setTestimoniosVideo(await getTestimoniosVideo());
  };

  useEffect(() => {
    cargarTestimonios();
  }, []);

  const handleTextoChange = (e) => {
    const { name, value, files } = e.target;
    setFormTexto({ ...formTexto, [name]: files ? files[0] : value });
  };

  const handleVideoChange = (e) => {
    const { name, value, files } = e.target;
    setFormVideo({ ...formVideo, [name]: files ? files[0] : value });
  };

  const submitTexto = async (e) => {
    e.preventDefault();
    if (editandoTexto) {
      await editarTestimonioTexto(editandoTexto, formTexto);
      setEditandoTexto(null);
    } else {
      await crearTestimonioTexto(formTexto);
    }
    setFormTexto({ Nombre: "", Frase: "", Foto_P: null, CustomUser: "" });
    cargarTestimonios();
  };

  const submitVideo = async (e) => {
    e.preventDefault();
    if (editandoVideo) {
      await editarTestimonioVideo(editandoVideo, formVideo);
      setEditandoVideo(null);
    } else {
      await crearTestimonioVideo(formVideo);
    }
    setFormVideo({ Descripcion: "", Video: null, CustomUser: "" });
    cargarTestimonios();
  };

  return (
    <div className="admin-panel">
      <h2>Testimonios</h2>
      <p>Gestiona los testimonios que inspiran a donar - textos y videos de donantes</p>

      {/* ===== TABS ===== */}
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

      {/* ===== TEXTO ===== */}
      {tab === "texto" && (
        <div className="card-testimonios">
          <div className="card-header">
            <div className="title-section">
              <i>❝</i>
              <span>Testimonios de Texto</span>
            </div>
            <button className="btn-red">+ Nuevo Testimonio</button>
          </div>

          <table className="tabla-testimonios">
            <thead>
              <tr>
                <th>Foto</th>
                <th>Nombre</th>
                <th>Frase</th>
                <th>ID</th>
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
                  <td><span className="id-badge">#{t.id}</span></td>
                  <td>
                    ✏️{" "}
                    <span
                      style={{ cursor: "pointer", marginLeft: 10 }}
                      onClick={async () => {
                        await eliminarTestimonioTexto(t.id);
                        cargarTestimonios();
                      }}
                    >
                      🗑️
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ===== VIDEO ===== */}
      {tab === "video" && (
        <div className="card-testimonios">
          <div className="card-header">
            <div className="title-section">
              <i>▶</i>
              <span>Testimonios en Video</span>
            </div>
            <button className="btn-red">+ Nuevo Video</button>
          </div>

          <table className="tabla-testimonios">
            <thead>
              <tr>
                <th>Video</th>
                <th>Descripción</th>
                <th>ID</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {testimoniosVideo.map((v) => (
                <tr key={v.id}>
                  <td>
                    {v.video?.Video && (
                      <video width="120" controls>
                        <source src={v.video.Video} />
                      </video>
                    )}
                  </td>
                  <td>{v.video?.Descripcion}</td>
                  <td><span className="id-badge">#{v.id}</span></td>
                  <td>
                    ✏️{" "}
                    <span
                      style={{ cursor: "pointer", marginLeft: 10 }}
                      onClick={async () => {
                        await eliminarTestimonioVideo(v.id);
                        cargarTestimonios();
                      }}
                    >
                      🗑️
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AdminTestimonios;
